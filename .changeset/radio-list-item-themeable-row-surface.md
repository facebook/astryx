---
'@astryxdesign/core': patch
---

[feat] RadioListItem: the `radio-list-item` theme target now rides the painting row element (converging with `list-item`), so a theme can style the row's hover background, padding, and border radius — previously it sat on a layout-only wrapper that painted nothing. The default row now matches CheckboxListItem's treatment (density padding, radius, hover highlight).

@freddymeta
