---
'@astryxdesign/core': patch
---

[feat] TreeList: two additive changes. (1) A fully flat tree — one with no expandable items at all — now renders its rows flush instead of reserving an empty chevron-alignment column that nothing lines up under; any tree that has at least one expandable item keeps the same per-level alignment as before, so only fully flat trees change shape. (2) Adds a themeable `--tree-list-row-gap` for the inter-row gap, defaulting to a subtle `2px` (`var(--spacing-0-5)`) separation — matching the inter-row gap `List` and `DropdownMenu` already ship — so this shifts the default spacing of every tree by that amount; set it on the `tree-list` target to widen or close it. The gap rides collapse-proof `padding-block` on the row wrapper (not the paintable `tree-list-item` target), and the connector guides span it automatically without overhanging the last row. (#4540)
@freddymeta
