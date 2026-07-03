---
'@astryxdesign/core': patch
---

[fix] useLayer: the popover `toggle` event listener is now removed when the layer element detaches or when the handler identity changes (a new `onHide`), instead of accumulating stale-closure listeners on the same element. This prevents duplicate/stale `onHide` firing over a layer's lifetime (#3343).
@cixzhang
