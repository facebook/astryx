---
'@astryxdesign/core': patch
---

[fix] Markdown: check a line's trailing spaces in linear time
@cixzhang

`Markdown` no longer slows to seconds on a line holding a long run of spaces before its last word, as a crafted message can: deciding whether trailing spaces make a hard line break now counts them from the end of the line instead of matching a pattern that retried from every space. Line breaks read as before.
