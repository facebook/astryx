---
'@astryxdesign/core': patch
---

[fix] RadioList: the group is now named via `aria-labelledby` pointing at the field label element, and the label no longer carries an orphaned `htmlFor` (it pointed at an id no radio used, so clicking it did nothing and the group was double-labeled). `Field`/`FieldLabel` gain optional `labelID` and `isGroupLabel` props to support grouping controls (#3343).
@cixzhang
