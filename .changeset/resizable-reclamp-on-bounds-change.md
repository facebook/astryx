---
'@astryxdesign/core': patch
---

[fix] useResizable: keep the held size inside the band when the band itself moves

`minSizePx`/`maxSizePx` were applied at initialization and on every set path, but never to the size the hook was already holding. A region whose maximum is derived from available width therefore kept a size that had become illegal the moment the maximum dropped — the panel stayed wider than its own ceiling, and `ResizeHandle` reported an `aria-valuenow` above its `aria-valuemax`.

The held size now follows the bounds when they move under it, in one direction only: a size that falls outside the band is corrected into it, and a band that widens again leaves the size alone. Growing back is what a viewer's choice looks like once the ceiling has moved, so the region does not spring back out while a window is being resized. The correction runs before paint, so the out-of-band size is never drawn, and it reports through `onSizeChange` like any other size change. A collapsed region is left at zero — `expand()` already applies the current band when it restores.

@cixzhang
