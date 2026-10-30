---
'@astryxdesign/core': patch
---

[fix] Numbered List and Markdown markers end on one edge, with tabular figures, so every period in a list lines up as native list markers do. In List, a counter wider than its marker hangs toward the start before it widens the shared column. Markdown's non-swipe document lists instead keep the ordinary text inset and let whole counters paint outside it, matching RichText's native outside markers even beyond the marker gutter. Single-digit numbers, now right-aligned in their marker, sit a few pixels closer to their text.
@ernestt
