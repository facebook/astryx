---
'@astryxdesign/core': patch
---

[fix] Field inputs no longer paint above the sticky AppShell header while scrolling (#5689). Field now contains its local stacking layers (the input surface's z-index and the attached status layer) behind an `isolation: isolate` boundary on the field surface, so they cannot compete with page-level stacking; the AppShell header keeps its normal stacking level.
@Cypher-Aura-19
