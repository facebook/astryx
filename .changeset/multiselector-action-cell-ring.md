---
'@astryxdesign/core': patch
---

[fix] `MultiSelector`: the row action cell the keyboard reaches with the inline-end arrow draws the standard focus ring. Before, its outline read four CSS variables that nothing declared, so no ring showed on the active action cell.

@vjeux
