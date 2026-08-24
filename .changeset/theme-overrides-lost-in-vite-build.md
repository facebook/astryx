---
'@astryxdesign/build': patch
---

[fix] Vite build: StyleX CSS is wrapped in the library layer, so a theme's component overrides apply in a production build
@cixzhang

StyleX emits its rules into its own top-level `@layer priority1…priorityN`. The
dev server re-served those wrapped in `astryx-base`, and the pre-compiled
`astryx.css` ships them wrapped, but a build did neither — the priority layers
landed outside the `@layer reset, astryx-base, astryx-theme, product` order and
outranked `astryx-theme`. Every `components: {…}` override a theme set — a
colour, a radius, a public custom property — was silently dropped in the built
app while working in dev. Product-layer CSS was losing to library styles for the
same reason and now wins, as documented.
