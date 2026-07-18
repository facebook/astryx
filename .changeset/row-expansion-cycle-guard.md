---
'@astryxdesign/core': patch
---

[fix] Guard useTableRowExpansionState tree walks against cyclic data (#3971)

The `depthMap`, flattened `data`, and `allExpandableKeys` walks now track the ancestor keys on the current path and skip edges that point back at an ancestor, so self-referential or cyclic row data terminates instead of overflowing the stack.

@AKnassa
