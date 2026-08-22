---
'@astryxdesign/build': patch
---

[fix] Vite plugin: split Astryx library styles and product styles into their CSS layers during production builds, not only in the dev server. The splitter lived in a `configureServer` hook, so `vite build` shipped every atom in StyleX's flat `@layer priorityN` blocks — which sit outside the named layers and outrank `astryx-theme`, letting library base styles beat an installed theme. Splitting now keys off the atomic class prefix rather than the source path, and runs wherever StyleX hands over its CSS (dev middleware, bundle asset, written file), so dev and production agree. `libraryPattern` also accepts an array and now feeds the prefixer that the split reads, so the two can no longer disagree about which files are library source.

@cixzhang
