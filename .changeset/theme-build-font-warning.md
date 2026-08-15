---
'@astryxdesign/cli': patch
---

[feat] `astryx theme build` warns when a theme names fonts it does not load. The resolved `--font-family-*` tokens and component-override `fontFamily` values are checked against CSS generics and known system families; anything else gets one warning per family in the receipt and, after the install instructions, the `<link>`/`@font-face` snippet to add. `astryx docs typography` gains a Loading Custom Fonts section (Google Fonts and self-hosted recipes, `font-display: swap`, real fallback stacks), and the theme docs' production-build section points at it (#5015).

@AKnassa
