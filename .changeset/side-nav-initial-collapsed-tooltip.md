---
'@astryxdesign/core': patch
---

[fix] SideNav: a collapsed rail item's tooltip now binds to the link or button itself rather than the row around it. The control that takes focus carries the tooltip's `aria-describedby` from its first render, and keyboard focus on it now shows the label. As with other link and button tooltips, a touch tap activates the control without opening the tooltip. A disabled item still shows its label on hover.

@ernestt @thewebartisan7
