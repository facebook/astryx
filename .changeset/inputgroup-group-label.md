---
'@astryxdesign/core': patch
---

[fix] InputGroup: the group is now named by the field label via `aria-labelledby` instead of a duplicated `aria-label`, and the label no longer carries an orphaned `htmlFor` (its `inputId` was never handed to a child). Uses the `Field` `isGroupLabel`/`labelID` support (#3343).
@cixzhang
