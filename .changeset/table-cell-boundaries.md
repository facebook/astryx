---
'@astryxdesign/core': patch
'@astryxdesign/richtext': patch
---

[feat] Tables draw a line on every cell edge, not only between rows, on both `Markdown` and the RichText surfaces, and the grid closes at the table's rim. A reader following one row across never needed vertical lines, but someone editing a table has to aim at a cell and judge where a selection stops, and the empty 3×3 a toolbar insert produces was three horizontal rules with no sign it had three columns. The line is the same `--color-border` already used between rows, the rim merges with it into one rule rather than doubling at the edge, and both surfaces move together — the read and edit renderings match block for block, more closely than before. Proposal for #7570; XDS draws the same grid in WWW.

@cixzhang
