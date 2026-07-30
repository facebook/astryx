---
'@astryxdesign/core': patch
---

[fix] Tooltip: dismiss the tooltip when its trigger is pressed. Previously the tooltip stayed open through a click (e.g. a "Copy link" button's tooltip lingered after activation); now pressing the trigger hides its own tooltip. Applies to uncontrolled tooltips only.

@cixzhang
