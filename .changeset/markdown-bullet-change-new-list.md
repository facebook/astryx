---
'@astryxdesign/core': patch
---

[fix] Markdown: start a new list when the bullet changes
@cixzhang

`Markdown` now starts a new list when a bullet list's marker changes — `- a` then `* b` are two lists — as CommonMark specifies, and as ordered lists already did when their delimiter changes.
