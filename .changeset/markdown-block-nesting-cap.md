---
'@astryxdesign/core': patch
---

[fix] Markdown: cap list and blockquote nesting, so deep input cannot crash rendering
@cixzhang

`Markdown` now nests lists and blockquotes at most 100 levels deep, as it already caps emphasis; content nested deeper reads as text. A list or blockquote nested thousands of levels deep, as a crafted message can be, used to overflow the stack and throw while parsing.
