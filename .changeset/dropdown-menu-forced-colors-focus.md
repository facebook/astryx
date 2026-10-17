---
'@astryxdesign/core': patch
---

[fix] A focused `DropdownMenu` row stays visible under forced colors (Windows High Contrast and similar modes). Rows show focus with a translucent background, which forced colors replace with the page color, so a keyboard user could not tell which row Enter would activate. In forced-colors mode only, the focused row now receives an inset system `Highlight` outline while the browser preserves legible text, icons, markers, and end content on action, destructive, checkbox, radio, and sub-menu rows; nothing changes outside that mode. The same rows render in `ContextMenu` and breadcrumb menus.

@cixzhang
