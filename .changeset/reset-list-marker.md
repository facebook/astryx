---
'@astryxdesign/core': patch
---

[fix] `reset.css`: in Chromium, the dropdown marker of an `<input>` with a `list` sits in the middle of the field. Chromium sets the marker on the field's line-height, so above a line-height of 1 it sits low, and the reset makes every field inherit the page's 1.5: the marker sat 3.5px below the middle of a 40px field, and further down on taller lines. Date and time fields, whose calendar icon uses the same part, keep their icon where it was. To keep the old placement, add `input[list]::-webkit-calendar-picker-indicator { line-height: inherit; }` after the reset.

@vjeux
