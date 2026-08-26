---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` decides its `color-scheme` block from the theme's own token and component values rather than a substring scan of the generated CSS, and emits the `--color-data-*` defaults in `@layer astryx-base` so a built theme matches what the `<Theme>` runtime injects. Every built theme now carries those defaults, which are `light-dark()` pairs, so the old scan would have fired for every theme. The `color-scheme` output is unchanged.

@cixzhang
