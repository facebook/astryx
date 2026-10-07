---
'@astryxdesign/core': patch
---

[fix] Markdown: give an image the plain text of its description as alt text
@cixzhang

`Markdown` now reads an image's description as inline content and uses its plain text as the alt text, as CommonMark specifies, so ``![`a]b` *c*](u)`` has the alt `a]b c` rather than the raw source with its backticks and asterisks.
