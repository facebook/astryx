---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `defineTheme`: make `color.accent` optional (#2279)

A theme can now restyle the neutral ramp (`neutralStyle`, `contrast`) without adopting an accent. An accent-less config seeds the neutral palettes from the default accent's hue but leaves `--color-accent`, `--color-accent-muted` and `--color-on-accent` ungenerated, so they fall through to the token defaults — the same fall-through `expandColorScale` already applies to status, categorical and on-dark tokens. Configs that pass an accent are unchanged, token for token.
@AKnassa
