---
'@astryxdesign/core': patch
---

[fix] TreeList: a leaf row's hover/selected/focus highlight now starts flush with its sibling parent rows (at the guide/toggle column) instead of inset by the chevron column. The leaf's chevron-column offset moves from the row's outer margin to inner content padding, so labels stay aligned with parents while the highlighted row box lines up across leaves and parents. Purely visual; no API change.
@freddymeta
