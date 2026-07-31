---
'@astryxdesign/core': minor
---

[breaking] DropdownMenuRadioGroup now takes a required `label` prop that names the group for assistive tech (applied as aria-label), replacing the previous optional `aria-label`/`aria-labelledby` passthrough -- rename `aria-label="..."` to `label="..."` (pass `aria-labelledby` via base props instead when a visible label already exists). This also covers the ContextMenu/Breadcrumb re-exports (ContextMenuRadioGroup, BreadcrumbMenuRadioGroup). Also fixes ContextMenu to close the menu on Tab per the APG menu pattern.
@bhamodi
