---
schema_version: 3
template_version: 3
kind: component
id: component:Tokenizer
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-19
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, accessibility]
verified_by:
  [
    packages/core/src/Tokenizer/Tokenizer.test.tsx,
    packages/core/src/Typeahead/Typeahead.test.tsx,
    packages/core/src/Layer/useLayer.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:input-fields, family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-002/DEC-1]
---

# Tokenizer component contract

| Area                    | Contract                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TokenizerProps` gains optional `isLoading` and `changeAction`, exposing `family:input-fields` concepts. `hasEntriesOnFocus` gains a defined post-selection lifecycle with no prop, type, export, or syntax change.                               |
| Behavior                | A committed empty-query bootstrap choice keeps remaining eligible loaded choices open, filters committed IDs, and advances the active option; terminal states close safely.                                                                       |
| End-user impact         | People selecting several loaded values can continue without reopening the menu, while disabled, loading, exhausted, and dismissed states remain non-interactive.                                                                                  |
| Builder impact          | No migration: existing opt-in callers need no refetch, and typed-query selection remains unchanged. New optional choices: `isLoading` marks a busy value; `changeAction` runs a save as a Transition Action.                                      |
| Compatibility/readiness | The default `hasEntriesOnFocus={false}` path and direct single-select BaseTypeahead remain unchanged. This decision is current and owner-approved; implementation and exact-head interaction evidence remain pending in #6360.                    |
| Review checks           | Reject implementations that filter by label instead of ID, reorder eligible choices, lose focus or a valid active descendant, refetch unnecessarily, or let disabled, exhausted, dismissed, or stale-loading states remain interactive or reopen. |
| Governing rules         | This canonical `component:Tokenizer` record: [FR13–FR15](#behavioral-and-layout-contract), [AR5](#accessibility-contract), and [DEC-2](#dec-2--focus-bootstrap-supports-consecutive-committed-selections).                                        |

## Intent

Tokenizer lets a person build and edit a set of searchable values as removable
tokens around one stable combobox input. It owns the field surface, token/input
layout, suggestion-menu relationship, and the package-internal identity needed to
open a related surface from the control where the task began.

This record preserves shipped Tokenizer facts and defines two component-owned
contracts: one package-internal opening-control descriptor for Core peers, and the
post-selection lifecycle of an empty-query bootstrap menu. The descriptor lets
Layer prepare placement without exposing DOM refs, pointer coordinates, or width
policy to consumers. The dependent [PowerSearch draft](https://github.com/facebook/astryx/pull/5804)
remains evidence for the need, not authority for this record.

## Compatibility and migration

- Released default preserved: `yes`; `isLoading` defaults to `false` and
  `changeAction` to unset, which renders and behaves exactly as shipped, and
  the default `hasEntriesOnFocus={false}` path is unchanged.
- Compatibility class: additive. The exported `TokenizerProps` declaration
  gains two optional members, `isLoading?: boolean` and
  `changeAction?: (items: T[], change: TokenizerChange<T>) => void | Promise<void>`.
  Existing props, targets, DOM, and styling are unchanged, and nothing changes
  without the new props except the `family:input-fields` FR4 fix: a field
  disabled with a reason no longer removes a token (Backspace or a custom
  token's remove callback) or selects one from the keyboard. The
  opening-control descriptor stays package-internal. Separately, an
  intentional behavior correction for the existing opt-in `hasEntriesOnFocus`
  mode: a committed selection from its current empty-query bootstrap cohort
  keeps the remaining eligible loaded choices available instead of closing the
  menu after every choice.
- `isLoading` is additive. It marks the value busy — one Spinner in the end
  lane plus `aria-busy` on the combobox — and never means the option source is
  pending (`spec:AST-001`). `changeAction` is additive. Before it, an add,
  remove, or clear only reported through `onChange`. After it, `onChange` still
  runs first, then the Action runs inside a transition while the proposed
  token list shows as busy until the controlled `value` accepts or replaces it
  (`family:input-fields` FR5–FR7). The clear-all control follows the
  accepted `value`, as Selector's clear does, while the tokens follow the
  proposal.
- Controlled/uncontrolled ownership is unchanged. Retention follows committed
  controlled values; a proposed value that the caller has not accepted remains
  available. The one addition is a `changeAction` proposal still pending: its
  tokens are on screen, so FR13 filters them from the cohorts like committed
  ones until the proposal ends, and one the caller did not accept is eligible
  again.
- Migration decision: none. Existing callers that omit `hasEntriesOnFocus`, typed
  search selection, explicit dismissal, disabled state, maximum-entry state, and
  source-loading behavior retain their prior boundaries.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The token collection, stable native search input, and painted outer field/control
  surface that contains them.
- The lifecycle of Tokenizer's own focus-bootstrapped suggestion menu after a
  committed selection, including selected-value exclusion, next-option choice,
  focus continuity, and terminal close states.
- The active opening control for a task initiated within Tokenizer: the inner input
  for add/search work or the actual activated token/control for edit work.
- The identity, usability, lifetime, and safe fallback semantics of those elements
  in one package-internal descriptor.
- Tokenizer's current suggestion-menu width and minimum-anchor-width behavior.
- Token wrapping and the `none`, `unfocusedInline`, and `unfocusedLayer` overflow
  presentations.

**Does not own / non-goals**

- General BaseTypeahead selection policy. Direct single-select BaseTypeahead and
  Typeahead keep their select-clear-close-refocus lifecycle.
- A new rule for typed-query selection or a requirement to refetch suggestions
  after each Tokenizer selection.
- General anchor positioning, top-layer hosting, viewport collision, generated
  anchor names, or prepared-placement lifecycle — owned by
  `architecture:layer-runtime`.
- PowerSearch editor sizing, including its proposed 400–720 CSS px range — owned
  by `component:PowerSearch` if that draft is approved.
- A public input ref, opening-control ref, anchor descriptor, maximum menu width,
  coordinate, placement, or pointer-tracking API.
- A change to released `menuWidth` semantics. It remains an exact preferred pixel
  width whose rendered menu does not shrink below the Tokenizer outer field.
- Consumer-provided token content and visuals. Tokenizer owns only the capture
  boundary needed to identify the control that activated an internal open.

## Public concepts

`isLoading` and `changeAction` are input-field family concepts adopted from
`family:input-fields` (FR5–FR7, DEC-2, DEC-3), not Tokenizer-owned concepts.
Tokenizer owns only the Action's argument shape, which mirrors `onChange`:
`(items: T[], change: TokenizerChange<T>)`. Search busy stays
BaseTypeahead-owned; both meanings share the one end-lane Spinner and the
combobox `aria-busy`.

No Tokenizer-owned public concept is introduced: `isLoading` and `changeAction`
newly expose the two family concepts above as optional props, and no other
public concept is added. Existing consumer props and usage remain in
`Tokenizer.doc.mjs`. The existing `hasEntriesOnFocus` mode now includes the
component-owned post-selection behavior in FR13–FR15.

The descriptor is package-internal. It must be absent from exported
`TokenizerProps`, public barrels, generated declarations, consumer docs, CLI
output, and Changesets. Current `handleRef` remains the public focus/blur handle;
it does not become an element or geometry escape hatch.

## Behavioral and layout contract

Each requirement identifies its basis. This current record defines the approved
package-internal contract while implementation and focused verification remain
pending.

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                    | Basis                                                                    | Status                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| FR1  | Tokenizer MUST keep one native combobox input mounted across token addition, removal, clear, ordinary wrapping, and maximum-entry states. Reaching `maxEntries` may make the input zero-width, transparent, and out of flow, but MUST NOT replace its identity.                                                                                                                                                                              | Current source and tests                                                 | Verified current behavior                                 |
| FR2  | Tokenizer's suggestion menu MUST remain associated with the outer field/control surface. Existing `menuWidth` behavior remains an exact preferred pixel width plus the outer field's minimum width; it is not a maximum.                                                                                                                                                                                                                     | Current BaseTypeahead/Tokenizer source and docs                          | Verified current behavior; preserve                       |
| FR3  | `unfocusedInline` MAY replace direct token layout with OverflowList while blurred. `unfocusedLayer` MAY keep the real wrapper/input mounted in a context layer while an ordinary-flow placeholder represents the collapsed field.                                                                                                                                                                                                            | Current source, tests, and stories                                       | Verified current behavior                                 |
| FR4  | Tokenizer MUST provide Core peers one package-internal descriptor with stable identities for its outer field/control surface and active opening control. Layer consumes the descriptor; public consumers cannot observe or configure it.                                                                                                                                                                                                     | Approved package-internal contract; #5804 evidence; `spec:AST-002/DEC-1` | Current contract; implementation pending                  |
| FR5  | Add/search opens MUST identify the stable inner input as the opening control before the result row disappears. Selection, query clearing, result removal, refocus, or later input collapse MUST NOT substitute the transient result row or a pointer coordinate.                                                                                                                                                                             | Current selection order plus approved descriptor contract                | Current contract; implementation pending                  |
| FR6  | Edit opens MUST capture the actual activated token/control before state removes or replaces it. The Tokenizer-owned capture path MUST include custom `renderToken` output when activation originates from an identifiable descendant control; it MUST NOT require a new public ref contract.                                                                                                                                                 | Current owned wrapper plus approved capture contract                     | Current contract; implementation pending                  |
| FR7  | A non-null element is usable only while connected, rendered, and geometrically meaningful for the open being prepared. A disconnected, stale, hidden-layer, zero-width, or otherwise unusable opening control MUST fall back safely to the outer field at logical start before show.                                                                                                                                                         | Current max/overflow states plus approved safety rule                    | Current contract; implementation pending                  |
| FR8  | The descriptor MUST remain valid across focus movement, token add/remove/clear, wrapping, and `unfocusedLayer` reparenting. It MUST clear on unmount, perform no DOM work during SSR, and never retain an element beyond the open preparation that uses it.                                                                                                                                                                                  | Approved identity/lifetime contract                                      | Current contract; implementation pending                  |
| FR9  | A consuming surface MUST resolve its preferred width before choosing horizontal placement. A surface at least as wide as the outer field MUST use outer-field logical-start alignment. Only a surface narrower than the outer field may use opening-control geometry.                                                                                                                                                                        | Approved conditional-placement contract                                  | Current contract; implementation pending                  |
| FR10 | For a narrower surface, Layer MUST compare the opening control with the outer field's physical start/end geometry, choose the nearer physical edge, map that result to logical start/end, and use logical start on a tie. Viewport collision runs last.                                                                                                                                                                                      | Approved Layer-consumer contract                                         | Current contract; implementation pending                  |
| FR11 | Opening placement MUST be modality-neutral and latched for one open lifetime. Pointer, keyboard, touch, and programmatic activation of the same control MUST produce the same preferred edge. Pointer movement, later focus movement, resize, or target collapse MUST NOT recompute it.                                                                                                                                                      | `architecture:interaction-modality` plus approved stability contract     | Current contract; implementation pending                  |
| FR12 | Placement state MUST commit while the surface is hidden, and Layer MUST show it on the next animation frame only after anchor, alignment, and width styles exist. A stale or invalid descriptor MUST never cause a visible wrong-position or first-frame flash.                                                                                                                                                                              | Approved no-flash contract                                               | Current contract; implementation pending                  |
| FR13 | Tokenizer MUST exclude every choice whose `SearchableItem.id` is already present in its committed `value` from displayed bootstrap and search cohorts, including results that settle after the controlled value changes. A caller-rejected proposed value remains eligible because it was not committed. Distinct IDs remain eligible even when their labels match.                                                                          | Approved Tokenizer multi-selection contract                              | Current contract; implementation and verification pending |
| FR14 | With `hasEntriesOnFocus` enabled, committing a choice from the current settled empty-query bootstrap cohort MUST keep the input focused and the popup open when another eligible loaded choice remains. The active option advances to the next remaining choice in displayed order; when the committed choice was last, the nearest preceding choice becomes active. `aria-activedescendant` MUST reference that rendered option.            | Approved rapid multi-select lifecycle                                    | Current contract; implementation and verification pending |
| FR15 | The retained popup MUST close and clear its active descendant when no eligible loaded choice remains, `maxEntries` is reached, the control becomes disabled, focus leaves, or the person dismisses it. Disabled Tokenizer remains non-interactive. Pending or stale source work MUST NOT reopen a terminal popup or expose stale choices; loading has no selectable placeholder and its busy state clears when work is cancelled or settles. | Approved terminal-state safety boundary                                  | Current contract; implementation and verification pending |

### Allowed variation

- **AV1 — Token presentation.** Default Token controls and custom `renderToken`
  content may differ visually. The opening-control capture boundary remains
  Tokenizer-owned when an identifiable descendant control initiates activation.
- **AV2 — Overflow presentation.** Tokens may wrap normally, truncate while
  unfocused, or move with the live input into `unfocusedLayer`. These modes may
  change element geometry but not descriptor identity or fallback order.
- **AV3 — Internal representation.** The descriptor may use refs, elements,
  callback registration, or an equivalent Core-private representation. It must
  preserve FR4–FR8 and stay out of public declarations.
- **AV4 — Layer mechanism.** Layer may realize the latched edge through a
  zero-size marker, separate size and position anchors, or another internal
  mechanism that satisfies FR9–FR12 and current Layer architecture.
- **AV5 — Responsive movement.** CSS may follow outer-field movement, container
  resize, writing direction, and collision while open. JavaScript does not
  remeasure or select a new preferred edge until the next open.
- **AV6 — Internal retention mechanism.** Tokenizer and BaseTypeahead may retain,
  project, or otherwise coordinate the settled cohort through a package-private
  mechanism. That mechanism must preserve FR13–FR15, must not become public API,
  and must not change direct single-select BaseTypeahead behavior.

### Representative states

| State                                      | Required invariant                                                                                                                                         | Allowed variation                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Empty field                                | The mounted inner input is the opening control; a full-width menu stays aligned to the outer field.                                                        | Placeholder and bootstrap results may vary.                                              |
| Focus bootstrap, choices remain            | A committed selection is removed from the displayed cohort; the input and popup remain active on the next valid remaining choice.                          | Internal cohort storage and projection may vary.                                         |
| Focus bootstrap, selected choice was last  | The nearest preceding remaining choice becomes active without changing the displayed order.                                                                | Option identity representation may vary.                                                 |
| Focus bootstrap, no choices or max reached | The popup closes and no active descendant remains; pending work cannot reopen it.                                                                          | Source cancellation mechanism may vary.                                                  |
| Source pending or replaced                 | Busy semantics identify pending work; stale work cannot add choices or reopen a terminal popup.                                                            | A settled current cohort may be retained internally.                                     |
| Disabled                                   | No choice can be committed; an open popup closes and clears its active descendant while disabled-reason focusability remains available where configured.   | Native-disabled or focusable-disabled representation follows current Tokenizer behavior. |
| One or many tokens                         | The same input remains after tokens and moves with wrapping; full-width placement does not follow that movement.                                           | Token labels, wrapping rows, and custom content may vary.                                |
| At `maxEntries`                            | The input identity remains mounted but its zero-width/hidden box is unusable as geometry; opening falls back to the outer field.                           | Search remains unavailable under current behavior.                                       |
| Token removal or clear                     | Input identity survives and current refocus behavior remains.                                                                                              | Token count and input position change.                                                   |
| `unfocusedInline`                          | Blurred OverflowList and focused direct-token layouts resolve the same live input identity; a collapsed input is not used as geometry.                     | Visible token count may vary with width.                                                 |
| `unfocusedLayer`, focused                  | The live wrapper/input may be reparented into the context layer without descriptor churn.                                                                  | Corrective portal location may vary.                                                     |
| `unfocusedLayer`, unfocused                | The hidden-layer input is unusable for a new open; the ordinary-flow outer-field fallback is used.                                                         | Placeholder token count may vary.                                                        |
| Default or custom token edit               | The actual activated token/control is captured before edit state changes; if no usable descendant control exists, input then outer-field fallback applies. | Custom token markup may vary.                                                            |
| LTR or RTL                                 | Physical proximity selects an edge only for a narrower surface; logical start wins ties and full-width placement.                                          | Collision may move the final rendered surface.                                           |
| SSR, hydration, or unmount                 | No server geometry read occurs; first client open prepares normally; unmount clears identities and pending show work.                                      | Hydration timing may vary.                                                               |

### Transformation and precedence order

- **ORD1 — Surface width.** Resolve the consuming component's preferred surface
  width. Tokenizer contributes no PowerSearch width value.
- **ORD2 — Full-width decision.** If the preferred surface width is greater than
  or equal to the outer field width, use the outer field and logical start. Do not
  read or apply opening-control geometry to choose an edge.
- **ORD3 — Opening control.** For a narrower surface, use the actual captured
  token/control when available; otherwise use the stable inner input; otherwise
  use the outer field at logical start.
- **ORD4 — Edge selection.** Compare the usable control with the outer field's
  physical start and end, choose the nearer edge, and map it to logical
  start/end. A tie resolves to logical start.
- **ORD5 — Hidden commit.** Commit width mode, anchor, and alignment while hidden;
  show on the next animation frame and latch the result until close.
- **ORD6 — Collision.** Apply Layer's CSS-owned viewport and safe-area collision
  behavior last. Collision does not reopen the semantic edge decision.

### Performance and resources

- **PR1 — No render-time measurement.** Neither Tokenizer nor a descriptor
  consumer may read geometry during React render.
- **PR2 — One read batch per open.** Open preparation reads the outer field and,
  only when needed, the opening control in one batched read phase. Instrumented
  verification must fail on a second preparation batch for the same open.
- **PR3 — Hidden preparation.** Anchor, width mode, and alignment commit while the
  surface is hidden; show occurs on the next animation frame. Close or unmount
  before that frame cancels the pending show.
- **PR4 — No continuous tracking.** The contract adds no pointer tracking,
  always-on ResizeObserver, global resize listener, or repeated geometry read.
- **PR5 — CSS owns ongoing geometry.** Container resize, outer-field movement,
  writing-direction layout, and final collision remain CSS/Layer work after the
  one-time semantic choice.

## Accessibility contract

- **AR1 — Modality equivalence.** The same input or token/control produces the
  same preferred placement for pointer, touch, keyboard, and programmatic
  activation. No pointer coordinate participates.
- **AR2 — Semantic stability.** The descriptor and placement work MUST NOT change
  Tokenizer's field, group, combobox, listbox, option, token, announcement,
  disabled, focus, or dismissal semantics.
- **AR3 — Focus stability.** Existing focus/refocus behavior survives add,
  remove, clear, overflow expansion/collapse, and related-surface open/close.
- **AR4 — No visible placement error.** A person MUST NOT see a surface first
  paint at an outer-start or stale position and then jump to its resolved edge.
  Invalid identity falls back before show rather than flashing or showing wrong.
- **AR5 — Retained combobox semantics.** While a focus-bootstrapped menu remains
  open after selection, DOM focus MUST stay on the combobox, `aria-expanded` MUST
  remain true, and `aria-activedescendant` MUST name the rendered next valid
  option. Closing for dismissal, disabled, maximum, or exhaustion MUST remove the
  active descendant. Selected and disabled options are never interactive.

## Design relationships

| Anatomy or state            | Design requirement                                                                                                                            | Representation authority               | Hierarchy role | Component contract  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------- | ------------------- |
| Outer field/control surface | Contains tokens, input, and end controls; remains the full-width placement and safe fallback anchor.                                          | Current Tokenizer source               | Prominent      | FR1–FR4, FR7, FR9   |
| Token chips                 | Present selected values and removal; an activated token/control may become the per-open opening control.                                      | Token component or custom renderer     | Prominent      | FR6, FR8, AR2–AR3   |
| Search input                | Remains one mounted combobox node and is the add/search opening control while geometrically usable.                                           | Current Tokenizer/BaseTypeahead source | Prominent      | FR1, FR5, FR7–FR8   |
| Suggestion menu             | Retains current outer-field anchoring and exact preferred `menuWidth`; focus bootstrap keeps only eligible choices and a valid active option. | Current BaseTypeahead source           | Prominent      | FR2, FR13–FR15, AR5 |
| Overflow placeholder/layer  | Preserves a usable outer-field fallback while live content may reparent or collapse.                                                          | Current Tokenizer/Layer composition    | Supporting     | FR3, FR7–FR8        |
| Dependent narrower surface  | Uses the descriptor only after its owning component resolves a width narrower than the field.                                                 | Consuming component plus Layer         | Prominent      | FR9–FR12            |

This contract adds no target, state, or visual styling contract.

## Family and system relationships

- `family:overlay-dismissal` continues to own shared Escape and platform-close
  ordering for Tokenizer's BaseTypeahead/Layer surfaces.
- `architecture:layer-runtime` owns generated anchor names, anchor composition,
  prepared placement, top-layer hosting, viewport collision, visibility
  reconciliation, and cleanup. Tokenizer supplies identity, not Layer mechanics.
- `architecture:interaction-modality` owns shared modality state. Opening
  placement deliberately does not branch on that state.
- `architecture:public-component-api` and `spec:AST-002/DEC-1` keep derivable
  geometry and package-peer identity out of Tokenizer's public API.
- The current Typeahead draft records BaseTypeahead's layer delegation but does
  not own Tokenizer's token/input identity or the approved descriptor.
- `family:input-fields` owns family-wide state display, behavior, appearance,
  size, end-control, disabled-reason, and status-placement policy. Tokenizer
  keeps its component-local token/input and source-loading behavior inside that
  boundary.
- The PowerSearch contract at
  [#5804](https://github.com/facebook/astryx/pull/5804) depends on the approved
  descriptor and owns its own editor width policy. It is dependent draft evidence,
  not authority for Tokenizer.

### Required implementation and browser evidence

The post-selection lifecycle must update the owning source, focused tests,
consumer docs, and Changeset together. Exact-head browser evidence must exercise:

1. Pointer and keyboard selection from a settled focus-bootstrap cohort, with the
   committed value removed, the popup still open, input focus preserved, and the
   next remaining option active.
2. The fallback when the committed option was last, plus terminal closure for no
   remaining choice and `maxEntries`.
3. Escape, Tab or outside focus departure, transition to native-disabled and
   focusable-disabled states, and pending or stale source settlement without a
   later reopen.
4. The unchanged path when `hasEntriesOnFocus` is off and direct single-select
   BaseTypeahead selection still closes.

The separate opening-control descriptor remains pending. When that descriptor and
its Layer consumer ship, they must add screenshotable full/equal/narrow-width,
wrapped-token, overflow-layer, LTR/RTL, collision, stale-fallback, and first-paint
evidence. Instrumented verification must prove one geometry-read batch per open.
PowerSearch's separate evidence owns its editor dimensions; those dimensions never
become Tokenizer policy.

## Verification map

| Contract         | Verification                                                                       | Representative states                                                                                                                        | Mutation or failure expectation                                                                                                                                           | Audit section                    |
| ---------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1–FR3          | Existing Tokenizer/BaseTypeahead unit tests plus source inspection                 | empty, tokens, remove, clear, max, wrapping, both overflow modes                                                                             | Input remounts, suggestion menu changes anchor/width semantics, or overflow ownership is misstated.                                                                       | `audit:Tokenizer/current`        |
| FR4–FR8          | Focused descriptor identity/capture tests when implemented                         | add, default/custom token edit, max, hidden layer, reparent, stale node, unmount, SSR                                                        | Descriptor leaks publicly, captures a transient result/pointer, misses custom controls, or uses unusable geometry.                                                        | `audit:Tokenizer/opening-anchor` |
| FR9–FR12         | Layer unit tests and real-Chromium geometry checks when implemented                | full/equal/narrow surface, start/end/tie, LTR/RTL, collision, stale fallback                                                                 | Full-width follows inner input, tie is physical, collision runs early, or stale identity flashes.                                                                         | `audit:Tokenizer/placement`      |
| FR13–FR15, AR5   | Focused Tokenizer/BaseTypeahead tests and exact-head Chromium interaction evidence | pointer/keyboard commit, first/middle/last choice, rejected/deferred control, loading, disabled, max, exhaustion, Escape, Tab, outside focus | Selected values remain available, order changes, focus leaves the combobox, active descendant names no option, stale work reopens, or a terminal state stays interactive. | `audit:Tokenizer/multi-select`   |
| PR1–PR5          | Instrumented reads, pending-frame cleanup tests, and first-frame Chromium capture  | open, close before frame, reopen opposite side, resize while open                                                                            | Render-time/repeated reads, observer/pointer tracking, uncancelled frame, or first-frame jump occurs.                                                                     | `audit:Tokenizer/performance`    |
| AR1–AR5          | Existing interaction suites plus focused pointer/keyboard/browser checks           | add/edit, focus/refocus, overflow, disabled, dismissal, retained bootstrap selection                                                         | Modality changes placement, semantics/focus regress, active descendant becomes invalid, or visible placement is wrong before fallback.                                    | `audit:Tokenizer/accessibility`  |
| Input busy       | `Tokenizer.test.tsx` `input busy: isLoading and changeAction` suite                | `isLoading`; pending add, remove, or clear Action; settled; replaced mid-Action; source-busy plus value-busy                                 | A second Spinner appears, `aria-busy` drops while busy, the Action runs before `onChange`, or a proposal outlives an unaccepted Action or a `value` replacement.          | `audit:Tokenizer/accessibility`  |
| Record structure | `scripts/check-knowledge.mjs`                                                      | Template-v3 current record and current-only frontmatter links                                                                                | Invalid metadata, authority, or relationship references fail repository validation.                                                                                       | `audit:Tokenizer/knowledge`      |

## Decision log

### DEC-1 — Opening control is package-internal and read once per open

**Reference:** `component:Tokenizer/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

Tokenizer provides Core peers a package-internal descriptor for stable outer-field
and active opening-control identities. A consuming surface resolves its preferred
width first: a surface at least as wide as the field aligns to the outer field at
logical start; only a narrower surface may choose the nearer outer physical edge
from a usable opening control, with logical start as the tie and safe fallback.
The choice is modality-neutral and latched for one open lifetime.

Open preparation reads the outer field and, only when needed, the opening control
in one batch, commits width mode, anchor, and alignment while hidden, shows on the
next animation frame, and performs no continuous tracking. Tokenizer's public API
remains unchanged. Implementation must provide real-Chromium open-state evidence
for full-width and narrower placement, LTR and RTL, constrained collision, stale
fallback, and the first paint without a visible jump.

### DEC-2 — Focus bootstrap supports consecutive committed selections

**Reference:** `component:Tokenizer/DEC-2`
**Decider:** `cixzhang`, `2026-09-19`

When `hasEntriesOnFocus` is enabled, committing a choice from the current settled
empty-query bootstrap cohort keeps the popup open with the remaining eligible
loaded choices. Committed values are excluded by `SearchableItem.id`; distinct
items with the same label remain eligible. The option after the committed choice
in displayed order becomes active; when there is no following choice, the nearest preceding choice becomes active. Input focus and valid combobox/listbox
ARIA relationships remain intact.

The popup closes and clears its active descendant when no eligible loaded choice
remains, `maxEntries` is reached, the control becomes disabled, focus leaves, or
the person dismisses it. Pending or stale source work cannot reopen a terminal
popup or make stale choices interactive. This decision adds no public API, does
not require a refetch, and does not change typed-query selection or direct
single-select BaseTypeahead behavior.

## Open questions

None. The opening-control descriptor implementation remains pending; the
post-selection lifecycle has no unresolved decision.

## Content boundary

This file does not duplicate consumer prop tables, usage examples, search
algorithms, implementation code, current audit results, PowerSearch editor sizing,
or shared Layer mechanics. Consumer docs and release notes project only the
approved component behavior.
