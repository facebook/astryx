---
'@astryxdesign/core': patch
---

[breaking] DropdownMenu, ContextMenu, MoreMenu: removed the `hasAutoFocus` prop. Menus now always focus their first item on open (the correct APG menu-button behavior). Previously `hasAutoFocus={false}` left the menu keyboard-unreachable and undismissable — the prop existed only as an escape hatch for documentation previews, which no longer need it.
@cixzhang
