---
'@astryxdesign/core': patch
---

[fix] DateInput's sheet-backed field is the same height as every other input on touch

`TouchDateField`'s closed field carried a 44px `minBlockSize` floor on a coarse
pointer, so on a phone it rendered 12px taller than the TextInput beside it —
and taller than the same component's own native surface, which is what
`DateInput` renders by default on touch. Two `DateInput`s in one form could
therefore differ in height purely by `nativePicker`.

The floor is gone from the closed field; every target inside the open sheet
keeps its 44px. The field's own floor is core's, 24x24 under WCAG 2.5.8 AA,
which a 32x180 field clears several times over.

@imdreamrunner
