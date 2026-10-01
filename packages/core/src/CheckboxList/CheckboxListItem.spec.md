---
schema_version: 3
template_version: 6
kind: component
id: component:CheckboxListItem
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [public-api, behavior, interaction, theming, accessibility, visual]
verified_by:
  [
    packages/core/src/CheckboxList/CheckboxList.test.tsx,
    packages/core/src/CheckboxList/__tests__/CheckboxList.a11y.chromium.spec.ts,
    packages/core/src/CheckboxInput/__tests__/Checkbox.a11y.test.tsx,
    packages/core/src/CheckboxInput/__tests__/Checkbox.a11y.chromium.spec.ts,
    apps/storybook/stories/CheckboxList.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
    architecture:interaction-modality,
  ]
contributing: []
system_specs: [spec:AST-011, spec:AST-021, spec:AST-038]
---

# CheckboxListItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One option row: a native checkbox named by `label` or `aria-label`, described by `description`, with optional `endContent`, rendered through ListItem. Inside a CheckboxList with a `value` array (collection mode), checked state comes from membership and `value` is required. Inside List, or inside a CheckboxList without `value` (standalone mode), the item reads `isChecked` and calls `onCheck`. |
| Behavior                | The checkbox is the option's only tab stop. Row-surface clicks delegate to it when the item is editable and sits in a CheckboxList or has `onCheck`, or when it has `onClick`; an item `onClick` fires once per direct, keyboard, or row-surface click. Disabled, read-only, and busy states refuse toggling.                                                                                              |
| End-user impact         | People can operate each option by pointer, touch, and keyboard, hear its name, description, and checked, mixed, disabled, read-only, or busy state, and see a spinner while it saves.                                                                                                                                                                                                                      |
| Builder impact          | Where the item sits, and whether its parent list has `value`, selects the mode; `value` is required only in collection mode. Handlerless meaning, checked-row theming and pointer feedback, consumer DOM-prop targets, and focus-ring ownership remain owner decisions. Read-only click propagation to ancestors is an unscored authority gap routed to the shared clickable-container hook.               |
| Compatibility/readiness | Released API, defaults, DOM ownership, and targets are unchanged. This draft records shipped behavior only.                                                                                                                                                                                                                                                                                                |
| Review checks           | Reject a second tab stop, a toggle while disabled, read-only, or busy, `isChecked` overriding a parent `value` array, an `onClick` that fires more than once per click, a dropped description relationship, or a new target, state, or event-routing API introduced without an owner decision.                                                                                                             |
| Governing rules         | `architecture:public-component-api/INV5–INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:interaction-modality/INV1–INV5`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-021/FR8–FR10`; `spec:AST-011`; `spec:AST-038/FR7`; WCAG 2.2 1.3.1, 2.1.1, 4.1.2.                                                                                                          |

This table is a review projection; the body below becomes authoritative only after owner approval.

## Intent

Present one independent choice as a full-width row whose checkbox, label,
description, and end content stay aligned with its checked, available,
read-only, and busy state, inside a CheckboxList or a plain List.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: observational record; no runtime change
- Controlled/uncontrolled behavior: controlled only — by the parent list's
  `value` in collection mode, by `isChecked` in standalone mode
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One option row: its CheckboxInput, naming (string label, rich label through
  `aria-labelledby`, `aria-label` override), description relationship,
  end-content slot, and the checkbox size that follows list density.
- Mode resolution: collection membership versus standalone `isChecked` and
  `onCheck`, the error for a missing `value` in collection mode, and the next
  value the row proposes.
- Row-surface click delegation, the single-tab-stop rule, and item `onClick`
  routing.
- Item disabled and loading states, the busy rendering of a pending collection
  item, read-only rendering, and the checked-row fill.

**Does not own / non-goals**

- The group, its label, description, status, disabled reason, read-only and
  disabled inputs, pending-value set, and collection change ordering — owned by
  `component:CheckboxList`.
- Row presentation, density, dividers, hover and pressed overlays, the
  focus-within ring, the `list-item` target, and label and description
  truncation — owned by `component:List` and Item.
- The checkbox control, its indicator, focus ring, pressed overlay, and busy,
  disabled, and read-only semantics — owned by `component:CheckboxInput` and
  `component:CheckboxIndicator`.
- Loading-indicator presentation — owned by `component:Spinner`; delegation
  mechanics — owned by the shared clickable-container hook.
- New targets, reflected states, or event-routing API.

## Public concepts

| Concept       | Closed values or states                                                                         | Meaning                                                                                                                               | Availability by variant/orientation/state                                      | Default        | Owner                | Stability                              | Invalid-value behavior                       |
| ------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------- | -------------------- | -------------------------------------- | -------------------------------------------- |
| naming        | string `label`; node `label`; `aria-label`                                                      | Names the checkbox; a node label names it from its visible text; `aria-label` replaces the derived name on the checkbox, not the row. | All states.                                                                    | label required | caller and component | stable                                 | rejected by the public type                  |
| mode          | collection (parent has `value`); standalone in CheckboxList without `value`; standalone in List | Collection reads membership and reports through the parent; standalone reads `isChecked` and calls `onCheck`.                         | Chosen by placement; `isChecked` and `onCheck` are ignored in collection mode. | standalone     | component            | stable                                 | a collection item without `value` throws     |
| checked state | unchecked, checked, mixed (standalone only)                                                     | Native checkbox state; mixed uses the native `indeterminate` property and proposes `true`.                                            | All modes.                                                                     | unchecked      | caller               | stable                                 | rejected by the public type                  |
| change path   | parent `onChange`/`changeAction` (collection); `onCheck` (standalone); none                     | Proposes the next value array or boolean.                                                                                             | Enabled, editable, non-busy items.                                             | none           | caller and component | shipped; handlerless meaning unsettled | no handler means no component-owned mutation |
| availability  | enabled; item `isDisabled`; group disabled; group disabled with reason                          | Blocks toggling and the checked-row fill; a group reason keeps the checkbox focusable through `aria-disabled`.                        | Item and group.                                                                | enabled        | component            | stable                                 | boolean only                                 |
| read-only     | from the group's `isReadOnly`                                                                   | Keeps the value visible, focusable, and full-opacity while refusing toggles.                                                          | Inside CheckboxList only.                                                      | false          | component            | stable                                 | boolean only                                 |
| busy          | `isLoading`; pending parent `changeAction` for the item's `value`                               | Spinner in the checkbox, busy row and checkbox, toggling refused.                                                                     | Per item.                                                                      | idle           | component            | stable                                 | boolean/transition state only                |
| content       | `description`, `endContent`                                                                     | Description describes the checkbox; end content stays caller-owned and outside the name.                                              | All states.                                                                    | none           | caller               | stable                                 | typed values only                            |
| `onClick`     | fires on the checkbox for direct, keyboard, and row-surface clicks                              | Once per click, including read-only items; the public type names the row element.                                                     | All states.                                                                    | none           | caller and component | shipped; target unsettled              | —                                            |
| pass-through  | `ref`, `className`, `style`, `xstyle`, data, ARIA except `aria-label`, other events             | Reach the row `<li>`; consumer `xstyle` composes after the checked-row fill.                                                          | All states.                                                                    | none           | component            | shipped; ARIA target unsettled         | component-owned attributes win               |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                         | Basis                                                                                                  | Draft review state                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| FR1  | The row MUST render one native CheckboxInput as ListItem start content; that checkbox MUST be the option's only focusable control, and the row itself MUST NOT be focusable.                                                                                                                                                                                                | shipped source; focused tests; WCAG 2.1.1 and 4.1.2                                                    | verify                                           |
| FR2  | A string `label` MUST name the checkbox; a node `label` MUST name it from the visible label element through `aria-labelledby`; `aria-label` MUST replace the derived name on the checkbox and never reach the row.                                                                                                                                                          | shipped source and focused tests                                                                       | verify                                           |
| FR3  | A renderable `description` MUST describe the checkbox through `aria-describedby`; an absent or empty description MUST add none.                                                                                                                                                                                                                                             | shipped source and focused tests; WCAG 1.3.1                                                           | verify                                           |
| FR4  | Inside a CheckboxList with a `value` array, the item MUST read checked state from membership, throw without `value`, and propose the array with its `value` added or removed through the parent's change path; `isChecked` and `onCheck` MUST be ignored.                                                                                                                   | shipped source and focused tests                                                                       | verify                                           |
| FR5  | Inside List, or inside a CheckboxList without `value`, the item MUST read `isChecked` and call `onCheck` with the next boolean; a mixed item MUST propose `true`, and `value` MAY be omitted.                                                                                                                                                                               | shipped source and focused tests                                                                       | verify                                           |
| FR6  | Item `isDisabled` or a disabled group MUST disable the checkbox, refuse toggling, and omit the checked-row fill; a group reason keeps the checkbox focusable through `aria-disabled` (`component:CheckboxList` FR9).                                                                                                                                                        | shipped source, focused tests, and shared checkbox binding                                             | verify                                           |
| FR7  | Item `isLoading`, or a pending parent `changeAction` for the item's `value`, MUST render Spinner inside the checkbox, mark the row and the checkbox busy, and refuse toggling.                                                                                                                                                                                              | shipped source, focused tests, and Chromium receipts                                                   | verify                                           |
| FR8  | A read-only group MUST make the checkbox read-only, focusable, and full-opacity, refuse every toggle, and omit the checked-row fill; the row delegates clicks only when the item has `onClick`.                                                                                                                                                                             | shipped source, focused tests, and shared checkbox binding; `spec:AST-011`                             | verify                                           |
| FR9  | On an enabled, editable item inside a CheckboxList or with `onCheck`, a row-surface click outside interactive descendants MUST be delegated to the checkbox; links and buttons in the label, description, or end content MUST keep their own behavior.                                                                                                                      | shipped source and focused tests                                                                       | verify                                           |
| FR10 | An item `onClick` MUST fire once for each direct, keyboard, or row-surface click, including on read-only items.                                                                                                                                                                                                                                                             | shipped source and focused tests; `architecture:public-component-api/INV5`                             | verify                                           |
| FR11 | `compact` density MUST render the `sm` checkbox; other densities MUST render `md`.                                                                                                                                                                                                                                                                                          | shipped source and focused test                                                                        | verify                                           |
| FR12 | An enabled, editable, checked row MUST paint the `--color-accent-muted` fill, and consumer `xstyle` MUST compose after it.                                                                                                                                                                                                                                                  | shipped source and Chromium receipts                                                                   | verify                                           |
| FR13 | `ref`, `className`, `style`, `xstyle`, data attributes, ARIA other than `aria-label`, and events other than `onClick` MUST reach the row `<li>`.                                                                                                                                                                                                                            | shipped source and focused tests                                                                       | verify                                           |
| GAP1 | A standalone item with `isChecked` and no `onCheck` is inert but exposed as an editable checkbox; inside a CheckboxList without `value`, its row also delegates clicks and shows pointer feedback.                                                                                                                                                                          | exact `spec:AST-021` known failure `list-item-handlerless-read-only`; WCAG 4.1.2                       | owner decision                                   |
| GAP2 | The item paints the checked-row fill itself, but no selection state is reflected on the row's `list-item`/`item` targets, so a theme cannot restyle checked rows apart from unchecked rows.                                                                                                                                                                                 | `architecture:component-theming-surface/INV6`                                                          | owner decision                                   |
| GAP3 | Consumer DOM inputs split between two elements: data attributes and ARIA reach the row, while `onClick` runs on the checkbox and is typed for the row, so `event.currentTarget` is the checkbox and does not carry the row's data attributes.                                                                                                                               | `architecture:public-component-api/INV5`; `INV9` for any retype or move                                | owner decision                                   |
| GAP4 | On a read-only item with `onClick`, the item stops the click's propagation, so React ancestors never receive those clicks, while they do for enabled items. The stop exists because the shared clickable-container hook would re-delegate a click that came from an `aria-readonly` delegate target back to it. The item's own `onClick` still fires once per click (FR10). | No current authority owns ancestor propagation; shared clickable-container hook behavior (advisory)    | authority gap (unscored); shared-module advisory |
| GAP5 | On an enabled, editable, checked row, the checked-row fill replaces the row's hover and pressed overlays, so pointer hover and hold give no row feedback.                                                                                                                                                                                                                   | Chromium receipts; `design:user-states` leaves hover and selection treatment outside its current claim | authority gap (unscored); owner decision         |
| GAP6 | One keyboard focus move paints two indicators: Item's row focus-within outline and CheckboxInput's indicator ring.                                                                                                                                                                                                                                                          | Chromium receipts; `architecture:interaction-modality/INV3`                                            | owner decision                                   |

### Allowed variation

- **AV1 — Content.** Label, description, and end content may vary within their
  public types without becoming new targets.
- **AV2 — Composed presentation.** Density, dividers, row overlays, the focus
  ring, and the checkbox indicator remain capabilities of their owning
  components.
- **AV3 — Theme paint.** Semantic tokens and composed targets may change
  admitted visual properties without changing semantics, tab order, or state
  precedence.

### Representative states

| State                             | Required invariant                                                          | Allowed variation                     |
| --------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| Collection option                 | Checked from membership; one tab stop; toggles through the parent           | Label, description, end content       |
| Standalone option (List or group) | Reads `isChecked`, calls `onCheck`; mixed proposes `true`                   | Placement                             |
| Busy option                       | Spinner, busy row and checkbox, toggling refused                            | Loading source (prop or pending save) |
| Read-only option                  | Visible, focusable, full-opacity, immutable; `onClick` fires once per click | Whether the item has `onClick`        |
| Disabled option                   | Inoperable; no checked-row fill                                             | Item or group source; group reason    |
| Handlerless standalone option     | Inert; read-only, unavailable, or invalid-usage meaning is unsettled        | No policy is introduced by this draft |

### Transformation and precedence order

- **ORD1 — Checked state.** Parent `value` array (collection) → optimistic
  pending value → membership; otherwise `isChecked`; otherwise unchecked.
- **ORD2 — Toggle.** disabled, read-only, or busy guard → mode → parent
  `onChange` (collection) or `onCheck` (standalone).
- **ORD3 — Click routing.** Interactive descendants keep their clicks → other
  row-surface clicks delegate to the checkbox when the item is editable and sits
  in a CheckboxList or has `onCheck`, or has `onClick` → the checkbox's click
  runs `onClick` once.
- **ORD4 — Attributes.** Consumer rest props → row `<li>`; `aria-label` and
  `onClick` → checkbox; component-owned name, description, state, and busy
  attributes win.

### Performance and resources

- **PR1 — Bounded resources.** The item owns no observer, timer, or global
  listener; delegation listeners belong to the row and its lifetime.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Option semantics.** Each option MUST remain a native checkbox whose
  name, description, checked or mixed state, and disabled, read-only, and busy
  states are programmatically determinable.
- **AR2 — Keyboard parity.** Tab MUST reach the checkbox exactly once, and Space
  MUST follow the same availability and change rules as pointer activation.
- **AR3 — Enlarged target.** The row surface MUST act as the checkbox's pointer
  and touch target without becoming a second control.
- **AR4 — Busy perception.** A busy option MUST expose busy state in the
  accessibility tree and visibly through Spinner.
- **AR5 — Focus visibility.** Keyboard focus on the checkbox MUST stay visible;
  which element owns the single indicator is open (GAP6).

## Design relationships

| Anatomy or state   | Design requirement                                                          | Representation authority                                   | Hierarchy role  | Component contract |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- | ------------------ |
| Option row         | Full-width row with start checkbox, label and description, and end content. | List and Item                                              | Supporting      | FR1, FR9, FR13     |
| Checkbox           | Presents the option's selection indicator.                                  | CheckboxInput owner and `design:user-states` for its press | Prominent       | FR1, FR6–FR8, FR11 |
| Label, description | Name and describe the checkbox.                                             | Item                                                       | Primary content | FR2, FR3           |
| Checked-row fill   | Supplements the checkbox state on enabled, editable checked rows.           | unsettled (GAP2, GAP5)                                     | Supporting      | FR12               |
| Spinner            | Replaces the mark while the option is busy.                                 | Spinner                                                    | Supporting      | FR7                |

This draft adds no `anatomy-theming:v1` block. The composed option anatomy and
its target dispositions are recorded in `component:CheckboxList`'s theming
anatomy, and CheckboxListItem owns no target of its own.

## Family and system relationships

- `component:CheckboxList` composes this contract: it supplies the collection
  value, availability, read-only, and pending values the option reads through
  context, and owns the group around it.
- `architecture:public-component-api` owns pass-through preservation, event
  composition, refs, and released-change rules.
- `architecture:component-theming-surface` owns target placement and state
  reflection.
- `architecture:interaction-modality` owns focus visibility and the one-indicator
  rule.
- `spec:AST-021` owns the reusable checkbox accessibility binding for
  CheckboxListItem and its exact known-failure lifecycle.
- `spec:AST-011` records `isReadOnly` as the name for visible, focusable,
  non-editable values.
- `spec:AST-038/FR7` stops CheckboxList context at a layer boundary; an item
  inside a layer needs its own provider.
- List, Item, CheckboxInput, CheckboxIndicator, and Spinner retain their
  existing target and behavior contracts when composed here.

## Verification map

| Contract           | Verification                                                                                                          | Representative states                                                                         | Mutation or failure expectation                                                                        | Audit section                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| FR1, FR9, AR2, AR3 | `CheckboxList.test.tsx` single-tab-stop, delegation, and interactive-content suites                                   | Collection option; row-surface click; link in a rich label; interactive end content           | A second tab stop, lost delegation, or a toggle from an interactive descendant fails the assertions.   | `audit:CheckboxListItem/behavior`        |
| FR2, FR3, AR1      | `CheckboxList.test.tsx` accessible-name and description suites; shared checkbox bindings                              | String and rich label; `aria-label` override; string and node description; absent description | A wrong name or description, or `aria-label` on the row, fails the assertions.                         | `audit:CheckboxListItem/a11y`            |
| FR4, FR5           | `CheckboxList.test.tsx` collection, standalone, and select-all suites                                                 | add, remove, missing `value`, mixed, select-all, `isChecked` with a parent `value` array      | A wrong array or boolean, a missing error, or `isChecked` overriding the parent fails the assertions.  | `audit:CheckboxListItem/behavior`        |
| FR6–FR8, AR4       | `CheckboxList.test.tsx` disabled, loading, pending, and read-only suites; shared checkbox bindings; Chromium receipts | Item and group disabled; reason; loading; pending; read-only with and without `onClick`       | A toggle while disabled, read-only, or busy, a lost busy state, or a read-only toggle fails the tests. | `audit:CheckboxListItem/a11y`            |
| FR10               | `CheckboxList.test.tsx` item `onClick` and read-only click tests                                                      | Enabled and read-only; direct, keyboard, and row-surface clicks                               | An `onClick` that fires zero or several times per click fails the assertions.                          | `audit:CheckboxListItem/behavior`        |
| FR11               | `CheckboxList.test.tsx` density test                                                                                  | compact and balanced                                                                          | A wrong checkbox size fails the assertion.                                                             | `audit:CheckboxListItem/behavior`        |
| FR12               | Chromium checked, hover, and pressed receipts                                                                         | light and dark                                                                                | A missing or misplaced fill fails the receipts' row-paint check.                                       | `audit:CheckboxListItem/design-rendered` |
| FR13               | `CheckboxList.test.tsx` pass-through, data-testid, and ARIA tests                                                     | row ref, class, style, data, ARIA                                                             | A dropped or misrouted input fails the assertions.                                                     | `audit:CheckboxListItem/api`             |
| Direction          | curated RTL D2 target `core-checkboxlist--rich-descriptions`                                                          | LTR and RTL                                                                                   | The checkbox and end content fail to swap inline order.                                                | `audit:CheckboxListItem/i18n-rtl`        |

## Decision log

None. This draft records shipped behavior; it introduces no new API, default,
target, or subjective visual decision.

## Open questions

- **OQ1 — What does a standalone item with `isChecked` and no `onCheck`
  mean?** (`human-api`) Choose read-only, unavailable, or invalid usage,
  consistent with the matching CheckboxInput question.
- **OQ2 — How should a theme reach the checked-row fill?** (`human-api`)
  Exposing it needs a target or reflected-state decision.
- **OQ3 — Which element owns consumer DOM inputs?** (`human-api`) Data and ARIA
  reach the row while `onClick` runs on the checkbox under a row-typed handler.
- **OQ4 — Should read-only item clicks propagate?** (`human-api`) No current
  authority owns ancestor propagation, so this is an unscored authority gap.
  Removing the stop needs the shared clickable-container hook to stop
  re-delegating clicks that already came from its delegate target.
- **OQ5 — What hover and pressed feedback should a checked row show?**
  (`human-design`) The checked-row fill currently replaces both overlays.
- **OQ6 — Which element paints the option's focus ring?** (`human-design`)
  `architecture:interaction-modality/INV3` requires one indicator; RadioList
  composes the same two painters.

## Content boundary

This file does not duplicate consumer prop tables and examples, current audit
results, implementation steps, or the group contract. It links to their
owners.
