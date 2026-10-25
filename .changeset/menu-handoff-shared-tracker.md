---
'@astryxdesign/core': patch
---

[internal] Under DropdownMenu's touch modes, the finger that opened the menu resolves the menu's rows through the shared action-group tracker, as a finger that lands in the menu already does: rects read once instead of a hit test per move. Nothing a consumer sees changes.

@vjeux
