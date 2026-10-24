---
'@astryxdesign/core': patch
---

[fix] NumberInput: a finger held on a number stepper no longer selects text. In iOS Safari, resting a finger on a stepper for about half a second selected the field's label and opened the edit menu over the field, and the tap was lost. The steppers now opt out of text selection and the touch callout, and rapid taps on them no longer double-tap zoom the page; a scroll that starts on a stepper still scrolls.

@vjeux
