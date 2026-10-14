---
'@astryxdesign/core': patch
---

[fix] Rows inside a `DropdownMenuGroup` (also exported as `ContextMenuGroup`) or a data-mode `{type: 'section'}` keep the menu's 2px row gap. Before, the group's heading, rows and dividers sat flush against each other, so grouped rows sat 2px closer together than the plain rows around them. To keep the flush look on a compound group, pass it `xstyle` with `gap: 0`.

@vjeux
