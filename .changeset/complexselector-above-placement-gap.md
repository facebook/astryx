---
'@astryxdesign/core': patch
---

[fix] ComplexSelector: the popup keeps its clearance when opening upward (`placement="above"`). The popup layer only set the gap on its block-start edge, which spaces a downward-opening popup but left an upward-opening one flush against the trigger. Both block edges now carry the gap, matching Popover.

@AKnassa
