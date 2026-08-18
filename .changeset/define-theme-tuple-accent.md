---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] `defineTheme`: `color.accent` accepts a `[light, dark]` tuple (#2279)

`ColorScaleConfig.accent` now takes either a single hex or a `[light, dark]` tuple, matching `TokenValue`. With a tuple, `expandColorScale` derives the light half of every generated `light-dark()` pair from the light seed's palettes and the dark half from the dark seed's, so each scheme gets a consistent derived palette (muted, on-accent, neutrals) instead of the `tokens['--color-accent']` workaround that skips scale generation. Single-string configs are unchanged, token for token. Also documents the precedence between `color` and `tokens` for accent-derived values: `tokens` entries win token by token, the `var(--color-accent)` reference tokens follow a `--color-accent` override at runtime, and the baked `--color-on-accent` stays derived from the `color.accent` seed.
@jiunshinn
