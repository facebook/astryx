---
'@astryxdesign/core': patch
---

[feat] Themes can retune touch motion. `defineTheme({motion})` takes `springs`, `durations` and `curves` keyed by motion role, the table path of a value touch presentations play (`springs.sheetPresent`, `timing.reducedMotionCrossFadeMs`), at the root or in an adaptation rule. A role the theme leaves out keeps its measured default, and the duration scale (`fast`, `medium`, `ratio`) is optional when a theme sets only roles. Adaptation rules gain a `platform` condition, `ios` or `other`.

@vjeux
