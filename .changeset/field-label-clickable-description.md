---
'@astryxdesign/core': patch
---

[fix] CheckboxInput & Switch: clicking the field description now forwards to the control (the whole label area is one hit target), while clicks on interactive content inside a description (links, buttons) are left alone. No new prop or accessibility-tree change — the description stays a sibling of the label, so it isn't folded into the control's accessible name.

@freddymeta
