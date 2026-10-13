---
'@astryxdesign/core': patch
---

[fix] `CodeBlock`'s code viewport is a keyboard Tab stop only while its content actually overflows, through the shared scroll capability: a short snippet no longer adds an unexplained stop to the page's Tab order, a wide or capped block still does, and a viewport that stops overflowing keeps focus where it is. Role and accessible name are unchanged.

@cixzhang
