---
schema_version: 3
template_version: 1
kind: module
id: module:Table/useTableColumnResize
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-10
owners: [cixzhang]
review_triggers: [behavior, layout, visual, accessibility]
verified_by:
  [
    packages/core/src/Table/plugins/columnResize/useTableColumnResize.test.tsx,
    scripts/check-knowledge.mjs,
  ]
parent_component: component:Table
references:
  [
    component:Table,
    architecture:interaction-modality,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
---

# useTableColumnResize module contract

## Intent

`useTableColumnResize` lets a person change a column's width from its trailing
boundary. This record owns what that boundary looks like before anybody drags it:
when a column boundary is drawn, how far the drawn line runs, which pointer
capabilities see it, and what else on the header may change while it is shown.

Width resolution, per-column minimums, proportional-neighbor behavior, the commit
callback, and the module's configuration remain uncontracted. This record is their
canonical owner when they are recorded; today it states only the affordance, its
extent, and its modality.

## Compatibility and migration

- Released default preserved: `no` for the resting appearance of a hovered header
  under a hover-capable pointer; `yes` for public API, DOM shape, keyboard
  behavior, coarse-pointer behavior, and every width outcome.
- Compatibility class: presentation-only change to one transient state. No public
  API, prop, export, target, or accessibility mapping is added or changed.
- Migration decision: none. No consumer edit and no codemod.

This specification-only change carries no package Changeset. The implementation
pull request owns runtime code, tests, and its Changeset.

## Ownership boundary

**Owns**

- Presence and placement of one resize boundary control per resizable column, and
  its pointer target versus its drawn indicator.
- The disclosure contract: which boundaries are drawn at rest, on header hover, on
  pointer, on visible focus, and during drag, and the precedence between them.
- The vertical extent of the drawn indicator and the requirement that it never
  makes the Table scroll region scroll vertically.
- Which pointer capabilities receive the affordance at all.
- The bound on what else header hover may change.

**Does not own / non-goals**

- Aggregate `TablePlugin` protocol, transform phases, plugin ordering, and header
  row and header cell render slots — owned by `component:Table`.
- Shared modality state and focus-indicator visibility rules — owned by
  `architecture:interaction-modality`.
- Public theme targets and token exposure — owned by
  `architecture:component-theming-surface`. No `table-resize-handle` target is
  approved by this contract.
- Sort, selection, column-settings, or any other header control's own hover, focus,
  and press treatments.
- Width computation, clamping, commit semantics, RTL width math, and the module's
  configuration surface. They stay in consumer docs until this record contracts
  them.

## Public API and concepts

This contract adds no public API. Consumer signatures, defaults, and examples
remain in `useTableColumnResize.doc.mjs`.

| Concept            | Closed values or states          | Meaning                                                     | Default                            | Owner                               | Stability |
| ------------------ | -------------------------------- | ----------------------------------------------------------- | ---------------------------------- | ----------------------------------- | --------- |
| Boundary control   | Present or absent per column     | One resizable boundary at a column's trailing inline edge.  | Present for every resizable column | `module:Table/useTableColumnResize` | Stable    |
| Disclosure state   | `hidden`, `hinted`, `emphasized` | How strongly one boundary is drawn right now.               | `hidden`                           | `module:Table/useTableColumnResize` | Stable    |
| Pointer capability | Hover-capable or coarse          | Whether the affordance exists and whether hover reveals it. | Derived from the input             | `architecture:interaction-modality` | Stable    |

## Behavioral contract

| ID  | Invariant                                                                                                                                                                                                                                                                           | Basis                                                  | Implementation/evidence state                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| FR1 | Each resizable column receives one boundary control at its trailing inline edge, with a pointer target wider than the drawn indicator so the line stays hairline while the grab area stays usable. A column that opts out of resizing, and a generated plugin column, receive none. | Current source and docs                                | Verified current behavior; sizes are source-inspected.          |
| FR2 | The drawn indicator runs from the top of the header through the body rows so a drag reads against the rows it moves. It MUST end at or above the table's bottom edge and MUST NOT make the Table scroll region scroll vertically; that region exists for horizontal overflow only.  | Owner direction, 2026-09-10                            | Current release overhangs the last row; correction pending.     |
| FR3 | With no hover-capable pointer in the header row, no visible focus on a boundary, and no drag in progress, every boundary is `hidden`.                                                                                                                                               | Current source and docs                                | Verified current behavior.                                      |
| FR4 | While a hover-capable pointer is anywhere inside a header row, every boundary in that row is `hinted` at border weight at the same time. The boundaries return to `hidden` when the pointer leaves the row.                                                                         | Owner direction, 2026-09-10 (DEC-1)                    | Owner-directed; implementation and focused coverage pending.    |
| FR5 | A boundary under the pointer, a boundary with a visible focus indicator, and the boundary being dragged are `emphasized` at accent weight, over any `hinted` state.                                                                                                                 | Current source plus DEC-1                              | Pointer and focus states verified; hint interaction pending.    |
| FR6 | Hover disclosure applies only to hover-capable pointers. Where the pointer is coarse, the module renders no boundary control at all, so disclosure changes nothing there.                                                                                                           | Current source and `architecture:interaction-modality` | Coarse-pointer suppression verified; hover gate pending.        |
| FR7 | Header hover changes only these indicators. It MUST NOT change header background, label, cursor, layout, column width, or any body-row treatment, and MUST NOT alter another header control's own states.                                                                           | Owner direction, 2026-09-10                            | Owner-directed; focused coverage pending.                       |
| FR8 | Resizing stays available without hover. A boundary remains in tab order with its accessible name and values, keyboard resize is unchanged, and the reveal adds discovery only — it is never a precondition for use.                                                                 | Current source and WAI-ARIA splitter pattern           | Keyboard path verified; hover-independence is source-inspected. |

### Transformation and precedence order

- **ORD1 — Disclosure precedence.** Drag, visible focus, and pointer-on-boundary
  resolve to `emphasized`; otherwise header-row hover resolves to `hinted`;
  otherwise `hidden`. A boundary's own state always outranks the row-level hint, so
  the boundary under the pointer reaches accent while its neighbors stay at border
  weight.
- **ORD2 — Reveal scope.** The reveal is published once at header-row scope, not per
  cell, so entering the header anywhere reveals every boundary in that row together
  rather than the one under the pointer.
- **ORD3 — Parent pipeline.** The module contributes its header row and header cell
  transforms at the position `component:Table` gives it and does not redefine plugin
  order.

### Performance and resources

- **PR1 — Disclosure costs no render.** Entering or leaving the header MUST NOT set
  React state, add a listener or timer, or rerender the Table. Disclosure is a
  declarative style state.
- **PR2 — One measurement path.** Indicator extent reuses the module's existing
  shared resize observation of the table. Disclosure adds no observer, and extent
  measurement MUST NOT observe anything whose size the indicator itself changes.

## Accessibility contract

- **AR1 — Unchanged semantics.** Each boundary keeps its separator role, vertical
  orientation, accessible name naming its column, and current value bounds.
- **AR2 — Decorative disclosure.** `hinted` is presentation only. It changes no ARIA
  state, announces nothing, and does not enter or reorder tab order.
- **AR3 — Parity without hover.** Keyboard focus draws the same boundary at accent,
  so a person who never hovers gets an equal cue at the moment it is useful.
- **AR4 — Honest strength claim.** The `hinted` weight is a discovery aid, not a
  state indicator. This contract makes no non-text contrast promise for it and MUST
  NOT let it become the only signal that a control is available; `emphasized` and
  the focus indicator carry that signal.
- **AR5 — Motion restraint.** Any transition on disclosure MUST remain a short
  color change and MUST NOT move layout or the indicator's position.

## Design relationships

| Anatomy or state      | Design requirement                                                                   | Representation authority            | Module contract |
| --------------------- | ------------------------------------------------------------------------------------ | ----------------------------------- | --------------- |
| Boundary control      | Offers a grabbable column edge without drawing a permanent divider.                  | `module:Table/useTableColumnResize` | FR1, FR6        |
| `hidden` boundary     | Keeps a resting header free of controls the person is not using.                     | `module:Table/useTableColumnResize` | FR3             |
| `hinted` boundary     | Answers "can these columns move?" at the moment attention enters the header.         | `module:Table/useTableColumnResize` | FR4, FR7, AR4   |
| `emphasized` boundary | Names the one boundary that pointer, focus, or drag is acting on.                    | `module:Table/useTableColumnResize` | FR5, ORD1       |
| Indicator extent      | Reads the drag against the rows it resizes, without changing what the table scrolls. | `module:Table/useTableColumnResize` | FR2             |

### Theming

No public target is approved for the boundary control or its indicator, and the
module's consumer doc records no anatomy of its own. This contract therefore adds
no `anatomy-theming:v1` block; a direct target requires its own review under
`architecture:component-theming-surface` with synchronized consumer anatomy.

## Parent and system relationships

- `component:Table` owns the plugin protocol, ordering, header row and header cell
  slots, and the scroll region this contract's FR2 protects. Table's aggregate
  record does not own column-resize anatomy, which is why this boundary is separate.
- `architecture:interaction-modality` owns hover capability versus modality history
  and the visibility rules for the shared focus indicator. FR6 and AR3 apply those
  rules; they do not restate them.
- `architecture:component-theming-surface` owns target qualification. Structural
  custom properties used to carry extent and hint values are implementation, not
  theme surface.
- `architecture:public-component-api` owns the public boundary. This record adds no
  export, prop, or type.

## Verification map

| Contract      | Verification                                                                                     | Representative states                                                        | Mutation or failure expectation                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR6      | `useTableColumnResize.test.tsx` boundary-presence cases plus a coarse-pointer case               | Resizable, opted-out, and generated columns; fine and coarse pointers        | A boundary appears on a non-resizable column, disappears from a resizable one, or renders for a coarse pointer.               |
| FR2           | Browser measurement of scroll-region vertical overflow with the plugin enabled                   | Short and tall tables, wrapped and single-line headers, dense and default    | The indicator ends below the last row or the scroll region gains vertical scroll that the same table lacks without resize.    |
| FR3-FR5, ORD1 | New focused tests for resting, header-hovered, pointer-on-boundary, focused, and dragging states | Rest, header hover, hover plus pointer on one boundary, keyboard focus, drag | A resting header draws boundaries, header hover misses a boundary, or the pointed/focused boundary fails to outrank the hint. |
| FR7           | Snapshot or assertion that header hover changes no other header or row treatment                 | Header hover over a sortable and a selectable header                         | Header hover changes background, label, cursor, width, or another control's state.                                            |
| FR8, AR1-AR3  | Existing keyboard and ARIA suites plus assistive-technology spot check                           | Tab to boundary, arrow resize, screen-reader navigation of the header        | The boundary leaves tab order, loses its name or values, or the hint reaches the accessibility tree.                          |
| PR1, PR2      | Render-count assertion around header pointer enter/leave; observer inspection                    | Pointer enters and leaves the header repeatedly                              | Disclosure rerenders the Table, adds a listener, or the extent measurement observes what it resizes.                          |
| Record shape  | `scripts/check-knowledge.mjs`                                                                    | Colocated module record, canonical id and filename, parent backlink          | A missing, misnamed, mis-parented, or unlinked record passes validation.                                                      |

Browser, render-count, and assistive-technology evidence are pending. Passing this
specification pull request proves record integrity only.

## Decision log

### DEC-1 — The header discloses every resizable boundary on hover

**Reference:** `module:Table/useTableColumnResize/DEC-1`
**Decider:** cixzhang, 2026-09-10

A boundary drawn only once the pointer is already inside its grab area asks the
person to suspect the column is resizable before they can find out. Entering the
header now reveals every boundary at border weight, and the boundary under the
pointer still takes accent, so discovery and targeting stay distinguishable. The
reveal is bounded by FR7 and is pointer-only by FR6.

Rejected: revealing only the boundary under the pointer, which keeps the discovery
problem; drawing permanent dividers, which adds a resting visual the columns do not
earn; relying on the resize cursor alone, which requires the same prior suspicion;
and a public prop to opt out, which makes a discovery affordance a caller decision.

### DEC-2 — The indicator is bounded by the table it belongs to

**Reference:** `module:Table/useTableColumnResize/DEC-2`
**Decider:** cixzhang, 2026-09-10

A full-height indicator is the intended design because a drag has to read against
the rows it moves. An indicator that ends past the last row is a defect, not an
allowed variation: the scroll region promotes vertical overflow as soon as it
scrolls horizontally, so an invisible overhang becomes visible stray scrolling.
Ending a fraction short of the last row is within FR2; hanging past it is not.

Rejected: leaving the overhang and suppressing vertical scroll on the region, which
would hide real overflow from other content.

## Open questions

- **OQ1 — Forced colors.** How do `hinted` and `emphasized` resolve under forced-colors
  and high-contrast modes? (`checkable`)
- **OQ2 — Theme selection.** Should the hint weight ever be theme-selectable, or does
  it stay component-owned? (`human-design`)
- **OQ3 — Coarse pointers.** Resizing has no coarse-pointer path at all today. Is a
  non-pointer affordance wanted, or is that a settled non-goal? (`human-design`)
- **OQ4 — Draft design record.** `design:user-states` is draft. When it is promoted,
  its conditional-hover requirement should be cited here instead of restated.

## Content boundary

This record does not duplicate consumer signatures or examples, the parent Table
plugin protocol, shared modality mechanics, theme target policy, width computation,
current audit results, or implementation steps. It links to their owners.
