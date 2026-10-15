---
'@astryxdesign/core': patch
---

[feat] `Markdown` fenced code blocks wrap long lines instead of scrolling them sideways. A reader on a narrow screen sees the whole line without a horizontal scroll, and where `Markdown` and RichText give a code block the same width, a long line takes the same number of lines in both. Only the appearance changes: the code's text, line numbers, syntax colours and what Copy returns are unchanged, and a code block whose lines no longer overflow also no longer takes the scroll region's Tab stop, as a code block that fits never has. To keep the old sideways-scrolling look, render code yourself through the `components.code` prop with a `CodeBlock` that leaves `isWrapped` off.

@cixzhang
