---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` decides its `color-scheme` block from the theme's own token and component values rather than a substring scan of the generated CSS. Theme generation now seeds every theme with the `--color-data-*` defaults, which are `light-dark()` pairs, so the old scan would have fired for every theme. Output is unchanged.

@cixzhang
