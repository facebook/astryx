---
'@astryxdesign/core': patch
---

[fix] A CheckboxList row now answers a finger the same way wherever it lands. Under a finger, pressing a row's label painted the whole row while pressing its box painted only the box; the row is now the one touch press surface, so the row and its checkbox show the pressed state together whether the finger lands on the label, the description or the box. Mouse presses and hover are unchanged.

@vjeux
