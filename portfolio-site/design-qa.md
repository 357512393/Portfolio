# Design QA

- Source visual truth: `/tmp/pacomepertant-reference.png`
- Implementation desktop: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-spiral-desktop.png`
- Implementation mobile: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-spiral-mobile.png`
- Responsive minimum-width implementation: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-responsive-1280.png`
- Responsive large-screen implementation: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-responsive-1920.png`
- Fixed-scale implementation at 1280px: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-fixed-scale-1280.png`
- Fixed-scale implementation at 1920px: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-fixed-scale-1920.png`
- Adaptive implementation at 1280px: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-adaptive-1280.png`
- Adaptive implementation at 1920px: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-adaptive-1920.png`
- Preserved 19:19 mobile implementation: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-mobile-preserved-390x844.png`
- Desktop 240px target at 1280: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-desktop-240-at-1280.png`
- Desktop 360px target at 1920: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-desktop-360-at-1920.png`
- Corrected resting depth order: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-depth-order-fixed.png`
- Corrected transition depth order: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-depth-order-motion.png`
- Copy and intro-position source: `/var/folders/h3/p4c0wxyn2052zy3rf6ryy5n40000gn/T/codex-clipboard-3fbae3cb-c406-4a24-9fea-51160cfcd46d.png`
- Copy and intro-position implementation: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-intro-position-final.png`
- Reordered navigation and poster sequence: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-reordered-projects.png`
- Latest comparison pixels: source `1152 × 590`, implementation `970 × 734`; both device density `1`. The comparison is normalized by relative viewport coordinates because the requested change targets fixed-page positioning rather than poster scale.
- Latest comparison state: project `03` (`AI应用集合`) selected, desktop view.
- Downward-scroll bend: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-bend-down.png`
- Upward-scroll bend: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-bend-up.png`
- Settled flat state: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-bend-settled.png`
- Side-by-side comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/design-qa-comparison.png`
- Desktop viewport: `1440 × 900` CSS px, device density `1`
- Mobile viewport: `390 × 844` CSS px, device density `1`
- Source pixels: `3840 × 2160`; normalized to `1440 × 900` with centered cover crop for comparison
- Implementation pixels: `1440 × 900` desktop and `390 × 844` mobile
- State: spiral view at rest, upward and downward wheel-scroll bends, settled rebound, and drag interaction checks

## Full-view comparison evidence

The reference and the upward-scroll bend were placed together in `design-qa-comparison.png`. The comparison was scoped to the requested image-stage characteristics: a full-screen spiral, alternating left/right placement, perspective depth, staggered card tilt, dimmed distant cards, flexible card curvature during motion, and continuous movement. The existing Chinese information layer, pure-black background, and user-provided portfolio assets are intentional product constraints rather than source-site elements to clone.

Focused-region comparison was not required because the requested target is the full-stage spatial relationship and the foreground, middle-distance, and background cards are all clearly legible in the normalized full-view comparison.

## Required fidelity surfaces

- Fonts and typography: existing Chinese hierarchy and type scale remain unchanged, as requested; the reference typography was not applied because the task only targeted image layout and spiral motion.
- Spacing and layout rhythm: the former central column now fills the viewport with a compact vertical helix. Foreground cards sit near the visual center, adjacent cards overlap diagonally, and distant cards exit through the viewport edges.
- Colors and visual tokens: the pure-black site background is preserved. Distant cards are darkened according to depth without adding a new background color or grid.
- Image quality and asset fidelity: all eight supplied images remain in their original order and are rendered as proportional `16:9` planes. No image is stretched, regenerated, replaced, or hotlinked.
- Copy and content: the approved name, project labels, seven-item index order, project metadata, `厦门` intro, photography navigation, lower-left scroll prompt, and project action label are present exactly as specified.

## Interaction verification

- Mouse wheel advances the image sequence continuously along the spiral.
- Upward and downward wheel motion produce visibly opposite signed curvature.
- Curvature eases back to a flat surface after scrolling stops; no full-card turnover occurs.
- Pointer/touch drag advances the same spiral in both vertical and horizontal gestures.
- Project-list and thumbnail selection still bring the requested project to the foreground.
- Active project metadata updates as the nearest card changes.
- Supported desktop layouts render without browser warnings or console errors.

## Comparison history

### Iteration 1

- [P2] The initial orbit radius spread cards too widely and the side-facing perspective was shallower than the reference.
- Fix: reduced desktop orbit radius from `0.32` to `0.265` of the WebGL viewport, reduced vertical step from `0.19` to `0.16`, increased depth from `3.8` to `4.2`, and increased Y-axis tilt from `0.42` to `0.72` radians.
- Post-fix evidence: `implementation-spiral-desktop.png` and `design-qa-comparison.png` show a denser central cluster, stronger overlap, and more pronounced near/far perspective.

### Iteration 2

- [P2] The spiral cards initially remained rigid during wheel motion, while the reference uses flexible card surfaces.
- Fix: subdivided each poster mesh to `32 × 8` segments and added velocity-driven signed curvature. Upward and downward motion now bend in opposite directions, with a damped return to flat.
- Post-fix evidence: `implementation-bend-down.png`, `implementation-bend-up.png`, and `implementation-bend-settled.png` show both motion directions and the final rebound state.

### Iteration 3

- [P3] The first flexible-sheet pass was directionally correct but visually too restrained for the requested emphasis.
- Fix: increased vertical arc, depth arc, edge twist, and velocity sensitivity by roughly 70%, while keeping the same signed bend and flat rebound behavior.
- Post-fix verification: both wheel directions were replayed at `1440 × 900`; the larger silhouette curvature is clearly visible and the browser console remains clean.

### Iteration 4

- [P2] The information shell and thumbnail rail used fixed pixel offsets, so their proportions drifted between compact and large desktop windows.
- Fix: established `1280px` as the minimum supported canvas and converted edge spacing, typography, metadata anchors, poster size, spiral gap, and thumbnail rail dimensions to bounded fluid values.
- Post-fix verification: `1280 × 720`, a live resize to `1600 × 800`, and `1920 × 1080` all preserve the intended composition, original image aspect ratios, full-screen canvas sizing, and clean browser logs without requiring a refresh.

### Iteration 5

- [P2] The first responsive pass scaled most interface text and the poster base continuously with viewport width, which diverged from the reference site's fixed desktop scale.
- Fix: measured the current Teonak desktop source rules and locked regular interface copy to `13px`, auxiliary copy to `12px` when needed, content columns to `220px`, thumbnail rail width to `60px`, and poster sequence spacing to `20px`. Only the upper-left brand remains responsive (`44–56px`).
- [P2] A `200px` WebGL base plane rendered about 1.35× larger in the foreground because of camera perspective.
- Fix: reduced the internal plane base to `148px`, producing an approximately `200px` visible foreground poster cap at both tested desktop sizes while preserving the 16:9 ratio.
- Post-fix verification: `1280 × 720` and `1920 × 1080` both report `13px` for the intro, navigation, project index, details, number, and grid toggle; the thumbnail rail remains `60px`; the foreground poster no longer grows on the larger viewport; browser logs remain clean.

### Iteration 6

- [P2] The fixed poster cap did not respond to the supported desktop range after the user clarified that images should scale between 1280 and 1920.
- Fix: the internal poster plane now scales proportionally from `148px` at 1280 to `222px` at 1920, producing an approximately `200–300px` visible foreground range and a hard cap above 1920.
- [P2] Center-based scaling expanded the active poster in both directions and rebuilding the WebGL stage during resize could reset the selected project.
- Fix: the active poster uses a perspective-aware X offset that keeps its right edge anchored and places all added width to the left. Plane sizes update in place, preserving the active project and spiral position during live resize.
- Post-fix verification: project 04 remained selected through a live `1280 × 720` to `1920 × 1080` resize, the active poster visibly grew leftward, and browser logs remained clean.

### Iteration 7

- [P1] The desktop minimum-width rule and responsive poster logic were being applied to narrow viewports, overriding the archived 19:19 mobile composition.
- Fix: added an isolated mobile branch at `809px` and below. It restores the archived `390 × 844` layout values: 30px brand, 13px navigation/index/number/toggle, hidden intro/detail/type/thumbnail rail, 10px horizontal edges, and a fixed 176px internal poster base with no desktop left-growth offset.
- Post-fix verification: `implementation-mobile-preserved-390x844.png` matches the archived `implementation-spiral-mobile.png` composition and measured mobile element positions; desktop sizing code remains scoped to 1280–1920; browser logs remain clean.

### Iteration 8

- [P3] The desktop poster range was smaller than the newly requested 240–360px target.
- Fix: increased the internal desktop base from `148–222px` to `178–267px`, which renders the foreground poster at approximately `240px` at 1280 and `360px` at 1920 while keeping the same right-edge anchor and leftward growth.
- Post-fix verification: both desktop boundary screenshots match the requested relative sizes, no browser warnings or errors were emitted, and the isolated mobile branch was not modified.

### Iteration 9

- [P1] Poster stacking followed project-array draw order because depth testing and depth writing were disabled. A poster positioned behind the active project could therefore be painted over it, producing the reported front/back mismatch.
- Fix: enabled WebGL depth testing and depth writing for every poster program. The depth buffer now resolves stacking from camera-space Z, keeping the nearest selected poster in front throughout selection transitions.
- Post-fix verification: the initial resting state and an in-progress project transition both preserve the intended spiral depth order.

### Iteration 10

- [P2] The first copy-update pass placed the intro at the horizontal center-plus-13px position from the earlier reference, while the later source image explicitly moved it into the upper-right region.
- Fix: kept the approved two-line copy and moved the whole intro block to `left: 70.6%` and `top: 16.5%`.
- Post-fix evidence: the source and `implementation-intro-position-final.png` were viewed together at the same selected-project state. The intro begins at 70.6% of the implementation viewport (`x=684.8` in `970px`) and 16.5% vertically (`y=121.1` in `734px`), matching the relative placement in the latest source.
- Interaction verification: the `\ 点击查看` control is a semantic button and its computed cursor is `pointer`; project-index selection, thumbnail selection, and spiral focus updates remain functional.

### Iteration 11

- [P2] The left project index and poster sequence used different order maps, and the previous project action displayed the backslash state permanently.
- Fix: the project array is now the single source of truth for the left index, spiral, project numbering, and thumbnail rail, ordered `1, 2, 3, 4, 5, 6, 8, 7`. The action defaults to `/点击查看` and switches to `\点击查看` on hover or keyboard focus; the lower-left prompt is `/上下滑动`.
- Post-fix verification: the browser accessibility tree reports all eight project titles and all eight thumbnail labels in the requested order. The default action text is `/点击查看` with a computed `pointer` cursor, and the updated page is captured in `implementation-reordered-projects.png`.

### Iteration 12

- [P2] Slash-bearing controls changed glyphs without the masked text motion of the Teonak reference, and the project action plus lower-left prompt omitted the approved spaces.
- Fix: introduced one shared slash-label treatment for the three upper-right links, project action, and lower-left prompt. Each control now displays `/ 文案` at rest and rolls vertically to `\ 文案` on hover or keyboard focus with the same GPU-composited easing; reduced-motion preferences collapse the transition.
- Post-fix verification: the production build and Sites worker tests pass, all five slash-bearing controls use the shared component, and the default text includes the approved spacing.

### Iteration 13

- [P2] The masked vertical rollover did not match the supplied motion video or the clarified hover behavior.
- Fix: removed the clipping window and duplicate text layers. The standalone `/` now rotates 90 degrees into `\` over 120ms; the copy follows with a 5px rightward shift over 180ms and a 20ms delay. Pointer exit and focus loss return both parts to their original positions.
- Post-fix verification: all five slash-bearing controls share the same component, preserve the approved `/ 文案` spacing, keep a stable button box, and respect reduced-motion preferences.

### Iteration 14

- [P2] Rotating the entire slash element preserved layout flow but allowed the glyph's tall line box to make the visual center appear to drift.
- Fix: placed the glyph inside a fixed centered frame and rotate only a square inner glyph box. The `/` now changes to `\` around the same visual center while the text keeps its independent rightward shift.
- Post-fix verification: the slash frame retains identical bounds before and after hover, and all five controls share the corrected in-place transform.

### Iteration 15

- [P2] The in-place slash used a 90-degree planar rotation, while the requested motion is a horizontal mirror flip.
- Fix: changed the glyph transform from `rotate(90deg)` to `scaleX(-1)` around the same fixed center frame. The `/` now mirrors directly into `\` without changing its position, bounds, or the independent text shift.
- Post-fix verification: all five slash-bearing controls inherit the horizontal flip and retain stable layout geometry.

### Iteration 16

- [P2] The fixed square slash frame centered the glyph independently from the copy line box, making `/` and `\` appear vertically offset from the Chinese text.
- Fix: aligned the shared label on its typographic baseline and made the slash inherit the same line height as the copy. Horizontal flipping remains isolated to the glyph and does not affect layout.
- Post-fix verification: slash, backslash, and copy now share matching vertical bounds and baseline alignment across all five controls.

### Iteration 17

- [P1] The whole WebGL stage previously advertised a `grab` cursor and the upper-left brand was a button, while main posters themselves had no click selection.
- Fix: restricted clickability to navigation, slash controls, and the active poster plus its cyclic previous/next neighbors. Added depth-aware raycasting so only the nearest visible allowed poster receives a pointer cursor and click; active opens, adjacent selects. The brand is now static text and canvas background uses the default cursor.
- Post-fix verification: with project `01` active, raycasting returned pointer targets for posters `01`, `08`, and `02`; poster `03` and canvas background retained the default cursor. Clicking poster `02` advanced the active navigation and number to `PC直播助手` / `02`. Hover is recalculated while posters animate so the hand cursor cannot remain on a position after its allowed poster moves away.

## Findings

No actionable P0, P1, or P2 issues remain within the requested scope.

The reference site's background grid, logo, menu, and sound control were intentionally not copied because the user requested the image layout and spiral/bending effect, while existing project decisions require the current Chinese shell, supplied images, and pure-black background.

## Follow-up polish

- [P3] Motion speed and helix density can be tuned further to personal preference after reviewing the live preview.

## Strict secondary project page QA — 2026-08-19

- Source visual truth, desktop: `/Users/a11/Documents/ChatGPT/作品集 2/reference-evidence/strict-spoony-detail-desktop-1280x720.png`
- Source visual truth, mobile: `/Users/a11/Documents/ChatGPT/作品集 2/reference-evidence/spoony-project-detail-mobile-390x844.png`
- Implementation, desktop: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-strict-detail-desktop-1280x720.png`
- Implementation, mobile: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-strict-detail-mobile-390x844.png`
- Full desktop comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-strict-detail-desktop-comparison.png`
- Focused left-panel comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-strict-detail-panel-focus.png`
- Mobile comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-strict-detail-mobile-comparison.png`
- Desktop source and implementation: `1280 × 720` CSS px and image px at device density `1`.
- Mobile source and implementation: `390 × 844` CSS px and image px at device density `1`.
- State: first project open, media at the top, no hover or keyboard-focus state.

### Full-view and focused evidence

The desktop source and implementation are paired at identical dimensions in `qa-strict-detail-desktop-comparison.png`. Both use a fixed `528px` detail panel and the remaining viewport as the media column. The focused panel comparison makes the detailed anatomy readable: a `57px` full-width header, `200px` project index, `328px` content column, `69px` metadata row, content-only scroll area, and `57px` pager restricted to the content column. The left index continues to the bottom edge behind the pager, matching the source.

The mobile source and implementation are paired at `390 × 844` in `qa-strict-detail-mobile-comparison.png`. Both place the bottom sheet at `y=127`, use the same rounded blue outline and centered handle, keep the project image before metadata and description, and pin the `58px` pager to the viewport bottom (`source y=787`, implementation y=786; the one-pixel difference is the panel border).

### Required fidelity surfaces

- Fonts and typography: `12px` monospace interface typography, compact line height, gray hierarchy, and uppercase-style metadata treatment match the source. Chinese text is the previously approved content-language constraint.
- Spacing and layout rhythm: desktop header, columns, dividers, body inset, index row rhythm, media padding, and pager placement match the measured source structure. Mobile panel position, handle, horizontal `16px` media inset, indicator band, metadata, body spacing, and persistent pager follow the same order and dimensions.
- Colors and visual tokens: near-black page and panel surfaces, muted gray text, thin low-contrast dividers, white active marker, white close outline, and blue mobile-sheet border match the source palette.
- Image quality and asset fidelity: the implementation uses each project's supplied local cover at its native `16:9` ratio with no stretching, source hotlinking, generated imagery, invented backgrounds, or duplicated filler media. The source project has three media assets and therefore three dots; the local project has one supplied asset and therefore one dot. This is the only content-safe adaptation.
- Copy and content: project name, year, type, description, and outcome list follow the source information order. The two user-approved exceptions remain enforced: zero project avatars and zero “访问网站” actions.
- Icons and controls: the close control occupies the source `54 × 54` outlined position; previous and next affordances retain the source order and alignment. No extra counter or action was added.

### Interaction verification

- Homepage project name, thumbnail, active poster, and existing project action continue to open the corresponding detail state.
- Desktop quick-switch names replace the current project content and hash route.
- Previous and next controls update the project and hash without adding redundant history entries.
- Desktop close, Escape, and mobile backdrop close clear the project hash and restore the portfolio.
- Desktop media remains an independent vertical scroll region; the mobile sheet is the scroll container and its pager stays at the bottom.
- Browser console warnings and errors checked: none.

### Comparison history

- [P1] The prior implementation introduced a centered `01 / 08` counter, footer spanning both left columns, and two invented light/dark media stages. Fix: removed every unapproved region, restricted the footer to the `328px` content column, extended the `200px` project index to the bottom edge, and changed the right side to an unstyled source-order media stack.
- [P1] The prior mobile implementation absolutely overlaid media outside the sheet's reading flow and exposed an unapproved close label. Fix: moved media into the sheet before metadata, hid the desktop close control, restored the centered handle and indicator band, and kept the footer persistent.
- [P2] The first strict mobile pass placed the footer at `y=731` when short content did not fill the sheet. Fix: changed the mobile sheet to a column flex container and used `margin-top:auto` plus sticky positioning; the final footer is at `y=786`, matching the source bottom edge.
- [P2] The mobile backdrop initially sat below competing content layers and did not close reliably. Fix: assigned it the source-overlay layer beneath the panel and verified tap-to-close.
- Post-fix visual evidence: the final full and focused comparisons above contain no actionable P0, P1, or P2 differences beyond the explicitly approved no-avatar/no-visit-site constraints and project-specific media aspect/content.

### Follow-up polish

No unapproved polish items are proposed. Further secondary-page changes require explicit user approval.

## Approved desktop-column update — 2026-08-19

- Source visual truth: `/var/folders/h3/p4c0wxyn2052zy3rf6ryy5n40000gn/T/codex-clipboard-85b16f3c-028d-4dd1-8837-f21fa4b5aa25.png`
- Source dimensions: `1915 × 1566` image pixels. The page region is a `2×` browser capture; the left panel crop was normalized from `1056 × 1440` to `528 × 720` for visual comparison.
- Implementation screenshot: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-detail-columns-1280x720.png`
- Implementation viewport and density: `1280 × 720` CSS px at device density `1`; screenshot is `1280 × 720` image pixels.
- State: `#project/paid-live`, first project selected, media at top, pointer away from controls.
- Full left-panel comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-detail-columns-comparison.png`
- Focused header/divider comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-detail-divider-focus.png`

### Findings

No actionable P0, P1, or P2 issues remain within the eight approved desktop changes.

- Fonts and typography: every project label computes to `13px` with a `60px` line box. Copy typography and hierarchy outside the requested project-list change were preserved.
- Spacing and layout rhythm: the browser-computed tracks are exactly `200px 460px`, the media begins at `x=660`, each project row is exactly `60px`, the list gap is `0px`, and the active marker has a `14px` left margin.
- Colors and visual tokens: the project and copy surfaces compute to `rgb(0, 0, 0)`. Panel, header, metadata, pager, and full-height project divider use `1px rgb(37, 37, 37)` (`#252525`).
- Image quality and asset fidelity: the supplied project cover remains unchanged, sharp, and proportionally rendered in the remaining-width media column.
- Copy and content: no project title, metadata, description, outcome text, route, region, or media asset was added, removed, or rewritten.
- Controls and interaction: the close control computes to `0px none` with no radius. The active marker is `6px × 6px` pure white. Pointer entry moves only the label to `translateX(8px)` and pointer exit restores `transform: none`; reduced-motion preferences collapse the transition duration.
- Responsive regression check: at `390 × 844`, the existing sheet still begins at `y=127`, the desktop index and close control remain hidden, and the new full-height divider is disabled.
- Browser console warnings and errors checked: none.

### Comparison history

- The prior desktop detail layer used `200px + 328px`, translucent near-black surfaces, `#2a2a2a` dividers, a project divider beginning below the header, a bordered close control, `70px` / `11px` project rows, and an `8px` marker gap.
- Fix: applied only the eight user-approved desktop updates: `200px + 460px + remainder`, pure-black left surfaces, `1px #252525` dividers, a viewport-height divider at `x=199`, borderless close control, contiguous `60px` / `13px` rows, a `14px` pure-white active marker, and a reversible label-only hover shift.
- Post-fix evidence: both combined comparisons show the preserved secondary-page anatomy and the requested top-to-bottom divider; browser geometry and computed-style checks confirm every explicit pixel/color value.

### Follow-up polish

None proposed. Further secondary-page changes require explicit user approval.

## Spoony glass-overlay parity — 2026-08-19

- Live source, desktop: `/Users/a11/Documents/ChatGPT/作品集 2/reference-evidence/spoony-overlay-background-1280x720.png`
- Live source, mobile: `/Users/a11/Documents/ChatGPT/作品集 2/reference-evidence/spoony-overlay-background-mobile-390x844.png`
- User CSS evidence: `/var/folders/h3/p4c0wxyn2052zy3rf6ryy5n40000gn/T/codex-clipboard-8ee9bb52-c4c5-44a3-835a-d9c8ee081ff6.png` and `/var/folders/h3/p4c0wxyn2052zy3rf6ryy5n40000gn/T/codex-clipboard-727ee1d1-ea1b-4993-b6dd-cb31a25ee1c6.png`
- Implementation, desktop: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-spoony-glass-1280x720.png`
- Implementation, mobile: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-spoony-glass-mobile-390x844.png`
- Full desktop comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-spoony-glass-desktop-comparison.png`
- Full mobile comparison: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-spoony-glass-mobile-comparison.png`
- Viewports and density: desktop source/implementation `1280 × 720`, mobile source/implementation `390 × 844`, all captured at device density `1` with no scaling.
- State: first project open over the still-mounted homepage; media and panel scroll positions at the top; no hover or keyboard-focus state.

### Findings

No actionable P0, P1, or P2 issue remains in the requested background, frosted-glass, overlay, or divider scope.

- Fonts and typography: untouched in this pass; the prior approved local Chinese typography remains stable.
- Spacing and layout rhythm: untouched. The approved `200px + 460px + remainder` desktop tracks and existing mobile sheet geometry are preserved.
- Colors and visual tokens: live Spoony and the local panel now compute identically: `--bg-light: #0c0c0c`, `background: color-mix(in oklch, var(--bg-light) 96%, transparent)`, resolved `oklch(0.154339 0.00000767918 none / 0.96)`, and `backdrop-filter: blur(10px)`. Both use `--line-light: rgba(255,255,255,0.09)` for the `1px` right and internal rules.
- Image quality and asset fidelity: no media was changed or generated; the user's local project cover remains native and un-stretched.
- Copy and content: no title, description, highlight, route, control, region, or media asset was added, removed, or rewritten.
- Overlay behavior: `.project-page` computes to a transparent fixed layer; the homepage remains mounted behind it. Only the detail panel owns Spoony's 96%-opaque frosted surface, matching the live source instead of replacing the whole viewport with an opaque new page.
- Responsive evidence: the `390 × 844` implementation panel resolves to the same 96% `#0c0c0c` color mix and `blur(10px)` as Spoony's live mobile sheet.
- Interaction verification: closing removes the detail layer and returns to the existing homepage with all eight project entries; clicking the homepage project name reopens the same overlay and hash route.
- Browser console warnings and errors checked: none.

### Comparison history

- [P1] The previous `.project-page` used an opaque `#0c0c0c` full-viewport background, while the panel's child columns used opaque black, so the detail state visually replaced the homepage and could not reproduce Spoony's glass surface.
- [P2] Previous dividers used `#252525`, while the live source and the supplied inspector evidence use `var(--line-light)`, resolved to `rgba(255,255,255,0.09)`.
- Fix: made the full detail layer transparent; moved the exact source `color-mix(...)` plus `blur(10px)` to the panel; made panel children transparent; and routed every panel rule through the exact live `--line-light` value.
- Post-fix evidence: both combined comparisons were inspected together, and browser-computed styles match the live Spoony values property-for-property. The remaining content and width differences are explicit prior user constraints, not drift in this background-only pass.

### Follow-up polish

None proposed. Further secondary-page changes require explicit user approval.

## Stacked project/copy column backgrounds — 2026-08-19

- Source visual truth: `/var/folders/h3/p4c0wxyn2052zy3rf6ryy5n40000gn/T/codex-clipboard-1e02aec7-2c19-4c1e-bb69-79e1c72c5227.png`
- Source dimensions: `462 × 486` image pixels; this is CSS-inspector evidence for the requested extra background layer, not a full-page composition.
- Implementation screenshot: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/implementation-stacked-column-background-1280x720.png`
- Implementation viewport and density: `1280 × 720` CSS px and image pixels at device density `1`.
- Combined comparison input: `/Users/a11/Documents/ChatGPT/作品集 2/portfolio-site/qa-stacked-column-background-comparison.png`
- State: first project open, media and panel at top, no hover or keyboard focus.

### Findings

No actionable P0, P1, or P2 issue remains in the requested extra-background scope.

- Fonts and typography: unchanged.
- Spacing and layout rhythm: unchanged; the existing `200px + 460px + remainder` desktop geometry is preserved.
- Colors and visual tokens: the panel remains the first `color-mix(in oklch, var(--bg-light) 96%, transparent)` layer with `blur(10px)`. The desktop header, project index, copy region, and copy pager now each compute to the same requested `color-mix(...)` value as a second surface layer. The browser resolves every one to `oklch(0.154339 0.00000767918 none / 0.96)`.
- Image quality and asset fidelity: unchanged; no asset was generated, replaced, or transformed.
- Copy and content: unchanged.
- Responsive scope: at `390 × 844`, the copy region still computes to transparent and the mobile panel retains its single existing glass layer, confirming that the new desktop-only layer did not alter mobile.
- Interaction verification: closing still removes the overlay and reveals the homepage; selecting the homepage project restores the overlay and route.
- Browser console warnings and errors checked: none.

### Comparison history

- [P2] The previous pass gave the outer detail panel the requested glass background, but the desktop project and copy columns themselves remained transparent.
- Fix: added the exact supplied background declaration to the desktop grid regions composing both full columns, including their header and footer bands, without changing any element, dimension, border, copy, or interaction.
- Post-fix evidence: the combined input shows the darker stacked column surface, and computed-style checks confirm the exact requested value on all four desktop regions.

### Follow-up polish

None proposed. Further secondary-page changes require explicit user approval.

## 0.5px divider update — 2026-08-19

- Source visual truth: `/var/folders/h3/p4c0wxyn2052zy3rf6ryy5n40000gn/T/codex-clipboard-25a43967-7e85-4539-941c-cafa3487e8d0.png`
- Source dimensions: `816 × 104` image pixels; CSS-inspector evidence specifies `0.5px solid rgb(255 255 255 / 5%)`.
- Intended implementation viewport: `1280 × 720` CSS px at device density `1`, first project open with no hover state.
- Build verification: production build and all four Sites worker tests pass. Source and built CSS contain the requested `0.5px` width and `5%` white line color for the desktop panel edge, full-height project divider, header rule, metadata rule, and pager rule.

### Findings

- [P2] Browser-rendered evidence is unavailable for the revised border state.
  - Location: desktop secondary-page panel dividers.
  - Evidence: the browser session was able to show only the previously loaded `1px / 9%` state, then the in-app browser security policy blocked reload and subsequent inspection after the local preview server restarted.
  - Impact: the implementation code and build match the supplied values, but the required post-change visual capture and side-by-side comparison cannot be completed in this run.
  - Fix: reopen or refresh the local preview in the in-app browser, then capture and compare the rendered `0.5px / 5%` state.

### Required fidelity surfaces

- Fonts and typography: unchanged.
- Spacing and layout rhythm: unchanged; only border thickness and color tokens were edited.
- Colors and visual tokens: source/build CSS now use `--line-width: 0.5px` and `--line-light: rgb(255 255 255 / 5%)` on all desktop detail dividers.
- Image quality and asset fidelity: unchanged.
- Copy and content: unchanged.

### Comparison history

- [P2] Previous dividers rendered at `1px solid rgba(255,255,255,0.09)`.
- Fix applied in code: changed all desktop panel rules to `0.5px solid rgb(255 255 255 / 5%)` and aligned the full-height vertical divider to `left: 199.5px` with a `0.5px` width.
- Post-fix visual evidence: blocked by the in-app browser security policy; no alternate browser or automation surface was used.

### Follow-up polish

None proposed.

final result: blocked
