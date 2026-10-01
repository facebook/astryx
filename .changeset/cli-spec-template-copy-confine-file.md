---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name> <dir>` now refuses the write, with `ERR_PATH_TRAVERSAL`, when the file it would create in that directory is a symlink to an existing file outside the project. Before, only the directory was checked, so `--overwrite` followed the link and replaced the file it pointed at. (#6563)

@josephfarina
