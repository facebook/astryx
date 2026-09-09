---
'@astryxdesign/cli': patch
---

[fix] `theme build` ignores comments when detecting icon imports and fails with `ERR_THEME_INVALID` when an inline registry cannot be preserved. Both normal builds and `--check` reject unsupported registries before writing output files, preventing successful builds that lose custom icons. Move an inline registry into its own module and import it into the theme file. Imported registries continue to build as before.

@jiunshinn
