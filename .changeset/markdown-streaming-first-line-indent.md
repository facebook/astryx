---
'@astryxdesign/core': patch
---

[fix] Markdown: keep the indentation of a message's first line
@cixzhang

`Markdown` now keeps the indentation of a message's first line, as it already did for every later line: two bullets indented by the same amount stay side by side, an indented numbered list keeps each item, and an indented table keeps its columns. A message that started with indented content used to render it differently from the same text after its first line.
