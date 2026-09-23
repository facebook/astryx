---
'@astryxdesign/core': patch
---

[fix] Start the `useTableRowExpansion` detail panel at the first column rather than at the row edge. (#6480)
@ernestt

The panel is one cell spanning the whole row with a flat `20px` inline padding, so its content began under the chevron — a column to the left of every label it describes.

It now indents by the chevron column's fixed width plus the inline padding a cell of that density gives its own content, read off the table context so it follows `density`, and written as a logical property so RTL mirrors it. It is not configurable: a panel starting anywhere else reads as a misalignment rather than as a choice.

The chevron column's width cannot be a token reference — the layout does arithmetic on it — but it is the pixel value of `--spacing-10`, which is how the indent spells it. A test pins the two together so a change to the scale cannot silently unalign them.
