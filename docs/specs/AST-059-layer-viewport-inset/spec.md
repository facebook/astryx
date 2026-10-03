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
| Behavior                | A layer renders at its own size — the caller's explicit size, or its content's — up to the viewport minus its gutters. When that size does not fit beside the trigger, the layer flips; when it fits on neither side, it keeps its size and slides along the alignment axis into view while the anchor is in view (FR4, DEC-2). A layer whose anchor has left the viewport holds its position and its size (FR5, DEC-3).                                                                        |
| End-user impact         | A person who opens a 352px menu from a control near the edge of a panel gets a 352px menu, not a 274px one. A long menu on a phone keeps its labels readable instead of squeezing beside its trigger. A layer never ends under a phone navigation bar the app has declared (FR6). Nothing moves for an app that declares no bar.                                                                                                                                                                |
| Builder impact          | `Popover.width` and `DropdownMenu.menuWidth` become ordinary sizes. Nothing new to pass. An app with a floating bar declares it once, on `:root`. Components that compose `useLayer` or `usePopover` inherit the gutter, the caps, and the fallbacks without a record change (FR7).                                                                                                                                                                                                             |
| Compatibility/readiness | Behavior change, no API change. Content-sized aligned layers that used to shrink to the span beside the trigger now flip or slide at their natural size (DEC-2). Authority: `draft`, `approved_by` `null`. One owner decision is proposed here rather than already taken: DEC-2.                                                                                                                                                                                                                |
| Review checks           | Reject a second definition of the viewport gutter outside the layer runtime; a `max-inline-size` resolved against the anchor's span; a fallback list authored by a component for an anchor-mode layer; a branch on whether a size was explicit; a slide that continues once the anchor has left the viewport; a `layer` theme target or a theme value standing in for an app's bar; a consumer minimum size that is not clamped by the runtime's cap.                                           |
| Governing rules         | [`architecture:layer-runtime`](../../architecture/layer-runtime.md) INV3, INV5 for anchor-mode placement, fallbacks, and direction; [`spec:AST-003`](../AST-003/spec.md) FR21–FR23 for the reduced behavior where CSS Anchor Positioning is absent; `component:Popover` FR4, ORD4 for Popover's conditional scrolling, which this record leaves in place; [`architecture:container-padding`](../../architecture/container-padding.md) for the `--astryx-*` custom-property grammar FR6 follows. |

This table is a review projection; the body below is authoritative.

## Intent

An anchored layer must stay on screen with a breathing gap from the viewport
edge and from the device's own insets, must choose a position that fits, and
must know where the viewport really ends when an app floats a bar over it.
Today each of those is a component's problem: the gutter expression
`max(--spacing-4, env(safe-area-inset-*))` is copied into Popover,
DropdownMenu, DropdownMenuSubMenu, and BaseTypeahead with four sets of
constants, and the layer runtime itself fits nothing to the viewport. The
copies have already drifted, and one of them hides a defect: an aligned layer
caps its inline size to `calc(100% - gutter)`, which under anchor positioning
is the span of viewport beside the trigger, so an explicit width shrinks when
the trigger sits near an edge.

This record owns one answer: **the layer runtime owns the viewport inset —
the gutter, the size cap, the fallback order, the app-declared inset, and the
stories that show them. Popover is an application of the layer that adds
styling on top.**

The triggers are [#6688](https://github.com/facebook/astryx/pull/6688), which
fixes the explicit-width defect inside Popover and extends the layer's
fallback list from Popover, and
[#6686](https://github.com/facebook/astryx/pull/6686), which proposes
per-edge inset custom properties read by three components. Both reach for the
layer's behavior through a component; this record puts the behavior where
they were reaching.

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
  was given a size, and the layer no longer needs to know it (DEC-2).
- Its visual treatment, the painted surface and its `popover` theme target,
  its surface padding, and conditional internal scrolling once the layer has
  capped the surface (`component:Popover` FR4, ORD4).

**Why no existing record can hold it**

- [`architecture:layer-runtime`](../../architecture/layer-runtime.md) is
  `current`, and by its own first paragraph "describes the layer runtime
  shipped on current `main`"; its Positioning section records that Popover,
  not the layer, owns viewport sizing, which is true of the shipped code. A
  `current` record carries one `authority` value, so writing unshipped
  behavior into it would present that behavior as both approved and shipped
  (`architecture:knowledge-contracts` INV1, INV14). The record already names
  the path for an accepted layer change: `spec:AST-003` is incorporated "only
  as that work ships". This record follows the same path; the exact
  architecture-record deltas are listed under Current-state impact so the
  consolidation can apply them.
- `component:Popover` is `current` and records Popover's shipped behavior,
  including the viewport fitting this record moves out of it (FR3, ORD2,
  ORD3). The same authority rule applies; its deltas are listed below.
- `component:DropdownMenu`, `component:BaseTypeahead`, and the other
  composing components are consumers of the behavior, not owners of it. One
  rule binding five-plus components through one hook is a system fact.

## Non-goals

- **Sizing a layer to the room on one side of its trigger on the placement
  axis.** A layer taller than the room both above and below its trigger is
  capped to the viewport and flipped, as today. Preferring the roomier side is
  not settled here.
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
  gives renders at that size up to the cap; a content-sized layer renders at
  its content's size up to the cap. The layer does not know, and does not
  need to know, which of the two it is rendering. A composing component may
  cap lower (Tooltip's 300px); it may not cap higher.
- **FR3 — Placement-axis cap.** On the placement axis, a layer's size is
  capped to the viewport minus both gutters. A composing component may cap
  lower (DropdownMenu's 300px) and may become a scroll container when its
  content exceeds the cap; it may not cap higher.
- **FR4 — One fallback order.** An anchor-mode layer tries, in order: its
  preferred position; the flip across the placement axis; the flip across the
  alignment axis; both flips; then, while its anchor is in view, a slide
  along the alignment axis that keeps the layer's size and moves it the least
  distance that brings it inside the gutters, on the preferred side of the
  trigger first and the opposite side second. Side placements slide along the
  block axis. The runtime authors this list; a component passes no fallbacks
  of its own to an anchor-mode layer.
- **FR5 — An off-screen anchor holds.** A layer whose anchor has left the
  viewport does not slide. It keeps the position the flips give it and its
  size until the anchor returns. Ruled by Cindy Zhang, 2026-10-03.
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

Applied when the consolidation ships, not before:

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

Applied when the consolidation ships, not before:

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
  evaluation now follows the layer's cap rather than Popover's.
- AV4 drops "available viewport size" from what Popover varies.
- Design relationships: the Popover surface "carries scroll, focus, and
  dialog behavior"; fit is removed.
- Verification map: the FR3/FR4 row becomes FR4 only; its Storybook
  reference points at the Layer stories for geometry and keeps Popover's
  overflow story for scrolling.
- `Popover.tsx` loses its `viewportAligned` span cap and its
  alignment-specific viewport styles; `width` becomes an ordinary CSS width
  with the layer's cap above it. The `hasExplicitWidth` branch
  [#6688](https://github.com/facebook/astryx/pull/6688) adds is not adopted.
  The one branch that stays is Popover's own: explicit width, else
  trigger-matching minimum.

### What the other consumers inherit without a record change

- `DropdownMenu` and `DropdownMenuSubMenu` drop their `MENU_*` gutter
  constants and read the runtime's. `menuWidth` has the same defect as
  `Popover.width`: `resolveMenuWidth` wraps a length as
  `min(<length>, calc(100% - gutter))`, so an explicit `menuWidth` on an
  aligned menu near an edge renders narrower than asked. Under FR7 the clamp
  becomes the viewport cap. The 300px block cap stays as the component's
  lower cap (FR3).
- `BaseTypeahead` drops its `TYPEAHEAD_*` constants. It has the defect twice:
  `menuWidth` sets a `width` under the span cap, and its match-trigger
  `min-width: anchor-size(width)` is unclamped, so an input wider than the
  span overflows. Both resolve under FR2 and FR7.
- `ComplexSelector` carries a fifth copy, `min(480px, calc(100vh - 32px))`,
  without the safe-area term; it inherits the placement-axis cap and keeps
  480px as its lower cap.
- `Tooltip`, `HoverCard`, `ContextMenu`, the Selector family, `TabMenu`, the
  TopNav menus, and the date inputs render through anchor mode or
  `usePopover` with no viewport fit today. They gain FR1–FR5. A layer that
  already fit is unchanged; one that overflowed the viewport is now capped,
  flipped, or slid.

### Open pull requests

- [#6688](https://github.com/facebook/astryx/pull/6688) is superseded in
  substance. Its width fix is a consequence of FR2 applied at the layer; its
  Popover-local `span-all` fallbacks are FR4 applied at the layer; its
  off-screen behavior is FR5. Its 352px end-aligned case becomes a Layer
  story. Closing it is the owner's call.
- [#6686](https://github.com/facebook/astryx/pull/6686) matches FR1 and FR6
  in substance — a shared gutter module and four per-edge properties — and
  rebases onto the consolidation: its Popover-record edits are replaced by
  this record, and it must drop the span cap it currently preserves (FR2).

## Verification

Stories live under `Core/Layer`. Each row names the claim a person can open
the story to check; "Rendered evidence" says whether real-Chromium geometry
exists for it yet. Popover's stories keep only what is Popover's: scrolling,
focus, dismissal, surface styling.

| Contract      | Verification                                                                                                                                                                  | Representative states                                                                                 | Mutation or failure expectation                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| FR1, FR7      | One gutter module; the four consumers' emitted styles reference it; Layer story "Gutter"                                                                                      | Default gutter at every edge; a layer flush against a viewport edge                                   | A second gutter constant anywhere in `packages/core/src`, or a layer closer to an edge than FR1  |
| FR2           | Layer stories "Explicit size near an edge" and "Content-sized, fits beside trigger"; rendered width                                                                           | 352px end-aligned layer on a trigger 45px from the inline-start edge; a short content-sized layer     | The layer renders narrower than its explicit size, or `100%` of the anchor span appears in a cap |
| FR3           | Layer story "Taller than the viewport"                                                                                                                                        | Content taller than the viewport; a consumer's lower cap                                              | The layer's block size exceeds the viewport minus gutters                                        |
| FR4           | Layer stories "Content-sized, does not fit beside trigger", "Trigger near an edge flips", "Neither side fits"                                                                 | A flip across each axis; a slide while the anchor is in view, on the preferred side then the opposite | A fallback list authored outside the runtime; a layer clipped while a flip or slide would fit it |
| FR5           | Layer story "Anchor leaves the viewport"                                                                                                                                      | Horizontal scroll carries the trigger out of view while the layer is open                             | The layer slides toward the viewport edge after the anchor is gone, or changes size              |
| FR6           | Layer story "App-declared inset"; emitted gutter includes each property                                                                                                       | A persistent bottom bar declared on `:root`; the same story with the declaration removed              | A layer ends under the bar, or an unset property moves a layer                                   |
| FR1 safe area | None in Storybook: `env(safe-area-inset-*)` is set only by a real device; Chromium emulation does not populate it. Evidence is a device run recorded on the consolidation PR. | Landscape phone with a notch on one side                                                              | A layer under the notch                                                                          |

Stories that demonstrate a claim before the consolidation ships show the
shipped defect — the explicit-size story renders 274px on current `main` —
and are the fixtures the consolidation turns green.

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
styles. It removes the drift and keeps the ownership problem — the next
behavior would again be written into whichever component needed it first.

### DEC-2 — A content-sized layer keeps its natural size and moves

**Reference:** `spec:AST-059/DEC-2`
**Decider:** proposed by this record on the owner's observation of
2026-10-03; pending owner approval

A layer that does not fit beside its trigger keeps its natural size and
moves: it flips to the other side, and when neither side fits it slides along
the alignment axis into view (FR4). It is never shrunk to the span beside the
trigger. The span cap did two jobs — it kept a content-sized surface from
overhanging, and it silently shrank an explicit size — and the second is the
defect. Dropping it for every layer means the runtime needs no knowledge of
whether a size was explicit, so `Popover.width` and `DropdownMenu.menuWidth`
become ordinary CSS sizes. Content with no intrinsic width, such as prose,
takes the viewport cap; a caller gives such content a width, as today.

Rejected: shrinking a content-sized layer to fit beside its trigger while
honoring an explicit size up to the viewport. It keeps every label readable
only by truncating it, and it requires the layer to branch on whether a size
was given — the branch whose absence makes the layer width-agnostic.

### DEC-3 — An aligned layer does not slide toward an off-screen anchor

**Reference:** `spec:AST-059/DEC-3`
**Decider:** Cindy Zhang, 2026-10-03

The slide (FR4) serves a visible trigger whose layer fits on neither side. Once
the anchor has left the viewport, the layer holds the position the flips give
it and holds its size (FR5). A layer that kept sliding would pin itself into
the narrowest strip at the edge, giving up room it had a moment earlier for
an anchor nobody can see. Aligned layers ship today with flips only, so this
is the shipped behavior for that state, stated in the ordering rules rather
than left to emerge from a fallback list.

Rejected: closing the layer when its anchor leaves. That is a product
decision about staleness, not a geometry rule, and it would take the layer
away from a person still reading it.

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
component's theme would then govern DropdownMenu, BaseTypeahead, and every
other consumer. Also rejected: a per-layer prop — the bar would be restated
on every surface, and two surfaces could disagree about where the viewport
ends.

## Follow-up work

Ordered so each item can land on its own:

1. **Consolidation.** Add the runtime's gutter module and apply FR1–FR7 in
   `useLayer` anchor mode; remove the four consumers' constants and
   Popover's span cap and width branching; clamp `menuWidth` and
   match-trigger minimums with the runtime's cap; gate the slide on anchor
   visibility. Apply the `architecture:layer-runtime` and `component:Popover`
   deltas above in the same change and move this record to `shipped`.
2. **Story moves.** Move Popover's `ViewportFit` and
   `MatchTriggerViewportFit` under `Core/Layer`; Popover keeps
   `TallContentOverflow` (scrolling is Popover's) and its styling stories.
   Record a device run for the safe-area row.
3. **[#6686](https://github.com/facebook/astryx/pull/6686)** rebases onto 1:
   its gutter module and properties are FR1 and FR6; its Popover-record edits
   and its retained span cap come out.
4. **[#6688](https://github.com/facebook/astryx/pull/6688)** is superseded by
   1; the owner decides its disposition. Its 352px case is already a Layer
   story.
5. **Toast and fullscreen Dialog** read the shared gutter definition and the
   owner decides whether FR6 reaches them.

## Open questions

None. DEC-2 and DEC-4 are proposed here for the owner to approve or
overturn; they are not open designs with alternatives to weigh.
