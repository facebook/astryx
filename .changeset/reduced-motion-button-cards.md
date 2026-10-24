---
'@astryxdesign/core': patch
---

[fix] Button and the cards follow reduced motion. With `prefers-reduced-motion: reduce`, a pressed Button no longer shrinks; with a mouse or trackpad as the primary pointer, the hover and press colours of Button, ClickableCard, SelectableCard and Thumbnail change at once; on a touch screen they cross-fade in 200 ms, whatever the theme's duration.

@vjeux
