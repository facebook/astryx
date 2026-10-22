---
'@astryxdesign/core': patch
---

[fix] Selector, DropdownMenu and ContextMenu: clicking an option inside a shadow root selects it. The menu used to hit-test through the document, which answers with the shadow host, so the click closed the menu without selecting anything.

@cixzhang
