---
'@astryxdesign/core': patch
---

[fix] Markdown: read a code fence's language after spaces
@cixzhang

`Markdown` now reads a fenced code block's language as the first word of its info string after any spaces, as CommonMark specifies, so `~~~ js` and ` ``` js ` are JavaScript blocks rather than blocks with no language. Fences written without a space read as before.
