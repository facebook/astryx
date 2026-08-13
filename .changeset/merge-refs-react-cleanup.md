---
'@astryxdesign/core': patch
---

[fix] Fix `mergeRefs` cleanup so object refs are cleared and callback refs without
cleanup functions still receive `null` when a merged ref returns cleanup.

@czarandy
