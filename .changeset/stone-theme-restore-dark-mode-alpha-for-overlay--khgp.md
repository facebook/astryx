---
'@astryxdesign/theme-stone': patch
---

[fix] Stone theme: restore dark-mode alpha for overlay/border/shadow tokens (#3626)

The dark-mode values for `--color-overlay`, `--color-border`, and `--color-shadow` were fully opaque (`#28282a`, `#f3f3f5`, `#000000`), unlike their light-mode counterparts and their own original pre-regression values, which are semi-transparent tints. An opaque overlay hides the page behind a solid block instead of a translucent scrim, an opaque border paints a solid near-white line instead of a subtle hairline, and an opaque shadow has no falloff. Restored the exact values from Stone's introduction (30e9d122f, #2020), stripped by a later tooling pass (e2892c0ad, #2173): `--color-overlay` to `#28282acc` (80%), `--color-border` to `#f3f3f51a` (T96 · 10%), and `--color-shadow` to `#0000004d` (30%). Fixes #3625.

@let-sunny
