---
'@astryxdesign/core': patch
---

[fix] TableCell and TableHeaderCell load their right-click context menu only when the cell has `contextMenuActions`. A table without context menus no longer bundles ContextMenu, DropdownMenu's menu hooks and the touch sheet with its cells: `TableCell`, `TableRow` and `TableBody` alone drop from about 75 KB to about 7 KB gzip in an esbuild bundle of the package source. A cell with actions renders its content at once and its menu a moment later, as soon as the menu code loads. `resolveContextActions` keeps its export and no longer pulls the menu in.

@rhagigi
