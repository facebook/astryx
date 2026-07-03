---
'@astryxdesign/core': patch
---

[feat] Export `themeProps` (and its `ThemeProps`/`ClassProps`/`ClassValue`/`ThemeDataAttributes` types) from `@astryxdesign/core/utils`, so packages building on core can generate the stable astryx class + `data-*` attribute surface through the public API instead of reaching into core internals.

@cixzhang
