---
'@astryxdesign/core': patch
---

[fix] Markdown: close a code span only at a backtick string of the same length
@cixzhang

`Markdown` now ends a code span at the next run of exactly as many backticks as opened it, never at part of a longer run, and reads runs of any length, as CommonMark specifies. `` `one`` two` `` is one code span holding ` `` `, and four or more backticks open and close spans too. A run with no closer of its length stays text.
