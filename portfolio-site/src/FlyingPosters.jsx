import { useEffect, useRef } from "react";
import { Camera, Mesh, Plane, Program, Raycast, Renderer, Texture, Transform } from "ogl";
import "./FlyingPosters.css";

const MAX_CANVAS_DIMENSION = 4096;
const MAX_DEVICE_PIXEL_RATIO = 2;
const OVERSIZE_DEVICE_PIXEL_RATIO = 1.5;

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

function wrap(value, length) {
  return ((value + length / 2) % length + length) % length - length / 2;
}

function getCanvasDpr(width, height) {
  const deviceDpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
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
    this.radiusX = this.viewport.width * (compact ? 0.255 : 0.265);
    this.verticalStep = this.viewport.height * (compact ? 0.18 : 0.195);
    this.depth = compact ? 2.35 : 4.2;
    // Keep the second neighbor separated throughout the motion. A wider,
    // constant angular step moves the upper-left branch inward and preserves
    // the same spiral relationship while it scrolls and settles.
    this.angleStep = compact ? 0.96 : 1.32;
  }

  update(scroll) {
    this.relative = wrap(this.index - scroll.current, this.length);
    const relativeDistance = Math.abs(this.relative);
    const trackDistance = Math.min(relativeDistance, 2) + Math.max(0, relativeDistance - 2) * 0.58;
    const trackRelative = Math.sign(this.relative) * trackDistance;
    const angle = trackRelative * this.angleStep;
    const depthProgress = (Math.cos(angle) + 1) / 2;
    const velocity = Math.max(-0.08, Math.min(0.08, scroll.current - scroll.last));
    const bendTarget = Math.max(-1, Math.min(1, velocity * 19));
    this.bend = lerp(this.bend || 0, bendTarget, 0.2);

    // Keep the active poster's right edge fixed as it scales with the viewport,
    // so the added width grows toward the left. The influence fades with depth.
    const anchorWeight = Math.pow(depthProgress, 4);
    this.plane.position.x = Math.sin(angle) * this.radiusX + this.leftGrowthOffset * anchorWeight;
    this.plane.position.y = -trackRelative * this.verticalStep;
    this.plane.position.z = Math.cos(angle) * this.depth;
    this.plane.rotation.x = Math.cos(angle) * 0.035;
    this.plane.rotation.y = -Math.sin(angle) * 0.72;
    this.plane.rotation.z = -Math.sin(angle) * 0.12 + velocity * 1.8;

    const scale = 0.92 + depthProgress * 0.08;
    this.plane.scale.set(this.baseScaleX * scale, this.baseScaleY * scale, 1);
    this.program.uniforms.uBrightness.value = 0.43 + depthProgress * 0.57;
    this.program.uniforms.uBend.value = this.bend;
  }
}

class PosterCanvas {
  constructor(options) {
    Object.assign(this, options);
    this.scroll = { ease: this.scrollEase, current: 0, target: 0, last: 0 };
    this.activeIndex = -1;
    this.isDown = false;
    this.hoveredIndex = null;
    this.hoverFrame = 0;
    this.clickCandidate = null;
    this.dragDistance = 0;
    this.snapTimer = null;

    this.onResize = this.onResize.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
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
      alpha: true,
      antialias: true,
      dpr: getCanvasDpr(rect.width, rect.height),
    });
    this.gl = this.renderer.gl;
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
    this.medias?.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  onWheel(event) {
    this.scroll.target += event.deltaY * 0.0017;
    this.scheduleSnap();
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

  hitTest(pointerEvent) {
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
    const nearestIndex = hits[0]?.posterIndex;
    return this.getInteractiveIndexes().has(nearestIndex) ? nearestIndex : null;
  }

  updateHover(pointerEvent) {
    this.hoveredIndex = this.hitTest(pointerEvent);
    this.canvas.style.cursor = this.hoveredIndex === null ? "default" : "pointer";
  }

  onPointerDown(event) {
    if (typeof event.button === "number" && event.button !== 0) return;
    window.clearTimeout(this.snapTimer);
    this.isDown = true;
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

  goToIndex(index, immediate = false) {
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
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    this.medias.forEach((media) => media.update(this.scroll));

    const closest = this.medias.reduce((best, media) => {
      const distance = Math.abs(media.relative);
      return distance < best.distance ? { index: media.index, distance } : best;
    }, { index: 0, distance: Infinity });
    if (closest.index !== this.activeIndex) {
      this.activeIndex = closest.index;
      this.onIndexChange?.(closest.index);
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
