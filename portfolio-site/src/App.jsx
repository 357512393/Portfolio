import { useEffect, useMemo, useState } from "react";
import FlyingPosters from "./FlyingPosters";
import ProjectDetail from "./ProjectDetail";
import AboutPage from "./AboutPage";
import PhotographyPage from "./PhotographyPage";
import SlashHoverLabel from "./SlashHoverLabel";
import { assetUrl } from "./assetUrl";

const projectImages = (slug, numbers) => (
  numbers.map((number) => assetUrl(`/assets/projects/${slug}/${number}.webp`))
);

const projectThumbnailImages = (slug, numbers) => (
  numbers.map((number) => assetUrl(`/assets/project-thumbnails/${slug}/${number}.webp`))
);

const homeCoverImage = (number) => assetUrl(`/assets/home-covers/${number}.webp`);

const detailProjects = [
  {
    image: assetUrl("/assets/2.webp"),
    images: projectImages("paid-live", [5, 6, 7, 8, 9, 10]),
    thumbnails: projectThumbnailImages("paid-live", [1, 2, 3, 4, 5, 6]),
    slug: "paid-live",
    title: "知识付费直播项目",
    type: "产品体验设计",
    scope: "APP · 小程序 · PC",
    year: "2021—2025",
    description: "围绕知识付费直播业务，从用户观看、讲师开播到运营管理，梳理多端关键链路，并持续完善从开课到转化的完整体验。",
    highlights: ["建立移动端与桌面端一致的直播体验框架", "重构开播、观看与互动链路，降低核心任务成本", "与产品、研发协作沉淀可复用的直播组件与规范"],
  },
  {
    image: assetUrl("/assets/3.webp"),
    images: projectImages("pc-live-assistant", [12, 13, 14, 15, 16]),
    thumbnails: projectThumbnailImages("pc-live-assistant", [7, 8, 9, 10, 11]),
    slug: "pc-live-assistant",
    title: "PC直播助手",
    type: "桌面端体验与重构",
    scope: "讲师直播助手 · 中控台",
    year: "2021—2025",
    description: "面向讲师的桌面直播工具，以稳定开播、课堂控制和多媒体管理为核心，重新组织复杂功能的层级与操作反馈。",
    highlights: ["重构直播前、中、后的任务流程与信息架构", "统一中控台状态反馈，提升高频操作可见性", "覆盖异常、弱网与多设备协同场景"],
  },
  {
    image: assetUrl("/assets/4.webp"),
    images: projectImages("ai-design-workflow", [18, 19]),
    thumbnails: projectThumbnailImages("ai-design-workflow", [12, 13]),
    slug: "ai-design-workflow",
    title: "AI设计工作流",
    type: "AI视觉探索",
    scope: "设计研发一体化",
    year: "2026",
    description: "把生成式AI引入需求理解、视觉探索与前端验证，搭建从想法到可交互页面的短链路设计工作流。",
    highlights: ["基于组件映射生成前端代码，实现设计稿到页面的快速落地", "让AI理解产品设计语言，保证生成结果的一致性", "通过 Figma MCP 学习历史页面、业务流程及高频场景，实现业务页面快速生成"],
  },
  {
    image: assetUrl("/assets/5.webp"),
    images: projectImages("ai-apps", [21, 22, 23, 24, 25, 26, 27]),
    thumbnails: projectThumbnailImages("ai-apps", [14, 15, 16, 17, 18, 19, 20]),
    slug: "ai-apps",
    title: "AI应用集合",
    type: "AI助手与智能体",
    scope: "公众号 · 小程序 · 后台",
    year: "2025—2026",
    description: "面向知识付费教育场景，打造服务学员的AI教学助手，兼顾文本问答、语音输入",
    highlights: ["AI 输出结构化答案，分点输出建议，回答清晰易读，适配知识付费场景", "提供两套语音路径，适合快速口述提问和长段口述、解放双手的使用场景，覆盖不同用户操作习惯", "页面完整覆盖：点击快捷提问、文字输入、短语音输入、沉浸式语音通话四种交互方式。"],
  },
  {
    image: assetUrl("/assets/6.webp"),
    images: projectImages("ai-website-design", [29, 30]),
    thumbnails: projectThumbnailImages("ai-website-design", [21, 22]),
    slug: "ai-website-design",
    title: "AI官网设计",
    type: "官网设计",
    scope: "WEB · H5",
    year: "2025—2026",
    description: "以营销转化为目标搭建信息层级，依次传递产品价值、行业痛点与一体化解决方案",
    highlights: ["完成从视觉概念到响应式页面的落地", "保证信息结构、视觉语言保持统一，保障企业客户在不同设备下的阅读体验", "通过模块化复用，在保证视觉统一的前提下，降低多页面的设计与迭代成本"],
  },
  {
    image: assetUrl("/assets/7.webp"),
    images: projectImages("study-abroad", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
    thumbnails: projectThumbnailImages("study-abroad", [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]),
    slug: "study-abroad",
    title: "留学酱",
    type: "产品体验设计",
    scope: "学员端 · 学霸端",
    year: "2019—2021",
    description: "围绕留学咨询与经验服务，连接学员和学霸两种角色，优化匹配、沟通与服务交付的关键过程。",
    highlights: ["梳理产品问题，完善产品流程，提升产品体验，降低用户流失", "优化首页布局，提升核心功能点击率，延长用户停留时间", "合并提问流程，统一交互样式，提升页面内容填写效率"],
  },
  {
    image: assetUrl("/assets/8.webp"),
    images: projectImages("other-design", [32, 33, 34, 35, 36, 37]),
    thumbnails: projectThumbnailImages("other-design", [23, 24, 25, 26, 27, 28]),
    slug: "other-design",
    title: "其他设计",
    type: "功能体验优化",
    scope: "活动 · 视觉 · 优化",
    year: "2024—2026",
    description: "覆盖B端后台工具、C端运营活动、智能AI陪伴玩具、AI创作平台、营销视觉物料等多类业务场景",
    highlights: ["统一组件与布局规范，降低操作人员的认知成本，提升内容编辑效率", "运营活动页面、运营海报围绕业务增长目标设计，让产品功能和营销视觉互相配合", "业务流程做步骤拆解，把复杂链路拆解成清晰的页面流程，降低用户上手难度"],
  },
];

const homeProjects = [
  {
    image: homeCoverImage(1),
    slug: "portfolio-2026",
    detailSlug: "paid-live",
    title: "2026 Portfolio",
    type: "作品集设计",
    scope: "UI/UX · 项目复盘",
  },
  ...detailProjects.map((project, index) => ({
    ...project,
    image: homeCoverImage(index + 2),
  })),
];

function detailProjectIndexFromHash() {
  const slug = window.location.hash.match(/^#project\/(.+)$/)?.[1];
  return slug ? detailProjects.findIndex((project) => project.slug === slug) : -1;
}

function isAboutHash() {
  return window.location.hash === "#about-me" || window.location.hash === "#about";
}

function isPhotographyHash() {
  return /^#photography(?:\/\d+)?$/.test(window.location.hash);
}

function homeProjectIndexForDetail(index) {
  if (index < 0) return 0;
  return homeProjects.findIndex((project) => project.slug === detailProjects[index].slug);
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

function padIndex(index) {
  return String(index + 1).padStart(2, "0");
}

export function App() {
  const width = useViewportWidth();
  const isMobile = width <= 809;
  const desktopWidth = Math.min(1920, Math.max(1280, width));
  // The foreground mesh is enlarged by the perspective camera (~1.35×).
  // 178px renders at ~240px at 1280. The base then follows the viewport
  // proportionally until 1920, where the visible poster reaches ~360px.
  const desktopPosterBase = 178;
  const posterWidth = isMobile ? 176 : desktopPosterBase * (desktopWidth / 1280);
  const posterHeight = posterWidth * 0.5625;
  const [activeIndex, setActiveIndex] = useState(() => homeProjectIndexForDetail(detailProjectIndexFromHash()));
  const [focusRequest, setFocusRequest] = useState(null);
  const [detailIndex, setDetailIndex] = useState(() => detailProjectIndexFromHash());
  const [aboutOpen, setAboutOpen] = useState(() => isAboutHash());
  const [photographyOpen, setPhotographyOpen] = useState(() => isPhotographyHash());
  const [navMotionLocked, setNavMotionLocked] = useState(false);
  const images = useMemo(() => homeProjects.map((project) => project.image), []);
  const active = homeProjects[activeIndex];
  const activeDetailProject = detailProjects.find(
    (project) => project.slug === (active.detailSlug ?? active.slug),
  );
  const thumbnailImages = activeDetailProject?.thumbnails ?? activeDetailProject?.images ?? [];

  useEffect(() => {
    const syncFromHash = () => {
      const index = detailProjectIndexFromHash();
      setDetailIndex(index);
      setAboutOpen(isAboutHash());
      setPhotographyOpen(isPhotographyHash());
      if (index >= 0) {
        const homeIndex = homeProjectIndexForDetail(index);
        if (homeIndex >= 0) {
          setActiveIndex(homeIndex);
          setFocusRequest({ index: homeIndex, token: Date.now() });
        }
      }
    };

    window.addEventListener("popstate", syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("popstate", syncFromHash);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const selectProject = (index) => {
    setActiveIndex(index);
    setFocusRequest({ index, token: Date.now() });
  };

  const handlePosterClick = (index) => {
    if (index === activeIndex) {
      openHomeProject(index);
      return;
    }
    selectProject(index);
  };

  const openHomeProject = (homeIndex, replace = false) => {
    const homeProject = homeProjects[homeIndex];
    const targetSlug = homeProject.detailSlug ?? homeProject.slug;
    const targetDetailIndex = detailProjects.findIndex((project) => project.slug === targetSlug);
    if (targetDetailIndex < 0) return;

    setActiveIndex(homeIndex);
    setFocusRequest({ index: homeIndex, token: Date.now() });
    setDetailIndex(targetDetailIndex);
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", `#project/${targetSlug}`);
  };

  const openDetailProject = (index, replace = false) => {
    const project = detailProjects[index];
    setDetailIndex(index);
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", `#project/${project.slug}`);
  };

  const closeProject = () => {
    const homeIndex = homeProjectIndexForDetail(detailIndex);
    const targetIndex = homeIndex >= 0 ? homeIndex : activeIndex;
    setActiveIndex(targetIndex);
    setFocusRequest({ index: targetIndex, token: Date.now(), immediate: true });
    setDetailIndex(-1);
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  };

  const openAbout = (event) => {
    event?.preventDefault();
    setNavMotionLocked(false);
    setDetailIndex(-1);
    setAboutOpen(true);
    setPhotographyOpen(false);
    window.history.pushState({}, "", "#about-me");
  };

  const openPhotography = (event) => {
    event?.preventDefault();
    setAboutOpen(false);
    setDetailIndex(-1);
    setPhotographyOpen(true);
    window.history.pushState({}, "", "#photography");
  };

  const closePhotography = () => {
    setPhotographyOpen(false);
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  };

  const closeAbout = () => {
    setNavMotionLocked(true);
    setAboutOpen(false);
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  };

  return (
    <main className="portfolio-shell">
      <header className={`site-header${photographyOpen ? " is-photography-open" : ""}`}>
        <h1 className="brand">UI设计师</h1>
        <div className="intro-block">
          <time>厦门 {new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}</time>
          <p className="intro-block__description">
            <span>从0到1参与产品建设，覆盖移动端、B端系统</span>
            <span>及运营体验设计，持续探索AI产品体验</span>
          </p>
          <p className="intro-block__email">357512393@qq.com</p>
        </div>
        <nav
          className={`site-nav${aboutOpen ? " is-about-open" : ""}${photographyOpen ? " is-photography-open" : ""}${navMotionLocked ? " is-transition-locked" : ""}`}
          aria-label="页面导航"
          onMouseLeave={() => setNavMotionLocked(false)}
        >
          <a className={!aboutOpen && !photographyOpen ? "is-current" : ""} href="#work" aria-label="项目" aria-current={!aboutOpen && !photographyOpen ? "page" : undefined}><SlashHoverLabel label="项目" /></a>
          <a href="#photography" aria-label="摄影" className={photographyOpen ? "is-current" : ""} onClick={photographyOpen ? (event) => event.preventDefault() : openPhotography}><SlashHoverLabel label="摄影" /></a>
          <a
            href="#about-me"
            aria-label="关于"
            aria-current={aboutOpen ? "page" : undefined}
            className={aboutOpen ? "is-current" : ""}
            onClick={aboutOpen ? (event) => event.preventDefault() : openAbout}
          >
            <SlashHoverLabel label="关于" />
          </a>
        </nav>
      </header>

      <section id="work" className="project-index" aria-label="作品索引">
        {homeProjects.map((project, index) => (
          <button
            key={project.title}
            className={index === activeIndex ? "is-active" : ""}
            type="button"
            onClick={() => openHomeProject(index)}
          >
            <span>{project.title}</span>
          </button>
        ))}
      </section>

      <section className="gallery-stage" aria-label="作品图片滑动区域">
        <FlyingPosters
          items={images}
          planeWidth={posterWidth}
          planeHeight={posterHeight}
          minPlaneWidth={isMobile ? 176 : desktopPosterBase}
          planeGap={20}
          scrollEase={0.05}
          cameraFov={38}
          cameraZ={16}
          introAnimation={detailIndex < 0 && !aboutOpen && !photographyOpen}
          focusRequest={focusRequest}
          onIndexChange={setActiveIndex}
          onPosterClick={handlePosterClick}
        />
      </section>

      <section className="project-type" aria-live="polite">
        <p>{active.type}</p>
      </section>

      <section className="project-detail" aria-live="polite">
        <p>{active.scope}</p>
        <button
          type="button"
          aria-label={`查看${active.title}`}
          onClick={() => openHomeProject(activeIndex)}
        >
          <SlashHoverLabel label="点击查看" />
        </button>
      </section>

      <p className="project-number">{padIndex(activeIndex)}</p>

      <aside className="thumbnail-rail" aria-label="作品缩略图">
        {thumbnailImages.map((image, index) => (
          <button
            key={`${active.slug}-${image}`}
            type="button"
            aria-label={`查看${active.title}第${index + 2}张图片`}
            onClick={() => openHomeProject(activeIndex)}
          >
            <img src={image} alt="" />
          </button>
        ))}
      </aside>

      <button
        className="grid-toggle"
        type="button"
        aria-label="上下滑动"
        onClick={() => selectProject((activeIndex + 1) % homeProjects.length)}
      >
        <SlashHoverLabel label="上下滑动" />
      </button>
      <span id="about" className="about-anchor" aria-hidden="true" />

      {detailIndex >= 0 && (
        <ProjectDetail
          projects={detailProjects}
          activeIndex={detailIndex}
          onSelect={(index) => openDetailProject(index, true)}
          onClose={closeProject}
        />
      )}

      {aboutOpen && <AboutPage onClose={closeAbout} />}
      {photographyOpen && <PhotographyPage onClose={closePhotography} />}
    </main>
  );
}
