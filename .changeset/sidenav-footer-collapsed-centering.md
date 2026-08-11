---
'@astryxdesign/core': patch
---

[fix] SideNav: `footer` content now centers when the nav is collapsed, matching how `children` already centers. `stickyBottomCollapsed` (the collapsed-rail wrapper for `footer`) was missing `alignItems: 'center'`, which its sibling `scrollableCollapsed` (the collapsed-rail wrapper for `children`) already had — so full-width footer content (e.g. an icon-only button) stretched to the collapsed rail's width instead of centering.

@HelloOjasMutreja
