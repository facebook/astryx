---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Move canonical data-color defaults from generated theme CSS to the public StyleX `dataVars` group.

Import `dataVars` from `@astryxdesign/core/theme/dataTokens.stylex` for CSS-capable code. Canvas and other non-CSS APIs continue to use `resolveThemeToken()` or `useTheme().token()`. Rebuild committed theme CSS with `astryx theme build`; concrete themes now emit only explicitly authored data-color overrides.

@cixzhang
