---
'@astryxdesign/core': patch
---

[feat] RadioListItem: the `radio-list-item` theme target now rides the painting row element (converging with `list-item`), so a theme can style the row's hover background, padding, and border radius — previously it sat on a layout-only wrapper that painted nothing. The default (unthemed) row appearance is unchanged: it stays a bare surface with no row padding, radius, or hover/selected background (only the radio indicator tints on hover) (#5143).

@freddymeta
