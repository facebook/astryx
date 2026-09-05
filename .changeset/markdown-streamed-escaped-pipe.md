---
'@astryxdesign/core': patch
---

[fix] Streamed Markdown no longer goes blank when the line still arriving
contains an escaped pipe. A `\|` is literal text, not a table-cell delimiter,
so a line carrying only escaped pipes is ordinary prose and renders as it
streams instead of being held back as an unfinished table header. Genuine
partial table syntax is still suppressed, and incremental parsing stays bounded
to the stream tail.

@cixzhang
