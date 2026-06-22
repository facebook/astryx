---
'@xds/cli': patch
---

[chore] Remove the internal `drop-xds-meta-prefix` codemod from the OSS repo (#2970)
@ejhammond

This codemod has been moved to its own package's tooling, where it belongs. It was registered as an optional, version-independent transform and is not part of any standard upgrade path, so removing it does not affect the public `0.0.13 → 0.0.15` migration.
