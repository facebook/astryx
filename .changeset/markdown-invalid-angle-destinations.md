---
'@astryxdesign/core': patch
---

[fix] Markdown: show a link whose destination opens with `<` but is no angle-bracket destination as text
@cixzhang

`Markdown` now shows `[a](<b>c>)`, `[a](<b)`, and `[link](<foo\>)` as text, as CommonMark specifies: a destination that opens with `<` must be one whole angle-bracket destination, with no line ending inside, even after a backslash. Such links used to fall back to a link to the whole text between the parentheses.
