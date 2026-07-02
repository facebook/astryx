---
'@astryxdesign/core': patch
---

[fix] SideNavItem: for split-action items (a collapsible item with its own link/action), `aria-current="page"` now sits on the focusable link instead of the non-interactive wrapper `<div>`, so screen readers announce the current page on the actual navigation element (#3343).
@cixzhang
