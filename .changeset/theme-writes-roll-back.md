---
'@astryxdesign/cli': patch
---

[fix] `astryx theme add` and `astryx theme build` now undo a failed write completely. Before, when one file failed to write after others were written, the written files kept their new content. Now every replaced file gets its previous content back, every new file is removed, and the error names any file that could not be restored. Both commands also refuse to replace a destination that is a symbolic link. (#6852)

@josephfarina
