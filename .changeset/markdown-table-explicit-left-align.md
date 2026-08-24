---
'@astryxdesign/core': patch
---

[fix] Markdown: a table column that declares `:---` says so

`cellAlignStyles` had entries for `center` and `end` only, so a column written
`| :--- |` got no style at all and rendered exactly like an undeclared one. It
looks right in isolation, because a cell already starts at the inline start —
but `text-align` inherits, so the column follows whatever the table is nested
in. Rendered inside a centered block, a table whose first column explicitly
declares `:---` centers it, and there is nothing in the markdown that says it
should.

A declared alignment is now always written out, `start` included. Only the
`:---` case changes, and only where something around the table had already
moved the default.

@lexs
