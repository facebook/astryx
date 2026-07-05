---
'@astryxdesign/core': patch
---

[fix] Table rows re-render when a field is removed from the row object (#3595)

The row memo compared only the keys of the new item, so a field cleared by omission (optimistic update, server response) never invalidated the memo and the cell kept rendering the deleted value indefinitely. A key-count check now catches removed properties.
@arham766
