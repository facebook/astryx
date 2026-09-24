---
'@astryxdesign/cli': patch
---

[fix] Programmatic `init()` now confines the starter template it scaffolds with `templateName` to the project directory. A `src` symlink that points outside the project is rejected with `ERR_PATH_TRAVERSAL` before anything is written.

@josephfarina
