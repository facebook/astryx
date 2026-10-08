---
'@astryxdesign/core': patch
---

[fix] Keep editable content from toggling tree and expansion rows
@josephfarina

The shared click guard that row-expansion and tree-data use to decide
whether a row click should toggle missed `[contenteditable]` elements.
Clicking or typing inside editable content in a row toggled it. Restored
the exclusion with tests on both paths.
