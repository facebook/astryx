---
'@astryxdesign/core': patch
'@astryxdesign/richtext': patch
---

[feat] Tables draw a line on every cell edge, not only between rows, on both `Markdown` and the RichText surfaces. A reader following one row across never needed vertical lines, but someone editing a table has to aim at a cell and judge where a selection stops, and the empty 3×3 a toolbar insert produces was three horizontal rules with no sign it had three columns. The line is the same `--color-border` already used between rows, the last column has none so the grid does not close the table's outer edge, and both surfaces move by the same amount — the read and edit renderings still match block for block. Proposal for #7570; XDS draws the same grid in WWW.

@cixzhang
