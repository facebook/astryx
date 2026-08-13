---
'@astryxdesign/core': patch
---

[fix] `ComplexSelector`'s popup now keeps its 4px clearance from the trigger when `placement="above"`, matching `placement="below"` and `Popover`. The popup's margin was set on `marginBlockStart` only, which is correct for a popup opening downward but leaves zero clearance on the edge that matters when it opens upward.

@HelloOjasMutreja
