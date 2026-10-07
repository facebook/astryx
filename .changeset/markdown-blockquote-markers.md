---
'@astryxdesign/core': patch
---

[fix] Markdown: read a block quote marker as CommonMark does
@cixzhang

`Markdown` now reads a line that starts with up to three spaces and `>` as a block quote, whether or not a space follows the `>`: `>quote`, `   > quote`, and `>>> nested` are quotes, as CommonMark specifies. These lines used to show as plain text with their `>` marks.
