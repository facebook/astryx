---
'@astryxdesign/core': patch
---

[fix] The 56 `--color-data-*` tokens now reach CSS. They were declared in `domainTokens/dataTokens.ts` and resolvable from JS through `useTheme().token()` and `resolveThemeTokens()`, but nothing emitted them as custom properties, so `var(--color-data-categorical-blue)` resolved to nothing and only a token a theme happened to override by name ever landed. The defaults are now emitted once as a `:root` block in `@layer astryx-base` — the same place and layer StyleX puts the core token defaults — so the palette resolves, a theme's `--color-data-*` override outranks it by layer, and a nested `<Theme>` that names no data token inherits its parent's override instead of shadowing it with the default.

**Visual change.** Anything reading `var(--color-data-*)` without a fallback painted nothing before and now paints the palette value; anything reading it with a hex fallback now takes the token value instead of the fallback. Pin a colour explicitly if you were relying on either.

@cixzhang
