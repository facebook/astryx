---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-045
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [vjeux]
affects_architecture: [architecture:layer-runtime]
affects_families: []
affects_contributing: []
affects_consumer_docs: [useLayer, Popover]
---

# Layer placement on engines without CSS anchor positioning system spec

## Intent

A layer opened from a trigger lands against that trigger on every engine the
library runs on — on the side the caller asked for, on the opposite side when
the room is short, aligned as asked, inside the viewport — whether or not the
engine implements CSS anchor positioning. A caller that passes `placement` to
`useLayer`, or to a component built on it, gets the placement it asked for and
can tell which mechanism delivered it.

This projects `spec:AST-003` FR21–FR23 and DEC-5 onto the placement half of the
anchored-layer contract. AST-003 required a _usable reduced fallback_ for
engines without native features and let that fallback omit anchored geometry
and collision behaviour. In practice a layer that keeps the user-agent
popover's insets lands nowhere near its trigger (a popover at the bottom of a
phone screen under the composer that opened it), which is not usable. This
spec raises the floor for the placement half only: anchored geometry and the
collision flip are delivered on every engine; top-layer promotion, native light
dismissal, auto-popover association and invoker focus order remain governed by
AST-003 FR22 and stay reduced where the Popover API is missing.

## Non-goals

- Reproducing every CSS anchor-positioning feature in script. `anchor-size()`,
  `position-try-order`, span-based slides for centered layers, and consumer
  `positioning: "custom"` styles are not emulated.
- Changing the CSS anchor-positioning path. Where the engine has it, it places
  the layer exactly as before.
- Sizing a layer to the room its trigger leaves it (available-size clamps); that
  is a separate contract.
- Choosing the placement path per caller. The path is the engine's answer, not
  a prop.
- Equivalent internal implementations remain valid when they satisfy this
  contract. The measurement source, event set, scheduling, and the internal
  module boundary are architecture, not contract, except where FR6 names the
  observable data attribute callers and tests depend on.

## Requirements

### Path selection

- **FR1 — The path is the engine's answer, asked once per layer.** `useLayer`
  MUST determine, once per layer and without touching browser globals during a
  server render, whether the engine implements the `position-area` values the
  hook emits (the `self-*` keyword family) and `position-try-fallbacks`. An
  environment with no `CSS` object (a server, a DOM emulator) MUST take the
  anchor path so server and client markup agree.
- **FR2 — Three paths, one contract.**
  - `anchor`: both features exist. CSS anchor positioning places the layer end
    to end. Emitted styles MUST be unchanged from the pre-existing anchor path.
  - `anchor-flip`: `position-area` exists, `position-try-fallbacks` does not.
    CSS MUST keep the side and the alignment; the layer MUST decide the flip by
    measurement and express it as the `position-area` for the side it chose.
    It MUST NOT emit `position-try-fallbacks`.
  - `measured`: `position-area` does not exist. The layer MUST be placed from
    measurements as fixed-position viewport coordinates written through the
    layer's own rendered style; it MUST NOT emit `position-area`,
    `position-try-fallbacks`, or `position-anchor`.

### Measured geometry

- **FR3 — The measured side follows the collision contract CSS gives.** The
  layer takes the requested side when its margin box fits in the room that
  side has, the viewport gutter excluded; otherwise the opposite side when the
  margin box fits there (`flip-block` / `flip-inline`); otherwise whichever side
  has more room. A measured layer is clamped to the gutter, so the roomier side
  is the one that covers less of its trigger.
- **FR4 — Alignment is logical.** `start`, `center` and `end` line the layer's
  start edge, middle, or end edge up with the trigger's along the axis
  perpendicular to the placement, resolved against the layer's inline
  direction, so RTL mirrors the inline axis exactly as the `self-*` keywords
  do.
- **FR5 — The layer stays inside the viewport gutter and keeps its clearance.**
  Coordinates are clamped so the layer's margin box stays at least the gutter
  from every viewport edge — the same `max(spacing token, safe-area inset)` the
  Popover family already sizes against — and a layer larger than the viewport
  sits at the gutter's start edge. The `offset` clearance survives the flip, as
  it does on the anchor path. On the `anchor-flip` path the flip decision MUST
  read the same gutter.
- **FR6 — A measured layer follows its trigger.** While open, the layer MUST
  re-measure after a window resize, a scroll of the window or any ancestor, a
  visual-viewport resize or scroll (the on-screen keyboard), a size change of
  the layer or the trigger, and after the placement props change, and its first
  coordinates MUST be applied before its first paint. A re-measure that yields
  the same whole-pixel answer MUST NOT re-render.

### Capability signal

- **FR7 — The element says which path placed it.** The rendered layer element
  carries `data-astryx-layer-placement` with the value `anchor`, `anchor-flip`
  or `measured`. Consumers and tests depend on this attribute. A layer under
  `positioning: "custom"` carries no attribute and takes no path: that mode
  owns its own insets. The value type is public as `LayerPlacementPath`.

### Platform support

- Supported feature/engine floor: the `anchor` path applies wherever
  `position-area` and `position-try-fallbacks` are implemented (Astryx's
  published browser matrix). The `anchor-flip` and `measured` paths apply below
  that floor wherever `getBoundingClientRect`, `getComputedStyle`, and
  `position: fixed` exist, which is every engine the library targets.
- Unsupported behavior: without the Popover API the layer still takes the path
  the probe selects, and the reduced behaviour of `spec:AST-003` FR22 governs
  everything but placement.
- Browser evidence: rendered geometry — the layer against its trigger, the flip
  at a viewport edge, following scroll — on real Chromium and WebKit, with the
  anchor features present and with them taken away before the page runs.
  Playwright WebKit is evidence for the paths, not for a shipping iOS Safari.

## Current-state impact

- `architecture:layer-runtime` — _Positioning_ gains the three paths and the
  attribute; _Current browser support behavior_ states that the measured path
  restores anchored geometry and the collision flip and that span slides are
  not reproduced; _Owning code_ names the probe and the pure placement math as
  a separate seam beside `useLayer`; the INV3–INV5 evidence row grows the pure
  suite.
- `spec:AST-003` — FR22's "not required to reproduce … anchor-geometry or
  collision behavior" is narrowed by this record for placement; DEC-5's
  rejection of a _polyfill_ stands (the Popover API is not emulated). On
  promotion, AST-003's platform-support text should reference this record.
- Consumer docs: `useLayer` and Popover documentation describe the two paths
  and the attribute.
- No component API changes. Every consumer of `useLayer` (Popover, HoverCard,
  Tooltip, DropdownMenu, ContextMenu, Selector, ComplexSelector) receives the
  behaviour without a prop.

## Verification

| Contract | Verification                                                                                                                                | Representative states                                                                                                                                         | Mutation or failure expectation                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| FR1, FR2 | Unit: probe with `CSS` absent and with each feature answered separately; rendered-style assertions per path                                 | both features; `position-area` only; neither; `CSS` undefined; custom positioning                                                                             | A path emits the other path's styles, or a server render touches `CSS`                                  |
| FR3      | Pure placement-function table tests                                                                                                         | requested side fits; flip on the block axis both ways; flip on the inline axis both ways; neither side fits                                                   | Removing the flip leaves the layer on the short side; removing the roomier-side rule overflows          |
| FR4      | Pure placement-function table tests, LTR and RTL                                                                                            | start/center/end on a block placement; start/center/end on an inline placement; RTL for both                                                                  | RTL start lands on the left                                                                             |
| FR5      | Pure clamp tests; unit test that the gutter is carried on both measuring paths and on neither the anchor path nor custom positioning        | trigger at each edge; per-edge gutter; layer larger than the viewport; sub-pixel input                                                                        | A layer crosses the gutter; the anchor-flip flip reads a zero gutter                                    |
| FR6      | Unit: re-measure on `resize` and capture-phase `scroll`, stop after hide; browser: an open layer follows a page scroll                      | open, scrolled, hidden                                                                                                                                        | Coordinates go stale after a scroll, or keep updating after hide                                        |
| FR7      | Unit: attribute value per path and absent under custom positioning; browser: attribute matches the engine's own `CSS.supports` answer       | each path; custom                                                                                                                                             | Attribute missing, wrong, or present on a custom layer                                                  |
| FR2–FR6  | Browser (Chromium and WebKit): triggers at the top, start and bottom edges asking for the side they lack; native, `anchor-flip`, `measured` | layer above a bottom-edge trigger with clearance and start alignment; below a top-edge trigger centered; at the end of a start-edge trigger; following scroll | A path lands the layer off its trigger, on the short side, outside the gutter, or without its clearance |

## Decision log

### DEC-1 — Placement is delivered on every engine; the Popover API is not emulated

**Reference:** `spec:AST-045/DEC-1`
**Decider:** `vjeux`, `2026-09-27`

A layer that lands away from its trigger is not a usable reduced fallback: the
user cannot find it and, on a phone, cannot reach its last rows. Placement is
the one half of the anchored contract that script can deliver faithfully with
what every engine has (`getBoundingClientRect`, `position: fixed`), so it is
delivered. Top-layer promotion, light dismissal, association and invoker focus
order cannot be delivered that way and stay reduced under `spec:AST-003` FR22.

Rejected: a documented capability signal alone (the minimum the reporting
consumer asked for). It moves 300 lines of measurement into every app that
notices, and the second app gets it wrong differently.

### DEC-2 — Where the engine has `position-area` but not `position-try-fallbacks`, CSS keeps the side and script decides only the flip

**Reference:** `spec:AST-045/DEC-2`
**Decider:** `vjeux`, `2026-09-27`

The engine keeps doing what it can — alignment, RTL, sub-pixel following of the
anchor — and script does the one thing it cannot: the flip. The measured side
is expressed as `position-area`, so the layer stays anchored.

Rejected: taking the whole measured path there. It trades native anchor
following for scroll-driven re-measurement on an engine that does not need it.

### DEC-3 — When neither side fits, the measured layer takes the roomier side

**Reference:** `spec:AST-045/DEC-3`
**Decider:** `vjeux`, `2026-09-27`

CSS keeps the requested side and lets the layer overflow; a measured layer is
clamped to the gutter, so keeping the requested side would slide it over its
own trigger. The roomier side covers less of the trigger.

Rejected: matching CSS exactly (requested side, overflow). Overflow off a phone
screen is the defect this record exists to remove.

### DEC-4 — The path is a data attribute on the layer element

**Reference:** `spec:AST-045/DEC-4`
**Decider:** `vjeux`, `2026-09-27`

A consumer that must branch on placement mechanism (a CSS rule, a test) needs a
selector-addressable signal on the element that carries the placement. A hook
return value would reach only the `useLayer` caller, not a component consumer
or a stylesheet.

Rejected: a `placementPath` field on the `useLayer` return. It does not reach
Popover, Selector or ComplexSelector consumers, which is where the defect was
seen.

## Open questions

- **OQ1 — Should `spec:AST-003` FR22 be edited in place on promotion, or is a
  reference from its platform-support section enough?** (`human-design`)
