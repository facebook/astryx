---
'@astryxdesign/core': patch
---

[feat] BreadcrumbItem gains a `menu` prop that turns a crumb into a menu trigger for switching between sibling destinations. It accepts the same item API as DropdownMenu/MoreMenu/ContextMenu (a `DropdownMenuOption[]` array or composed item children), so existing menu-item definitions drop into a breadcrumb with no rewrite. The item components are also re-exported under `Breadcrumb*` aliases.

@cixzhang
