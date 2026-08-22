import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import SlashHoverLabel from "./SlashHoverLabel";
import { assetUrl } from "./assetUrl";

const PHOTOGRAPHY_IMAGES = [
  "2026-08-20_211457.JPG",
  "2026-08-20_211516.JPG",
  "2026-08-20_211547.JPG",
  "photo-new-41.jpg",
  "2026-08-20_211003.JPG",
  "2026-08-20_222749.JPG",
  "2026-08-20_211033.JPG",
  "2026-08-20_211036.JPG",
  "2026-08-20_211038.JPG",
  "2026-08-20_215919.JPG",
  "2026-08-20_211057.JPG",
  "WechatIMG1273.jpg",
  "WechatIMG1274.jpg",
  "WechatIMG1275.jpg",
  "2026-08-20_211110.JPG",
  "2026-08-20_211120.JPG",
  "2026-08-20_211123.JPG",
  "2026-08-20_211256.JPG",
  "photo-after-18-1293.jpg",
  "2026-08-20_211331.JPG",
  "2026-08-20_211338.JPG",
  "2026-08-20_211347.JPG",
  "2026-08-20_211349.JPG",
  "WechatIMG1269.jpg",
  "WechatIMG1279.jpg",
  "2026-08-20_211403.JPG",
  "2026-08-20_211409.JPG",
  "2026-08-20_211609.JPG",
  "2026-08-20_211634.JPG",
  "2026-08-20_211639.JPG",
  "2026-08-20_222842.JPG",
  "2026-08-20_211709.JPG",
  "2026-08-20_211720.JPG",
  "WechatIMG1271.jpg",
  "2026-08-20_211730.JPG",
  "2026-08-20_214537.JPG",
  "2026-08-20_214539.JPG",
  "photo-replacement-37-1290.jpg",
  "photo-after-37-1288.jpg",
  "photo-after-37-1289.jpg",
  "2026-08-20_215913.JPG",
  "2026-08-20_215916.JPG",
  "2026-08-20_215934.JPG",
  "2026-08-20_215937.JPG",
  "2026-08-20_215942.JPG",
  "photo-after-42-1300.jpg",
  "photo-after-42-1301.jpg",
  "photo-after-42-1302.jpg",
  "photo-after-42-1303.jpg",
  "photo-replacement-1.jpg",
  "photo-replacement-2.jpg",
  "2026-08-20_211228.JPG",
  "2026-08-20_222734.JPG",
  "2026-08-20_211208.JPG",
  "2026-08-20_211219.JPG",
  "photo-after-48-1292.jpg",
  "photo-after-48-1291.jpg",
  "WechatIMG1276.jpg",
  "WechatIMG1277.jpg",
  "WechatIMG1278.jpg",
  "WechatIMG1280.jpg",
  "WechatIMG1281.jpg",
  "WechatIMG1282.jpg",
  "WechatIMG1283.jpg",
].map((filename) => assetUrl(`/assets/photography/${filename}`));

const PHOTOGRAPHY_ARCHIVE = PHOTOGRAPHY_IMAGES;

function selectedImageFromHash() {
  if (typeof window === "undefined") return null;
  const value = Number(window.location.hash.match(/^#photography\/(\d+)$/)?.[1]);
  return value >= 1 && value <= PHOTOGRAPHY_ARCHIVE.length ? value - 1 : null;
}

export default function PhotographyPage({ onClose }) {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const thumbnailRailRef = useRef(null);
  const thumbnailClickGuardRef = useRef(false);
  const selectedImageRef = useRef(null);
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const mobile = viewportWidth <= 809;
  // Keep enough surrounding cycles for seamless rebasing without asking
  // mobile browsers to decode hundreds of duplicate image elements.
  const cycleCount = mobile ? 3 : 5;
  const initialCycle = Math.floor(cycleCount / 2);
  const initialProgress = PHOTOGRAPHY_ARCHIVE.length * initialCycle;
  const motionRef = useRef({
    current: initialProgress,
    target: initialProgress,
    down: false,
    lastX: 0,
    lastY: 0,
    dragDistance: 0,
    pressedImage: null,
  });
  const [selectedImage, setSelectedImage] = useState(selectedImageFromHash);
  const selectDetailImage = (index, push = false) => {
    selectedImageRef.current = index;
    setSelectedImage(index);
    const method = push ? "pushState" : "replaceState";
    window.history[method]({}, "", `#photography/${index + 1}`);
  };
  const closeDetailImage = () => {
    selectedImageRef.current = null;
    setSelectedImage(null);
    window.history.replaceState({}, "", "#photography");
  };
  useEffect(() => {
    selectedImageRef.current = selectedImage;
  }, [selectedImage]);
  useEffect(() => {
    const syncSelectedImage = () => {
      const index = selectedImageFromHash();
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
    () => Array.from({ length: cycleCount }, () => PHOTOGRAPHY_ARCHIVE).flat(),
    [],
  );
  const step = mobile
    ? { x: 132, y: -92, z: -210 }
    : viewportWidth < 1200
      ? { x: 190, y: -78, z: -250 }
      : { x: 240, y: -84, z: -288 };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return undefined;

    const state = motionRef.current;
    const cycleLength = PHOTOGRAPHY_ARCHIVE.length;
    const cycleShift = cycleLength * 2;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let backwardScrollLocked = !reducedMotion;
    if (backwardScrollLocked) stage.classList.add("is-initial-lock");
    // Keep a complete cycle on either side of the centered cycle. The last
    // few cards are excluded from the rebase boundary so the viewport never
    // reaches an empty tail/head during a fast swipe.
    const forwardBoundary = cycleLength * (cycleCount - 1) + cycleLength - 5;
    const backwardBoundary = 5;
    const dragScale = mobile ? 0.0028 : 0.0032;
    const scrollPerItem = mobile ? 430 : viewportWidth < 1200 ? 500 : 600;
    const maxPointerDelta = 32;
    const setX = gsap.quickSetter(track, "x", "px");
    const setY = gsap.quickSetter(track, "y", "px");
    const setZ = gsap.quickSetter(track, "z", "px");
    // The reference page enters by returning one full perspective cycle to
    // zero, using the same frame-smoothed track motion as normal scrolling.
    const entryOffset = {
      x: -cycleLength * step.x,
      y: -cycleLength * step.y,
      z: -cycleLength * step.z,
    };
    const cards = [...track.querySelectorAll(".photography-page__card")];
    const finalCardPosition = (index) => ({
      "--card-x": `${index * step.x}px`,
      "--card-y": `${index * step.y}px`,
      "--card-z": `${index * step.z}px`,
    });
    let entryActive = !reducedMotion;

    cards.forEach((card, index) => gsap.set(card, finalCardPosition(index)));

    const releaseInitialLock = () => {
      if (!backwardScrollLocked) return;
      backwardScrollLocked = false;
      stage.classList.remove("is-initial-lock");
    };

    const finishEntry = () => {
      releaseInitialLock();
      if (!entryActive) return;
      entryActive = false;
      entryOffset.x = 0;
      entryOffset.y = 0;
      entryOffset.z = 0;
      cards.forEach((card, index) => {
        gsap.set(card, finalCardPosition(index));
        card.style.zIndex = "";
      });
    };

    const constrainInitialScroll = () => {
      if (!backwardScrollLocked) return;
      state.target = Math.max(initialProgress, state.target);
    };

    const update = () => {
      constrainInitialScroll();
      // Match the reference collection's smooth scroll tracking (0.12 per frame).
      const frameEase = 1 - Math.pow(0.88, gsap.ticker.deltaRatio(60));
      state.current += (state.target - state.current) * frameEase;
      if (entryActive) {
        entryOffset.x += (0 - entryOffset.x) * frameEase;
        entryOffset.y += (0 - entryOffset.y) * frameEase;
        entryOffset.z += (0 - entryOffset.z) * frameEase;
        if (Math.max(Math.abs(entryOffset.x), Math.abs(entryOffset.y), Math.abs(entryOffset.z)) < 0.1) {
          entryActive = false;
          entryOffset.x = 0;
          entryOffset.y = 0;
          entryOffset.z = 0;
          releaseInitialLock();
        }
      }

      // Keep one complete cycle loaded on both sides of the visible cycle.
      // Rebase only after the preload window is safely behind the viewport;
      // shifting by two identical cycles preserves every rendered position.
      if (state.current > forwardBoundary) {
        state.current -= cycleShift;
        state.target -= cycleShift;
      } else if (state.current < backwardBoundary) {
        state.current += cycleShift;
        state.target += cycleShift;
      }

      setX(-state.current * step.x + entryOffset.x);
      setY(-state.current * step.y + entryOffset.y);
      setZ(-state.current * step.z + entryOffset.z);

    };

    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      finishEntry();
      const wheelScale = 1 / scrollPerItem;
      state.target += event.deltaY * wheelScale + event.deltaX * wheelScale * 0.45;
      constrainInitialScroll();
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
    setX(-state.current * step.x + entryOffset.x);
    setY(-state.current * step.y + entryOffset.y);
    setZ(-state.current * step.z + entryOffset.z);
    gsap.ticker.add(update);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerCancel);

    return () => {
      stage.classList.remove("is-initial-lock");
      gsap.ticker.remove(update);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [step.x, step.y, step.z]);

  useLayoutEffect(() => {
    if (selectedImage === null || !thumbnailRailRef.current) return undefined;
    const rail = thumbnailRailRef.current;
    const detail = rail.closest(".photography-page__detail");
    const thumbnails = [...rail.querySelectorAll(".photography-page__thumbnail")];
    const offsets = new Map();
    const interaction = { down: false, lastY: 0, distance: 0, pressedIndex: null, velocity: 0 };
    const scroll = { current: 0, target: 0, pendingIndex: null };
    let frame = 0;
    let wheelTimer = 0;

    const centeredScrollTop = (thumbnail) => (
      thumbnail.offsetTop + thumbnail.offsetHeight / 2 - rail.clientHeight / 2
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
      const deltaRatio = gsap.ticker.deltaRatio(60);
      const scrollFollow = scroll.pendingIndex === null ? 0.03 : 0.12;
      const scrollEase = 1 - Math.pow(1 - scrollFollow, deltaRatio);
      const curveEase = 1 - Math.pow(0.92, deltaRatio);
      scroll.current += (scroll.target - scroll.current) * scrollEase;
      if (Math.abs(scroll.target - scroll.current) < 0.02) scroll.current = scroll.target;
      rail.scrollTop = scroll.current;

      const railRect = rail.getBoundingClientRect();
      const center = railRect.top + railRect.height / 2;
      const radius = window.innerWidth <= 809 ? 220 : 280;
      const maximumOffset = window.innerWidth <= 809 ? 24 : 64;

      thumbnails.forEach((thumbnail) => {
        const rect = thumbnail.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
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
        scroll.target = clampScroll(scroll.target - interaction.velocity * 2.4);
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
    <section className="photography-page" aria-label="摄影作品">
      <div ref={stageRef} className="photography-page__stage">
        <header className="photography-page__heading">
          <h1>2025-2026<br />人像摄影集</h1>
          <p>({PHOTOGRAPHY_ARCHIVE.length})</p>
        </header>
        <div ref={trackRef} className="photography-page__track">
            {images.map((src, index) => (
              <button
              className={`photography-page__card${index < initialProgress ? " is-prestart" : ""}`}
              type="button"
              key={`${src}-${index}`}
              aria-label={`Preview YanQi personal IP study ${index % PHOTOGRAPHY_ARCHIVE.length + 1}`}
                data-photo-index={index % PHOTOGRAPHY_ARCHIVE.length}
                style={{
                  "--card-x": `${index * step.x}px`,
                  "--card-y": `${index * step.y}px`,
                  "--card-z": `${index * step.z}px`,
                }}
                onClick={(event) => {
                  if (event.detail === 0) selectDetailImage(index % PHOTOGRAPHY_ARCHIVE.length, true);
                }}
              >
              <span className="photography-page__visual">
                <img src={src} alt={`摄影作品 ${index % PHOTOGRAPHY_ARCHIVE.length + 1}`} draggable="false" />
              </span>
            </button>
          ))}
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
            {PHOTOGRAPHY_ARCHIVE.map((src, index) => (
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
                <img src={src} alt="" draggable="false" />
              </button>
            ))}
          </aside>
          <figure className="photography-page__detail-figure">
            {PHOTOGRAPHY_ARCHIVE.map((src, index) => (
              <div
                className={`photography-page__focus-item${selectedImage === index ? " is-active" : ""}`}
                key={`${src}-focus-${index}`}
                aria-hidden={selectedImage !== index}
              >
                <img
                  className="photography-page__detail-image"
                  src={src}
                  alt={selectedImage === index ? `摄影作品 ${index + 1}` : ""}
                  decoding="async"
                  draggable="false"
                />
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
