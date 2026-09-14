---
'@astryxdesign/core': patch
---

[feat] Add an opt-in bulk-actions toolbar to `useTableSelection` via a new `bulkActions` config (#5486). When present, a toolbar appears above the table while rows are selected, showing a count, optional "select all N matching" link, optional extra content, and the provided action buttons (each receives the selected keys on click). Off by default: tables that omit `bulkActions` are unchanged.

@humbertovirtudes
