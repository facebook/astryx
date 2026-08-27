---
'@astryxdesign/core': patch
---

[fix] Banner names each dismiss control after its string title, so stacked banners no longer expose identical "Dismiss" buttons to screen readers. Rich titles retain the generic translated name unless the consumer supplies an already-translated `dismissLabel`; that override also labels the tooltip.

@cixzhang
