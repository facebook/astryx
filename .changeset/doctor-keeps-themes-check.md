---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor` keeps its `themes` check, with the same id, label and fields, beside the new theme checks, so scripts that read it by id keep working. Without a generated theme module it reports what it did before: whether an `@astryxdesign/theme-*` package is installed, and whether the app's package.json names a theme in `astryx.theme`. Its fix now names `theme add --import`. With a generated module it reports the overall result of the theme checks.

In a workspace, `themes` reads the app's own package.json, the file the CLI reads when it resolves the theme, rather than the package.json beside the root `node_modules`. It no longer counts the `ASTRYX_THEME` variable, which the CLI does not read, as a wired theme.

@josephfarina
