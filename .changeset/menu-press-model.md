---
'@astryxdesign/core': patch
---

[feat] Menus and pickers act on the row under the pointer at release, and the highlight follows a held finger or mouse.

`DropdownMenu`, `ContextMenu`, `DropdownMenuSubMenu`, `Selector` and the menu
bottom sheet share one press model, the one macOS and iOS menus use: the row
under the pointer when it is released is the row that acts, and the highlight
follows a held pointer across the rows. A finger that lands on one row and
lifts on another acts on the second — once; the click the browser aims at the
first row is swallowed. A mouse released outside a menu closes it; a finger
released outside leaves it open. A menu whose rows fit declares
`touch-action: none` so a slide stays a slide; one that scrolls lets the
browser pan it and ends the gesture. Menu rows no longer paint a pressed look
where hover does not exist. New public hook: `useMenuPress`.

@vjeux
