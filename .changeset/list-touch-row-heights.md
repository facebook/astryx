---
'@astryxdesign/core': patch
---

[feat] On a touch screen, `List` rows are as tall as iOS table rows: at least 52px, 62px with a description, and at least 44px in `density="compact"`, which used to put rows as short as 33px under a finger. Lists driven by a mouse or a trackpad are unchanged. A theme that sets `min-height` on `list-item` keeps its own value.

@vjeux
