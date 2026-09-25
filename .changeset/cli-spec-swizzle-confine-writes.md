---
'@astryxdesign/cli': patch
---

[fix] `astryx swizzle` no longer writes outside the project through a symlink in the output folder. When the component folder or one of its files is a symlink that points outside the project, the command now fails with `ERR_PATH_TRAVERSAL` before it writes anything. (#6573)

@josephfarina
