---
'@astryxdesign/core': patch
---

[fix] Markdown: parse ordered lists using the `)` marker delimiter, not just `.` (#2994)

CommonMark 5.2 allows an ordered-list marker to end in `.` or `)` (e.g. `1)`), but the parser only matched `\d+\. `, so `1) First` lists rendered as literal paragraph text. Lists now capture their delimiter — a `.` → `)` change starts a new list, including across streamed chunks — and paragraph interruption follows CommonMark (only a marker value of 1, including zero-padded like `01.`, may interrupt).

@lexs
