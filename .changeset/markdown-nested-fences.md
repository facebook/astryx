---
'@astryxdesign/core': patch
---

[fix] Markdown: keep blank-separated fenced code blocks inside their list items. List continuation now follows each marker's effective content indentation, and streaming parsing keeps an open list-owned fence in the mutable tail across LF and CRLF input.

@ernestt
