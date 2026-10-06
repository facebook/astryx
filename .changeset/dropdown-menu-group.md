---
'@astryxdesign/core': patch
---

[feat] Add `DropdownMenuGroup`, a titled `role="group"` of rows for compound-mode menus.

The `items` data API could title a group (`{type: 'section', title, items}`);
a menu written with children — checkbox rows, radio groups, rows mounted only
while open — could not. `DropdownMenuGroup` (also `ContextMenuGroup` and
`BreadcrumbMenuGroup`) renders a `role="group"` named by its heading through
`aria-labelledby`; the heading shares the data mode's typography and
`astryx-dropdown-menu-section-heading` theme target, is not a menu item, and is
skipped by arrow keys and typeahead. Existing menus are unchanged.

@vjeux
