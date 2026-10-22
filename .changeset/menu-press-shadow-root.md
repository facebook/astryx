---
'@astryxdesign/core': patch
---

[fix] Selector, DropdownMenu and ContextMenu: clicking an option inside a shadow root (open, closed or nested) selects it. The menus used to read the document's view of the click, which names the shadow host, so the click closed the menu without selecting anything.

@cixzhang
