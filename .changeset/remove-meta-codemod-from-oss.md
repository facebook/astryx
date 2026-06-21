---
'@xds/cli': patch
---

Remove the internal `drop-xds-meta-prefix` codemod from the OSS repo. This codemod targeted the Meta-internal `@nest/xds-meta` package and has been moved to that package's own tooling, where it belongs. It was registered as an optional, version-independent transform and is not part of any standard upgrade path, so removing it does not affect the public `0.0.13 → 0.0.15` migration.
