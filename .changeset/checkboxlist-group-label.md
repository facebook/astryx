---
'@astryxdesign/core': patch
---

[fix] CheckboxList: the checkboxes are now wrapped in a `role="group"` named by the field label via `aria-labelledby` (and associated with the description/error), instead of a flat list with an orphaned label `htmlFor`. Screen-reader users now hear the group's name and context (#3343).
@cixzhang
