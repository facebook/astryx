---
'@astryxdesign/core': patch
---

[fix] `useScrollLock`, and so Dialog, BottomSheet, Drawer and Lightbox, keeps the page where it is while an overlay is open. The lock used to pin `<body>` with `position: fixed` at minus the scroll offset and scroll back on release: the page's offset read 0 for the whole lock, and on iOS Safari the jump to the top brought the toolbar back, where it stayed after the overlay closed. Now the page gets `overflow: hidden` (on the root, or on `<body>` when the body's own overflow is the one the viewport uses), and on touch screens a one-finger pan that would scroll the page is cancelled, which iOS Safari before 26.4 needs because it scrolls an `overflow: hidden` page under a finger. Pans that a scroller inside the overlay can take, and pinch-zoom, still work. The lock no longer pins `<body>`, and `window.scrollY` keeps its value while the lock holds. Pans are judged through the shared gesture host, after a small slop so a swipe's first wobble does not fix the wrong axis. MobileNav's own clip goes through the same page scroll-style claims, so closing or unmounting it no longer releases another overlay's lock.

@vjeux
