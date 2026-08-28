---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[fix] The 56 `--color-data-*` defaults now reach runtime CSS and built themes from the same source, while dashboard template fallbacks match those defaults (#5562, #5566)

The defaults live once at `:root` in `@layer astryx-base`, so nested themes inherit parent overrides and `astryx theme build` matches `<Theme>` while `generateThemeCSS` keeps its existing return shape.

**Visual change.** A chart or template that previously painted nothing or used a mismatched hex fallback now paints the data token's default. Pin an explicit color to preserve a previous fallback.

@cixzhang
