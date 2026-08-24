---
'@astryxdesign/theme-neutral': patch
'@astryxdesign/cli': patch
---

[fix] neutral theme: darken the light-mode error red from `#e33f4a` to `#c9303a` so the filled `Badge variant="error"` label clears WCAG 2.1 AA. White on `#e33f4a` is 4.14:1 and the badge label is 12px/weight 500, so the 4.5:1 normal-text threshold applies rather than the 3:1 large-text allowance; `#c9303a` gives 5.29:1 while holding the hue (OKLCH H 21.9 -> 22.8, C 0.200 -> 0.189). StatusDot and the ProgressBar `--color-error` rebinding move with it — both are documented as tracking the badge fill so the dot and its badge read as one status language. Dark mode is untouched (dark text on `#ff705d`, 6.60:1). Adds `scripts/check-badge-contrast.test.mjs`, which resolves every theme's badge label/fill pair through `light-dark()`, `var()` indirection and alpha compositing, and holds all of them to 4.5:1.

@AKnassa
