# KH Black Spatial Design System

> 版本：1.0  
> 更新日期：2026-08-27  
> 适用产品：KUN HONG Portfolio  
> 状态：Production

## 1. 系统简介

KH Black Spatial 是本作品集使用的视觉与交互设计系统。它以纯黑画布、克制文字、沉浸式图片、空间运动和连续页面状态为核心，用于统一项目首页、项目详情、摄影和关于页面。

设计系统的目标：

- 让作品图片始终拥有最高视觉优先级。
- 让不同页面共享一致的导航、边距、文字和反馈方式。
- 让桌面端与移动端保持同一种气质，而不是机械缩放同一布局。
- 让图片密集型页面在加载、滚动和返回时保持稳定。
- 为后续新增项目、页面和组件提供可复用基础。

## 2. 系统原则

### 2.1 Black Canvas

页面、HTML、Body、React 根节点、加载层和 WebGL Canvas 必须从第一帧开始保持纯黑。任何页面状态都不应暴露浏览器白色默认背景。

### 2.2 Content First

界面用于组织作品，不与作品竞争。避免大面积色块、复杂图标、厚重边框和多余装饰。

### 2.3 Spatial Continuity

页面通过深度、透视、模糊和层级建立空间关系。重型 Canvas、纹理和已解码图片在页面切换后优先保留，返回时恢复而不是重建。

### 2.4 Precise Feedback

每次点击、悬停、焦点、拖拽、吸附和加载都有明确反馈。反馈不能改变布局或造成内容抖动。

### 2.5 Mobile Independence

移动端使用独立的信息层级和交互模型。允许隐藏桌面辅助信息、切换底部抽屉和重组内容，不采用桌面端等比缩小。

## 3. Token 架构

Token 分为四层：

```text
Primitive Token
  ↓
Semantic Token
  ↓
Component Token
  ↓
Page Pattern
```

- Primitive：原始颜色、尺寸和时长。
- Semantic：文字、背景、分隔线等语义用途。
- Component：导航、列表、缩略图和面板的具体参数。
- Page Pattern：首页、覆盖层、图库和关于页的组合规则。

## 4. Color

### 4.1 Primitive Colors

| Token | Value |
| --- | --- |
| `black-100` | `#000000` |
| `black-90` | `#0c0c0c` |
| `white-100` | `#ffffff` |
| `white-96` | `#f4f4f2` |
| `gray-53` | `#858585` |
| `gray-41` | `#696969` |
| `gray-34` | `#575757` |

### 4.2 Semantic Colors

```css
:root {
  --ds-color-canvas: #000;
  --ds-color-surface: #0c0c0c;
  --ds-color-text-primary: #f4f4f2;
  --ds-color-text-strong: #fff;
  --ds-color-text-secondary: #858585;
  --ds-color-text-muted: #696969;
  --ds-color-text-disabled: #575757;
  --ds-color-line-subtle: rgb(255 255 255 / 5%);
  --ds-color-line-mobile: rgb(255 255 255 / 9%);
  --ds-color-backdrop: rgb(0 0 0 / 58%);
  --ds-color-media-surface: #181817;
}
```

### 4.3 Usage

| Semantic Token | 用途 |
| --- | --- |
| Canvas | 页面、加载底、Canvas、图片错误底 |
| Surface | 详情面板、深色内容层 |
| Text Primary | 正文、当前项、主要操作 |
| Text Strong | Hover 和 Focus 强调 |
| Text Secondary | 默认导航、年份、辅助值 |
| Text Muted | 时间、标签、说明 |
| Text Disabled | 未选项目和弱化状态 |
| Line Subtle | 桌面分栏和结构线 |
| Backdrop | 覆盖层下的首页遮罩 |

### 4.4 Color Rules

- 页面不提供 Light Theme。
- 不使用渐变作为主要按钮或主要背景。
- 不使用高饱和强调色作为通用交互反馈。
- 状态优先通过亮度、透明度、位置和字重表达。
- 网格线透明度保持 2%–4%。

## 5. Typography

### 5.1 Font Families

```css
:root {
  --ds-font-ui: "PingFang SC", "Noto Sans CJK SC", "Helvetica Neue", Arial, sans-serif;
  --ds-font-display: "Geist", "Helvetica Neue", Arial, sans-serif;
  --ds-font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", "PingFang SC", monospace;
}
```

### 5.2 Type Scale

| Style | Desktop | Mobile | Weight | Line Height | Use |
| --- | ---: | ---: | ---: | ---: | --- |
| Display Hero | `clamp(177px, 18.45vw, 327px)` | `clamp(100.8px, 27.6vw, 216px)` | 800 | 0.72 | 首屏品牌动画 |
| Display Brand | `clamp(118px, 12.3vw, 218px)` | `clamp(84px, 23vw, 180px)` | 800 | 0.72 | About 品牌 |
| Display Page | `clamp(54px, 7vw, 112px)` | `clamp(40px, 13vw, 64px)` | 800 | 0.92 | 摄影标题 |
| Title | 16px | 16px | 700 | 1.3 | 项目标题 |
| UI Body | 13px | 13px | 400 | 18–18.2px | 导航、正文、索引 |
| Caption | 12px | 12px | 400 | 18px | 标签、经历辅助信息 |
| Micro | 10px | 10px | 400 | 1.4 | 极少量眉题 |

### 5.3 Typography Rules

- 常规界面固定使用 13px，不随桌面宽度任意放大。
- 大标题使用 Display 字体和紧字距。
- 项目详情使用 Mono 字体，其他页面使用 UI 字体。
- 正文不使用全大写转换；项目详情可保留既有大写风格。
- 文案进入动画不能导致字形位置变化或重新排版。
- 中英文、数字和符号保持自然可读，不使用过度字距。

## 6. Spacing

### 6.1 Base Scale

| Token | Value |
| --- | ---: |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |

### 6.2 Edge Insets

```css
:root {
  --ds-edge-x: clamp(18px, 1.3889vw, 28px);
  --ds-edge-y: clamp(16px, 2.2222vh, 28px);
}

@media (max-width: 809.98px) {
  :root {
    --ds-edge-x: 10px;
    --ds-edge-y: 24px;
  }
}
```

页面边缘控件必须共享 Edge Insets，不允许每个页面自行设置近似值。

## 7. Size

### 7.1 Fixed Component Sizes

| Component | Desktop | Mobile |
| --- | --- | --- |
| Homepage project row | 22px height | 22px height |
| Homepage thumbnail | 60 × 34px | Hidden |
| Homepage thumbnail gap | 8px | — |
| Photography deck card | 300 × 300px | 200 × 200px |
| Photography thumbnail | 80px width | 56px width |
| Photography rail | 176px width | 96px width |
| Project index column | 200px | Hidden |
| Mobile project drawer | — | 100% × 85dvh |
| Mobile drawer handle | — | 40 × 5px |

### 7.2 Media Constraints

| Media | Constraint |
| --- | --- |
| Homepage poster | 16:9, proportional |
| Project detail image | Width 100%, natural height |
| Photography focus image desktop | `max-width: min(100vw - 352px, 1180px)` |
| Photography focus image desktop | `max-height: 100vh - 128px` |
| Photography focus image mobile | `max-width: 100vw - 108px` |
| Photography focus image mobile | `max-height: 100vh - 112px` |

## 8. Border, Radius, Blur

### 8.1 Borders

```css
--ds-border-subtle: 0.5px solid rgb(255 255 255 / 5%);
--ds-border-mobile: 1px solid rgb(255 255 255 / 9%);
```

### 8.2 Radius

| Token | Value | Use |
| --- | ---: | --- |
| `radius-none` | 0 | 首页和摄影卡片 |
| `radius-media` | 4px | 桌面项目媒体 |
| `radius-media-mobile` | 10px | 移动项目媒体 |
| `radius-sheet` | 24px 24px 0 0 | 移动详情抽屉 |
| `radius-pill` | 999px | 抽屉把手 |

### 8.3 Blur

| Token | Value | Use |
| --- | ---: | --- |
| `blur-backdrop` | 8px | 首页到项目详情的背景模糊 |
| `blur-panel` | 10px | 项目详情面板 |
| `blur-media` | 12px | 桌面媒体列 |
| `blur-lqip-card` | 18px | 摄影卡片 LQIP |
| `blur-lqip-focus` | 22px | 摄影大图 LQIP |

## 9. Layer System

| Layer | Recommended Z | Content |
| --- | ---: | --- |
| Canvas | 0–2 | 页面背景、WebGL |
| Base UI | 5–6 | 首页文案、导航、项目索引 |
| Project Overlay | 20 | 项目详情 |
| Full Page | 30 | 摄影、关于 |
| Full Page Navigation | 31–32 | 摄影详情导航、返回和计数 |
| Preloader | 100 | 首次进入加载层 |

规则：

- Z-index 只用于系统层级，不用于修复局部布局问题。
- 全屏页面进入后必须阻止底层无效点击。
- 项目详情应保留底层首页可见，以生成真实模糊背景。

## 10. Grid and Layout

### 10.1 Background Grid

桌面内容页允许使用四列弱网格和约 1/3 高度横线：

- 主网格透明度：3%–4%。
- 内容网格透明度：2%。
- 网格不影响可点击区域。
- 移动 About 与 Photography Detail 不使用网格。

### 10.2 Breakpoints

| Breakpoint | Behavior |
| --- | --- |
| `≥1280px` | 完整桌面首页与桌面项目详情 |
| `810–1279px` | 首页桌面逻辑，摄影媒体缩小 |
| `≤1100px` | 项目详情切换为底部抽屉 |
| `≤809px` | 移动首页、摄影和关于布局 |
| Height `≤760px` | 调整中部信息位置 |

### 10.3 Layout Rules

- 首页桌面构图保持 1280px 最低宽度。
- 项目详情在 810–1279px 可释放全局最小宽度。
- 移动端只保留核心内容，辅助内容隐藏而不是挤压。
- 每个页面只指定一个主要纵向滚动面。

## 11. Motion

### 11.1 Easing

```css
:root {
  --ds-ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --ds-ease-cover: cubic-bezier(0.77, 0, 0.175, 1);
  --ds-ease-standard: ease;
}
```

### 11.2 Duration

| Token | Duration | Use |
| --- | ---: | --- |
| `motion-micro` | 160ms | 斜杠翻转、颜色 |
| `motion-control` | 180ms | 文字位移、列表反馈 |
| `motion-image` | 220–280ms | 图片显示、卡片 Hover |
| `motion-component` | 320–420ms | 项目详情切换 |
| `motion-reveal` | 760–1100ms | 文字遮罩揭示 |
| `motion-page` | 1350ms | 页面文案淡入 |

### 11.3 Motion Principles

- 布局使用最终位置，动画只改变 Transform、Opacity 或 Clip Path。
- 不使用 Top/Left 动画造成重新布局。
- 可中断滚动使用一个共享目标值，避免原生平滑滚动竞争。
- 动画结束后移除不必要的 `will-change`。
- Reduced Motion 下时长缩短至约 1ms，但状态必须完整。

## 12. Iconography

网站不建立传统图标库。主要操作以文字和斜杠符号表达。

### 12.1 Slash Symbol

```text
/ 项目
/ 摄影
/ 关于
/ 点击查看
/ 返回项目
/ 上下滑动
```

### 12.2 Slash Interaction

- Glyph 固定宽度 0.55em。
- Hover/Focus 时水平翻转为 `\`。
- Glyph：160ms Smooth Ease。
- Text：延迟 20ms，向右 5px，180ms Smooth Ease。
- 移动触摸端不播放翻转和文字位移。

### 12.3 Exceptions

- 非交互提示“滑动浏览”不使用斜杠动画。
- 项目详情关闭使用现有轻量文字符号，不添加带框图标。
- 不引入与整体语言冲突的彩色图标集。

## 13. Component Library

### 13.1 Brand Lockup

**Purpose**：表示个人品牌身份。  
**Variants**：Header Brand、Preloader Hero、About Display。  
**Content**：`辜锟泓` 或 `KUN / HONG`。  
**Rules**：大字使用紧字距，Header Brand 不可点击。

### 13.2 Global Navigation

**Anatomy**：Slash Glyph + Label。  
**Items**：项目、摄影、关于。  
**States**：Default、Hover、Focus、Current、Transition Locked。  
**Placement**：所有页面固定右上。  
**Mobile**：保留三项，间距缩小，不改为汉堡菜单。

### 13.3 Slash Action

**Use**：点击查看、返回项目、上下滑动。  
**States**：Default、Hover、Focus、Pressed。  
**Rule**：点击热区固定，内部字符可动。

### 13.4 Project Index Item

**Height**：22px Homepage / 60px Detail。  
**Default**：Muted。  
**Active**：Primary；详情列表附带 6px 白色方块。  
**Hover**：只移动内部文字。

### 13.5 Metadata Block

**Content**：项目类型、平台范围、年份、序号。  
**Typography**：13px，辅助值使用 Secondary/Muted。  
**Behavior**：内容改变时不移动固定锚点。

### 13.6 Homepage Thumbnail Rail

**Size**：60 × 34px。  
**Limit**：每个项目最多 5 张。  
**Default**：Opacity 0.56。  
**Hover/Active**：Opacity 1。  
**Behavior**：不可滚动；点击打开当前项目详情。

### 13.7 Spatial Poster

**Ratio**：16:9。  
**Environment**：WebGL 3D Spiral。  
**States**：Distant、Adjacent、Active、Hovered、Dragging、Bending、Snapping。  
**Desktop Hover**：Active Poster 最大约 16° Tilt、1.2× Scale。  
**Mobile**：无 Tilt。

### 13.8 Project Backdrop

**Visual**：58% Black + 8px Blur。  
**Behavior**：覆盖全屏，点击可关闭详情。  
**Constraint**：底层首页保持挂载并可见。

### 13.9 Project Detail Panel

**Desktop**：200px Index + 350–540px Copy + Remaining Media。  
**Mobile**：85dvh Bottom Sheet。  
**Surface**：96% Dark Mix + 10px Blur。  
**States**：Loading、Ready、Entering、Switching、Scrollable。

### 13.10 Photography Deck Card

**Ratio**：1:1。  
**Size**：300/250/200px。  
**Media**：Cover + LQIP。  
**Hover**：视觉层向上 14px。  
**Behavior**：点击进入对应摄影详情。

### 13.11 Photography Thumbnail Rail

**Desktop**：80px Image / 176px Rail。  
**Mobile**：56px Image / 96px Rail。  
**Motion**：围绕视口中心形成右弯曲线。  
**Input**：Wheel、Mouse Drag、Touch Drag。  
**Result**：停止后吸附并更新 Focus Image。

### 13.12 Focus Image

**Layout**：居中、自然比例、Contain。  
**Layers**：LQIP + Full Image。  
**Switching**：所有项目保持预挂载，Active Item 直接切换到 Opacity 1。  
**Constraint**：高清图加载后不可退回 LQIP。

### 13.13 Experience Item

**Anatomy**：Company、Role、Period、Description。  
**Typography**：14px Company，12px Role/Period/Description。  
**Desktop**：固定日期列。  
**Mobile**：Period 右对齐内容边缘。

### 13.14 Preloader

**Purpose**：等待首页关键图片真实加载和解码。  
**Anatomy**：Hero Brand、Black Cover、Subtle Grid。  
**Behavior**：首次首页进入播放；直接打开非首页路由不播放。  
**Exit**：Black Cover 向右离场。

## 14. Component State Model

所有交互组件应从以下状态中选择：

| State | Required |
| --- | --- |
| Default | Always |
| Hover | Fine pointer components |
| Focus Visible | Keyboard interactive components |
| Pressed | Buttons and draggable surfaces |
| Active/Current | Navigation and selection |
| Loading | Media and async content |
| Loaded | Media |
| Dragging | Spatial galleries |
| Snapping | Spatial galleries |
| Disabled | Only when interaction is truly unavailable |
| Error | Resource failure |

禁止只设计 Default 状态。

## 15. Page Patterns

### 15.1 Immersive Index

用于项目首页：

```text
Brand + Global Navigation
Project Index + Spatial Media + Metadata + Thumbnail Rail
Edge Hint + Index Number
```

### 15.2 Glass Detail Overlay

用于项目详情：

```text
Retained Homepage
  + Blurred Backdrop
  + Project Navigation
  + Copy Column
  + Scrollable Media
```

### 15.3 Spatial Gallery

用于摄影首页：

```text
Page Heading + Global Navigation
3D Square Card Track
Return + Browse Hint
```

### 15.4 Focus Gallery

用于摄影详情：

```text
Curved Thumbnail Rail
Centered Natural-Ratio Image
Return + Counter
```

### 15.5 Editorial Profile

用于 About：

```text
Global Navigation
Large Brand Lockup
Experience Column
Contact Block
```

## 16. Interaction Patterns

### 16.1 Navigate

- 使用干净 History API 路径。
- 当前页面使用 `aria-current="page"`。
- 浏览器 Back 同步恢复页面和选择状态。
- 深层路径刷新必须恢复正确内容。

### 16.2 Select

- 列表选择只移动内部文字。
- 当前状态通过亮度、字重或白色标记表达。
- 相邻空间海报先选择，再由 Active 海报打开详情。

### 16.3 Drag and Snap

- 拖拽开始前光标保持 Default/Grab。
- 真实拖拽后显示 Grabbing。
- 释放或输入停止后吸附最近项。
- 吸附完成前不允许多个动画源争夺位置。

### 16.4 Load and Reveal

- LQIP 先占位，高清图加载解码后覆盖。
- 已加载高清图保留挂载。
- 缓存图片在 `complete && naturalWidth > 0` 时同步显示。
- 不依赖可能已经错过的单次 `onLoad` 事件。

### 16.5 Pause and Resume

- 页面隐藏时暂停 RAF 和输入监听。
- 保留 Canvas、纹理、已解码图片、当前选择和滚动位置。
- 再次进入时恢复，而不是完整重播。

## 17. Photography Loading System

### 17.1 Asset Tiers

| Tier | Path | Budget | Use |
| --- | --- | --- | --- |
| Cover | `photography-covers/1–64.webp` | 720 × 720px | 3D Deck |
| Thumbnail/LQIP | `photography-thumbnails/1–64.webp` | 5–10KB | Rail + Placeholder |
| Full Image | `photography/1–64.webp` | 70–90KB | Focus Viewer |

### 17.2 Priority

1. Cover 与 Thumbnail 开始加载。
2. 选择详情后当前 Full Image 立即设置 Src。
3. 当前图前后各 2 张 High Priority Preload。
4. 所有 Cover 完成后后台加载全部 Full Image。
5. 完成的 Full Image 在页面会话中持续挂载。

### 17.3 Versioning

固定摄影文件名使用共享 `PHOTOGRAPHY_ASSET_VERSION`。任何 Full Image 或 Thumbnail 内容替换都必须提升版本值。

## 18. Accessibility

### 18.1 Semantics

- 页面使用 `main`、`section`、`nav`、`aside`、`figure`。
- 操作使用真实 `button` 或 `a`。
- 内容图提供准确 Alt，装饰图使用空 Alt。

### 18.2 Keyboard

- Tab 可进入所有关键操作。
- Enter/Space 可激活按钮。
- Escape 可关闭 About 或覆盖层。
- Focus Visible：1px Primary Outline + 2px Offset。

### 18.3 Motion

- 尊重 `prefers-reduced-motion`。
- Reduced Motion 下状态变化继续生效。
- 不使用闪烁或快速重复运动。

### 18.4 Touch

- 触摸设备不依赖 Hover。
- Hover 动画不能在触摸后粘住。
- 拖拽面使用明确 `touch-action`。
- 使用 `overscroll-behavior` 防止滚动穿透。

## 19. Content Guidelines

### 19.1 Navigation

使用短中文名词：项目、摄影、关于。

### 19.2 Actions

使用明确动词：点击查看、返回项目、上下滑动、滑动浏览。

### 19.3 Project Description

结构：

```text
服务对象/业务背景 + 设计范围 + 解决的关键问题
```

### 19.4 Highlights

每个项目保留约 3 条，使用“动作 + 对象/流程 + 改进结果”结构。

### 19.5 Contact

```text
Homepage: zhi_9650 / 357512393@qq.com
WeChat: zhi_9650
Email: 357512393@qq.com
```

## 20. Asset System

### 20.1 Directory Model

```text
public/assets/
├── home-covers/
├── projects/
├── project-thumbnails/
├── photography-covers/
├── photography-thumbnails/
└── photography/
```

### 20.2 Naming

- 固定序列使用连续数字文件名。
- 项目目录使用小写英文 Slug。
- 文件名不包含中文、空格或时间戳。

### 20.3 Export

- 使用 WebP。
- 项目图片最长边不超过 2048px。
- 删除 EXIF/GPS/Camera Metadata。
- 原始素材不进入 Public 或部署包。

## 21. Implementation Mapping

| Design System Area | Source |
| --- | --- |
| Global Tokens/Layout | `src/styles.css` |
| App Shell/Navigation | `src/App.jsx` |
| Spatial Poster | `src/FlyingPosters.jsx` |
| Preloader | `src/Preloader.jsx` |
| Slash Action | `src/SlashHoverLabel.jsx` |
| Project Overlay | `src/ProjectDetail.jsx` |
| Photography | `src/PhotographyPage.jsx` |
| About | `src/AboutPage.jsx` |
| Route/Cache | `vercel.json` |

设计系统文档本身不自动改变代码。新增或修改 Token 时必须同步 `src/styles.css` 和相关组件。

## 22. Stability Levels

| Level | Meaning | Current Items |
| --- | --- | --- |
| Stable | 不应随意修改 | Color、Typography、Edge Insets、Navigation、Slash Action |
| Stable Pattern | 可换内容，不换结构 | Homepage、Project Overlay、Photography Detail、About |
| Tunable | 可基于性能测试微调 | Preload Concurrency、Scroll Interpolation、Snap Timing |
| Experimental | 需单独验证 | 新 WebGL 效果、新页面结构、新媒体模式 |

## 23. Contribution Workflow

新增设计系统内容时：

1. 确认现有 Token 或组件不能满足需求。
2. 说明新增内容解决的问题。
3. 提供桌面和移动状态。
4. 补充 Hover、Focus、Loading、Error 和 Reduced Motion。
5. 检查是否破坏页面层级、资源加载或路由。
6. 更新 `DESIGN_SYSTEM.md`。
7. 需要长期防回退时更新 `AGENTS.md`。
8. 完成构建、页面和深层路由验证。

## 24. Do / Do Not

### Do

- 使用现有 Token 和组件组合新页面。
- 保持图片自然比例和深色加载底。
- 为桌面和移动分别设计。
- 保留已加载资源和页面位置。
- 用短而准确的中文表达操作。

### Do Not

- 不创建浅色主题。
- 不将导航改为汉堡菜单。
- 不给同一功能创建第二套视觉参数。
- 不移除项目详情后的模糊首页。
- 不让摄影高清图退回 LQIP。
- 不使用 React 实现域名 301。
- 不给整个 `/assets/` 盲目设置长期不可变缓存。

## 25. Release Checklist

### Foundations

- [ ] 使用系统颜色、字体、间距、层级与动效 Token。
- [ ] 第一帧为纯黑。
- [ ] 桌面与移动规则完整。

### Components

- [ ] Default、Hover、Focus、Active 状态完整。
- [ ] Loading、Loaded、Error 状态完整。
- [ ] 点击区域不因内部动画移动。

### Media

- [ ] WebP 尺寸和体积符合预算。
- [ ] LQIP 切换无白帧。
- [ ] 已加载媒体不回退。
- [ ] 资源版本已更新。

### Interaction

- [ ] 鼠标、触摸和键盘均可完成核心操作。
- [ ] 滚动和拖拽停止后准确吸附。
- [ ] 页面返回恢复正确状态。
- [ ] Reduced Motion 可用。

### Routing

- [ ] `/`、`/Photo`、`/Photo/N`、`/About` 可直接打开。
- [ ] 深层路径刷新不出现 Vercel 404。
- [ ] 静态资源从根路径正确解析。
- [ ] `www` 跳转保留完整路径。

## 26. Related Documents

- `DESIGN.md`：当前网站设计说明。
- `DESIGN_TEMPLATE.md`：页面与组件设计模板。
- `VISUAL_INTERACTION_SPEC_TEMPLATE.md`：单项需求的视觉与交互交付模板。
- `DESIGN_SYSTEM.md`：全站基础、组件和模式的统一系统。
- `AGENTS.md`：已经批准、实现时不得回退的长期规则。
