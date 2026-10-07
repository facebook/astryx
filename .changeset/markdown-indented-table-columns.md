---
'@astryxdesign/core': patch
---

[fix] Markdown: read an indented table with its own columns
@cixzhang

`Markdown` no longer adds an empty first column to a table whose rows are indented, such as `  | a | b |`. The indentation before a row's first pipe used to read as a cell of its own.
