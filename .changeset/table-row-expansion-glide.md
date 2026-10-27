---
'@astryxdesign/core': patch
---

Table: `useTableRowExpansion` takes an `animatedLayout` handle from `useAnimatedLayout`. With it, opening or closing a row's panel glides the rows after it to their new places instead of jumping, and each row's divider moves with its row. Under Reduce Motion the rows change at once.
