---
'@astryxdesign/cli': patch
---

[fix] `astryx theme add` no longer writes through a symlink that already sits at the temporary name it stages each file under. A link that leads outside the project now fails with `ERR_PATH_TRAVERSAL`, and any other entry at that name fails the copy instead of being overwritten. (#6535)

@josephfarina
