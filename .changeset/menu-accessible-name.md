---
'@astryxdesign/core': patch
---

[fix] DropdownMenu/ContextMenu: the `role="menu"` container now has an accessible name — DropdownMenu names it from the trigger's label, and ContextMenu exposes a `menuLabel` prop (default "Context menu"). ContextMenu also no longer places `aria-haspopup="menu"` on its role-less, non-focusable trigger wrapper, where it conveyed nothing useful to assistive tech (menus-13, menus-15).
@cixzhang
