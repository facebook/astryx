---
'@astryxdesign/core': patch
---

[fix] Markdown: end a code block left open at the end of a message on its last line of code
@cixzhang

When a message ended inside a code block that was never closed, `Markdown` read the message's final line ending as one more, empty line of code, unlike a closed code block and unlike the streamed render of the same message. A real blank line before the end is still code, and while a message streams, an open code block now shows the blank lines already written instead of adding them later.
