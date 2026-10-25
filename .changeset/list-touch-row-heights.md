---
'@astryxdesign/core': patch
---

[feat] Under a finger (a coarse primary pointer, iOS and Android alike), `List` rows are as tall as iOS table rows: at least 52px, 62px with a description, and at least 44px in `density="compact"`, which used to put rows as short as 33px under a finger. Lists with markers (bullets, numbers, Markdown lists) are running text and keep their rows. Lists driven by a mouse or a trackpad are unchanged. A theme that sets `min-height` on `list-item` keeps its own value.

@vjeux
