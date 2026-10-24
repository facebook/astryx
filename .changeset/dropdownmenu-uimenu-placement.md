---
'@astryxdesign/core': patch
---

[feature] On a phone (compact viewport, coarse pointer), the popover DropdownMenu and MoreMenu sit where UIMenu does on iOS: over their trigger, centered on it and top-aligned with it, or bottom-aligned when the trigger is in the lower half of the viewport, and 8 px from the viewport's sides. The finger that opened the menu rests on its first row and picks only once it moves, as on iOS. Larger screens and mouse presentations keep the menu below its trigger.

@vjeux
