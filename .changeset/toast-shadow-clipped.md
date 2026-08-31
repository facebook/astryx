---
'@astryxdesign/core': patch
---

[fix] Toast: the card's shadow is no longer clipped away.

Each toast's grid row used `overflow: hidden` throughout its lifetime. The clip
is load-bearing while the row opens and closes — it makes the toast read as
folding into the stack — but at rest it hugs the card's border box with zero
slack on every side and cuts off every shadow the card casts. Astryx's own
`--shadow-med` was declared and invisible: against a white page, every sampled
pixel below a stock toast was pure white.

The row now keeps its cross-engine `overflow: hidden` boundary during entry and
exit, and releases it to `overflow: visible` only after the opening transition
settles. Dismissal restores the clip synchronously. The wrapper keeps its
ordinary pointer boundary, so a second click while the toast is still visible
is absorbed by the toast rather than falling through to an obscured control
underneath.

This avoids `overflow-clip-margin`, which WebKit 26.5 does not support, while
preserving the exact paint boundary the exit shipped with before this fix.

Settled state is held on the mounted row rather than in a set of toast ids on
the viewport, so it cannot outlive the row it describes. A row leaves the DOM
by more paths than dismissal — `maxVisible` evicts the oldest when a newer
toast arrives, and a `uniqueID` overwrite swaps a new entry into a replaced
toast's place — and on neither path does anything on the dismissal path run.
An evicted toast that resurfaces once the stack drains therefore mounts clipped
and runs its own entry transition, instead of releasing the clip over a row
that is still opening.

Two further lifecycle guards: only the row's own transition is read, since
`grid-template-rows` is not private to the wrapper and `transitionend` bubbles
from any descendant animating its own grid; and a row that resolves to no
transition at all settles and exits without waiting for an event that will
never arrive. Reduced motion keeps a 0.01ms transition so the event still
fires, but a host stylesheet, a print or forced-colors context can resolve the
wrapper to `transition-duration: 0s`, and without the fallback the clip would
never be released and a dismissed toast would never unmount.

Below a settled stock toast on a white page, per pixel row: `255,255,255` at
every offset before; `237 → 245 → 250 → 254` over the shadow's 14px reach
after. During exit the row clips again, so anything outside the shrinking row
is neither painted nor hit-testable — while the wrapper itself keeps the
ordinary pointer boundary it has always had, and still absorbs a click aimed
at a toast that is still on screen.

@freddymeta
