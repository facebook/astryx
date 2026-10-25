---
'@astryxdesign/core': patch
---

[feat] Under a finger, on every touch device (iOS and Android alike), a finger still down when ContextMenu's menu opens can slide onto an action and lift to pick it, as on iOS. Once the finger has moved 10 pt in the open menu, the highlight follows it, and the action under the lift runs. A lift before that picks nothing and leaves the menu open, and a slide off the rows leaves none lit, with no focus ring on the menu.

@vjeux
