---
'@astryxdesign/theme-stone': patch
---

[fix] Stone theme: dark-mode overlay/accent-muted tokens missing alpha (#3624)

The dark-mode values for `--color-accent-muted`, `--color-overlay-hover`, and `--color-overlay-pressed` were fully opaque `#f3f3f5`, unlike their light-mode counterparts which are semi-transparent tints. Because these tokens paint absolutely-positioned hover/press overlays and muted-accent fills, the opaque dark value covered the content underneath instead of tinting it. Changed each dark value to carry an alpha suffix symmetric with its light-mode counterpart (`#f3f3f514` / `#f3f3f50d` / `#f3f3f51a`), preserving the existing hover < pressed intensity ordering. Fixes #3622.

@let-sunny
