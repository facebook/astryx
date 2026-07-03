---
'@astryxdesign/core': patch
---

[fix] DropdownMenu: pressing Tab in an open menu now closes it (APG menu-button pattern) and returns focus to the trigger, instead of leaking focus into the page while the menu stayed open (#3343).
@cixzhang
