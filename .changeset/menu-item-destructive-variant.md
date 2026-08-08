---
'@astryxdesign/core': patch
---

[feat] DropdownMenuItem now accepts a `variant` prop (`'default' | 'destructive'`); `'destructive'` renders the label, description, and icon in the error color for dangerous actions like Delete. The data-driven `items` API accepts the same `variant` field, and because ContextMenu shares the menu-item data shape, context-menu items get it too. Defaults to `'default'`, so existing menus are unchanged.
@freddymeta
