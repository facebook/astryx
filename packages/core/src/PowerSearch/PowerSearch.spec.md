---
schema_version: 3
template_version: 3
kind: component
id: component:PowerSearch
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, accessibility]
verified_by:
  [
    packages/core/src/PowerSearch/PowerSearch.test.tsx,
    packages/core/src/PowerSearch/PowerSearchRouting.test.tsx,
    packages/core/src/PowerSearch/PowerSearchTouch.test.tsx,
    packages/core/src/PowerSearch/PowerSearchEditPopover.test.tsx,
    packages/core/src/Tokenizer/Tokenizer.test.tsx,
    packages/core/src/Typeahead/Typeahead.test.tsx,
    packages/core/src/Layer/useLayer.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# PowerSearch component contract

## Intent

PowerSearch provides structured filtering through field, operator, and value
selection. When its pointer/typeahead surface is active, the editor popover keeps
the active editing task readable on both narrow and wide search bars. When the
editor can follow the PowerSearch width, it stays aligned to that outer surface.
When the 720 CSS px readability cap makes the editor narrower, it stays near the
stable control that opened it instead of stretching across the page or depending
on input modality.

## Compatibility and migration

- Released default preserved: `no` for editor popovers anchored to a PowerSearch
  wider than 720 CSS px; other widths preserve their current sizing behavior.
- Compatibility class: intentional default layout and placement change with no
  public API change.
- Controlled/uncontrolled behavior: unchanged.
- Migration decisions: `component:PowerSearch/DEC-1` and
  `component:PowerSearch/DEC-2`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The readable width range of the filter-editor popover.
- Identifying the stable control that opened the editor: the inner typeahead input
  for the add path, or the actual activated token/control for the edit path.
- Choosing which outer PowerSearch edge a width-capped editor aligns to from that
  opening control's geometry.
- Preserving the editing flow, content, and focus behavior while the editor's width
  and horizontal alignment change.

**Does not own / non-goals**

- Main field/search-menu width — the existing `menuWidth` consumer surface is an
  exact pixel width forwarded to Tokenizer's main field menu, not a maximum and not
  an editor width control.
- General anchor positioning, viewport collision handling, top-layer hosting, or
  dismissal — owned by `architecture:layer-runtime`.
- Operator- and value-menu sizing inside the editor.
- A public prop for overriding editor width or placement.
- Pointer-coordinate placement, pointer-versus-keyboard branches, continuous
  pointer tracking, or an always-on geometry observer.

## Public concepts

No public concept or prop is introduced. The inclusive 400–720 CSS px range and
conditional alignment are internal PowerSearch readability policy, not callsite
options. Existing `menuWidth` remains an exact pixel width for only the main
field/search menu.

## Behavioral and layout contract

Current requirements identify their basis and distinguish accepted contract from
implementation status. The contract is authoritative; the behavior remains unshipped
until its implementation and verification complete.

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                                               | Status                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1 | The filter-editor popover MUST have a rendered border-box width no greater than 720 CSS px.                                                                                                                                                                                                                                                                                                          | Owner direction; legibility issue demonstrated by wide PowerSearch adopters                         | Accepted contract; implementation pending |
| FR2 | Before viewport collision handling, the editor's preferred width MUST be the outer PowerSearch width clamped to the inclusive 400–720 CSS px range. The 400 px floor MUST yield when the available viewport width cannot fit it.                                                                                                                                                                     | Existing 400 px editing floor plus `component:PowerSearch/DEC-1`                                    | Accepted contract; implementation pending |
| FR3 | When the 720 CSS px cap does not make the editor narrower than the outer PowerSearch, including when the 400 px floor is active, the editor MUST preserve current logical-start alignment to the outer PowerSearch.                                                                                                                                                                                  | Compatibility requirement                                                                           | Accepted contract; implementation pending |
| FR4 | When the 720 CSS px cap makes the editor narrower, PowerSearch MUST resolve one stable opening control for that open: the inner typeahead input for the add path, or the actual activated token/control for the edit path.                                                                                                                                                                           | Owner direction plus current composition analysis                                                   | Accepted contract; implementation pending |
| FR5 | For a capped editor, PowerSearch MUST compare the opening control's border-box distance from the outer PowerSearch's physical left and right edges, select the nearer outer edge, and align the editor to that edge. Equal distances MUST fall back to the outer PowerSearch's logical-start edge. The result MUST depend on control geometry, not pointer coordinates or pointer/keyboard modality. | `component:PowerSearch/DEC-2`                                                                       | Accepted contract; implementation pending |
| FR6 | Opening-control identity and the selected edge MUST be latched for the open lifetime. Reopening from a control on the opposite side MUST recalculate both; movement after open MUST NOT move the editor.                                                                                                                                                                                             | Stable interaction and performance requirement                                                      | Accepted contract; implementation pending |
| FR7 | Width and preferred-edge selection MUST still yield to the layer runtime's viewport collision handling so the editor remains horizontally visible within the runtime's existing safe area.                                                                                                                                                                                                           | `architecture:layer-runtime`                                                                        | Accepted contract; implementation pending |
| FR8 | The width and alignment change MUST NOT alter editor content, field/operator/value state, vertical placement, focus movement, selection, dismissal, or screen-reader semantics.                                                                                                                                                                                                                      | Compatibility and accessibility requirement                                                         | Accepted contract; implementation pending |
| FR9 | The opening-control descriptor owned by `component:Tokenizer/DEC-1` and consumed by PowerSearch MUST remain package-internal. PowerSearch MUST NOT add a public width, maximum-width, input-ref, or positioning prop for this behavior.                                                                                                                                                              | `component:Tokenizer/DEC-1`, `architecture:public-component-api`, and `component:PowerSearch/DEC-1` | Accepted contract; implementation pending |

### Allowed variation

- **AV1 — Viewport clamping.** The layer runtime may shift or shrink the editor
  when the preferred width or edge alignment would cross its viewport safe area.
- **AV2 — Writing direction.** Implementations may express the selected physical
  edge through logical alignment values as long as the rendered edge is correct in
  both LTR and RTL.
- **AV3 — Submenus.** Operator and value menus may retain their own width and
  collision behavior; this contract applies only to the filter-editor popover.
- **AV4 — Internal representation.** The shared opening-control descriptor may use
  refs, elements, or an equivalent package-internal value. Its observable geometry,
  lifetime, and precedence must satisfy FR3–FR9.
- **AV5 — Adaptive coarse-pointer surface.** Supported coarse-pointer
  configurations may replace the main typeahead and filter-editor popover with one
  field-wide trigger and a filter-management bottom sheet. Capsules in the field are
  display-only and expose no edit or remove controls. The management sheet owns
  a top-right header Add filter action and footer Clear all and Done actions; each
  selected row has a trailing navigation chevron and opens its update sheet when
  pressed, where explicit Cancel and Delete actions are available alongside the edit confirmation.
  The Add filter sheet owns string-valued content search backed by the standard
  PowerSearch suggestion source, rendered as an in-flow divided list directly below
  its input rather than a popover.
  Single- and multi-value enum choices use the same divided value list, with a
  trailing checkmark on each selected row.
  The selected-filter list has no separate visible heading. When there are no selected
  filters, every interactive configuration opens directly to Add filter. Back from
  direct Add filter entry dismisses to the field-wide trigger, while Add filter opened
  from management returns there. Clear all removes every editable filter and dismisses the sheet. Every sheet button action MUST
  expose at least a 44×44 CSS px touch target. Input controls retain their established
  component sizes. Field-picker Back, value-sheet Cancel, and the mode-specific Add filter or Edit filter confirmation
  MUST return focus to the control that launched the preceding step; removing a row
  MUST prefer the adjacent row before falling back to Add filter. FR1–FR9 apply whenever
  the popover surface is active; they do not impose popover geometry on the bottom
  sheet. Configurations with nested filters or configured token overflow retain the
  pointer/typeahead surface and therefore remain under this contract.

### Representative states

| State                                                   | Required invariant                                                                                              | Allowed variation                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Outer PowerSearch narrower than 400 px                  | Editor prefers 400 px and logical-start alignment to the outer surface, but yields to available viewport width. | Layer runtime may shift or shrink it to remain visible. |
| Outer PowerSearch from 400 through 720 px               | Editor matches the outer surface and remains logical-start aligned.                                             | Existing vertical collision behavior may flip.          |
| Wider than 720 px; add from inner input near left       | Editor is 720 px wide and prefers the outer surface's physical left edge.                                       | Viewport collision handling may shift it.               |
| Wider than 720 px; add from inner input near right      | Editor is 720 px wide and prefers the outer surface's physical right edge.                                      | Viewport collision handling may shift it.               |
| Wider than 720 px; edit a token/control near either end | Editor is 720 px wide and prefers the outer edge nearest that activated control.                                | Custom token markup may vary; identity remains exact.   |
| Wider than 720 px; opening control is equidistant       | Editor is 720 px wide and uses the outer surface's logical-start edge.                                          | Direction determines the physical start edge.           |
| Pointer, keyboard, or programmatic activation           | The same stable opening control produces the same preferred edge regardless of activation modality.             | Focus behavior remains unchanged.                       |
| Reopen from a control on the opposite side              | Opening-control identity and preferred edge are recalculated for the new open, then remain latched until close. | Later layout changes do not move the open editor.       |

### Transformation and precedence order

- **ORD1 — Width.** Resolve outer PowerSearch width → apply the 400 px readable
  floor → apply the 720 px readable ceiling → yield to available viewport width.
- **ORD2 — Opening control.** Resolve the stable inner input or activated
  token/control for the current open.
- **ORD3 — Horizontal alignment.** If the ceiling did not narrow the editor, use
  outer logical start. Otherwise compare the opening control's physical edge gaps
  inside the outer PowerSearch → choose the nearer outer edge → use outer logical
  start on a tie.
- **ORD4 — Collision.** Let the layer runtime apply viewport collision handling
  after preferred width and edge selection.

### Performance and resources

- **PR1 — One batched open-time read.** PowerSearch MUST read the outer PowerSearch
  and opening-control geometry together once in response to open intent, never
  during React render.
- **PR2 — Hidden commit before show.** Placement state MUST commit while the editor
  popover is hidden, and the popover MUST show on the next animation frame. Real
  Chromium verification MUST prove there is no first-frame flash at a default or
  stale position.
- **PR3 — Latch, do not track.** The resolved opening control and preferred edge
  MUST remain latched until close. The implementation MUST NOT install continuous
  pointer tracking or an always-on geometry observer.
- **PR4 — CSS owns responsive geometry.** CSS anchor sizing and the layer runtime
  MUST own the 400–720 width policy and collision behavior. JavaScript may select
  the per-open anchor/alignment descriptor but MUST NOT continuously calculate
  popup width or collision offsets.

## Accessibility contract

- **AR1 — Modality equivalence.** Pointer, keyboard, and programmatic activation of
  the same control MUST resolve the same preferred edge. Keyboard users retain the
  current field selection, editor focus, traversal, apply/cancel, Escape, and
  focus-return behavior.
- **AR2 — Semantic stability.** Width and placement MUST NOT change the current
  combobox, listbox, option, menu, or editor semantics and accessible names.
- **AR3 — Visible content.** Viewport clamping MUST keep all editor controls
  horizontally reachable without requiring page-level horizontal scrolling.

- **AR4 — Adaptive focus continuity.** Touch-sheet Back, Cancel, and confirmation actions MUST
  restore focus to the control that launched the preceding step. Removing a
  selected-filter row MUST move focus to the nearest remaining editable row, or Add
  filter when no such row remains. Clear all MUST dismiss the sheet and restore focus
  to the field-wide trigger.

## Design relationships

| Anatomy or state        | Design requirement                                                                                                                                                                                           | Representation authority       | Hierarchy role | Component contract      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------- | ----------------------- |
| Search field and tokens | Continue presenting the structured query and its current interaction states.                                                                                                                                 | Current source and public docs | Prominent      | FR8                     |
| Main field/search menu  | Retain its exact `menuWidth` surface and current selection behavior; it does not inherit the editor's 720 px cap.                                                                                            | Current source and public docs | Prominent      | Ownership boundary, FR9 |
| Touch field             | Act as one field-wide launcher; render capsules without per-capsule edit or remove controls.                                                                                                                 | `component:PowerSearch/AV5`    | Prominent      | AV5                     |
| Touch management sheet  | Own selected-row navigation; omit a redundant list heading, place Add filter at the header's top-right, keep Clear all plus Done in the footer, and expose explicit Cancel and deletion from the edit sheet. | `component:PowerSearch/AV5`    | Prominent      | AV5                     |
| Touch Add filter sheet  | Own structured field selection and content search, rendering suggestion results as an inline divided list below the input rather than a popover.                                                             | `component:PowerSearch/AV5`    | Prominent      | AV5                     |
| Filter-editor popover   | Stay within the readable 400–720 px range before viewport clamping.                                                                                                                                          | `component:PowerSearch/DEC-1`  | Prominent      | FR1–FR3, FR7            |
| Width-capped editor     | Prefer the outer edge nearest the stable opening control, independent of activation modality.                                                                                                                | `component:PowerSearch/DEC-2`  | Prominent      | FR4–FR8                 |
| Keyboard-opened editor  | Use the same control-geometry rule and preserve current focus behavior.                                                                                                                                      | Accessibility contract         | Prominent      | FR5, FR8, AR1           |

The pointer proposal changes editor geometry only. The adaptive touch variation
changes interaction placement without introducing a public configuration concept or
new theme target.

## Family and system relationships

- `architecture:layer-runtime` owns anchor wiring, collision fallbacks, viewport
  safety, top-layer hosting, and visibility reconciliation. PowerSearch supplies
  its per-open preferred width source, stable opening control, and edge choice.
- `architecture:interaction-modality` continues to own shared modality state, but
  the editor placement result intentionally does not branch on modality.
- `architecture:public-component-api` owns the public-surface bar. Width and
  placement remain internal because they are component usability invariants rather
  than adopter policy.
- `family:overlay-dismissal` continues to own shared Escape and platform-close
  ordering; this proposal changes no dismissal behavior.
- `component:Tokenizer/DEC-1` is current authority for the package-internal stable
  outer-field/opening-control descriptor and its safe fallback semantics.
  PowerSearch consumes that identity only after resolving an editor narrower than
  the outer field; Tokenizer contributes no PowerSearch width policy.

### Current dependency

`component:Tokenizer` is current authority on `main` and satisfies PowerSearch's
opening-control prerequisite. Its DEC-1 owns the package-internal descriptor,
modality-neutral edge choice, hidden placement commit, one-read open preparation,
and collision-last ordering that this record consumes. Both current contracts still
mark implementation and focused real-Chromium verification as pending.

### Required visual evidence stories

- PowerSearch MUST provide dedicated wide-field evidence above 720 CSS px with the
  editor already open in the captured state. The matrix MUST cover opening controls
  near the outer start edge, outer end edge, and equidistant; keyboard activation;
  LTR and RTL; narrow-viewport collision; and the first painted frame with no
  default-position flash.
- Separate Tokenizer evidence stories MUST cover its unchanged full-width menu,
  wrapped-token and `unfocusedLayer` states, RTL, and viewport collision. Those
  stories verify the package-internal opening-control prerequisite; they MUST NOT
  inherit PowerSearch's 400–720 editor width policy.

## Verification map

| Contract         | Verification                                                   | Representative states                                                                                          | Mutation or failure expectation                                                                    | Audit section                     |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1–FR3, FR7     | PowerSearch unit tests plus real-Chromium geometry assertions  | 399/400, 720/721, wide outer surface, narrow viewport, LTR/RTL, collision                                      | Removing either clamp, capping the main menu, or allowing viewport overflow fails.                 | `audit:PowerSearch/layout`        |
| FR4–FR6, FR9     | Opening-path tests plus real-Chromium geometry assertions      | Add from inner input; edit actual left/right/equidistant token/control; pointer/keyboard; reopen opposite side | Using pointer coordinates, modality, wrapper-only identity, stale identity, or public props fails. | `audit:PowerSearch/interaction`   |
| PR1–PR4          | Instrumented unit tests plus first-frame real-Chromium capture | Open, close, reopen opposite side; hidden placement commit; first painted frame                                | Render-time reads, repeated reads, observers, pointer tracking, or a default-position flash fails. | `audit:PowerSearch/performance`   |
| FR8, AR1–AR3     | Existing PowerSearch/editor suites plus focused browser checks | Pointer and keyboard edit, apply, cancel, Escape, light dismiss, focus return, selection, semantics            | Focus, semantics, selection, dismissal, or reachability changes fail.                              | `audit:PowerSearch/accessibility` |
| Record structure | `scripts/check-knowledge.mjs`                                  | Component-contract schema and current-authority dependency                                                     | Missing or invalid metadata and sections fail repository validation.                               | `audit:PowerSearch/knowledge`     |

Current-source Chromium evidence establishes the geometry gap, not implementation
completion:

- At an 800 px PowerSearch with many filters, the active inner input's logical text
  start was 570.8 px inward from the outer edge while the editor remained aligned
  to the outer 800 px surface.
- In a 400 px Tokenizer with two selected tokens, the active inner input's logical
  text start was 242.3 px inward while the suggestion surface remained aligned to
  the outer wrapper. The same magnitude reproduced in LTR and RTL.

Completion still requires real-Chromium proof at the 400 and 720 boundaries, a
narrow viewport, opening controls near both edges and equidistant, reopen from the
opposite side, pointer and keyboard activation, LTR and RTL, collision handling,
first-frame stability, and unchanged focus, selection, and dismissal.

## Decision log

### DEC-1 — PowerSearch owns one internal readable editor width

**Reference:** `component:PowerSearch/DEC-1`
**Decider:** `cixzhang`, 2026-08-31

A very wide editor makes a small field/operator/value task harder to scan, while a
callsite width prop would turn readability policy into permanent public API and
produce inconsistent products. PowerSearch therefore owns one internal preferred
range: outer PowerSearch width clamped to 400–720 CSS px, then constrained by the
viewport. This rule does not change Tokenizer's main-menu sizing or PowerSearch's
existing exact-pixel `menuWidth` surface.

Rejected: a public editor width/max-width prop, applying the 720 cap to Tokenizer's
main menu, or treating `menuWidth` as an editor width.

### DEC-2 — Only a capped editor follows the stable opening control

**Reference:** `component:PowerSearch/DEC-2`
**Decider:** `cixzhang`, 2026-08-31

A full-width or floor-expanded editor remains aligned to the outer PowerSearch.
Only when the 720 px ceiling makes the editor narrower does PowerSearch use the
stable opening control to choose the nearer outer edge. The add path uses the
inner typeahead input; the edit path uses the actual activated token/control. The
control's geometry produces the same result for pointer, keyboard, and programmatic
activation, and the result is latched until close.

Rejected: pointer-coordinate placement, pointer-versus-keyboard branches, always
using one edge, anchoring every width to the inner control, continuous tracking,
render-time geometry reads, and showing before hidden placement state commits.

## Open questions

None. The contract is accepted and current. Implementation and focused real-Chromium
verification remain pending.

## Content boundary

This file does not duplicate consumer prop tables, configuration examples,
operator/value editor internals, current audit results, implementation steps, or
shared layer positioning and dismissal rules. It links to their owners.
