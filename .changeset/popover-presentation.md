---
'@astryxdesign/core': patch
---

[feature] Popover takes `presentation`, with the values DropdownMenu and Selector use: `'popover'` (the default, unchanged) anchors it to its trigger, `'bottom-sheet'` presents its content in a modal BottomSheet labeled by `label`, and `'adaptive'` uses the BottomSheet on a compact touch screen (a phone) and the anchored popover elsewhere, the way iOS presents a popover on an iPhone. In a sheet, `placement`, `alignment` and `width` do not apply. The sheet loads only when a popover can present one.

@vjeux
