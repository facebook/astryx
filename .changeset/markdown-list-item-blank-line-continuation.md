---
'@astryxdesign/core': patch
---

[fix] Markdown: keep content indented into a list item in the item after a blank line
@cixzhang

`Markdown` now keeps lines indented to a list item's content in that item after a blank line, as CommonMark specifies: a nested list, a fenced code block, or another paragraph under a numbered step stays in the step, and the numbering continues after it. Such content used to end the list, so the sub-items showed as a separate list and a step's code block showed as raw text.
