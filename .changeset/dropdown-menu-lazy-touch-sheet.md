---
'@astryxdesign/core': patch
---

[fix] DropdownMenu: load the touch bottom sheet only when a menu shows it

`DropdownMenu` imported its touch sheet (BottomSheet, its gestures, and the touch action list) up front, so every page with a dropdown shipped it, even when the menu only ever opens as an anchored popover. The sheet now loads on demand, the way `ContextMenu` already loads it. A popover-only dropdown's own code drops by about a third (about 23 KB gzipped). Bottom-sheet and adaptive menus behave as before; the sheet mounts with the trigger, so it has loaded before the first tap.
