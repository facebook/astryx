---
'@astryxdesign/cli': patch
---

[fix] `astryx layout expand <expr> <dir>` now refuses the write, with `ERR_PATH_TRAVERSAL`, when `<dir>/<Name>.tsx` is a symlink to an existing file outside the project. Before, only the directory was checked, so the generated TSX replaced the file the link pointed at.

@josephfarina
