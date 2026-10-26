---
'@astryxdesign/core': patch
---

[feature] On a compact touch screen (a phone, iOS or Android), the popover DropdownMenu and MoreMenu sit where UIMenu does: over their trigger, centered on it and top-aligned with it, or bottom-aligned when the trigger is in the lower half of the viewport, 8 px from the viewport's sides (or the safe area), and no taller than the room left, so they stay on screen and scroll. The finger that opened the menu rests on its first row and picks only once it moves, as on iOS. Larger screens, a mouse, and `presentation="popover"` keep the menu below its trigger.

@vjeux
