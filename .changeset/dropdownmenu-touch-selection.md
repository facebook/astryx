---
'@astryxdesign/core': patch
---

[feature] Under a finger, on every touch device, DropdownMenu tracks a finger that lands in its open menu as the list of an iOS menu does: the row under a resting finger lights after UIKit's content-touch delay (150 ms), a tap picks at the lift, and a quick drag scrolls a menu that scrolls and slides the highlight in one that fits. A mouse, and `presentation="popover"`, keep the pointer model. It runs on the gesture system and the shared action-group tracker; `useMenuPress` itself is unchanged.

@vjeux
