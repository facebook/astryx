---
'@astryxdesign/core': patch
---

[fix] `useScrollOverflow` (the strip of `TabList`, the scroller of `Carousel`) measures only while its container is rendered. Inside a `display: none` ancestor or a `content-visibility: hidden` subtree the hook keeps its last state instead of reading layout, since a layout read there made the browser render the whole hidden subtree for the answer; the resize observation that comes with the reveal measures again. Before, a hidden container reported no overflow.

@vjeux
