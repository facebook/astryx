---
'@astryxdesign/cli': patch
---

[fix] Fix comparison table category from "Table - Frozen Column" to "Table - Comparison"
@ernestt

The category described an implementation detail (the frozen label column) instead of
what the template is for. Builders searching by layout type now find it under Comparison.
