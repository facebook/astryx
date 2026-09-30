---
'@astryxdesign/cli': patch
---

[fix] `theme build` resolves real icon imports from the selected theme instead of matching comment or string contents. Generated modules preserve named, aliased, default, and namespace registry imports, plus inherited icons with child overrides. Normal builds and `--check` reject unsupported inline registries with `ERR_THEME_INVALID` before generating or writing output. Move such a registry into its own module and import it into the theme file.

@jiunshinn
