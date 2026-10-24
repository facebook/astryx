---
'@astryxdesign/core': patch
---

[fix] A list row's touch press release keeps fading while the page runs script. `ListItem`, `Item` and `TreeList` rows used to stay fully pressed after the finger lifted until the main thread was free, and every frame of the fade repainted the row; the release now runs on the compositor, with the same color, clock and curve as before. On an interactive row the press paints on the row's `::before`, so a row's own `::before` set through `xstyle` or `className` replaces the press paint.

@vjeux
