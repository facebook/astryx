---
'@astryxdesign/core': patch
---

[fix] Markdown: keep blank-separated fenced code blocks, paragraphs, and nested lists inside their list item when they are indented to the marker's content indent. Streaming parsing converges on the same tree, settles completed blocks inside long list items, and keeps tight list nesting unchanged.

@ernestt
