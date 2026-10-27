---
'@astryxdesign/core': patch
---

[fix] Button and the cards follow reduced motion. With `prefers-reduced-motion: reduce`, a pressed Button no longer shrinks, and Button, ClickableCard, SelectableCard and Thumbnail change their hover, press and selection colours at once with a mouse or a finger; on a touch screen only an opacity change may still cross-fade, in 200 ms or less, whatever the theme's duration.

@vjeux
