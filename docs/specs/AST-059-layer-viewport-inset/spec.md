---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-059
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:layer-runtime]
affects_families: []
affects_contributing: []
affects_consumer_docs:
  [Layer, useLayer, Popover, usePopover, DropdownMenu, BaseTypeahead]
review_triggers: [layering, layout, behavior, public-api]
---

# Layer viewport inset system spec

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "layering": ["FR1", "FR2", "FR4", "FR5", "FR7", "DEC-1", "DEC-3"],
    "layout": ["FR1", "FR2", "FR3", "FR4", "FR5", "FR6", "DEC-2"],
    "behavior": ["FR2", "FR4", "FR5", "FR7"],
    "public-api": ["FR6", "DEC-4"]
  }
}
```

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | The layer runtime owns the viewport inset: one gutter definition (FR1), one size cap — the viewport, never the span beside the trigger (FR2, FR3) — one fallback order (FR4, FR5), and one place an app declares a persistent bar floating over a viewport edge (FR6). Popover is an application of the layer that adds styling on top (DEC-1).                                                                                                                                                 |
| Behavior                | A layer renders at its own size — the caller's explicit size, or its content's — up to the viewport minus its gutters. Content that can wrap fits beside the trigger by wrapping; a size that cannot shrink flips to the other side, and when it fits on neither side it keeps its size and slides along the alignment axis into view while the anchor is in view (FR4, DEC-2). A layer whose anchor has left the viewport holds its position and its size (FR5, DEC-3).                        |
| End-user impact         | A person who opens a 352px menu from a control near the edge of a panel gets a 352px menu, not a 274px one. A long menu on a phone keeps its labels readable instead of squeezing beside its trigger. A layer never ends under a phone navigation bar the app has declared (FR6). Nothing moves for an app that declares no bar.                                                                                                                                                                |
| Builder impact          | `Popover.width` and `DropdownMenu.menuWidth` become ordinary sizes. Nothing new to pass. An app with a floating bar declares it once, on `:root`. Components that compose `useLayer` or `usePopover` inherit the gutter, the caps, and the fallbacks without a record change (FR7).                                                                                                                                                                                                             |
| Compatibility/readiness | Behavior change, no API change. An explicit size near an edge renders at its size instead of shrinking; unwrappable content near an edge flips or slides instead of overflowing its box; prose still wraps beside its trigger (DEC-2). Every anchor-mode layer gains the gutter and caps (FR7). Authority: `draft`, `approved_by` `null`. Two decisions are proposed here rather than already taken: DEC-2 and DEC-4.                                                                           |
| Review checks           | Reject a second definition of the viewport gutter outside the layer runtime; a `max-inline-size` resolved against the anchor's span; a fallback list authored by a component for an anchor-mode layer; a branch on whether a size was explicit; a slide that continues once the anchor has left the viewport; a `layer` theme target or a theme value standing in for an app's bar; a consumer minimum size that is not clamped by the runtime's cap.                                           |
| Governing rules         | [`architecture:layer-runtime`](../../architecture/layer-runtime.md) INV3, INV5 for anchor-mode placement, fallbacks, and direction; [`spec:AST-003`](../AST-003/spec.md) FR21–FR23 for the reduced behavior where CSS Anchor Positioning is absent; `component:Popover` FR4, ORD4 for Popover's conditional scrolling, which this record leaves in place; [`architecture:container-padding`](../../architecture/container-padding.md) for the `--astryx-*` custom-property grammar FR6 follows. |

This table is a review projection; the body below is authoritative.

## Intent

An anchored layer must stay on screen with a breathing gap from the viewport
edge and from the device's own insets, must choose a position that fits, and
must know where the viewport really ends when an app floats a bar over it. A
person who opens a menu from a control near the edge of a panel needs the menu
at the size it was given; a person on a phone needs a long menu's labels
readable rather than squeezed beside the trigger; a person using an app with a
floating navigation bar needs no layer to end underneath it.

This record owns one answer: **the layer runtime owns the viewport inset —
the gutter, the size cap, the fallback order, the app-declared inset, and the
stories that show them. Popover is an application of the layer that adds
styling on top.** A gutter defined in one place cannot drift between
components; a size capped by the viewport rather than by the span beside the
trigger cannot shrink an explicit width near an edge; an inset declared once by
the app reaches every layer instead of the components that happen to read it.

## Ownership boundary

**Owns**

- The viewport gutter: its one definition, which edges it applies to, how the
  device safe area and an app-declared inset feed it.
- The size cap of an anchor-mode layer on both axes, and that no span beside
  the trigger ever caps a layer.
- The fallback order of an anchor-mode layer, including the slide and the
  condition under which it applies.
- Where an app declares a persistent bar floating over a viewport edge, and
  that a theme does not.
- That every anchor-mode layer inherits these behaviors without a component
  record change, and what a composing component may still add on top.
- The Layer stories that demonstrate the viewport behaviors.

**What Popover keeps**

- Its props and their meaning, including that an explicit `width` wins over
  trigger matching and that, without one, the surface prefers the trigger's
  minimum width — the one fact the layer cannot know is whether this instance
  was given a size, and the layer does not need to know it (DEC-2).
- Its visual treatment, the painted surface and its `popover` theme target,
  its surface padding, and conditional internal scrolling once the layer has
  capped the surface (`component:Popover` FR4, ORD4).

**Why no existing record can hold it**

- [`architecture:layer-runtime`](../../architecture/layer-runtime.md) is
  `current` and describes the layer runtime as shipped; it incorporates an
  accepted layer change only as that change ships (`spec:AST-003` is its
  precedent). A `current` record carries one `authority` value, so an
  unshipped behavior written into it would read as both approved and shipped
  (`architecture:knowledge-contracts` INV1, INV14). The architecture-record
  deltas this record requires are listed under Current-state impact.
- `component:Popover` is `current` and records Popover's shipped behavior,
  including viewport fitting (its FR3, ORD2, ORD3). The same authority rule
  applies; its deltas are listed below.
- `component:DropdownMenu`, `component:BaseTypeahead`, and the other
  composing components are consumers of the behavior, not owners of it. One
  rule binding five-plus components through one hook is a system fact.

## Non-goals

- **Sizing a layer to the room on one side of its trigger on the placement
  axis.** A layer taller than the room both above and below its trigger is
  capped to the viewport and flipped. Preferring the roomier side is not
  settled here.
- **Toast and fullscreen Dialog.** Both keep the same gutter value by
  convention but are not anchor-mode layers; whether the app-declared inset
  (FR6) reaches them is a later decision.
- **Public docs for the reduced behavior where CSS Anchor Positioning is
  absent.** `spec:AST-003` FR21–FR23 own that boundary.
- **Component scrolling, measurement, focus, dismissal, visual treatment, and
  theming anatomy.** They stay with their owners.
- Equivalent internal implementations remain valid when they satisfy this
  contract. Module names, the mechanism that observes anchor visibility, and
  which CSS properties carry the cap are implementation unless a caller
  depends on them; FR6's custom properties are the one public mechanism, and
  callers depend on their exact names.

## Requirements

- **FR1 — One gutter.** Every anchor-mode layer keeps a gutter from each
  viewport edge equal to `max(--spacing-4, env(safe-area-inset-<edge>))` plus
  that edge's app-declared inset (FR6). The inline gutter reads the larger of
  the two physical safe-area insets, so a layer that flips across the inline
  axis still clears a notch on either side. The definition lives in the layer
  runtime; no component or family defines its own.
- **FR2 — The cap is the viewport, never the span.** On the alignment axis, a
  layer's size is capped to the viewport minus both gutters. The span of
  viewport beside the trigger never caps a layer. An explicit size the caller
  gives renders at that size up to the cap. A content-sized layer wraps its
  content to the room beside its trigger when the content can wrap, and keeps
  its content's size when it cannot (FR4 then moves it). The layer does not
  know, and does not need to know, whether a size was given; no component
  branches on it. A composing component may cap lower (Tooltip's 300px); it
  may not cap higher.
- **FR3 — Placement-axis cap.** On the placement axis, a layer's size is
  capped to the viewport minus both gutters. A composing component may cap
  lower (DropdownMenu's 300px) and may become a scroll container when its
  content exceeds the cap; it may not cap higher.
- **FR4 — One fallback order.** An anchor-mode layer tries, in order: its
  preferred position; the flip across the placement axis; the flip across the
  alignment axis; both flips; then, while its anchor is in view, a slide
  along the alignment axis that keeps the layer's size and moves it the least
  distance that brings it inside the gutters. Side placements slide along the
  block axis. The runtime authors this order; a component passes no fallbacks
  of its own to an anchor-mode layer.
- **FR5 — An off-screen anchor holds.** A layer whose anchor has left the
  viewport does not slide. It keeps the position the flips give it and its
  size until the anchor returns (DEC-3).
- **FR6 — The app declares a floating bar once.** An app that keeps a
  persistent bar floating over a viewport edge declares its extent per
  logical edge through the inherited custom properties
  `--astryx-layer-inset-block-start`, `--astryx-layer-inset-block-end`,
  `--astryx-layer-inset-inline-start`, and `--astryx-layer-inset-inline-end`,
  usually once on `:root`. Each adds to that edge's gutter (FR1) and reads
  `0px` when unset, so an app that declares none renders exactly as before.
  They are app state, not theme values (DEC-4).
- **FR7 — Consumers inherit; a consumer's own size rule cannot defeat the
  cap.** Every component that renders through `useLayer` in anchor mode or
  through `usePopover` receives FR1–FR5 with no record change and no option
  to pass. A component that sets its own minimum size — trigger matching, a
  `menuWidth` applied as a minimum — clamps that minimum with the runtime's
  cap expression, because a CSS minimum otherwise wins over a maximum.

### Platform support

- Supported feature/engine floor: CSS Anchor Positioning (`position-area`,
  `position-try-fallbacks`, `anchor-size()`) and the Popover API, as
  `architecture:layer-runtime` already requires for anchor mode. FR5 needs
  the runtime to know whether the anchor is in view; a runtime observation of
  the anchor is the layer's mechanism to own.
- Unsupported behavior: without anchor positioning, FR1–FR3 still bound a
  layer's size to the viewport; FR4 and FR5 have no fallbacks to order and do
  not apply. This is the reduced behavior `spec:AST-003` FR22 describes, not
  an equivalent.
- Browser evidence: rendered geometry in real Chromium for each Layer story
  below — the layer's bounding rectangle against the viewport, its gutters,
  and its size before and after a flip or slide. Emitted style strings prove
  the definition is shared; they do not prove a layer landed on screen.

## Current-state impact

### `architecture:layer-runtime` (`current`)

When this ships:

- Positioning: replace "Popover adds component-specific viewport sizing and
  overflow behavior above this geometry. Those constraints are not universal
  Layer behavior." with the gutter, cap, fallback order, and app-declared
  inset of FR1–FR6 as shipped behavior; state that the slide applies to every
  alignment while the anchor is in view and that an off-screen anchor holds.
- INV3 becomes "Anchor mode owns logical placement, fallbacks, and the
  viewport inset; custom mode owns its geometry; fixed mode owns explicit
  coordinates."
- Add an invariant for FR1 and FR7: the gutter has one definition, every
  anchor-mode layer inherits it, and a consumer minimum is clamped by it.
- Owning code: add the module that holds the gutter and cap expressions and
  the custom-property names.
- Change coupling: the positioning row already names viewport-edge fallbacks;
  add explicit-size, content-size, neither-side-fits, and off-screen-anchor
  states, and the app-declared inset.
- Verification: add the Layer stories as the rendered evidence for the new
  invariant and for INV3; name the explicit-width story's failure signal (a
  layer narrower than its given size).
- `deciding_specs`: add `spec:AST-059`.

### `component:Popover` (`current`)

When this ships:

- Ownership boundary, Owns: remove "viewport fitting, safe-area gutters" from
  the third bullet; it keeps focus destination, match-trigger sizing,
  conditional internal scrolling, and the measurement lifecycle.
- Ownership boundary, Does not own: add the viewport inset — gutter, size
  caps, fallback order, app-declared inset — owned by
  `architecture:layer-runtime`.
- Public concepts, "Placement and fit": becomes "Placement and preferred
  size" — Popover owns the preference (explicit width, else trigger minimum);
  the cap and fit are the layer's.
- FR3 is retired; its claim moves to this record's FR2 and FR3.
- ORD2 becomes: "An explicit width wins over trigger matching. Without
  explicit width, Popover prefers trigger minimum width, clamped by the
  layer's cap (`spec:AST-059` FR7)." The sentence about viewport and
  safe-area capping is removed.
- ORD3 is retired; the viewport fit is the layer's. ORD4's overflow
  evaluation follows the layer's cap.
- AV4 drops "available viewport size" from what Popover varies.
- Design relationships: the Popover surface "carries scroll, focus, and
  dialog behavior"; fit is removed.
- Verification map: the FR3/FR4 row becomes FR4 only; its Storybook
  reference points at the Layer stories for geometry and keeps Popover's
  overflow story for scrolling.
- `width` is an ordinary CSS width clamped by the layer's cap. Popover's one
  sizing branch is its own — explicit width, else trigger-matching minimum —
  and nothing in it depends on whether that width fits beside the trigger.

### What the other consumers inherit without a record change

- `DropdownMenu` and `DropdownMenuSubMenu` read the runtime's gutter. An
  explicit `menuWidth` is a minimum clamped by the viewport cap (FR7), never
  by the room beside the trigger; the menus' 300px block cap is a lower cap
  FR3 permits.
- `BaseTypeahead` reads the runtime's gutter; `menuWidth` and its
  match-trigger minimum are both clamped by the viewport cap (FR2, FR7).
- `PowerSearch` clamps its 400px editor floor with the viewport cap (FR7).
- `ComplexSelector` keeps 480px and `TopNavMegaMenu` keeps the room below its
  trigger as lower caps on the placement axis (FR3).
- `Tooltip`, `HoverCard`, `ContextMenu`, the Selector family, `TabMenu`, the
  TopNav menus, and the date inputs render through anchor mode or
  `usePopover` and receive FR1–FR5 with no change of their own. A layer that
  fits is unchanged; one that would overflow the viewport is capped, flipped,
  or slid.

## Verification

Stories live under `Core/Layer` as "Viewport inset: …" and run in real
Chromium under the story play guard; each is a claim a person can open and
look at. Popover's stories keep only what is Popover's: its match-trigger
preference, scrolling, focus, dismissal, and surface styling.

| Contract      | Verification                                                                                                                                        | Representative states                                                                                 | Mutation or failure expectation                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| FR1, FR7      | One gutter module; a source scan for a second gutter or a `100%`-of-span cap among anchor-mode layers; story "the gutter"                           | Default gutter at every edge; a wrapping layer beside a trigger flush with the edge                   | A second gutter constant among anchor-mode layers, or a layer inside the 16px gutter                                 |
| FR2           | Stories "explicit size near an edge (352px)" and "content-sized, fits beside the trigger"; Popover and DropdownMenu clamp strings                   | 352px end-aligned layer on a trigger 45px from the edge; a short content-sized layer                  | The layer renders narrower than its explicit size, or `100%` of the anchor span appears in a cap                     |
| FR3           | Story "taller than the viewport"; the runtime's viewport-fit style on every anchor-mode layer                                                       | Content taller than the viewport                                                                      | The layer's block size exceeds the viewport minus gutters                                                            |
| FR4           | Stories "content-sized, does not fit beside the trigger", "trigger near an edge flips", "neither side fits"                                         | A flip to end alignment at content size and at an explicit size; a 1000px layer on a centred trigger  | A layer squeezed into the span, a flipped edge off the trigger's edge, or a layer outside the gutters                |
| FR5           | Story "anchor leaves the viewport"; the runtime's anchor-visibility unit suite                                                                      | Horizontal scroll carries the trigger out of view while the layer is open, then back                  | The layer slides toward the viewport edge after the anchor is gone, changes size, or does not return with its anchor |
| FR6           | Story "app-declared inset (floating bar)"; the gutter module's property names                                                                       | An 80px bar declared through `--astryx-layer-inset-block-end`; the same story without the declaration | A layer ends under the bar, or an unset property moves a layer                                                       |
| FR1 safe area | A device run: `env(safe-area-inset-*)` is set only by a real device and Chromium emulation does not populate it, so no Storybook story can show it. | Landscape phone with a notch on one side                                                              | A layer under the notch                                                                                              |

## Decision log

### DEC-1 — The layer owns the viewport inset; Popover is an application of it

**Reference:** `spec:AST-059/DEC-1`
**Decider:** Cindy Zhang, 2026-10-03

The layer runtime owns the viewport inset behaviors, their specification, and
their stories. Popover is an application of the layer that adds styling
considerations on top. A gutter defined once cannot drift; a fallback list
authored once cannot be extended by one component for its own case; a person
sees the same edge behavior from a menu, a popover, a typeahead, and a
tooltip.

Rejected: a shared constant each component imports while keeping its own fit
styles — it removes the drift and keeps the ownership problem.

### DEC-2 — A content-sized layer wraps if it can and moves if it cannot

**Reference:** `spec:AST-059/DEC-2`
**Decider:** proposed by this record on the owner's observation of
2026-10-03; pending owner approval

A content-sized layer fits beside its trigger by wrapping its content into the
room there, as an auto-width positioned box does on its own. A size that
cannot shrink — an explicit width, a `menuWidth`, a label that does not wrap —
keeps its size and moves: it flips to the other side, and when neither side
fits it slides along the alignment axis into view (FR4). No size is ever capped
to the span beside the trigger, so the runtime needs no knowledge of whether a
size was given, and `Popover.width` and `DropdownMenu.menuWidth` are ordinary
CSS sizes clamped only by the viewport.

Rejected: forcing every content-sized layer to its `max-content` width so it
always moves rather than wraps — prose beside a trigger would open as wide as
the viewport.

### DEC-3 — An aligned layer does not slide toward an off-screen anchor

**Reference:** `spec:AST-059/DEC-3`
**Decider:** Cindy Zhang, 2026-10-03

The slide (FR4) serves a visible trigger whose layer fits on neither side. Once
the anchor has left the viewport, the layer holds the position the flips give
it and holds its size (FR5). A layer that kept sliding would pin itself into
the narrowest strip at the edge, giving up room it had a moment earlier for
an anchor nobody can see. The condition belongs in the ordering rules, not
left to emerge from a fallback list.

Rejected: closing the layer when its anchor leaves — a product decision about
staleness, not a geometry rule, and it takes the layer from a person reading it.

### DEC-4 — An app's floating bar is app state, not a theme value

**Reference:** `spec:AST-059/DEC-4`
**Decider:** proposed by this record; pending owner approval

A persistent bar floating over a viewport edge is a fact about an app's
shell — whether it exists and how tall it is — and two apps sharing one theme
differ on it. The caller therefore writes it as inherited CSS custom
properties (FR6), not through `defineTheme`. There is no `layer` theme
target: a theme target is a component's anatomy vocabulary, and the layer has
no painted anatomy of its own; the gutter is geometry, not treatment. The
property names follow the `--astryx-<owner>-<concept>-<logical-edge>`
grammar the container-padding protocol already uses.

Rejected: routing the inset through the `popover` theme target — one
component's theme would govern every other consumer. Rejected: a per-layer
prop — the bar would be restated on every surface, and two could disagree.

## Open questions

None. DEC-2 and DEC-4 are proposed here for the owner to approve or
overturn; they are not open designs with alternatives to weigh.
