---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build --out` now reports a path that leaves the working directory with `ERR_PATH_TRAVERSAL`, and an output directory it cannot create with `ERR_WRITE_FAILED`, instead of unregistered codes such as `PATH_TRAVERSAL` or `EEXIST`. The programmatic `themeBuild()` throws the same codes as an `AstryxError`. (#6543)

@josephfarina
