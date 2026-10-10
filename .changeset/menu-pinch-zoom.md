---
'@astryxdesign/core': patch
---

[fix] A two-finger pinch over an open DropdownMenu, sub-menu flyout, ContextMenu or Selector list now zooms the page. The menus declared `touch-action: none` while their rows fit and `pan-y` once they scroll, and neither allows a pinch, so a phone could not zoom the page while a menu was open. They now declare `pinch-zoom` and `pan-y pinch-zoom`; a one-finger slide over the rows and the press model behave as before.

@vjeux
