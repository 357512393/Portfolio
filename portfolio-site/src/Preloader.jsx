import { useEffect, useRef, useState } from "react";

const MINIMUM_DISPLAY_MS = 280;
const TEXT_ANIMATION_MS = 1100;
const HOLD_AFTER_TEXT_MS = 300;
const MOVE_TO_BRAND_MS = 700;
const FINAL_BRAND_HEIGHT_PX = 16 * 0.72 * 2;

function preloadImage(url, priority = "low") {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = priority;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    image.onload = async () => {
      try {
        if (typeof image.decode === "function") await image.decode();
      } catch {
        // A decoded frame is a performance hint, not a reason to block the page.
      }
      finish();
    };
    image.onerror = finish;
    image.src = url;
    if (image.complete) {
      Promise.resolve(image.decode?.()).catch(() => {}).then(finish);
    }
  });
}

async function preloadBatch(urls, concurrency = 6, priority = "low") {
  let cursor = 0;
  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor];
      cursor += 1;
      await preloadImage(url, priority);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
}

export default function Preloader({ sources = [], criticalCount = 8, onComplete, visible = true, animate = true }) {
  const nameRef = useRef(null);
  const [isEntering, setIsEntering] = useState(!animate);
  const [isMoving, setIsMoving] = useState(!animate);
  const [isHandoff, setIsHandoff] = useState(!animate);

  useEffect(() => {
    if (!animate) return undefined;
    let cancelled = false;
    const startedAt = performance.now();
    const uniqueSources = [...new Set(sources.filter(Boolean))];
    const criticalSources = uniqueSources.slice(0, criticalCount);
    const deferredSources = uniqueSources.slice(criticalCount);

    const timers = [];
    preloadBatch(criticalSources, 4, "high").then(() => {
      const remaining = Math.max(0, MINIMUM_DISPLAY_MS - (performance.now() - startedAt));
      timers.push(window.setTimeout(() => {
        if (cancelled) return;
        setIsEntering(true);
        timers.push(window.setTimeout(() => {
          if (cancelled) return;
          const name = nameRef.current;
          if (name) {
            const fontSize = Number.parseFloat(window.getComputedStyle(name).fontSize) || 16;
            const edgeYToken = window.getComputedStyle(document.documentElement).getPropertyValue("--edge-y").trim();
            const edgeY = edgeYToken.endsWith("px")
              ? Number.parseFloat(edgeYToken)
              : Math.min(28, Math.max(16, window.innerHeight * 0.022222));
            const bounds = name.getBoundingClientRect();
            name.style.setProperty("--preloader-brand-scale", String(16 / fontSize));
            name.style.setProperty("--preloader-brand-shift-y", `${edgeY + FINAL_BRAND_HEIGHT_PX - bounds.bottom}px`);
            name.dataset.scaleReady = "true";
          }
          setIsMoving(true);
          timers.push(window.setTimeout(() => {
            if (cancelled) return;
            setIsHandoff(true);
            preloadBatch(deferredSources, 6, "high");
            onComplete?.();
          }, MOVE_TO_BRAND_MS + 100));
        }, TEXT_ANIMATION_MS + HOLD_AFTER_TEXT_MS));
      }, remaining));
    });

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [animate, sources]);

  return (
    <div
      className={`preloader${visible ? "" : " is-hidden"}${isEntering ? " is-entering" : ""}${isMoving ? " is-moving" : ""}${isHandoff ? " is-handoff" : ""}`}
      aria-label="正在加载作品"
      aria-busy={!isHandoff}
    >
      <div className="preloader__intro" aria-hidden="true">
        <div ref={nameRef} className="preloader__name">
          <span className="preloader__line"><span>KUN</span></span>
          <span className="preloader__line"><span>HONG</span></span>
        </div>
      </div>
      <div className="preloader__cover" aria-hidden="true" />
    </div>
  );
}
