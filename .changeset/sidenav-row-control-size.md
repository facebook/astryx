---
'@astryxdesign/core': patch
---

[fix] SideNavItem: the standalone expand/collapse toggle on a `collapsible` item with an `href` or `onClick` now carries the box of a `size="sm"` icon button. It had no box of its own, so it shrank to the 24px chevron inside it and painted a smaller hover pill than any icon button sitting beside it in the same row. (#4988)

@AKnassa
