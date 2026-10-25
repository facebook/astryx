---
'@astryxdesign/core': patch
---

[fix] Under every coarse pointer, Dialog (and so AlertDialog), Drawer and MobileNav no longer blur the page behind the modal: the 2px full-viewport backdrop blur is costly to repaint on touch devices. The dim keeps the theme's `--color-overlay`, and in forced colors the modal draws an edge so it still stands apart from the page. With a mouse the blur stays. BottomSheet never blurred.

@vjeux
