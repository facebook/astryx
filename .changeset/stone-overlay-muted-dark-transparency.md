---
'@astryxdesign/theme-stone': patch
---

[fix] Stone theme: dark-mode overlay/accent-muted tokens missing alpha (#3624)

The dark-mode values for `--color-accent-muted`, `--color-overlay-hover`, and `--color-overlay-pressed` were fully opaque `#f3f3f5`, unlike their light-mode counterparts which are semi-transparent tints. Because these tokens paint absolutely-positioned hover/press overlays and muted-accent fills, the opaque dark value covered the content underneath instead of tinting it. Changed the dark values to carry alpha suffixes following the conventions used by every other theme in the repo: overlays symmetric with light (`#f3f3f50d` hover / `#f3f3f51a` pressed, matching butter/chocolate/matcha/neutral/y2k), and accent-muted one step stronger in dark (`#f3f3f520`, matching the `14`-light/`20`-dark pattern in chocolate/matcha/y2k). Fixes #3622.

@let-sunny
