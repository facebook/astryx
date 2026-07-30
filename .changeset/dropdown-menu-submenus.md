---
'@astryxdesign/core': patch
---

[feat] DropdownMenu: add submenus via a single `DropdownMenuSubMenu` component (or a nested `items` array in data mode). The row adopts DropdownMenuItem semantics (label / icon / description / isDisabled) and its children — or an `items` array — become the flyout content. Flyouts open inline-end with auto-flip, hover-intent, and full keyboard support (Right/Enter/Space opens and focuses the first item; Left/Escape closes and returns focus to the trigger).
@cixzhang
