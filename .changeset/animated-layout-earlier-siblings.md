---
'@astryxdesign/core': patch
---

[fix] With an `animatedLayout` handle, content before a Collapsible or TreeList change glides too where the layout moves it: an item before the change in a centered, end-aligned or space-between row, a sibling `order` places after it, and the card around a change in a centered column. A positioned ancestor of the change, and the content before the change inside it, take their final place at once.

@cixzhang
