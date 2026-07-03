---
'@astryxdesign/core': patch
---

[fix] ContextMenu: can now be opened on touch (long-press) and by keyboard. A long-press (500ms, cancelled by a 10px finger move) opens the menu at the touch point — previously context menus were unreachable on iOS Safari, which never fires `contextmenu` on long-press. A keyboard-initiated `contextmenu` (Shift+F10 / the Menu key), whose coordinates are (0,0), now anchors the menu to the trigger's box instead of the viewport corner (#3343).
@cixzhang
