---
'@astryxdesign/cli': patch
---

[fix] Make staged writes portable across filesystems that reject hard links.
The create-only publisher now falls back from `linkSync` to `copyFileSync` with
`COPYFILE_EXCL` for `EPERM` and `EXDEV`, while preserving no-clobber,
concurrent-creator safety, compare-and-swap replacements, symlink rejection,
rollback, and temporary-file cleanup.

@josephfarina
