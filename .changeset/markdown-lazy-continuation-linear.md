---
'@astryxdesign/core': patch
---

[fix] Markdown: keep lazy continuation lines fast in deeply nested input
@cixzhang

`Markdown` no longer slows to seconds on a deeply nested blockquote or list followed by a lazy continuation line, as a crafted message can be: checking whether the line continues a paragraph now reuses what the parser already read at each level, and checking a long line for a thematic break no longer copies it. Lists and blockquotes nest at most exactly 100 levels deep.
