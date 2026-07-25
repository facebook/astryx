---
'@astryxdesign/core': patch
---

[feat] TreeList: add a dedicated `astryx-tree-list-item-label` theme target on the item's label text, so consumers can theme just the label (e.g. bold the selected item's label) via `defineTheme` instead of a fragile `button:not([data-tree-toggle]) > span` structural selector. Reflects the row's `selected` state as a `data-selected` attribute on the label.

@freddymeta
