---
schema_version: 3
template_version: 7
kind: component
id: component:Overlay
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-22
owners: [cixzhang]
review_triggers: [public-api, layout, accessibility]
verified_by:
  [
    packages/core/src/Overlay/Overlay.test.tsx,
    apps/storybook/stories/Overlay.stories.tsx,
  ]
modules: []
families: []
design_specs: [design:bidirectionality]
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:internationalization,
  ]
contributing: []
system_specs: [spec:AST-002/DEC-1, spec:AST-017/FR5, spec:AST-027/FR2]
---

# Overlay component contract

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

This record governs how content is placed at fractional coordinates over an
Overlay's surface, including the stacking of a container that holds such content. Overlay's scrim, reveal modes, strip positions, and
alignment remain described by its source, tests, and `Overlay.doc.mjs` until a
record claims them.

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | New `OverlayRegion` component, exported beside Overlay: `x`, `y` (0–1, required), `width`, `height` (0–1, optional), `children`, `ref`, `xstyle`, `className`, `style`.                                                              |
| Behavior                | A region placed in overlay content centers on (`x`, `y`) as fractions of the overlay surface, sizes to `width`/`height` fractions or to its content, stays inside the surface on sized axes, and scales with it.                     |
| End-user impact         | A caption, tag, or hotspot over an image or video stays on the same spot of the media at every size, in either text direction.                                                                                                       |
| Builder impact          | None by default. A builder places content with `OverlayRegion` instead of hand-written absolute positioning; moving a region stays the builder's code.                                                                               |
| Compatibility/readiness | Additive: a new component and export; an Overlay without a region renders and stacks exactly as before. This record is current authority; `OverlayRegion`, its consumer docs, region tests, and region stories have not shipped yet. |
| Review checks           | Reject coordinates that mirror in right-to-left, JavaScript measurement or observers, drag or resize behavior inside Overlay, a role or focus stop on the region, or a theme target on it.                                           |
| Governing rules         | FR1–FR9 below; `design:bidirectionality/DR5`, `DR6`; `architecture:component-theming-surface/INV4`; `spec:AST-017/FR5`.                                                                                                              |

This table is a review projection; the body below is authoritative.

## Intent

Overlay layers content over a bounded surface, usually media. Some of that
content belongs to a specific spot on the media rather than to an edge of the
surface: a caption drawn into an image, a tag on a face, a hotspot on a
product photo. Those spots are naturally described as fractions of the media's
width and height, because the media is shown at many sizes and the spot must
stay on the same pixels of it. Overlay owns that placement because Overlay owns
the surface the fractions are measured against.

## Compatibility and migration

- Released default preserved: `yes`; an Overlay without a region renders and
  stacks exactly as before. Only a container that holds a region isolates its
  stacking (FR8).
- Compatibility class: additive component and export.
- Controlled/uncontrolled behavior: not applicable; a region holds no state.
- Migration decision: none required (`spec:AST-017/FR5`).

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- `OverlayRegion`: its coordinates, size, clamping, scaling, and reference box.
- The stacking isolation of a container that holds a region.
- The rule that coordinates are measured in the surface's own space.

**Does not own / non-goals**

- Moving, dragging, or resizing a region, including pointer capture, keyboard
  steps, snapping, and when a new position is reported — owned by the product
  callsite (`component:Overlay/DEC-2`).
- What a region paints: borders, fills, handles, and text — owned by the
  region's content.
- Making the base content fill the surface — owned by the caller, as for every
  Overlay; fractions are measured against the surface, so media that does not
  fill it does not line up with them.
- Placement relative to a trigger or outside the surface — owned by the layer
  runtime (Popover, Tooltip, HoverCard).

## Public concepts

| Concept     | Closed values or states                            | Meaning                                                                                                      | Availability by variant/orientation/state | Default      | Owner               | Stability | Invalid-value behavior                                      |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------ | ------------------- | --------- | ----------------------------------------------------------- |
| Coordinate  | `x`, `y`: numbers from 0 to 1                      | The region's center, as fractions of the surface's width and height, measured from its top-left corner.      | Every Overlay and `useOverlay` surface    | Required     | `component:Overlay` | stable    | Clamped into 0–1; a non-finite number is treated as 0       |
| Region size | `width`, `height`: numbers from 0 to 1, or omitted | The region's size as fractions of the surface's width and height; omitted means the region fits its content. | Each axis independently                   | Content size | `component:Overlay` | stable    | Clamped into 0–1; a non-finite number is treated as omitted |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Basis                                                       | Draft review state |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ |
| FR1 | `OverlayRegion` MUST position against the scrim box of the Overlay or `useOverlay` host whose content renders it. Under `position="fill"`, the default, that box is the whole base surface, so 0 and 1 are the media's edges and the box matches the Overlay's `ref`. Under `position="top"` or `"bottom"` that box is the strip, so a region's fractions are of the strip, not the media. Placing a region requires no prop on Overlay.                                                                          | `component:Overlay/DEC-1`                                   | settled            |
| FR2 | On an axis with a size, the region MUST be exactly that fraction of the surface and MUST sit wholly inside it: its left edge (`x` axis) or top edge (`y` axis) is the coordinate minus half the size, clamped between 0 and one minus the size. A region whose coordinate leaves room is centered on the coordinate.                                                                                                                                                                                              | `component:Overlay/DEC-3`                                   | settled            |
| FR3 | On an axis without a size, the region MUST fit its content up to the full surface size on that axis and MUST be centered on the coordinate. Content that then extends past the container's edge is clipped by the Overlay or `useOverlay` container; it is not shifted inward. In a strip, overhang past the strip's edge stays visible over the media up to the container's edge.                                                                                                                                | `component:Overlay/DEC-3`                                   | settled            |
| FR4 | Coordinates and sizes MUST be clamped into 0–1 before FR2 and FR3 apply. A non-finite coordinate MUST resolve to 0, and a non-finite size MUST resolve to omitted.                                                                                                                                                                                                                                                                                                                                                | Invalid-value behavior                                      | settled            |
| FR5 | When the surface changes size, every region MUST keep its fractional center and fractional size without a re-render: placement is expressed in fractions of the surface, never in measured pixels.                                                                                                                                                                                                                                                                                                                | `component:Overlay/DEC-1`                                   | settled            |
| FR6 | `x` MUST be measured from the surface's left edge and `y` from its top edge in every writing direction. A region's coordinates MUST NOT mirror in right-to-left; the region's own content follows the ambient direction.                                                                                                                                                                                                                                                                                          | `design:bidirectionality/DR5`                               | settled            |
| FR7 | A region MUST appear, hide, and become inert with the overlay content that contains it, following Overlay's `showOn` and `isOpen`, and MUST inherit the scrim's media theme. It adds no visibility rule of its own.                                                                                                                                                                                                                                                                                               | Overlay's existing reveal behavior                          | settled            |
| FR8 | Regions MUST paint above the surface's in-flow overlay content, including positioned in-flow content written after them, and later regions MUST paint above earlier ones. An Overlay or `useOverlay` container that holds a region MUST own an isolated stacking context, so that paint order never competes with content outside the overlay; a container without a region keeps its stacking unchanged. A region MUST NOT take part in the scrim's flow layout, so in-flow content keeps its `align` placement. | Absolute positioning within the surface; `spec:AST-027/FR2` | settled            |
| FR9 | Overlay and `OverlayRegion` MUST NOT move, drag, or resize a region, and MUST NOT attach pointer, keyboard, or gesture handlers to it. A region moves only when its caller passes new coordinates.                                                                                                                                                                                                                                                                                                                | `component:Overlay/DEC-2`                                   | settled            |

### Allowed variation

- **AV1 — Content.** Any content may sit in a region; FR2 and FR3 hold per axis,
  so a region may have a fixed width and a content-sized height.
- **AV2 — Surface size and shape.** The surface may be any size or aspect ratio,
  and may change size at any time (FR5).
- **AV3 — Mixed content.** In-flow overlay content and regions may share one
  surface (FR8).

### Representative states

| State                                      | Required invariant                                                                  | Allowed variation     |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------- |
| Sized caption box near the top of an image | Box is the given fraction of the image and centered on (`x`, `y`).                  | Image size.           |
| Sized box whose coordinate is near an edge | Box stays wholly inside the surface, flush with that edge.                          | Which edge.           |
| Content-sized pin                          | Pin's center is on (`x`, `y`).                                                      | Pin content and size. |
| Surface resized from 640px to 320px wide   | Every region keeps its fractional center and size, with no re-render.               | Any surface size.     |
| Right-to-left page                         | Same position on the media as left-to-right; the region's text reads right-to-left. | Writing direction.    |
| `position="bottom"` strip with a region    | Fractions are of the strip box, not the media.                                      | Strip height.         |
| `showOn="hover"` overlay at rest           | Regions are hidden with the rest of the overlay content.                            | Reveal mode.          |

### Transformation and precedence order

- **ORD1 — Placement.** Clamp each value into 0–1 (FR4) → resolve each axis as
  sized (FR2) or content-sized (FR3) → express the result as fractions of the
  surface (FR5). Styling inputs compose after placement in the order
  `architecture:public-component-api/INV6` gives; a caller who overrides inset or
  size properties owns the result.

### Performance and resources

- **PR1 — CSS geometry only.** Placement, clamping, and scaling MUST be achieved
  with arithmetic on the given fractions and CSS: no measurement, observer,
  listener, state, Effect, or extra render pass.

## Accessibility contract

- **AR1 — Presentation only.** `OverlayRegion` MUST add no role, accessible name,
  description, focus stop, or text. Its content keeps its own semantics.
- **AR2 — Source order is reading order.** Assistive technology and keyboard
  focus follow the regions' source order, not their position on the surface. A
  caller renders regions in the order a reader should meet them.
- **AR3 — Movement offers non-drag paths.** Overlay's documented move pattern
  pairs pointer dragging with a single-pointer path that needs no drag, where
  activating a spot on the media moves the region's center there, and a keyboard
  path that moves a focused region by a fixed step per arrow key, with arrow
  directions matching the visual axes (`design:bidirectionality/DR6`).

## Design relationships

| Anatomy or state | Design requirement                                 | Representation authority      | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------- | ----------------------------- | -------------- | ------------------ |
| Region           | Stays on the same spot of the media at every size. | Owner direction               | Supporting     | FR2, FR3, FR5      |
| Region in RTL    | Media is physical content and does not mirror.     | `design:bidirectionality/DR5` | Supporting     | FR6                |

## Family and system relationships

- `design:bidirectionality` owns how physical content behaves in right-to-left;
  FR6 applies DR5 to region coordinates and AR3 applies DR6 to movement.
- `architecture:component-theming-surface/INV4` keeps a non-painting box out of
  the theme surface: the region is a geometry-only box that paints nothing, so it
  has no theme target and its content owns its paint.
- `architecture:public-component-api` owns prop admission and styling-input
  order; ORD1 applies INV6.
- `spec:AST-027/FR2` puts the isolation boundary on the surface; FR8 makes the
  Overlay or `useOverlay` container that holds a region that owner.
- `spec:AST-017/FR5` classifies this as nonbreaking: it adds a new component,
  changes no default, and a caller who never renders a region sees no change.

## Verification map

| Contract                | Verification                                                         | Representative states                                                                                                     | Mutation or failure expectation                                                                                                                                                                                                                           | Audit section          |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR1, FR4, FR9           | `Overlay.test.tsx` region suite                                      | Region in Overlay content and in a `useOverlay` host's content; out-of-range and non-finite input; pointer and key events | Unclamped values, a region outside the scrim, or a region that moves on its own fails.                                                                                                                                                                    | `audit:Overlay/api`    |
| FR2, FR3, FR5, FR6, FR8 | Real-Chromium assertions in the Overlay region story's play function | Sized, edge-clamped, content-sized, resized surface, RTL; a region written before a positioned in-flow control            | A region center or edge off its fraction of the surface by more than 0.5px, the in-flow control hit at the region's center, a region-holding container whose computed `isolation` is not `isolate`, or a container without a region that isolates, fails. | `audit:Overlay/layout` |
| FR7                     | `Overlay.test.tsx` reveal case with a region                         | `isOpen={false}`; the region renders inside the scrim, so every other reveal mode applies to it unchanged                 | A region outside the scrim, or a closed scrim that is not inert, fails.                                                                                                                                                                                   | `audit:Overlay/api`    |
| AR1, AR2                | `Overlay.test.tsx` DOM check of the region element                   | Text content                                                                                                              | Any attribute other than `class` and `style` on the region element, or text it adds, fails.                                                                                                                                                               | `audit:Overlay/a11y`   |
| AR3                     | Region move story's play function                                    | Arrow key and single activation on the media, LTR and RTL                                                                 | ArrowRight moving a region left, or an activation that does not move the region's center to the activated spot, fails.                                                                                                                                    | `audit:Overlay/a11y`   |
| PR1                     | Source review of `OverlayRegion`                                     | All inputs                                                                                                                | A ref read, observer, listener, or Effect added for placement fails review.                                                                                                                                                                               | `audit:Overlay/layout` |

## Decision log

<!-- Record the boundary or requirement, not how it was reached. A rejected alternative is at most one line here, kept only when it is consequential and likely to recur. -->

### DEC-1 — Fractional placement is an Overlay region centered on its coordinate

**Reference:** `component:Overlay/DEC-1`
**Decider:** cixzhang, 2026-10-22

Content tied to a spot on media is placed by an `OverlayRegion` inside Overlay's
content, so it inherits Overlay's surface, reveal, and media theme with no new
Overlay prop. The coordinate names the region's center: a center stays put when
the region's content or the media changes size, and it is the one anchor that
needs no knowledge of the region's own size. A caller holding a corner and a
size passes the corner plus half the size.

Rejected: an anchor prop choosing corners or edges, until a caller needs a point
that a center plus a size cannot express.

### DEC-2 — Moving a region stays at the callsite

**Reference:** `component:Overlay/DEC-2`
**Decider:** cixzhang, 2026-10-22

Placement is the same geometry wherever media carries positioned content, so the
system owns it once. What moving a region means differs by product: whether the
position commits on release or live, the keyboard step, snapping, which regions
move, and what happens while a new rendering of the media loads. Overlay
therefore never moves a region; the caller converts pointer and keyboard input
into new fractions with the Overlay's `ref`, which is the region's reference box
in a fill overlay (FR1), and passes them back.

Rejected: a drag hook on Overlay, because a shared drag primitive needs its own
record and more than one caller's needs.

### DEC-3 — Sized axes are clamped inside the surface; content-sized axes are not

**Reference:** `component:Overlay/DEC-3`
**Decider:** cixzhang, 2026-10-22

A region with a size can be kept inside the surface with arithmetic on the given
fractions, so it never spills off the media however far it is moved. Keeping a
content-sized region inside would require measuring it, which PR1 forbids, so it
stays centered on its coordinate and the surface clips any overhang.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
