---
'@astryxdesign/core': patch
---

[fix] CheckboxInput & Switch: clicking the description now toggles the control, so the whole label area is one hit target. The description stays a sibling `<span>` of the `<label>` (never nested), so it isn't folded into the control's accessible name or double-announced — it forwards the click to the control instead. Clicks on interactive content inside a description (links, buttons) are left alone, and text-input descriptions focus the input rather than click it. No new prop or accessibility-tree change.

@freddymeta
