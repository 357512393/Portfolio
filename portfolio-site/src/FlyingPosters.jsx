import { useEffect, useRef } from "react";
import { Camera, Mesh, Plane, Program, Raycast, Renderer, Texture, Transform, Vec3 } from "ogl";
import "./FlyingPosters.css";

const MAX_CANVAS_DIMENSION = 4096;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MOBILE_MAX_DEVICE_PIXEL_RATIO = 1.5;
const OVERSIZE_DEVICE_PIXEL_RATIO = 1.5;
const MOBILE_BREAKPOINT = 809;
const MOBILE_SCROLL_EASE = 0.09;
const MOBILE_BEND_LIMIT = 0.32;
const HOVER_ROTATE_AMPLITUDE = (16 * Math.PI) / 180;
const HOVER_SCALE = 1.2;
const HOVER_HIT_PADDING = 100;
const HOVER_SPRING = { damping: 30, stiffness: 100, mass: 2 };
const HOVER_LOCAL_CORNERS = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.5],
  [-0.5, 0.5],
];

const vertexShader = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uBend;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 curvedPosition = position;
  float centeredX = uv.x - 0.5;
  float horizontalArc = 4.0 * centeredX * centeredX - 1.0;

  curvedPosition.y += horizontalArc * uBend * 0.13;
  curvedPosition.z += horizontalArc * abs(uBend) * 0.19;
  curvedPosition.z += centeredX * uBend * 0.28;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(curvedPosition, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform float uBrightness;
uniform sampler2D tMap;
varying vec2 vUv;
void main() {
  vec2 imageSize = uImageSize;
  vec2 planeSize = uPlaneSize;
  float imageAspect = imageSize.x / imageSize.y;
  float planeAspect = planeSize.x / planeSize.y;
  vec2 scale = vec2(1.0, 1.0);
  if (planeAspect > imageAspect) {
    scale.x = imageAspect / planeAspect;
  } else {
    scale.y = planeAspect / imageAspect;
  }
  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;
  vec4 color = texture2D(tMap, uv);
  gl_FragColor = vec4(color.rgb * uBrightness, color.a);
}
`;

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function stepSpring(value, velocity, target, deltaSeconds) {
  const acceleration = (
    HOVER_SPRING.stiffness * (target - value)
    - HOVER_SPRING.damping * velocity
  ) / HOVER_SPRING.mass;
  const nextVelocity = velocity + acceleration * deltaSeconds;
  return {
    value: value + nextVelocity * deltaSeconds,
    velocity: nextVelocity,
  };
}

function wrap(value, length) {
  return ((value + length / 2) % length + length) % length - length / 2;
}

function getCanvasDpr(width, height) {
  const maximumDpr = width <= MOBILE_BREAKPOINT
    ? MOBILE_MAX_DEVICE_PIXEL_RATIO
    : MAX_DEVICE_PIXEL_RATIO;
  const deviceDpr = Math.min(window.devicePixelRatio || 1, maximumDpr);
  const maxCssDimension = Math.max(width, height);
  const maxSafeDpr = MAX_CANVAS_DIMENSION / maxCssDimension;

  if (deviceDpr * maxCssDimension > MAX_CANVAS_DIMENSION) {
    return Math.min(OVERSIZE_DEVICE_PIXEL_RATIO, maxSafeDpr);
  }

  return deviceDpr;
}

class Media {
  constructor(options) {
    Object.assign(this, options);
    this.extra = 0;
    this.hoverRotationX = 0;
    this.hoverRotationY = 0;
    this.hoverScale = 1;
    this.hoverVelocityX = 0;
    this.hoverVelocityY = 0;
    this.hoverScaleVelocity = 0;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      // Let the camera-space Z position decide which poster is in front.
      // Without a depth buffer the later project in the array was always
      // painted over earlier projects, even when it sat behind the active one.
      depthTest: true,
      depthWrite: true,
      fragment: fragmentShader,
      vertex: vertexShader,
      uniforms: {
        tMap: { value: texture },
        uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [16, 9] },
        uBrightness: { value: 1 },
        uBend: { value: 0 },
      },
      cullFace: false,
    });

    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.src = this.image;
    image.onload = () => {
      texture.image = image;
      this.program.uniforms.uImageSize.value = [image.naturalWidth, image.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.posterIndex = this.index;
    this.plane.setParent(this.scene);
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;

    this.baseScaleX = (this.viewport.width * this.planeWidth) / this.screen.width;
    this.baseScaleY = (this.viewport.height * this.planeHeight) / this.screen.height;
    const minBaseScaleX = (this.viewport.width * this.minPlaneWidth) / this.screen.width;
    this.leftGrowthOffset = -(this.baseScaleX - minBaseScaleX) * 0.5;
    this.plane.scale.set(this.baseScaleX, this.baseScaleY, 1);
    this.plane.program.uniforms.uPlaneSize.value = [this.baseScaleX, this.baseScaleY];

    const compact = this.screen.width < 640;
    this.isMobile = this.screen.width <= MOBILE_BREAKPOINT;
    this.radiusX = this.viewport.width * (compact ? 0.255 : 0.265);
    this.verticalStep = this.viewport.height * (compact ? 0.18 : 0.195);
    this.depth = compact ? 2.35 : 4.2;
    // Keep the second neighbor separated throughout the motion. A wider,
    // constant angular step moves the upper-left branch inward and preserves
    // the same spiral relationship while it scrolls and settles.
    this.angleStep = compact ? 0.96 : 1.32;
  }

  update(scroll, hover, deltaSeconds) {
    this.relative = wrap(this.index - scroll.current, this.length);
    const relativeDistance = Math.abs(this.relative);
    const trackDistance = Math.min(relativeDistance, 2) + Math.max(0, relativeDistance - 2) * 0.58;
    const trackRelative = Math.sign(this.relative) * trackDistance;
    const angle = trackRelative * this.angleStep;
    const depthProgress = (Math.cos(angle) + 1) / 2;
    const velocity = Math.max(-0.08, Math.min(0.08, scroll.current - scroll.last));
    const bendTarget = this.isMobile
      ? Math.max(-MOBILE_BEND_LIMIT, Math.min(MOBILE_BEND_LIMIT, velocity * 6))
      : Math.max(-1, Math.min(1, velocity * 19));
    this.bend = lerp(this.bend || 0, bendTarget, this.isMobile ? 0.12 : 0.2);

    // Keep the active poster's right edge fixed as it scales with the viewport,
    // so the added width grows toward the left. The influence fades with depth.
    const anchorWeight = Math.pow(depthProgress, 4);
    const isHovered = !this.isMobile && hover?.index === this.index && relativeDistance < 0.5;
    const targetRotationX = isHovered ? hover.rotationX : 0;
    const targetRotationY = isHovered ? hover.rotationY : 0;
    const targetScale = isHovered ? HOVER_SCALE : 1;
    const rotationXSpring = stepSpring(
      this.hoverRotationX,
      this.hoverVelocityX,
      targetRotationX,
      deltaSeconds,
    );
    const rotationYSpring = stepSpring(
      this.hoverRotationY,
      this.hoverVelocityY,
      targetRotationY,
      deltaSeconds,
    );
    const scaleSpring = stepSpring(
      this.hoverScale,
      this.hoverScaleVelocity,
      targetScale,
      deltaSeconds,
    );
    this.hoverRotationX = rotationXSpring.value;
    this.hoverVelocityX = rotationXSpring.velocity;
    this.hoverRotationY = rotationYSpring.value;
    this.hoverVelocityY = rotationYSpring.velocity;
    this.hoverScale = scaleSpring.value;
    this.hoverScaleVelocity = scaleSpring.velocity;

    const scale = 0.92 + depthProgress * 0.08;
    const hoverAnchorOffset = -(this.baseScaleX * scale * (this.hoverScale - 1)) * 0.5;
    this.plane.position.x = Math.sin(angle) * this.radiusX
      + (this.leftGrowthOffset + hoverAnchorOffset) * anchorWeight;
    this.plane.position.y = -trackRelative * this.verticalStep;
    this.plane.position.z = Math.cos(angle) * this.depth;
    this.plane.rotation.x = Math.cos(angle) * 0.035 + this.hoverRotationX;
    this.plane.rotation.y = -Math.sin(angle) * 0.72 + this.hoverRotationY;
    this.plane.rotation.z = -Math.sin(angle) * 0.12 + (this.isMobile ? 0 : velocity * 1.8);

    this.plane.scale.set(
      this.baseScaleX * scale * this.hoverScale,
      this.baseScaleY * scale * this.hoverScale,
      1,
    );
    this.program.uniforms.uBrightness.value = 0.43 + depthProgress * 0.57;
    this.program.uniforms.uBend.value = this.bend;
  }
}

class PosterCanvas {
  constructor(options) {
    Object.assign(this, options);
    // Start the first frame below the viewport and let the track travel back
    // to the opening poster once. Increasing the scroll value moves posters
    // upward on the existing 3D spiral, so the intro feels like the images
    // rise into place instead of simply fading in.
    this.introStart = -2.4;
    this.introDuration = 1350;
    this.introActive = this.introAnimation !== false;
    this.introStartedAt = performance.now();
    const initialScroll = this.introActive ? this.introStart : 0;
    this.scroll = { ease: this.scrollEase, current: initialScroll, target: 0, last: initialScroll };
    this.activeIndex = 0;
    this.isDown = false;
    this.hoveredIndex = null;
    this.hover = null;
    this.canTilt = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
    this.hoverProjectionCorners = [new Vec3(), new Vec3(), new Vec3(), new Vec3()];
    this.hoverFrame = 0;
    this.clickCandidate = null;
    this.dragDistance = 0;
    this.snapTimer = null;

    this.onResize = this.onResize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.update = this.update.bind(this);

    this.createRenderer();
    this.createScene();
    this.onResize();
    this.createMedias();
    this.addEventListeners();
    this.update();
  }

  createRenderer() {
    const rect = this.container.getBoundingClientRect();
    this.renderer = new Renderer({
      canvas: this.canvas,
      alpha: false,
      antialias: true,
      dpr: getCanvasDpr(rect.width, rect.height),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 1);
    this.camera = new Camera(this.gl);
    this.raycast = new Raycast();
    this.camera.fov = this.cameraFov;
    this.camera.position.z = this.cameraZ;
  }

  createScene() {
    this.scene = new Transform();
    this.geometry = new Plane(this.gl, { heightSegments: 8, widthSegments: 32 });
  }

  createMedias() {
    this.medias = this.items.map((image, index) => new Media({
      gl: this.gl,
      geometry: this.geometry,
      scene: this.scene,
      screen: this.screen,
      viewport: this.viewport,
      image,
      length: this.items.length,
      index,
      planeWidth: this.planeWidth,
      planeHeight: this.planeHeight,
      minPlaneWidth: this.minPlaneWidth,
      planeGap: this.planeGap,
    }));
  }

  onResize() {
    const rect = this.container.getBoundingClientRect();
    this.screen = { width: rect.width, height: rect.height };
    this.renderer.dpr = getCanvasDpr(rect.width, rect.height);
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { height, width: height * this.camera.aspect };
    this.canTilt = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
    this.medias?.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  onWheel(event) {
    this.cancelIntro();
    this.scroll.target += event.deltaY * 0.0017;
    this.scheduleSnap();
  }

  cancelIntro() {
    if (!this.introActive) return;
    this.introActive = false;
    this.scroll.target = this.scroll.current;
    this.scroll.last = this.scroll.current;
  }

  snapToNearest() {
    this.scroll.target = Math.round(this.scroll.target);
  }

  scheduleSnap() {
    window.clearTimeout(this.snapTimer);
    this.snapTimer = window.setTimeout(() => {
      if (!this.isDown) this.snapToNearest();
    }, 140);
  }

  getInteractiveIndexes() {
    if (this.activeIndex < 0) return new Set();
    const previous = (this.activeIndex - 1 + this.items.length) % this.items.length;
    const next = (this.activeIndex + 1) % this.items.length;
    return new Set([previous, this.activeIndex, next]);
  }

  getPointerHit(pointerEvent) {
    const pointer = pointerEvent.touches ? pointerEvent.touches[0] : pointerEvent;
    if (!pointer) return null;

    const rect = this.canvas.getBoundingClientRect();
    if (
      pointer.clientX < rect.left
      || pointer.clientX > rect.right
      || pointer.clientY < rect.top
      || pointer.clientY > rect.bottom
    ) return null;

    const mouse = [
      ((pointer.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((pointer.clientY - rect.top) / rect.height) * 2,
    ];
    this.raycast.castMouse(this.camera, mouse);
    const hits = this.raycast.intersectMeshes(this.medias.map((media) => media.plane), { cullFace: false });
    const mesh = hits[0];
    const nearestIndex = mesh?.posterIndex;
    if (!this.getInteractiveIndexes().has(nearestIndex)) return null;
    return { index: nearestIndex, uv: mesh.hit?.uv };
  }

  hitTest(pointerEvent) {
    return this.getPointerHit(pointerEvent)?.index ?? null;
  }

  getExpandedActiveHover(pointerEvent, directHit) {
    if (directHit?.index === this.activeIndex) return directHit;
    if (directHit || !this.canTilt) return null;

    const pointer = pointerEvent.touches ? pointerEvent.touches[0] : pointerEvent;
    const plane = this.medias[this.activeIndex]?.plane;
    if (!pointer || !plane) return null;

    const canvasRect = this.canvas.getBoundingClientRect();
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;

    this.hoverProjectionCorners.forEach((corner, index) => {
      corner.set(HOVER_LOCAL_CORNERS[index][0], HOVER_LOCAL_CORNERS[index][1], 0)
        .applyMatrix4(plane.worldMatrix);
      this.camera.project(corner);
      const screenX = canvasRect.left + ((corner.x + 1) * canvasRect.width) / 2;
      const screenY = canvasRect.top + ((1 - corner.y) * canvasRect.height) / 2;
      left = Math.min(left, screenX);
      right = Math.max(right, screenX);
      top = Math.min(top, screenY);
      bottom = Math.max(bottom, screenY);
    });

    if (
      pointer.clientX < left - HOVER_HIT_PADDING
      || pointer.clientX > right + HOVER_HIT_PADDING
      || pointer.clientY < top - HOVER_HIT_PADDING
      || pointer.clientY > bottom + HOVER_HIT_PADDING
    ) return null;

    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);
    const uvX = Math.max(0, Math.min(1, (pointer.clientX - left) / width));
    const uvY = 1 - Math.max(0, Math.min(1, (pointer.clientY - top) / height));
    return { index: this.activeIndex, uv: { x: uvX, y: uvY } };
  }

  updateHover(pointerEvent) {
    const directHit = this.getPointerHit(pointerEvent);
    const hoverHit = this.getExpandedActiveHover(pointerEvent, directHit);
    this.hoveredIndex = directHit?.index ?? null;
    this.canvas.style.cursor = this.hoveredIndex === null ? "default" : "pointer";

    const restingOnActivePoster = this.canTilt
      && hoverHit?.index === this.activeIndex
      && !this.introActive
      && Math.abs(this.scroll.current - Math.round(this.scroll.current)) < 0.08
      && Math.abs(this.scroll.current - this.scroll.target) < 0.12;
    if (!restingOnActivePoster || !hoverHit.uv) {
      this.hover = null;
      return;
    }

    this.hover = {
      index: hoverHit.index,
      // React Bits calculates against CSS screen coordinates, whose Y axis
      // points down. OGL's plane Y axis points up, so only X rotation needs
      // a sign conversion; Y rotation keeps the component source direction.
      rotationX: (0.5 - hoverHit.uv.y) * 2 * HOVER_ROTATE_AMPLITUDE,
      rotationY: (hoverHit.uv.x - 0.5) * 2 * HOVER_ROTATE_AMPLITUDE,
    };
  }

  onPointerDown(event) {
    if (typeof event.button === "number" && event.button !== 0) return;
    this.cancelIntro();
    window.clearTimeout(this.snapTimer);
    this.isDown = true;
    this.hover = null;
    this.scroll.position = this.scroll.current;
    const pointer = event.touches ? event.touches[0] : event;
    this.startX = pointer.clientX;
    this.startY = pointer.clientY;
    this.lastPointer = pointer;
    this.dragDistance = 0;
    this.clickCandidate = this.hitTest(event);
  }

  onPointerMove(event) {
    const pointer = event.touches ? event.touches[0] : event;
    this.lastPointer = pointer;
    if (!this.isDown) {
      this.updateHover(event);
      return;
    }
    const verticalDelta = this.startY - pointer.clientY;
    const horizontalDelta = pointer.clientX - this.startX;
    this.dragDistance = Math.max(this.dragDistance, Math.hypot(horizontalDelta, verticalDelta));
    if (this.dragDistance > 6) this.clickCandidate = null;
    this.scroll.target = this.scroll.position + (verticalDelta + horizontalDelta * 0.35) * 0.012;
    this.canvas.style.cursor = "grabbing";
  }

  onPointerUp(event) {
    if (!this.isDown) return;
    const clickedIndex = this.dragDistance <= 6 ? this.clickCandidate : null;
    this.isDown = false;
    this.clickCandidate = null;
    this.snapToNearest();
    if (clickedIndex !== null) this.onPosterClick?.(clickedIndex);
    const pointer = event.changedTouches?.[0] || this.lastPointer || event;
    this.updateHover(pointer);
  }

  onPointerLeave() {
    if (this.isDown) return;
    this.hoveredIndex = null;
    this.hover = null;
    this.canvas.style.cursor = "default";
  }

  goToIndex(index, immediate = false) {
    this.cancelIntro();
    window.clearTimeout(this.snapTimer);
    const cycles = Math.round((this.scroll.target - index) / this.items.length);
    this.scroll.target = index + cycles * this.items.length;
    if (immediate) {
      this.scroll.current = this.scroll.target;
      this.scroll.last = this.scroll.target;
    }
  }

  setPlaneSize(planeWidth, planeHeight, minPlaneWidth) {
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.minPlaneWidth = minPlaneWidth;
    this.medias.forEach((media) => {
      media.planeWidth = planeWidth;
      media.planeHeight = planeHeight;
      media.minPlaneWidth = minPlaneWidth;
    });
    this.onResize();
  }

  update() {
    const now = performance.now();
    const deltaSeconds = Math.min((now - (this.lastFrameAt || now)) / 1000, 1 / 30) || 1 / 60;
    this.lastFrameAt = now;
    if (this.introActive) {
      const progress = Math.min(1, (now - this.introStartedAt) / this.introDuration);
      // Ease-out cubic gives the posters a quick lift followed by a soft settle.
      const eased = 1 - ((1 - progress) ** 3);
      this.scroll.current = lerp(this.introStart, 0, eased);
      this.scroll.target = 0;
      if (progress >= 1) {
        this.introActive = false;
        this.scroll.current = 0;
        this.scroll.last = 0;
        this.onIndexChange?.(0);
      }
    } else {
      const effectiveScrollEase = this.screen.width <= MOBILE_BREAKPOINT
        ? Math.max(this.scroll.ease, MOBILE_SCROLL_EASE)
        : this.scroll.ease;
      this.scroll.current = lerp(this.scroll.current, this.scroll.target, effectiveScrollEase);
    }
    this.medias.forEach((media) => media.update(this.scroll, this.hover, deltaSeconds));

    const closest = this.medias.reduce((best, media) => {
      const distance = Math.abs(media.relative);
      return distance < best.distance ? { index: media.index, distance } : best;
    }, { index: 0, distance: Infinity });
    if (closest.index !== this.activeIndex) {
      this.activeIndex = closest.index;
      // Keep the opening project selected while the intro is moving; once it
      // settles, normal nearest-poster updates resume.
      if (!this.introActive) this.onIndexChange?.(closest.index);
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    if (
      this.lastPointer
      && !this.isDown
      && Math.abs(this.scroll.current - this.scroll.last) > 0.0001
      && this.hoverFrame++ % 2 === 0
    ) this.updateHover(this.lastPointer);
    this.scroll.last = this.scroll.current;
    this.frame = requestAnimationFrame(this.update);
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("wheel", this.onWheel, { passive: true });
    this.canvas.addEventListener("mousedown", this.onPointerDown);
    this.canvas.addEventListener("mouseleave", this.onPointerLeave);
    window.addEventListener("mousemove", this.onPointerMove);
    window.addEventListener("mouseup", this.onPointerUp);
    this.canvas.addEventListener("touchstart", this.onPointerDown, { passive: true });
    window.addEventListener("touchmove", this.onPointerMove, { passive: true });
    window.addEventListener("touchend", this.onPointerUp, { passive: true });
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    window.clearTimeout(this.snapTimer);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("mousedown", this.onPointerDown);
    this.canvas.removeEventListener("mouseleave", this.onPointerLeave);
    window.removeEventListener("mousemove", this.onPointerMove);
    window.removeEventListener("mouseup", this.onPointerUp);
    this.canvas.removeEventListener("touchstart", this.onPointerDown);
    window.removeEventListener("touchmove", this.onPointerMove);
    window.removeEventListener("touchend", this.onPointerUp);
  }
}

export default function FlyingPosters({
  items = [],
  planeWidth = 264,
  planeHeight = 148.5,
  minPlaneWidth = planeWidth,
  planeGap = 20,
  scrollEase = 0.05,
  cameraFov = 38,
  cameraZ = 16,
  introAnimation = true,
  onIndexChange,
  onPosterClick,
  focusRequest,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);
  const onIndexChangeRef = useRef(onIndexChange);
  const onPosterClickRef = useRef(onPosterClick);

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    onPosterClickRef.current = onPosterClick;
  }, [onPosterClick]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return undefined;
    instanceRef.current = new PosterCanvas({
      container: containerRef.current,
      canvas: canvasRef.current,
      items,
      planeWidth,
      planeHeight,
      minPlaneWidth,
      planeGap,
      scrollEase,
      cameraFov,
      cameraZ,
      introAnimation,
      onIndexChange: (index) => onIndexChangeRef.current?.(index),
      onPosterClick: (index) => onPosterClickRef.current?.(index),
    });
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [items, planeGap, scrollEase, cameraFov, cameraZ]);

  useEffect(() => {
    instanceRef.current?.setPlaneSize(planeWidth, planeHeight, minPlaneWidth);
  }, [planeWidth, planeHeight, minPlaneWidth]);

  useEffect(() => {
    if (focusRequest) {
      instanceRef.current?.goToIndex(focusRequest.index, focusRequest.immediate);
    }
  }, [focusRequest]);

  return (
    <div ref={containerRef} className={`posters-container ${className}`.trim()}>
      <canvas ref={canvasRef} className="posters-canvas" aria-label="沿三维螺旋轨道滚动浏览设计作品" />
    </div>
  );
}
