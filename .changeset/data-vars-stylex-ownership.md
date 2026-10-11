---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Move canonical data-color defaults from generated theme CSS to the public StyleX `dataVars` group.

Import `dataVars` from `@astryxdesign/core/theme/dataTokens.stylex` for CSS-capable code. Canvas and other non-CSS APIs continue to use `resolveThemeToken()` or `useTheme().token()`. Rebuild committed theme CSS with `astryx theme build`; concrete themes now emit only explicitly authored data-color overrides.

@cixzhang

Old usage:
Generated theme CSS owned the canonical `--color-data-*` root defaults.

Replacement:
The public StyleX `dataVars` group in `@astryxdesign/core/theme/dataTokens.stylex` owns the defaults; concrete themes emit only explicitly authored data-color overrides.

Migration:
Import `dataVars` from `@astryxdesign/core/theme/dataTokens.stylex` for CSS-capable code. Canvas and other non-CSS APIs continue to use `resolveThemeToken()` or `useTheme().token()`. Rebuild committed theme CSS with `astryx theme build`.

Codemod:
`astryx upgrade` runs `validate-data-token-ownership`, which rewrites nothing and reports fallback-less `var(--color-data-*)` uses (whole or embedded source strings, and stylesheets) and stale generated theme CSS for manual migration.
