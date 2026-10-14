---
'@astryxdesign/core': patch
---

[fix] `reset.css`: in Chromium, the dropdown marker of an `<input>` with a `list` sits in the middle of the field. It was set on the line-height the field inherits, so with the reset's 1.5 it sat about 3px below the middle of a 40px field, and further down on taller lines. Date and time fields, whose calendar icon uses the same part, keep their icon where it was.

@vjeux
