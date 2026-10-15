---
'@astryxdesign/cli': patch
---

[docs] The Tailwind and migration setup docs now say that `globals.css` (or a `layers.css` holding only the `@layer` line) must be the first import in the root layout or app entry, before the `astryx-themes` module or any component that imports theme CSS; otherwise Tailwind preflight overrides Astryx base styles and theme overrides lose. The Tailwind v3 coexistence snippet moves its `@layer` line into a `layers.css` imported first, because Next.js (webpack or Turbopack) hoists CSS imports above an inline `@layer` line.
@cixzhang
