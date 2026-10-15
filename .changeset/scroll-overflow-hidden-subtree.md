---
'@astryxdesign/core': patch
---

[fix] `useScrollOverflow` (the strip of `TabList`, the scroller of `Carousel`) measures a resize, and its container at registration, only while the container is rendered. Inside a `display: none` ancestor or a `content-visibility: hidden` subtree the hook keeps its last state instead of reading layout, since a layout read there made the browser render the whole hidden subtree for the answer; the resize observation that comes with the reveal measures again, one frame after the reveal paints. A scroll is measured hidden or not, so a container script scrolled while hidden (a selected tab's reveal) is right at a reveal that brings no resize. Before, a hidden container reported no overflow.

@vjeux
