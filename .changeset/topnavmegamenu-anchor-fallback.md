---
'@astryxdesign/core': patch
---

[fix] TopNavMegaMenu: rendered outside a `<nav>` (e.g. a docs Properties preview), the panel no longer opens at the viewport top-left corner. The CSS anchor falls back to the trigger button itself when no `<nav>` ancestor exists, so the panel stays attached below its trigger.

@is-jain
