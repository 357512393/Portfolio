import { useCallback, useEffect, useRef, useState } from "react";
import { projectMobileAssetUrl } from "./projectAssets";

function getDesktopProjectMediaSources(project) {
  return project.images?.length
    ? [project.image, ...project.images]
    : [project.image];
}

function getProjectMediaSources(project, compact = false) {
  const sources = getDesktopProjectMediaSources(project);
  return compact ? sources.map(projectMobileAssetUrl) : sources;
}

function ProjectMedia({ project, compact = false, mobile = false, switching = false, contentRef }) {
  const images = getProjectMediaSources(project, compact);

  return (
    <div ref={contentRef} className={mobile ? "project-page__mobile-media" : "project-page__media"}>
      {images.map((image, index) => (
        <figure
          key={image}
          className={`project-page__media-item${switching ? " is-project-switching" : ""}`}
          style={{ "--project-media-index": index }}
        >
          <img
            src={image}
            alt={`${project.title}项目展示 ${index + 1}`}
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </figure>
      ))}
    </div>
  );
}

function ProjectCopy({ project, copyRef, copyScrollable, className = "" }) {
  return (
    <article ref={copyRef} className={`project-page__copy ${className}`.trim() + (copyScrollable ? " is-scrollable" : "")}>
      <div className="project-page__meta">
        <h2 id="project-page-title">{project.title}</h2>
        <p>{project.year}</p>
      </div>
      <div className="project-page__body">
        <p className="project-page__description">{project.description}</p>
        <ul>
          {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </div>
    </article>
  );
}

function MobileProjectView({ project, copyScrollable, copyRef, className = "" }) {
  return (
    <div className={`project-page__mobile-view ${className}`.trim()}>
      <ProjectMedia project={project} compact mobile />
      <ProjectCopy project={project} copyRef={copyRef} copyScrollable={copyScrollable} />
    </div>
  );
}

const imagePreloadCache = new Map();
const imagePreloadSettled = new Set();
const PROJECT_MEDIA_DURATION = 420;
const PROJECT_MEDIA_STAGGER = 70;
const PROJECT_MEDIA_LEAD_DELAY = 280;
const PROJECT_ANIMATION_BUFFER = 40;

function preloadImage(src, priority = "auto") {
  if (imagePreloadCache.has(src)) return imagePreloadCache.get(src);

  const promise = new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      imagePreloadSettled.add(src);
      resolve();
    };
    const decode = () => {
      if (typeof image.decode !== "function") {
        finish();
        return;
      }
      let decoded;
      try {
        decoded = image.decode();
      } catch {
        finish();
        return;
      }
      if (!decoded || typeof decoded.then !== "function") {
        finish();
        return;
      }
      decoded.catch(() => {}).then(finish);
    };

    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = priority;
    image.onload = decode;
    image.onerror = finish;
    image.src = src;
    if (image.complete) decode();
  });

  imagePreloadCache.set(src, promise);
  return promise;
}

async function preloadBatch(sources, concurrency = 2, priority = "auto") {
  let cursor = 0;
  const worker = async () => {
    while (cursor < sources.length) {
      const source = sources[cursor];
      cursor += 1;
      await preloadImage(source, priority);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, sources.length) }, worker));
}

function warmProjectFirstMedia(project, compact, priority = "high") {
  return preloadImage(getProjectMediaSources(project, compact)[0], priority);
}

function warmProjectRemainingMedia(project, compact) {
  return preloadBatch(getProjectMediaSources(project, compact).slice(1), 2, "low");
}

function isProjectFirstMediaCached(project, compact) {
  return imagePreloadSettled.has(getProjectMediaSources(project, compact)[0]);
}

export default function ProjectDetail({ projects, activeIndex, compact = false, onSelect, onClose }) {
  const project = projects[activeIndex];
  const mediaRef = useRef(null);
  const mediaContentRef = useRef(null);
  const copyRef = useRef(null);
  const mobileCopyRef = useRef(null);
  const mobileStageRef = useRef(null);
  const panelRef = useRef(null);
  const navigationRequestRef = useRef(0);
  const previousActiveIndexRef = useRef(activeIndex);
  const [copyScrollable, setCopyScrollable] = useState(false);
  const [readyProjectSlug, setReadyProjectSlug] = useState(null);
  const [switchingIndex, setSwitchingIndex] = useState(null);
  const [isProjectEntering, setIsProjectEntering] = useState(true);
  const readyMediaKey = `${project.slug}:${compact ? "compact" : "desktop"}`;
  const mediaReady = readyProjectSlug === readyMediaKey || isProjectFirstMediaCached(project, compact);
  const isProjectSwitching = isProjectEntering || previousActiveIndexRef.current !== activeIndex || switchingIndex === activeIndex;
  const desktopCopyMotionClass = `${isProjectEntering ? " is-project-entering" : ""}${isProjectSwitching ? " is-project-switching" : ""}`;
  const projectAnimationCleanupDelay = Math.max(
    360,
    PROJECT_MEDIA_LEAD_DELAY + PROJECT_MEDIA_DURATION + Math.max(0, (project.images?.length ?? 0) - 1) * PROJECT_MEDIA_STAGGER + PROJECT_ANIMATION_BUFFER,
  );
  const stopScrollPropagation = (event) => event.stopPropagation();

  useEffect(() => {
    let cancelled = false;
    setReadyProjectSlug(isProjectFirstMediaCached(project, compact) ? readyMediaKey : null);
    warmProjectFirstMedia(project, compact, "high").then(() => {
      if (!cancelled) {
        setReadyProjectSlug(readyMediaKey);
        warmProjectRemainingMedia(project, compact);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [compact, project, readyMediaKey]);

  useEffect(() => {
    const previousIndex = (activeIndex - 1 + projects.length) % projects.length;
    const nextIndex = (activeIndex + 1) % projects.length;
    const warmNeighbors = () => {
      warmProjectFirstMedia(projects[previousIndex], compact, "low");
      warmProjectFirstMedia(projects[nextIndex], compact, "low");
    };
    const idleId = typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(warmNeighbors, { timeout: 1200 })
      : window.setTimeout(warmNeighbors, 400);

    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [activeIndex, compact, projects]);

  useEffect(() => {
    mediaRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [activeIndex]);

  useEffect(() => {
    if (previousActiveIndexRef.current === activeIndex) {
      return undefined;
    }

    previousActiveIndexRef.current = activeIndex;
    setSwitchingIndex(activeIndex);
    const timer = window.setTimeout(() => setSwitchingIndex(null), projectAnimationCleanupDelay);

    return () => window.clearTimeout(timer);
  }, [activeIndex, projectAnimationCleanupDelay]);

  useEffect(() => {
    if (!isProjectEntering) {
      return undefined;
    }

    const timer = window.setTimeout(() => setIsProjectEntering(false), projectAnimationCleanupDelay);
    return () => window.clearTimeout(timer);
  }, [isProjectEntering, projectAnimationCleanupDelay]);

  useEffect(() => {
    const panel = panelRef.current;
    const stage = mobileStageRef.current;
    const scrollTarget = stage || panel;
    if (!panel || !scrollTarget) return undefined;

    const updateTopFade = () => {
      panel.classList.toggle("is-scrolled", scrollTarget.scrollTop > 0);
    };

    scrollTarget.scrollTo({ top: 0, behavior: "instant" });
    updateTopFade();
    scrollTarget.addEventListener("scroll", updateTopFade, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", updateTopFade);
  }, [activeIndex]);

  useEffect(() => {
    const copy = mobileCopyRef.current || copyRef.current;
    if (!copy) return undefined;

    const updateScrollState = () => {
      setCopyScrollable(copy.scrollHeight > copy.clientHeight + 1);
    };

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(copy);
    if (copy.firstElementChild) resizeObserver.observe(copy.firstElementChild);
    window.addEventListener("resize", updateScrollState);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [activeIndex]);

  const navigate = useCallback((nextIndex) => {
    const requestId = navigationRequestRef.current + 1;
    navigationRequestRef.current = requestId;
    warmProjectFirstMedia(projects[nextIndex], compact, "high").then(() => {
      if (navigationRequestRef.current === requestId) onSelect(nextIndex);
    });
  }, [compact, onSelect, projects]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") navigate((activeIndex - 1 + projects.length) % projects.length);
      if (event.key === "ArrowRight") navigate((activeIndex + 1) % projects.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, navigate, onClose, projects.length]);

  const previous = () => navigate((activeIndex - 1 + projects.length) % projects.length);
  const next = () => navigate((activeIndex + 1) % projects.length);

  return (
    <section
      className={`project-page${mediaReady ? " is-media-ready" : " is-media-loading"}`}
      aria-label={`${project.title}项目详情`}
      aria-busy={!mediaReady}
      onWheel={stopScrollPropagation}
      onTouchMove={stopScrollPropagation}
    >
      <button className="project-page__backdrop" type="button" onClick={onClose} aria-label="关闭项目详情" />
      <aside ref={panelRef} className="project-page__panel" role="dialog" aria-modal="true" aria-labelledby="project-page-title">
        <header className="project-page__header">
          <span>项目</span>
          <span>{projects.length}</span>
          <button type="button" onClick={onClose} aria-label="关闭项目详情">×</button>
          <span className="project-page__handle" aria-hidden="true" />
        </header>

        {compact && (
          <div ref={mobileStageRef} className="project-page__mobile-stage">
            <MobileProjectView project={project} copyScrollable={copyScrollable} copyRef={mobileCopyRef} />
          </div>
        )}

        {!compact && (
          <ProjectCopy
            project={project}
            copyRef={copyRef}
            copyScrollable={copyScrollable}
            className={`project-page__desktop-copy${desktopCopyMotionClass}`}
          />
        )}

        <nav className="project-page__index" aria-label="项目快速切换">
          {projects.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-pressed={index === activeIndex}
              onClick={() => navigate(index)}
            >
              <span>{item.title}</span>
              {index === activeIndex && <span className="project-page__marker" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <footer className="project-page__pager">
          <button type="button" onClick={previous}><span>‹ 上一个</span></button>
          <button type="button" onClick={next}><span>下一个 ›</span></button>
        </footer>
      </aside>

      {!compact && (
        <div ref={mediaRef} className="project-page__desktop-media">
          <ProjectMedia project={project} switching={isProjectSwitching} contentRef={mediaContentRef} />
        </div>
      )}
    </section>
  );
}
