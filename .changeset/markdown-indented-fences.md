---
'@astryxdesign/core': patch
---

[fix] Markdown: read a code fence indented up to three spaces as CommonMark does
@cixzhang

`Markdown` now reads a code fence indented by up to three spaces as a code block, and a closing fence may be indented the same way, as CommonMark specifies. Each code line loses as much indentation as the opening fence has. A closing fence has only spaces or tabs after it, so a line such as ` ```js ` inside an open block stays part of the code. Such fences used to show as raw backticks or tildes in a paragraph, and an indented closing fence left the block open to the end of the document.
