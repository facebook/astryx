---
'@astryxdesign/core': patch
---

[fix] `TransferList` clears its three remaining audit BLOCKs: the `Clear` and `Add all` header actions now meet the 24px touch-target minimum (WCAG 2.5.8) while keeping their text-link look, the add/remove/reorder glyphs render through the shared `Icon` primitive (remove reuses the registry `close` icon) instead of inline `<svg>`, and the fallback heading for ungrouped options is localized through the i18n catalog.

@ernestt
