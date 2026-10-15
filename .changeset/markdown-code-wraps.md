---
'@astryxdesign/core': patch
---

[feat] `Markdown` fenced code blocks wrap long lines instead of scrolling them sideways. A reader on a narrow screen sees the whole line without a horizontal scroll, and a long line now takes the same height in `Markdown` as in RichText, so switching between reading and editing no longer moves the blocks below it. Only the appearance changes: the code's text, line numbers, syntax colours and what Copy returns are unchanged. To keep the old sideways-scrolling look, render code yourself through the `components.code` prop with a `CodeBlock` that leaves `isWrapped` off.

@cixzhang
