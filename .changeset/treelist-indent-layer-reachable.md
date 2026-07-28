---
'@astryxdesign/core': patch
---

[fix] TreeList: stop setting the row indent as an inline `margin-inline-start`. That element is also the `astryx-tree-list-item` theme target, and an inline longhand outranks every cascade layer, so the indent could not be reached from `@layer astryx-theme` and consumers were pushed into `!important`/unlayered CSS. The row now publishes only the computed distance as `--_tree-indent` and `margin-inline-start` is declared in the stylesheet, restoring normal layer order. Rendering is unchanged at every nesting depth. This is Option A of RFC #4308 only — the DOM restructure (B) and an `indentSize` prop (C) are left as maintainer calls.

@AKnassa
