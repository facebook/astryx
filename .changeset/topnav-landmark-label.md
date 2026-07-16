---
'@astryxdesign/core': patch
---

[fix] TopNav: the `<nav>` landmark now defaults its accessible name to "Top navigation" when the `label` prop is omitted, matching SideNav ("Side navigation"), Breadcrumbs, and Pagination. Previously an omitted `label` shipped an unnamed navigation landmark, leaving screen-reader users with multiple indistinguishable "navigation" landmarks on pages that compose SideNav + TopNav + Breadcrumbs. An explicit `label` still wins.
@bhamodi
