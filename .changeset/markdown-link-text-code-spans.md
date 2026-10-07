---
'@astryxdesign/core': patch
---

[fix] Markdown: a code span in link text hides its brackets
@cixzhang

`Markdown` no longer ends link text at a `]` inside a code span, since code spans bind tighter than links (CommonMark). ``[`a]b`](/u)`` links the code `a]b`, and ``[`[x](javascript:y)`](/rel)`` links the code `[x](javascript:y)` to `/rel` rather than reading a link inside the code.
