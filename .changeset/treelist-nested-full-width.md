---
'@astryxdesign/core': patch
---

[fix] `TreeList`: nested rows now span the full width of the list, like root rows, so their hover and selected fill lines up with the rows above them. The indent moves inside the row as extra inline-start padding, so chevrons, icons, and labels sit exactly where they did before. Guide lines draw above the rows, so a filled row never breaks a line, and they let clicks pass through to the row underneath.

@kentonquatman
