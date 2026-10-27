---
'@astryxdesign/core': patch
---

[feat] NumberInput: a finger on a number stepper steps the value without focusing the field, and so do a pen and an activation with no pointer (a screen reader, a programmatic `click()`) where the primary pointer is coarse, so on a phone the on-screen keyboard no longer slides up over the page with every tap. A field that is already being edited stays focused. A mouse click, and a pen or an activation with no pointer where the primary pointer is fine, still focus the field, so the arrow keys and the wheel keep stepping.

@vjeux
