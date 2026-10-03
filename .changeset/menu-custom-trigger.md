---
'@astryxdesign/core': patch
---

[feat] DropdownMenu takes a `trigger` render prop: hang a menu off any control.

`trigger` renders the control the menu opens from — an IconButton, a chip, an
avatar, a list row — and hands it `DropdownMenuTriggerProps` to spread: the
press model, the keyboard opens, the toggle click and the ARIA wiring. The menu
is named by that control through `aria-labelledby`. `button` and `trigger` are
mutually exclusive (a dev warning).

@vjeux
