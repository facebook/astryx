---
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-stone': patch
---

[fix] `--radius-none` no longer overrides to `0.125rem`. `--radius-none` and `--radius-full` are documented as always fixed (never scaled by a theme), matching `@astryxdesign/core`'s own defaults — each of these themes' radius group bumps swept `--radius-none` along with it by mistake, the same bug fixed for `theme-neutral` in #4856. Anything opting out of rounding via `--radius-none` under these themes now renders with a true `0px` radius again, instead of a silent 2px.

@is-jain
