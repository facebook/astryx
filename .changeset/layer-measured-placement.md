---
'@astryxdesign/core': patch
---

[fix] `useLayer` places a layer on engines without CSS anchor positioning.

Placement was CSS anchor positioning only — `position-area` for the side,
`position-try-fallbacks: flip-block` for the flip — so an engine without
`position-area` ignored the placement entirely and the layer landed wherever
the UA stylesheet left it (on an iPhone, a popover opened at the bottom of the
screen under its own trigger), and an engine without `position-try-fallbacks`
had no defined behaviour when the requested side had no room.

The hook now asks the engine once (`CSS.supports`) and, where `position-area`
is missing, measures the trigger and the layer on open and on every resize,
scroll and size change, then writes `position: fixed` coordinates that follow
the same contract: the requested side, flipped when the room is short, aligned
per `alignment`, kept inside the viewport gutter. Where `position-area` exists
but `position-try-fallbacks` does not, CSS keeps the side and the measurement
decides only the flip. The element carries `data-astryx-layer-placement`
(`anchor`, `anchor-flip` or `measured`) so a consumer or a test can see which
path is in charge. Nothing changes on an engine with both halves.

@vjeux
