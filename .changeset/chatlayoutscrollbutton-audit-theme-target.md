---
'@astryxdesign/core': patch
---

[fix] Make a theme that styles `chat-layout-scroll-button` actually restyle the chat scroll-to-bottom pill. The documented target sat on the invisible full-width row that centres the pill, so a `backgroundColor` override painted a band across the chat dock while the pill kept the surface the theme asked to replace — and every automated check passed, because the override did reach _an_ element. The target now rides the pill, which is what paints the fill, elevation, and radius (`architecture:component-theming-surface` INV4). The target keeps its name, stays a single target, and the component's props, DOM shape, ref target, and consumer passthrough are unchanged. A Chromium spec pins the placement and proves the repair by moving the target back and showing the pill go unstyled under a theme. (#6482)

@cixzhang
