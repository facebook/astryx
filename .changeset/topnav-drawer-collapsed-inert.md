---
'@astryxdesign/core': patch
---

[fix] A collapsed `TopNavMenu` or `TopNavMegaMenu` section in the mobile drawer is now `inert` and hidden from assistive technology, so Tab no longer moves focus onto links that are not shown and screen readers no longer list them under a section announced as collapsed.

@kyu-rong
