---
'@astryxdesign/core': patch
---

[fix] CheckboxList keeps a caller's `aria-labelledby`. The group always replaced it with its own label id, so the caller's ids never reached the accessible name. The group is now named by its label and then the caller's ids, the same order RadioList and TimeInput use.

@kyu-rong
