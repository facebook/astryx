---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[fix] `generateThemeCSS` returns the two scoped blocks it has always returned — `prose` and `component`. The `--color-data-*` defaults it briefly also returned as a third `base` field are theme-independent, so they are not part of a theme's CSS: the `<Theme>` runtime keeps emitting them at `:root` in `@layer astryx-base`, and `astryx theme build` now formats the same block from the already-public `dataTokenDefaults` export. Output is byte-identical on both paths and no stable release ever carried the field.

@cixzhang
