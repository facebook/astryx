---
'@astryxdesign/core': patch
---

[fix] Syntax-highlighted punctuation (brackets, commas, semicolons, operators) now meets WCAG 2.1 AA contrast (4.5:1) against the code surface in every bundled theme.

`--color-syntax-punctuation` borrowed `--color-text-disabled`, a token WCAG deliberately exempts from the normal-text contrast requirement because it marks an inactive control. Punctuation in a code sample is always-active, normal text, and measured well under 4.5:1 in three themes: neutral (2.42:1 light, 2.53:1 dark), chocolate (3.06:1 light, 2.56:1 dark), and matcha (3.83:1 light, 2.73:1 dark). The other four themes (butter, gothic, stone, y2k) already defined their own passing punctuation colour and are untouched.

The shared default now points at `--color-text-secondary` instead (used for `--color-syntax-comment` too, and already verified to clear AA). Neutral, chocolate and matcha each get a dedicated punctuation colour in their own syntax palette, since they define one rather than inheriting the shared default: neutral `#6e6e6e`/`#a0a0a0` (4.89:1/7.57:1), chocolate `#9e622e`/`#cb884d` (4.84:1/6.12:1), matcha `#566a39`/`#92af6a` (5.19:1/7.02:1).

Adds `scripts/check-syntax-punctuation-contrast.test.mjs`, resolving each theme's `--color-syntax-punctuation`/`--color-syntax-background` pair through `light-dark()`/`var()` indirection (the pattern from #4446's badge contrast guard) and holding every theme, both colour schemes, to AA — so a regression here fails the build instead of shipping.

@HelloOjasMutreja
