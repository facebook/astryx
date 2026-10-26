---
'@astryxdesign/core': patch
---

[fix] SideNav: a collapsed rail item's tooltip now describes the link or button itself rather than the row around it, so the control that takes focus carries the tooltip's `aria-describedby` from its first render. A disabled item still shows its label on hover.

@ernestt @thewebartisan7
