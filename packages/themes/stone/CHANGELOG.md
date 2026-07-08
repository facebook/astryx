# @xds/theme-stone

# 0.1.4

#### Fixes

- Stone theme: dark-mode overlay/accent-muted tokens missing alpha (#3624)
  The dark-mode values for `--color-accent-muted`, `--color-overlay-hover`, and `--color-overlay-pressed` were fully opaque `#f3f3f5`, unlike their light-mode counterparts which are semi-transparent tints. Because these tokens paint absolutely-positioned hover/press overlays and muted-accent fills, the opaque dark value covered the content underneath instead of tinting it. Changed the dark values to carry alpha suffixes following the conventions used by every other theme in the repo: overlays symmetric with light (`#f3f3f50d` hover / `#f3f3f51a` pressed, matching butter/chocolate/matcha/neutral/y2k), and accent-muted one step stronger in dark (`#f3f3f520`, matching the `14`-light/`20`-dark pattern in chocolate/matcha/y2k). Fixes #3622.
- Stone theme: restore dark-mode alpha for overlay/border/shadow tokens (#3626)
  The dark-mode values for `--color-overlay`, `--color-border`, and `--color-shadow` were fully opaque (`#28282a`, `#f3f3f5`, `#000000`), unlike their light-mode counterparts and their own original pre-regression values, which are semi-transparent tints. An opaque overlay hides the page behind a solid block instead of a translucent scrim, an opaque border paints a solid near-white line instead of a subtle hairline, and an opaque shadow has no falloff. Restored the exact values from Stone's introduction (30e9d122f, #2020), stripped by a later tooling pass (e2892c0ad, #2173): `--color-overlay` to `#28282acc` (80%), `--color-border` to `#f3f3f51a` (T96 · 10%), and `--color-shadow` to `#0000004d` (30%). Fixes #3625.

#### Contributors

Thanks to everyone who contributed to this release:

- @let-sunny

---

# 0.1.3

---

# 0.1.2

---

# 0.1.1

#### Fixes

- Stone theme: add ~10% transparency to dark-mode `--color-neutral`
  The dark-mode value was a fully opaque `#f3f3f5`, unlike every other theme which uses a semi-transparent (~10% alpha) neutral tint. Because `--color-neutral` fills the secondary `Button` variant, this rendered a solid near-white surface with near-white text in dark mode (unreadable). Changed dark value to `#f3f3f51a` to match the convention used across all other themes. Fixes #3119.

#### Contributors

Thanks to everyone who contributed to this release:

- @ernestt

---

# 0.1.0

---

# 0.0.15

#### Changes

- Tracks `@xds/core@0.0.15` (bare-name migration + data-attribute selector surface).
