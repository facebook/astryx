---
'@astryxdesign/cli': patch
---

[fix] swizzle now copies nested component source recursively

`astryx swizzle <Name>` previously copied only the top-level files of a component directory and silently skipped nested subdirectories, producing a broken partial eject for components whose source is split across folders (e.g. `Table/plugins/*`). The copied entry file still imported from the dropped subtree, so the swizzled component failed to resolve — yet the CLI reported success. Swizzle now walks the component tree recursively and preserves nested structure, and import rewriting is location-aware so intra-component imports from nested files (e.g. `../../types`) stay relative while only imports that escape the component are rewritten to the owner package's subpaths.

@oneshot2001
