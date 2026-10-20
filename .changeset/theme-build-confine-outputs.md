---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` and `themeBuild()` now write only inside the working directory (`cwd` for the API), as `architecture:cli-surface/INV10` requires; under `architecture:cli-surface/INV10a` the refusal is a compatible fix. Each of these builds now fails with `ERR_PATH_TRAVERSAL` before anything is written: an absolute `--out` path outside the working directory, a theme file outside it whose outputs would go beside it, and `--family` with its root theme file outside it. Paths inside the working directory still build, including through a symlink. To migrate, run the build from a folder that holds the theme file and its outputs, or pass an `--out` path inside that folder; API callers pass a `cwd` that holds them.

@josephfarina
