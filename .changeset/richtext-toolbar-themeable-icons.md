---
'@astryxdesign/core': patch
---

[feat] Icon registry: `registerIcons()` now accepts arbitrary extension keys (not just built-in `IconName`s), so libraries can augment the icon map with their own keys. Add `getExtendedIcon(name, fallback)` — resolves an extension key, preferring a theme-registered icon over a caller-supplied default. This lets library-shipped icons (e.g. the lab `RichTextEditorToolbar`'s `richtext:*` glyphs) be overridden per-theme without forking.
@potatowagon
