---
'@astryxdesign/theme-neutral': patch
---

[fix] `--radius-none` no longer overrides to `0.25rem`. `--radius-none` and `--radius-full` are documented as always fixed (never scaled by a theme), matching `@astryxdesign/core`'s own defaults — this theme's radius group bump swept `--radius-none` along with it by mistake. Anything opting out of rounding via `--radius-none` under this theme now renders with a true `0px` radius again, instead of a silent 4px.

@HelloOjasMutreja
