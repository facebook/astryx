---
'@astryxdesign/core': patch
---

[fix] A clickable `Item` (`onClick`) no longer fires when the click belongs to a control inside the row that is not a native `button`, `a`, or form field. The row used a short tag list to decide, so picking a row in a `DropdownMenu` placed in its `endContent` (role `menuitem`), or a click inside content portaled out of the row, also ran the row's own action. It now uses the same nested-control rule as `ClickableCard` and other clickable surfaces (`hasInteractiveAncestor`), which also recognises role-based controls.

@cixzhang
