---
'@astryxdesign/core': patch
---

[fix] The 56 `--color-data-*` tokens now reach CSS. They were declared in `domainTokens/dataTokens.ts` and resolvable from JS through `useTheme().token()` and `resolveThemeTokens()`, but nothing emitted them as custom properties, so `var(--color-data-categorical-blue)` resolved to nothing and only a token a theme happened to override by name ever landed. Theme generation now seeds the theme's `:scope` token block with the data-token defaults, under the theme's own tokens, so the whole palette resolves inside a `<Theme>` and a theme's `--color-data-*` override replaces its default in the same rule.

@cixzhang
