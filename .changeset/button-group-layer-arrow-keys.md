---
'@astryxdesign/core': patch
---

[fix] ButtonGroup: arrow keys pressed inside a member's open menu stay with that menu. A DropdownMenu renders its menu inline inside the group, so ArrowLeft and ArrowRight used to bubble to the group and move focus onto a sibling button while the menu was still open. The group's `elevation` is also reflected as `data-elevation` now, so a theme can target it.

@cixzhang
