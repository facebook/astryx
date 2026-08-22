---
'@astryxdesign/core': patch
---

[fix] Popup triggers no longer fight the browser's own light dismiss: pressing the button of an open Selector, MultiSelector, ComplexSelector, DropdownMenu or Popover closes it once instead of closing and reopening, and a clear or status button sitting on the trigger no longer dismisses the popup it belongs to

@cixzhang
