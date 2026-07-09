---
'@astryxdesign/core': patch
---

[fix] `useTheme()` / `resolveThemeTokens()` now resolve derived tokens that reference other tokens (e.g. `--color-text-accent: var(--color-accent)`) to concrete raw values, following reference chains iteratively. Supported CSS color functions (`color-mix(in srgb, …)`) are evaluated against those values, so canvas/SVG/data-viz consumers get usable colors instead of `var(...)` or `color-mix(...)` strings (#3697).

Also adds shared color parsing/formatting primitives (`parseHex`, `parseRgb`, `parseColor`, `formatHex`, `formatColor`) under `@astryxdesign/core/utils`, unifying the color parsers previously duplicated across the theme layer.

@cixzhang
