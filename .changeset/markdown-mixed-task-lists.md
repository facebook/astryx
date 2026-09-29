---
'@astryxdesign/core': patch
---

[fix] Markdown: preserve task checkboxes in mixed lists (#6330)

Task and plain items now stay in one ordered or unordered list, with each task item preserving its checked state and each ordinary item preserving its marker. Nested and streamed mixed lists follow the same structure.

@cixzhang
