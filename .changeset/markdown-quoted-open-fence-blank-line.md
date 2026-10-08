---
'@astryxdesign/core': patch
---

[fix] Markdown: keep a quoted blank line at the end of a code block left open
@cixzhang

A code block left open inside a block quote keeps a blank quoted line at its end as code, as CommonMark reads it. Only the document's own final line ending is left out of an open code block.
