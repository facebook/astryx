---
'@astryxdesign/core': patch
---

[fix] Numbered List and Markdown markers end on one edge, with tabular figures, so every period in a list lines up as native list markers do. A counter wider than its marker hangs toward the start before it widens the list, so a Markdown list that reaches `100.` starts its text where RichText starts it. Single-digit numbers, now right-aligned in their marker, sit a few pixels closer to their text.
@ernestt
