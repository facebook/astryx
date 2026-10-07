---
'@astryxdesign/core': patch
---

[fix] Markdown: read angle-bracket link destinations to their closing bracket
@cixzhang

`Markdown` now reads an angle-bracket destination as CommonMark specifies: parentheses inside the brackets are part of the address, so `[a](<b(c>)` links to `b(c)`; an escaped bracket inside is part of it too, so `<b\>c>` is `b>c`; and a line ending inside the brackets makes the text no link. Unsafe schemes are refused as before.
