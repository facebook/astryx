---
'@astryxdesign/core': patch
---

[feat] `Item` gains `swipeActions`: touch-only leading and trailing swipe panels (`{label, icon?, onAction, tone?}`) revealed by a horizontal drag and fired past a commit point or by a fling, with the row sliding out; a vertical drag stays the scroller's, a mouse is ignored, a disabled row does not swipe. Directions are logical (`leading` is toward the inline end), so the gesture reads the same under RTL. With it set, the `as` element becomes the clipping container around the row (a swipeable `li` stays its list's direct child) and `ref`, `role` and every other attribute still land on the row. Types `ItemSwipeAction`, `ItemSwipeActions` and `ItemSwipeActionTone` are exported.

@vjeux
