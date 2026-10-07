---
'@astryxdesign/core': patch
---

[fix] Markdown: end a list at a thematic break
@cixzhang

`Markdown` now reads a line such as `* * *` or `- - -` after a list item as a thematic break that ends the list, as CommonMark specifies, rather than as another item holding a nested list.
