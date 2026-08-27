---
'@astryxdesign/build': patch
---

[fix] Vite build: Astryx and product styles are split into their own cascade layers, so a theme's component overrides apply in a production build
@cixzhang

StyleX emits every rule it collects into one top-level `@layer
priority1…priorityN`. The dev server re-served those partitioned by source file
— Astryx's own styles into `astryx-base`, the app's into `product` — but a build
did neither, so the priority layers landed outside the `@layer reset,
astryx-base, astryx-theme, product` order and outranked all of it. Every
`components: {…}` override a theme set — a colour, a radius, a public custom
property — was silently dropped in the built app while working in dev.

The build now runs the same partition the dev server does, from the same helper,
so the promised order holds in both: Astryx's styles are overridable by a theme,
and an app's own styles still outrank everything.
