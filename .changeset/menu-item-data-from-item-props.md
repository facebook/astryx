---
'@astryxdesign/core': patch
---

[chore] `DropdownMenuItemData` — the shape of one entry in a `DropdownMenu` / `ContextMenu` / `MoreMenu` `items` array — is now sourced from `DropdownMenuItemProps` (`Pick`) instead of restating `icon`, `onClick`, `isDisabled`, and `variant` by hand, and `renderDropdownItems` forwards the whole item to `DropdownMenuItem` rather than copying it field by field. The data and compound APIs describe the same item, so they can no longer drift — exposing another item prop to the data API is now one key in the `Pick`. The type is structurally identical to before (`label` is still narrowed to `string`, since the renderer keys rows by it) and rendering is unchanged. (#4809)
@cixzhang
