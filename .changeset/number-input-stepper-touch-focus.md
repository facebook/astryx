---
'@astryxdesign/core': patch
---

[fix] NumberInput: a finger or a pen on a number stepper, and an activation with no pointer (a screen reader, a programmatic `click()`), steps the value without focusing the field, so on a phone the on-screen keyboard no longer slides up over the page with every tap. A field that is already being edited stays focused, and a mouse click still focuses the field, so the arrow keys and the wheel keep stepping.

@vjeux
