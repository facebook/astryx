---
'@astryxdesign/core': patch
---

[feat] `TreeList`: nested rows now span the full width of the list, like root rows, so their hover and selected fill lines up with the rows above them. Before, a nested row started at its indent. The indent now sits inside the row, so chevrons, icons and labels stay exactly where they were. The indent area is now part of the row, so it shows hover feedback, and clicking it activates the row. For example, clicking a folder's indent toggles the folder. Guide lines draw above the rows, so a hover or selected fill doesn't break them, and they let clicks pass through to the row underneath. The one exception is a row with keyboard focus: it draws above the guides so they never cut its focus ring, which means that if it is also filled (selected or hovered), its fill covers the guides at that row. Padding set on a row through the `tree-list-item` theme target or an item's `className`, `style` or `xstyle` still composes with the indent. `--tree-list-indent` still retunes the indent step. There is no supported way to keep the old inset rows.

@kentonquatman
