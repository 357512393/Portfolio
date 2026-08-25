import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SlashHoverLabel from "./SlashHoverLabel";
import { assetUrl } from "./assetUrl";

const PHOTOGRAPHY_ASSET_VERSION = "20260826-2";
const photographyAssetUrl = (path) => (
  assetUrl(`${path}?v=${PHOTOGRAPHY_ASSET_VERSION}`)
);

const PHOTOGRAPHY_IMAGES = Array.from({ length: 64 }, (_, index) => (
  photographyAssetUrl(`/assets/photography/${index + 1}.webp`)
));

const PHOTOGRAPHY_ARCHIVE = PHOTOGRAPHY_IMAGES;
export const PHOTOGRAPHY_COVERS = PHOTOGRAPHY_ARCHIVE.map((_, index) => (
  assetUrl(`/assets/photography-covers/${index + 1}.webp`)
));
export const PHOTOGRAPHY_THUMBNAILS = PHOTOGRAPHY_ARCHIVE.map((_, index) => (
  photographyAssetUrl(`/assets/photography-thumbnails/${index + 1}.webp`)
));

const PHOTOGRAPHY_DIMENSIONS = [
  [1080, 1440], [1080, 1440], [1080, 1440], [1080, 1440], [958, 1440], [852, 1280], [852, 1280], [958, 1440],
  [958, 1440], [1081, 1440], [1081, 1440], [1081, 1440], [961, 1280], [1081, 1440], [1081, 1440], [1152, 1440],
  [1440, 918], [1080, 1440], [1080, 1440], [1080, 1440], [1080, 1440], [1440, 1080], [1080, 1440], [1080, 1440],
  [1440, 1020], [840, 1120], [1080, 1440], [1080, 1440], [1080, 1440], [1080, 1440], [1080, 1440], [1080, 1440],
  [1080, 1440], [1080, 1440], [1080, 1440], [1078, 1440], [958, 1440], [983, 1440], [853, 1280], [959, 1440],
  [1080, 1440], [1080, 1440], [1080, 1440], [1080, 1440], [960, 1280], [960, 1280], [960, 1280], [938, 1440],
  [960, 1280], [1080, 1440], [840, 1120], [1079, 1440], [1080, 1440], [1440, 611], [1080, 1440], [1440, 960],
  [1440, 960], [1440, 612], [1440, 810], [1080, 1440], [768, 1440], [730, 1440], [1080, 1440], [1080, 1440],
];

const imageLoadCache = new Map();

function preloadImage(src, priority = "auto") {
  const cached = imageLoadCache.get(src);
  if (cached) {
    if (priority === "high" && cached.image.fetchPriority !== "high") {
      cached.image.fetchPriority = "high";
    }
    return cached.promise;
  }
  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = priority;
  const load = new Promise((resolve) => {
    const finish = () => resolve(true);
    image.onload = () => Promise.resolve(image.decode?.()).catch(() => {}).then(finish);
    image.onerror = () => {
      imageLoadCache.delete(src);
      resolve(false);
    };
  });
  imageLoadCache.set(src, { image, promise: load });
  image.src = src;
  return load;
}

function revealLoadedImage(image) {
  if (image?.complete && image.naturalWidth > 0) {
    image.classList.add("is-loaded");
  }
}

async function preloadBatch(sources, concurrency, priority) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, sources.length) }, async () => {
    while (cursor < sources.length) {
      const source = sources[cursor];
      cursor += 1;
      await preloadImage(source, priority);
    }
  }));
}

let photographyEntryPreload;
export function preloadPhotographyEntry() {
  if (!photographyEntryPreload) {
    // Start the lightweight thumbnail requests alongside the deck, but use
    // completion of every 3D cover as the gate for warming the originals.
    preloadBatch(PHOTOGRAPHY_THUMBNAILS, 8, "high");
    photographyEntryPreload = preloadBatch(PHOTOGRAPHY_COVERS, 6, "high");
  }
  return photographyEntryPreload;
}

function selectedImageFromLocation() {
  if (typeof window === "undefined") return null;
  const value = Number(
    window.location.pathname.match(/^\/photo\/(\d+)\/?$/i)?.[1]
      ?? window.location.hash.match(/^#photography\/(\d+)$/)?.[1],
  );
  return value >= 1 && value <= PHOTOGRAPHY_ARCHIVE.length ? value - 1 : null;
}

function prioritizedOriginalIndices(selectedIndex) {
  const indices = [selectedIndex];
  for (let offset = 1; offset <= 2; offset += 1) {
    const previous = selectedIndex - offset;
    const next = selectedIndex + offset;
    if (previous >= 0) indices.push(previous);
    if (next < PHOTOGRAPHY_ARCHIVE.length) indices.push(next);
  }
  return indices;
}

export default function PhotographyPage({ active = true, onClose }) {
  const [isEntering, setIsEntering] = useState(true);
  const [deferredCoversEnabled, setDeferredCoversEnabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(selectedImageFromLocation);
  const [loadedOriginalIndices, setLoadedOriginalIndices] = useState(() => new Set());
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const thumbnailRailRef = useRef(null);
  const thumbnailClickGuardRef = useRef(false);
  const selectedImageRef = useRef(null);
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const mobile = viewportWidth <= 809;
  const recordLoadedOriginal = useCallback((index) => {
    setLoadedOriginalIndices((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
  }, []);
  useLayoutEffect(() => {
    if (!active) {
      setIsEntering(false);
      return undefined;
    }

    const routeImage = selectedImageFromLocation();
    selectedImageRef.current = routeImage;
    setSelectedImage(routeImage);
    setIsEntering(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setIsEntering(false), reducedMotion ? 1 : 1350);
    return () => window.clearTimeout(timer);
  }, [active]);
  useEffect(() => {
    if (selectedImage === null) return;

    // Give the active DOM image its URL immediately. The browser can begin
    // the visible request without waiting for the separate preloader to
    // finish loading and decoding the same file.
    recordLoadedOriginal(selectedImage);
    prioritizedOriginalIndices(selectedImage).forEach((index) => {
      if (index === selectedImage) return;
      preloadImage(PHOTOGRAPHY_ARCHIVE[index], "high")
        .then((loaded) => {
          if (loaded) recordLoadedOriginal(index);
        });
    });
  }, [recordLoadedOriginal, selectedImage]);
  useEffect(() => {
    let cancelled = false;
    let cursor = 0;

    const warmOriginals = async () => {
      await preloadPhotographyEntry();
      await Promise.all(Array.from({ length: 3 }, async () => {
        while (!cancelled && cursor < PHOTOGRAPHY_ARCHIVE.length) {
          const index = cursor;
          cursor += 1;
          const loaded = await preloadImage(PHOTOGRAPHY_ARCHIVE[index]);
          if (cancelled) return;
          if (loaded) recordLoadedOriginal(index);
        }
      }));
    };

    warmOriginals();
    return () => {
      cancelled = true;
    };
  }, [recordLoadedOriginal]);
  // Mobile is a finite gallery. Desktop keeps one duplicate cycle for
  // seamless looping while avoiding unnecessary image decoding.
  const cycleCount = mobile ? 1 : 2;
  const initialCycle = mobile ? 0 : 1;
  const initialProgress = PHOTOGRAPHY_ARCHIVE.length * initialCycle;
  const motionInitializedRef = useRef(false);
  const deferredCardsRevealedRef = useRef(false);
  const initialGateUnlockedRef = useRef(false);
  const motionRef = useRef({
    current: initialProgress,
    target: initialProgress,
    down: false,
    lastX: 0,
    lastY: 0,
    dragDistance: 0,
    pressedImage: null,
  });
  useEffect(() => {
    // The component is mounted only while the photography route is active for
    // the first time. Mark it resumable only after a real route change hides
    // it; StrictMode's mount rehearsal never changes `active` to false.
    if (!active) motionInitializedRef.current = true;
  }, [active]);
  const selectDetailImage = (index, push = false) => {
    selectedImageRef.current = index;
    setSelectedImage(index);
    const method = push ? "pushState" : "replaceState";
    window.history[method]({}, "", `/Photo/${index + 1}${window.location.search}`);
  };
  const closeDetailImage = () => {
    selectedImageRef.current = null;
    setSelectedImage(null);
    window.history.replaceState({}, "", `/Photo${window.location.search}`);
  };
  useEffect(() => {
    selectedImageRef.current = selectedImage;
  }, [selectedImage]);
  useEffect(() => {
    const syncSelectedImage = () => {
      const index = selectedImageFromLocation();
      selectedImageRef.current = index;
      setSelectedImage(index);
    };
    window.addEventListener("popstate", syncSelectedImage);
    window.addEventListener("hashchange", syncSelectedImage);
    return () => {
      window.removeEventListener("popstate", syncSelectedImage);
      window.removeEventListener("hashchange", syncSelectedImage);
    };
  }, []);
  const images = useMemo(
    () => Array.from({ length: cycleCount }, () => PHOTOGRAPHY_COVERS).flat(),
    [cycleCount],
  );
  const step = mobile
    ? { x: 132, y: -92, z: -210 }
    : viewportWidth < 1200
      ? { x: 190, y: -78, z: -250 }
      : { x: 240, y: -84, z: -288 };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return undefined;

    const state = motionRef.current;
    const cycleLength = PHOTOGRAPHY_ARCHIVE.length;
    const cycleShift = cycleLength;
    const minProgress = mobile ? 0 : 5;
    const maxProgress = mobile ? cycleLength - 1 : Number.POSITIVE_INFINITY;
    const unlockProgress = initialProgress + 3;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resumeMotion = motionInitializedRef.current;
    let backwardScrollLocked = !mobile && !reducedMotion && !initialGateUnlockedRef.current;
    if (backwardScrollLocked) stage.classList.add("is-initial-lock");
    // Rebase the desktop duplicate cycle before its tail/head becomes visible.
    const forwardBoundary = cycleLength * cycleCount - 5;
    const backwardBoundary = 5;
    const dragScale = mobile ? 0.005 : 0.0032;
    const scrollPerItem = mobile ? 360 : viewportWidth < 1200 ? 500 : 600;
    const maxPointerDelta = 32;
    const setTrackTransform = (x, y, z) => {
      track.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    };
    // The reference page enters by returning one full perspective cycle to
    // zero, using the same frame-smoothed track motion as normal scrolling.
    const entryOffset = resumeMotion
      ? { x: 0, y: 0, z: 0 }
      : {
          x: -cycleLength * step.x,
          y: -cycleLength * step.y,
          z: -cycleLength * step.z,
        };
    const cards = [...track.querySelectorAll(".photography-page__card")];
    const deferredCards = cards.filter((card, index) => index % cycleLength >= 9);
    const finalCardPosition = (index) => ({
      "--card-x": `${index * step.x}px`,
      "--card-y": `${index * step.y}px`,
      "--card-z": `${index * step.z}px`,
    });
    let entryActive = !reducedMotion && !resumeMotion;

    const revealDeferredCards = () => {
      if (deferredCardsRevealedRef.current) return;
      deferredCardsRevealedRef.current = true;
      setDeferredCoversEnabled(true);
      deferredCards.forEach((card) => card.classList.remove("is-entry-deferred"));
    };
    if (reducedMotion || deferredCardsRevealedRef.current) revealDeferredCards();

    const setCardPosition = (card, index) => {
      Object.entries(finalCardPosition(index)).forEach(([property, value]) => card.style.setProperty(property, value));
    };
    cards.forEach(setCardPosition);

    const releaseInitialLock = () => {
      initialGateUnlockedRef.current = true;
      if (!backwardScrollLocked) return;
      backwardScrollLocked = false;
      stage.classList.remove("is-initial-lock");
    };

    const finishEntry = () => {
      if (!entryActive) return;
      entryActive = false;
      entryOffset.x = 0;
      entryOffset.y = 0;
      entryOffset.z = 0;
      cards.forEach((card, index) => {
        setCardPosition(card, index);
        card.style.zIndex = "";
      });
    };

    const constrainInitialScroll = () => {
      if (state.target >= unlockProgress) {
        revealDeferredCards();
      }
      if (!mobile && state.target >= unlockProgress) {
        releaseInitialLock();
      }
      if (!backwardScrollLocked) return;
      state.target = Math.max(initialProgress, state.target);
    };

    const constrainTarget = () => {
      state.target = Math.max(minProgress, Math.min(maxProgress, state.target));
    };

    let animationFrame = 0;
    let lastTime = performance.now();
    const update = (now) => {
      const deltaRatio = Math.min(2, Math.max(0.25, (now - lastTime) / (1000 / 60)));
      lastTime = now;
      constrainInitialScroll();
      constrainTarget();
      // Mobile follows touch input a little faster while desktop keeps the
      // reference collection's 0.12-per-frame tracking.
      const frameFollow = mobile ? 0.2 : 0.12;
      const frameEase = 1 - Math.pow(1 - frameFollow, deltaRatio);
      const entryEase = 1 - Math.pow(0.92, deltaRatio);
      state.current += (state.target - state.current) * frameEase;
      if (entryActive) {
        entryOffset.x += (0 - entryOffset.x) * entryEase;
        entryOffset.y += (0 - entryOffset.y) * entryEase;
        entryOffset.z += (0 - entryOffset.z) * entryEase;
        if (Math.max(Math.abs(entryOffset.x), Math.abs(entryOffset.y), Math.abs(entryOffset.z)) < 0.1) {
          entryActive = false;
          entryOffset.x = 0;
          entryOffset.y = 0;
          entryOffset.z = 0;
        }
      }

      // Keep one complete cycle loaded on both sides of the visible cycle.
      // Rebase only after the preload window is safely behind the viewport;
      // shifting by two identical cycles preserves every rendered position.
      if (!mobile && state.current > forwardBoundary) {
        state.current -= cycleShift;
        state.target -= cycleShift;
      } else if (!mobile && state.current < backwardBoundary) {
        state.current += cycleShift;
        state.target += cycleShift;
      }

      setTrackTransform(
        -state.current * step.x + entryOffset.x,
        -state.current * step.y + entryOffset.y,
        -state.current * step.z + entryOffset.z,
      );
      animationFrame = requestAnimationFrame(update);

    };

    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      finishEntry();
      const wheelScale = 1 / scrollPerItem;
      state.target += event.deltaY * wheelScale + event.deltaX * wheelScale * 0.45;
      constrainInitialScroll();
      constrainTarget();
    };

    const onPointerDown = (event) => {
      if (event.button !== 0 || event.target.closest(".photography-page__return")) return;
      finishEntry();
      const card = event.target.closest(".photography-page__card");
      state.down = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.dragDistance = 0;
      state.pressedImage = card ? Number(card.dataset.photoIndex) : null;
      stage.setPointerCapture?.(event.pointerId);
      stage.classList.add("is-dragging");
    };

    const onPointerMove = (event) => {
      if (!state.down) return;
      const verticalDelta = state.lastY - event.clientY;
      const horizontalDelta = event.clientX - state.lastX;
      state.dragDistance += Math.hypot(horizontalDelta, verticalDelta);
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      const movement = Math.max(
        -maxPointerDelta,
        Math.min(maxPointerDelta, verticalDelta + horizontalDelta * 0.35),
      );
      state.target += movement * dragScale;
      constrainInitialScroll();
      constrainTarget();
    };

    const finishPointer = (event, allowOpen) => {
      if (!state.down) return;
      const imageToOpen = state.pressedImage;
      const shouldOpen = allowOpen && imageToOpen !== null && state.dragDistance < 12;
      state.down = false;
      state.pressedImage = null;
      if (stage.hasPointerCapture?.(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      stage.classList.remove("is-dragging");
      if (shouldOpen) selectDetailImage(imageToOpen, true);
    };

    const onPointerUp = (event) => finishPointer(event, true);
    const onPointerCancel = (event) => finishPointer(event, false);

    // Apply the entry position before the first paint so the normal track
    // position never flashes before the reference-style motion begins.
    setTrackTransform(
      -state.current * step.x + entryOffset.x,
      -state.current * step.y + entryOffset.y,
      -state.current * step.z + entryOffset.z,
    );
    animationFrame = requestAnimationFrame(update);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerCancel);

    return () => {
      stage.classList.remove("is-initial-lock");
      cancelAnimationFrame(animationFrame);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [active, step.x, step.y, step.z]);

  useLayoutEffect(() => {
    if (selectedImage === null || !thumbnailRailRef.current) return undefined;
    const rail = thumbnailRailRef.current;
    const detail = rail.closest(".photography-page__detail");
    const thumbnails = [...rail.querySelectorAll(".photography-page__thumbnail")];
    const thumbnailCenters = new Map(thumbnails.map((thumbnail) => [
      thumbnail,
      thumbnail.offsetTop + thumbnail.offsetHeight / 2,
    ]));
    const offsets = new Map();
    const interaction = { down: false, lastY: 0, distance: 0, pressedIndex: null, velocity: 0 };
    const scroll = { current: 0, target: 0, pendingIndex: null };
    let frame = 0;
    let lastFrameTime = performance.now();
    let wheelTimer = 0;

    const centeredScrollTop = (thumbnail) => (
      thumbnailCenters.get(thumbnail) - rail.clientHeight / 2
    );
    const clampScroll = (value) => Math.max(0, Math.min(rail.scrollHeight - rail.clientHeight, value));
    const nearestThumbnail = (position = scroll.target) => (
      thumbnails.reduce((nearest, thumbnail) => {
        const distance = Math.abs(centeredScrollTop(thumbnail) - position);
        return !nearest || distance < nearest.distance ? { thumbnail, distance } : nearest;
      }, null)?.thumbnail
    );
    const settleOnThumbnail = (thumbnail) => {
      if (!thumbnail) return;
      scroll.target = clampScroll(centeredScrollTop(thumbnail));
      scroll.pendingIndex = Number(thumbnail.dataset.thumbnailIndex);
    };
    const settleNearest = () => settleOnThumbnail(nearestThumbnail(scroll.target));

    const updateThumbnailCurve = () => {
      const deltaRatio = Math.min(2, Math.max(0.25, (performance.now() - lastFrameTime) / (1000 / 60)));
      lastFrameTime = performance.now();
      const scrollFollow = scroll.pendingIndex === null
        ? (mobile ? 0.08 : 0.03)
        : (mobile ? 0.18 : 0.12);
      const scrollEase = 1 - Math.pow(1 - scrollFollow, deltaRatio);
      const curveEase = 1 - Math.pow(0.92, deltaRatio);
      scroll.current += (scroll.target - scroll.current) * scrollEase;
      if (Math.abs(scroll.target - scroll.current) < 0.02) scroll.current = scroll.target;
      rail.scrollTop = scroll.current;

      const center = scroll.current + rail.clientHeight / 2;
      const radius = window.innerWidth <= 809 ? 220 : 280;
      const maximumOffset = window.innerWidth <= 809 ? 24 : 64;

      thumbnails.forEach((thumbnail) => {
        const distance = Math.abs(thumbnailCenters.get(thumbnail) - center);
        const proximity = distance < radius ? 1 - distance / radius : 0;
        const targetOffset = proximity * proximity * maximumOffset;
        const currentOffset = offsets.get(thumbnail) ?? 0;
        const nextOffset = currentOffset + (targetOffset - currentOffset) * curveEase;
        offsets.set(thumbnail, nextOffset);
        thumbnail.style.setProperty("--thumbnail-curve-x", `${nextOffset}px`);
      });

      const centeredThumbnail = nearestThumbnail(scroll.current);
      const centeredIndex = centeredThumbnail
        ? Number(centeredThumbnail.dataset.thumbnailIndex)
        : null;
      if (centeredIndex !== null && centeredIndex !== selectedImageRef.current) {
        selectDetailImage(centeredIndex);
      }

      if (scroll.pendingIndex !== null && Math.abs(scroll.target - scroll.current) < 0.35) {
        scroll.pendingIndex = null;
      }
      frame = requestAnimationFrame(updateThumbnailCurve);
    };

    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const deltaMultiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientHeight : 1;
      scroll.target = clampScroll(scroll.target + (event.deltaY + event.deltaX) * deltaMultiplier);
      scroll.pendingIndex = null;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(settleNearest, 140);
    };
    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      const thumbnail = event.target.closest(".photography-page__thumbnail");
      interaction.down = true;
      interaction.lastY = event.clientY;
      interaction.distance = 0;
      interaction.pressedIndex = thumbnail ? Number(thumbnail.dataset.thumbnailIndex) : null;
      interaction.velocity = 0;
      scroll.target = scroll.current;
      scroll.pendingIndex = null;
      window.clearTimeout(wheelTimer);
      thumbnailClickGuardRef.current = false;
      rail.setPointerCapture?.(event.pointerId);
      rail.classList.add("is-dragging");
    };
    const onPointerMove = (event) => {
      if (!interaction.down) return;
      const delta = event.clientY - interaction.lastY;
      interaction.lastY = event.clientY;
      interaction.distance += Math.abs(delta);
      interaction.velocity = delta;
      scroll.target = clampScroll(scroll.target - delta);
    };
    const finishPointer = (event, allowSelection) => {
      if (!interaction.down) return;
      const wasDrag = interaction.distance >= 8;
      const pressedIndex = interaction.pressedIndex;
      interaction.down = false;
      interaction.pressedIndex = null;
      thumbnailClickGuardRef.current = wasDrag;
      if (rail.hasPointerCapture?.(event.pointerId)) rail.releasePointerCapture(event.pointerId);
      rail.classList.remove("is-dragging");
      if (!wasDrag && allowSelection && pressedIndex !== null) {
        settleOnThumbnail(thumbnails[pressedIndex]);
      } else {
        scroll.target = clampScroll(scroll.target - interaction.velocity * (mobile ? 3.2 : 2.4));
        settleNearest();
      }
    };
    const onPointerUp = (event) => finishPointer(event, true);
    const onPointerCancel = (event) => finishPointer(event, false);

    const activeThumbnail = thumbnails[selectedImage];
    scroll.current = clampScroll(centeredScrollTop(activeThumbnail));
    scroll.target = scroll.current;
    rail.scrollTop = scroll.current;
    frame = requestAnimationFrame(updateThumbnailCurve);
    detail?.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", onPointerUp);
    rail.addEventListener("pointercancel", onPointerCancel);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelTimer);
      detail?.removeEventListener("wheel", onWheel);
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", onPointerUp);
      rail.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [selectedImage === null]);

  return (
    <section
      className={`photography-page${isEntering ? " is-entering" : ""}${active ? " is-active" : " is-hidden"}`}
      aria-label="摄影作品"
      aria-hidden={!active}
    >
      <div ref={stageRef} className="photography-page__stage">
        <header className="photography-page__heading">
          <h1><span className="photography-reveal-line">2025-2026</span><br /><span className="photography-reveal-line">人像摄影集</span></h1>
          <p>({PHOTOGRAPHY_ARCHIVE.length})</p>
        </header>
        <div ref={trackRef} className="photography-page__track">
            {images.map((src, index) => {
              const photoIndex = index % PHOTOGRAPHY_ARCHIVE.length;
              const sourceEnabled = photoIndex < 9 || deferredCoversEnabled;
              return (
              <button
              className={`photography-page__card${index < initialProgress ? " is-prestart" : ""}${!sourceEnabled ? " is-entry-deferred" : ""}`}
              type="button"
              key={`${src}-${index}`}
              aria-label={`查看摄影作品 ${photoIndex + 1}`}
                data-photo-index={photoIndex}
                style={{
                  "--card-x": `${index * step.x}px`,
                  "--card-y": `${index * step.y}px`,
                  "--card-z": `${index * step.z}px`,
                }}
                onClick={(event) => {
                  if (event.detail === 0) selectDetailImage(photoIndex, true);
                }}
              >
              <span className="photography-page__visual">
                {sourceEnabled && (
                  <img
                    className="photography-page__card-lqip"
                    src={PHOTOGRAPHY_THUMBNAILS[photoIndex]}
                    alt=""
                    loading={photoIndex < 9 ? "eager" : "lazy"}
                    decoding="async"
                    aria-hidden="true"
                    draggable="false"
                  />
                )}
                <img
                  className="photography-page__card-image"
                  ref={revealLoadedImage}
                  src={sourceEnabled ? src : undefined}
                  alt={`摄影作品 ${photoIndex + 1}`}
                  loading={photoIndex < 9 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={photoIndex < 9 ? "high" : "auto"}
                  draggable="false"
                  onLoad={(event) => revealLoadedImage(event.currentTarget)}
                />
              </span>
            </button>
              );
            })}
        </div>
      </div>
      <p className="photography-page__hint">{mobile ? "滑动浏览" : "滚动浏览"}</p>
      <button
        className={`photography-page__return${selectedImage === null ? "" : " is-detail"}`}
        type="button"
        aria-label={selectedImage === null ? "返回项目" : "返回摄影作品"}
        onClick={() => (selectedImage === null ? onClose() : closeDetailImage())}
      >
        <SlashHoverLabel label="返回项目" />
      </button>
      {selectedImage !== null && (
        <div className="photography-page__detail" role="dialog" aria-label="照片查看">
          <aside
            ref={thumbnailRailRef}
            className="photography-page__thumbnails"
            aria-label="摄影作品缩略图"
          >
            {PHOTOGRAPHY_THUMBNAILS.map((src, index) => {
              const [width, height] = PHOTOGRAPHY_DIMENSIONS[index];
              return (
              <button
                className="photography-page__thumbnail"
                type="button"
                key={`${src}-thumbnail-${index}`}
                data-thumbnail-index={index}
                aria-label={`查看摄影作品 ${index + 1}`}
                aria-current={selectedImage === index ? "true" : undefined}
                onClick={(event) => {
                  if (thumbnailClickGuardRef.current) {
                    thumbnailClickGuardRef.current = false;
                    event.preventDefault();
                  } else if (event.detail === 0) {
                    selectDetailImage(index);
                  }
                }}
              >
                <img
                  ref={revealLoadedImage}
                  src={src}
                  alt=""
                  width={240}
                  height={Math.round(height * 240 / width)}
                  loading="eager"
                  decoding="async"
                  draggable="false"
                  onLoad={(event) => revealLoadedImage(event.currentTarget)}
                />
              </button>
              );
            })}
          </aside>
          <figure className="photography-page__detail-figure">
            {PHOTOGRAPHY_ARCHIVE.map((src, index) => (
              <div
                className={`photography-page__focus-item${selectedImage === index ? " is-active" : ""}`}
                key={`${src}-focus-${index}`}
                aria-hidden={selectedImage !== index}
              >
                <span className="photography-page__focus-media">
                  <img
                    className="photography-page__detail-lqip"
                    src={selectedImage === index ? PHOTOGRAPHY_THUMBNAILS[index] : undefined}
                    alt=""
                    width={PHOTOGRAPHY_DIMENSIONS[index][0]}
                    height={PHOTOGRAPHY_DIMENSIONS[index][1]}
                    aria-hidden="true"
                    decoding="async"
                    draggable="false"
                  />
                  <img
                    className="photography-page__detail-image"
                    ref={revealLoadedImage}
                    src={loadedOriginalIndices.has(index) ? src : undefined}
                    alt={selectedImage === index ? `摄影作品 ${index + 1}` : ""}
                    width={PHOTOGRAPHY_DIMENSIONS[index][0]}
                    height={PHOTOGRAPHY_DIMENSIONS[index][1]}
                    loading="eager"
                    decoding="async"
                    fetchPriority={selectedImage === index ? "high" : "auto"}
                    draggable="false"
                    onLoad={(event) => revealLoadedImage(event.currentTarget)}
                  />
                </span>
              </div>
            ))}
          </figure>
          <p className="photography-page__detail-count" aria-live="polite">
            {selectedImage + 1}/{PHOTOGRAPHY_ARCHIVE.length}
          </p>
        </div>
      )}
    </section>
  );
}
