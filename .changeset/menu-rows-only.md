---
'@astryxdesign/core': patch
---

[fix] DropdownMenu, ContextMenu and sub-menus no longer special-case text fields and buttons placed among their rows. This reverts an unreleased change. A menu holds only menu items; a control that is not a row belongs outside the menu.

@cixzhang
