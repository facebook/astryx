---
'@astryxdesign/core': patch
---

[feat] Stepper: `--step-connector-gap`, so a theme can stop the on-track connector short of the indicator

The on-track layouts draw the connector as one segment either side of the node. A theme that wants the track to leave a hole around the indicator had to reach the two segments separately, and they are only distinguishable by sibling position — which changes with `indicator="none"`.

One public var does it instead, declared on the Stepper root because component vars are root-owned: a theme writes `stepper: {base: {'--step-connector-gap': '4px'}}` and every connector inherits it. Astryx spends it on whichever side each segment faces the node from, so the pair leaves a symmetric hole and the caller never names the pieces. `0px` by default: the shipped track still reads as one unbroken line.

Measured in Chromium against a built theme override, reading painted pixels down a 12px segment:

| value   | clipped away  | stepper height |
| ------- | ------------- | -------------- |
| `6px`   | 6px           | unchanged      |
| `-4px`  | 0             | unchanged      |
| `1rem`  | capped to 8px | unchanged      |
| `999px` | capped to 8px | unchanged      |
| `10%`   | 1px (of 12px) | unchanged      |
| `50%`   | capped to 6px | unchanged      |

Four things that had to be true and are:

**A theme override reaches it.** The default is declared once on the root, not on each connector. Declared per-connector, every connector re-declared `0px` on itself, and a value declared on an element beats an inherited one — so a generated `stepper` override compiled cleanly and changed nothing.

**The value is bounded**, and both halves earn it — neither for padding's reasons. `max(0px, …)` because `inset()` _accepts_ a negative length: Chromium computes `inset(0 0 -4px 0)` as written rather than clamping it the way it clamps negative padding, so the floor has to be declared. `min(…, --spacing-2)` — the flexible segment's own `min-height` — so an oversized gap leaves a short track rather than an unbounded one. Neither can grow the Stepper; a clip cannot change layout. (An earlier padding-based revision grew a three-step Stepper 108px → 144px at `1rem`.)

**The horizontal clip mirrors under `dir="rtl"`.** `clip-path: inset()` is physical — top/right/bottom/left, no logical form — while the row itself reverses. Left unflipped, the leading segment sits to the _right_ of the node in RTL and still clipped its right edge, so the hole opened at the join between steps instead of at the indicator. Measured before the fix: `con0 x=622, indicator x=606, clips RIGHT edge`. After: `clips LEFT edge`, with LTR unchanged. The block axis needs no handling — `dir` does not reverse it.

**One declaration covers both layers.** The gap has to reach the track (the segment's own background) and the accent fill (an absolutely placed `::before`). Spending it on each separately meant two declarations on two boxes, so a percentage resolved against a different containing block for each and stopped them ~1.2px apart. A single `clip-path: inset(…)` on the segment clips the element and its pseudo-element together against one reference box, so every accepted value behaves identically on both — which is what [#5824](https://github.com/facebook/astryx/pull/5824) requires of a public input across its full value domain. Clipping also cannot change layout, so the node the segment positions cannot move.

**No indicator, no gap.** `indicator="none"` renders no node, so a gap there is a hole in a track that is meant to be continuous.

Any CSS length or percentage is accepted and behaves the same way on both layers. A percentage resolves against each segment's own box, so a fixed and a flexible segment clip by slightly different amounts from one declared value — cosmetic, bounded by the cap, and recorded as accepted rather than fixed.

**Why a custom property and not a guaranteed CSS property.** A theme target reaches the element, never its `::before`. Measured against a built theme override on `step-connector`: `paddingBlock: 6px` produces no hole at all — the background paints to its border box and the fill is out of reach — its only effect being the Stepper growing 108px → 120px; `paddingBlockEnd: 6px` produces no hole either, and addresses only one of the two edges. Only the component can clip both layers together, mirror per axis and direction, and clamp first.

Adds `Stepper.spec.md`, the canonical owning record for this public property, carrying that admission argument, the value contract, and the anatomy-to-target map. `Stepper.doc.mjs` gains the anatomy entries its existing `stepper`, `step`, and `step-connector` targets never had, so every current target is anchored to a described part.

Supersedes the `segment` variant this PR previously proposed. That exposed `lead` / `rail` / `content` as public theming vocabulary, which does not hold up: the words never appeared in the generated docs, they emit bare `lead` / `content` classes where a consumer's own stylesheet can collide with them, and `lead` means different geometry per orientation. The pieces are how this layout happens to be drawn today, not a contract.

@freddymeta
