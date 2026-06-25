---
'@astryxdesign/theme-stone': patch
---

[fix] Stone theme: add ~10% transparency to dark-mode `--color-neutral`

The dark-mode value was a fully opaque `#f3f3f5`, unlike every other theme which uses a semi-transparent (~10% alpha) neutral tint. Because `--color-neutral` fills the secondary `Button` variant, this rendered a solid near-white surface with near-white text in dark mode (unreadable). Changed dark value to `#f3f3f51a` to match the convention used across all other themes. Fixes #3119.

@ernestt
