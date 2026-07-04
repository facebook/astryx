# @xds/theme-stone

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
