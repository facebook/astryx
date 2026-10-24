---
'@astryxdesign/core': patch
---

[fix] `useScrollLock`, and so Dialog, BottomSheet, Drawer and Lightbox, keeps the page where it is while an overlay is open. The lock used to pin `<body>` with `position: fixed` at minus the scroll offset and scroll back on release: the page's offset read 0 for the whole lock, and on iOS Safari the jump to the top brought the toolbar back, where it stayed after the overlay closed. Now the root gets `overflow: hidden`, and on touch screens a one-finger pan that would scroll the page is cancelled, which iOS Safari before 26.4 needs because it scrolls an `overflow: hidden` page under a finger. Pans that a scroller inside the overlay can take, and pinch-zoom, still work. The lock no longer writes inline styles on `<body>`, and `window.scrollY` keeps its value while the lock holds.

@vjeux
