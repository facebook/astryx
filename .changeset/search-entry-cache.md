---
'@astryxdesign/cli': patch
---

[fix] `astryx search` reuses its entry index across searches in one process while the catalog is unchanged, so repeated searches answer faster; every answer is unchanged.

@josephfarina
