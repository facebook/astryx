---
'@astryxdesign/core': patch
---

[fix] RadioList keeps a caller's `aria-labelledby`. The radiogroup always replaced it with its own label id, so the caller's ids never reached the accessible name. The group is now named by its label and then the caller's ids, the same order TimeInput uses.

@harjothkhara
