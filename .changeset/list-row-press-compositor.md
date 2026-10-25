---
'@astryxdesign/core': patch
---

[fix] A list row's touch press release keeps fading while the page runs script. `ListItem`, `Item` and `TreeList` rows used to stay fully pressed after the finger lifted until the main thread was free, and every frame of the fade repainted the row; the release now runs on the compositor, with the same color, clock and curve as before. Under a finger, an interactive row's press paints on its `::before`: StyleX merges a row's own `::before` from `xstyle` with it property by property, so that decoration keeps the layer's `opacity: 0` and is hidden at rest (a `className` rule overrides only the properties it sets); put row decoration on `::after` or a child element. With a mouse or trackpad the row is unchanged: no layer and no new stacking context.

@vjeux
