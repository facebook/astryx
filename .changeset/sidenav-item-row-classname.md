---
'@astryxdesign/core': patch
---

[fix] `SideNavItem` keeps a caller's `className` on its row element (the link or button, and the collapsed rail item) next to its own classes. Before, the row's generated class replaced it, so a class passed to style the row (for example, a cursor while a row is dragged) never reached the DOM, even though `style`, ARIA, data attributes and handlers did.

@cixzhang
