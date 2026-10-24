---
'@astryxdesign/core': patch
---

[feat] Lightbox no longer blurs the page behind the viewer, under every pointer, as the modal backdrops don't: the 2px full-viewport backdrop blur is costly to repaint, and the viewer's touch paths fade the backdrop every frame. The dim keeps the theme's `--color-overlay`. A theme keeps the blur by setting `backdropFilter: 'blur(2px)'` on `components.lightbox.base['::backdrop']`.

@vjeux
