---
'@astryxdesign/core': patch
---

[fix] Turn only the chevron glyph in `useTableRowExpansion`, and start its detail panel at the first column rather than the row edge. (#5995)
@ernestt

The rotation was on the `<button>`, which is the hit target and carries the hover chip, so opening a row swung that rounded rectangle and its highlight a quarter turn along with the arrow — most visible mid-animation, where the chip passes through a diamond. It now sits on the glyph, and the button stays put.

The panel was a full-width cell with a flat inline padding, which left its content under the chevron, a column to the left of every label it describes. It now indents by the chevron column's width plus the inline padding a cell of that density gives its own content, read off the table context so it follows `density`, and written as a logical property so RTL mirrors it. Neither is configurable: a panel that started anywhere else read as a misalignment rather than as a choice.
