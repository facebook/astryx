---
'@astryxdesign/core': patch
---

[feat] Under a finger (a coarse primary pointer, iOS and Android alike), `List` rows are as tall as iOS table rows: at least 52px, 62px with a description. Compact lists (`density="compact"`) are the dense case and keep their rows, and so do lists with markers (bullets, numbers, Markdown lists), which are running text. Lists driven by a mouse or a trackpad are unchanged. A theme that sets `min-height` on `list-item` keeps its own value.

@vjeux
