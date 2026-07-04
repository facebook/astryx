---
'@astryxdesign/cli': patch
---

[fix] `astryx component <Name>` now prints the correct `defineTheme` component-override key. The theming example stripped a stale `xds-` prefix (left over from the astryx rename) instead of `astryx-`, so it advertised keys like `astryx-base-table` / `astryx-button`. Those double-prefix to `.astryx-astryx-*` selectors at runtime and silently match nothing. Keys are now the stable class name minus `astryx-` (e.g. `base-table`, `button`), which is what `generateThemeRules` expects (#3458).
@ryanda9910
