---
'@astryxdesign/core': patch
---

[fix] Popup triggers no longer fight the browser's own light dismiss: pressing the button of an open Selector, MultiSelector, ComplexSelector, DropdownMenu, or Popover closes it once instead of closing and reopening. MultiSelector's clear and status buttons also keep its popup open when pressed.

@cixzhang
