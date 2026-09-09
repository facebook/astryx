---
'@astryxdesign/cli': patch
---

[fix] `swizzle` recursively copies nested core component source directories, preserving relative imports inside the copied tree and rewriting imports that escape it to the owner package. Components such as Table now include their plugins; overwrite checks and the returned file list use the same complete set of relative paths (#3506).

Destination symlinks, including dangling file links, are rejected before any writes even with `--overwrite`. Integration components retain the previous flat source-directory copy behavior; recursive copying is limited to core component directories.

@jiunshinn
