---
schema_version: 3
template_version: 6
kind: component
id: component:CheckboxList
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
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/CheckboxList.stories.tsx,
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

# CheckboxList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckboxList` is a labeled `role="group"` of `CheckboxListItem` rows. A `value` array selects controlled collection mode (`onChange`, `changeAction`); without it, items use standalone `isChecked`/`onCheck`. The group owns disabled, disabled-reason, read-only, and status.          |
| Behavior                | Each option is one native checkbox and one tab stop; the row surface delegates clicks to it. A toggled item stays busy and cannot be re-toggled while its `changeAction` is pending, while other items stay interactive.                                                                  |
| End-user impact         | People can identify the group, operate every option by pointer, touch, and keyboard, learn why a group is unavailable, and see which options are still saving.                                                                                                                            |
| Builder impact          | Builders choose collection or standalone mode and supply stable item `value`s in collection mode. Handlerless, invalid-status, pass-through-target, checked-row theming and feedback, and focus-ring ownership remain owner decisions.                                                    |
| Compatibility/readiness | Released API, defaults, DOM ownership, and targets are unchanged. This draft records shipped behavior plus two objective remediations: concurrent pending items keep their busy state, and a read-only item's `onClick` fires once per click instead of looping.                          |
| Review checks           | Reject a second tab stop per option, a pending item that loses busy or its re-toggle guard, an item `onClick` that fires more than once per click, dropped group naming or description ids, disabled or read-only mutation, or new target/state API introduced without an owner decision. |
| Governing rules         | `architecture:public-component-api/INV1–INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:interaction-modality/INV1–INV4`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-021/FR8–FR10`; `spec:AST-038/FR7`; WCAG 2.2 1.3.1, 2.1.1, 4.1.2.         |

This table is a review projection; the body below becomes authoritative only after owner approval.

## Intent

Present a small, labeled set of independent checkbox options whose checked,
available, read-only, busy, and status states stay aligned across pointer,
touch, keyboard, and assistive technology.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: observational record plus two objective bug fixes; public
  types, defaults, DOM ownership, targets, and focus order are unchanged
- Controlled/uncontrolled behavior: collection mode is controlled by `value`;
  standalone items are controlled by `isChecked`; no uncontrolled mode exists
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The labeled checkbox group, its `checkbox-list` target, and the group's
  description, status, and disabled-reason relationships.
- Collection state shared with CheckboxListItem: checked membership, change
  ordering, optimistic pending values, and group-level availability.

**Does not own / non-goals**

- Each option's row composition — its checkbox, naming and description
  relationships, row-surface delegation and `onClick` routing, standalone mode,
  and checked-row fill — owned by `component:CheckboxListItem`. The option rows
  below (FR3, FR5, FR8, FR11, FR12, GAP1, GAP2, GAP5, GAP6) observe that
  composition inside the group.
- List and option-row presentation — owned by `component:List`; its
  `list-item` target reaches only the row root.
- Standard option-label and option-description wrappers — rendered as separate,
  untargeted spans by Item rather than Text; rich label content and end content
  remain caller-owned.
- The checkbox control, its indicator, focus ring, and pressed overlay — owned
  by `component:CheckboxInput` and `component:CheckboxIndicator`.
- Group-label and validation-message presentation — owned by `component:Field`
  and `component:FieldStatus`.
- Loading-indicator presentation — owned by `component:Spinner`; tooltip
  behavior — owned by `useTooltip`.
- New targets or reflected states for the row, descriptions, or caller content.

## Public concepts

| Concept        | Closed values or states                                                             | Meaning                                                                                                           | Availability by variant/orientation/state             | Default                   | Owner                  | Stability                              | Invalid-value behavior                        |
| -------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------- | ---------------------- | -------------------------------------- | --------------------------------------------- |
| group naming   | `label`, `isLabelHidden`, `description`                                             | Names and describes the `role="group"`; a hidden label still names it.                                            | All states.                                           | label required; visible   | caller and Field       | stable                                 | rejected by the public type                   |
| selection mode | collection (`value` set), standalone in group, standalone in List                   | Collection derives checked state from membership; standalone items read `isChecked`.                              | Standalone item props are ignored in collection mode. | standalone                | component              | stable                                 | a collection item without `value` throws      |
| change path    | `onChange`, `changeAction` (collection); `onCheck` (standalone); none               | Reports the next value array or boolean; `changeAction` runs after `onChange` in a transition.                    | Enabled, non-read-only, non-busy items.               | none                      | caller and component   | shipped; handlerless meaning unsettled | no handler means no component-owned mutation  |
| checked state  | unchecked, checked, mixed (standalone only)                                         | Native checkbox state; mixed uses the native `indeterminate` property.                                            | All states.                                           | unchecked                 | caller                 | stable                                 | rejected by the public type                   |
| availability   | enabled, group disabled, group disabled with reason, item disabled                  | Blocks toggling; a reason keeps checkboxes focusable through `aria-disabled` and shows a group tooltip.           | Reason applies only with group `isDisabled`.          | enabled                   | component              | stable                                 | a reason without `isDisabled` renders nothing |
| read-only      | group `isReadOnly`                                                                  | Keeps values visible, focusable, and full-opacity while blocking toggling.                                        | Group-wide; not available on a standalone List item.  | false                     | component              | stable                                 | boolean only                                  |
| busy           | item `isLoading`; pending collection `changeAction`                                 | Shows Spinner in the checkbox, marks the row and checkbox busy, and blocks re-toggling that item.                 | Per item; other items remain interactive.             | idle                      | component              | stable                                 | boolean/transition state only                 |
| status         | `warning`, `error`, `success`, optional message                                     | A message renders a detached FieldStatus after the list and describes the group.                                  | All states.                                           | none                      | caller and FieldStatus | shipped; invalid semantics unsettled   | a status without a message renders nothing    |
| row layout     | `density` compact/balanced/spacious; `hasDividers`; `width`                         | Row padding and checkbox size (`sm` for compact); dividers between rows; field width for label, list, and status. | All states.                                           | balanced; none; intrinsic | component and List     | stable                                 | rejected by the public types                  |
| option content | string or node `label`, `aria-label`, `description`, `endContent`                   | Names and describes the checkbox; end content stays caller-owned.                                                 | All states.                                           | label required            | caller                 | stable                                 | typed values only                             |
| pass-through   | CheckboxList rest, `ref`, styling; CheckboxListItem rest, `ref`, styling, `onClick` | CheckboxList inputs reach the field root; item inputs reach the row; item `onClick` rides the checkbox.           | All states.                                           | none                      | component              | shipped; ARIA target unsettled         | component-owned attributes win                |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                | Basis                                                                                                                                                    | Draft review state                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| FR1  | The render MUST place CheckboxListItem children inside a List within a `role="group"` named by the group label through `aria-labelledby`; its `aria-describedby` MUST list the description, status message, and disabled-reason tooltip that are present, in that order.                                                                           | shipped source; focused tests; WCAG 1.3.1 and 4.1.2                                                                                                      | verify                                           |
| FR2  | The CheckboxList root MUST carry the current `checkbox-list` target.                                                                                                                                                                                                                                                                               | shipped source and public docs                                                                                                                           | settled                                          |
| FR3  | The option-row root and checkbox MUST continue to be rendered by List and CheckboxInput rather than reimplemented.                                                                                                                                                                                                                                 | shipped source                                                                                                                                           | settled                                          |
| FR4  | A busy item MUST render Spinner inside that item's checkbox and mark both the row and the checkbox busy; a status message MUST render through a detached FieldStatus after the list.                                                                                                                                                               | shipped source, focused tests, and Chromium receipts                                                                                                     | verify                                           |
| FR5  | Item MUST render the option label and description as separate untargeted children; end content MUST remain caller-provided inside its own untargeted slot wrapper.                                                                                                                                                                                 | shipped source and focused tests                                                                                                                         | settled                                          |
| FR6  | In collection mode, items MUST derive checked state from `value` membership; toggling MUST call `onChange` with the next array (appending or filtering the item's `value`) and then run `changeAction` with the same array in a transition with an optimistic value.                                                                               | shipped source and focused tests                                                                                                                         | verify                                           |
| FR7  | While an item's `changeAction` is pending, that item MUST show Spinner, expose busy state, and refuse re-toggling; toggling another item MUST NOT clear it. Concurrent pending items settle together, after which every busy state clears.                                                                                                         | shipped public `changeAction` promise; focused regression test; Chromium receipts                                                                        | verify (remediated by this audit)                |
| FR8  | Without a `value` array, or inside a plain List, items MUST read `isChecked` and call `onCheck` with the next boolean; a mixed item proposes `true`.                                                                                                                                                                                               | shipped source and focused tests                                                                                                                         | verify                                           |
| FR9  | Group `isDisabled` MUST natively disable every checkbox unless `disabledMessage` is set; with a reason, checkboxes MUST stay focusable through `aria-disabled`, show the reason tooltip on group hover and focus, and refuse toggling. Item `isDisabled` MUST natively disable that item.                                                          | shipped source, focused tests, and shared checkbox binding                                                                                               | verify                                           |
| FR10 | Group `isReadOnly` MUST expose read-only state on every checkbox, keep it focusable and full-opacity, and refuse every toggle, whether it comes from the checkbox, the keyboard, or the row. Row-surface clicks still delegate to the checkbox when the item has an `onClick`, which fires once per click; without one, the row does not delegate. | shipped source; focused read-only test; shared checkbox binding; `spec:AST-011` read-only vocabulary                                                     | verify (row-click loop remediated by this audit) |
| FR11 | Each option MUST expose exactly one tab stop, its checkbox. A click on the row surface outside interactive descendants MUST toggle through that checkbox, and an item `onClick` MUST fire once for each direct, keyboard, or delegated click.                                                                                                      | shipped source and focused tests; WCAG 2.1.1 and 4.1.2                                                                                                   | verify                                           |
| FR12 | A string `label` MUST name the checkbox; a node `label` MUST name it from its visible text through `aria-labelledby`; `aria-label` MUST replace the derived name; a renderable `description` MUST describe the checkbox.                                                                                                                           | shipped source and focused tests                                                                                                                         | verify                                           |
| FR13 | `compact` density MUST render the `sm` checkbox and other densities `md`; `hasDividers` MUST separate rows without a divider after the last row; `width` MUST size the label, list, and status together.                                                                                                                                           | shipped source, docs, and Chromium receipts                                                                                                              | verify                                           |
| GAP1 | A standalone item with `isChecked` and no `onCheck` is inert but exposed as an editable checkbox.                                                                                                                                                                                                                                                  | exact `spec:AST-021` known failure `list-item-handlerless-read-only`; WCAG 4.1.2                                                                         | owner decision                                   |
| GAP2 | CheckboxListItem paints the checked-row fill itself, but no selection state is reflected on the row's `list-item`/`item` targets, so a theme cannot restyle checked rows apart from unchecked rows.                                                                                                                                                | `architecture:component-theming-surface/INV6`; shipped source                                                                                            | owner decision                                   |
| GAP3 | An error `status` exposes no programmatic invalid state on the group or its checkboxes, and a status without a message renders nothing.                                                                                                                                                                                                            | shipped source; `spec:AST-002/FR15`                                                                                                                      | owner decision                                   |
| GAP4 | Consumer ARIA pass-throughs on CheckboxList reach the field root rather than the named `role="group"`.                                                                                                                                                                                                                                             | shipped source; `architecture:public-component-api/INV5`                                                                                                 | owner decision                                   |
| GAP5 | On an enabled, editable checked row, the checked-row fill replaces the row's hover and pressed overlays, so pointer hover and hold give no row feedback on checked options.                                                                                                                                                                        | exact-head Chromium `hover-checked` and `pressed-checked` receipts; `design:user-states` leaves hover and selection treatments outside its current claim | authority gap (unscored); owner decision         |
| GAP6 | Keyboard focus on an option paints two rings for one focus move: Item's row focus-within outline and CheckboxInput's indicator ring.                                                                                                                                                                                                               | exact-head Chromium `focus-visible` receipts; `architecture:interaction-modality/INV3`                                                                   | owner decision                                   |

### Allowed variation

- **AV1 — Option content.** Option labels, descriptions, and end content may
  vary with caller-provided CheckboxListItem content without becoming new
  CheckboxList targets.
- **AV2 — Composed ownership.** Density, dividers, disabled dimming, hover and
  pressed row overlays, and the checkbox indicator remain capabilities of their
  current owning components rather than separate anatomy parts.
- **AV3 — Theme paint.** Semantic tokens and composed targets may change
  admitted visual properties without changing semantics, tab order, or state
  precedence.

### Representative states

| State                      | Required invariant                                                                                                           | Allowed variation                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Default collection         | Named group, options list, rows, and checkboxes render; one tab stop per option                                              | Option content and selected values    |
| Item pending               | Each pending checkbox includes Spinner and busy state and refuses re-toggling                                                | Which options are pending             |
| Group disabled with reason | Checkboxes stay focusable and inoperable; the reason is reachable by hover, focus, and AT                                    | Reason text                           |
| Group read-only            | Values stay visible, focusable, full-opacity, and immutable with read-only semantics; an item `onClick` fires once per click | Which values are checked              |
| Group status with message  | Detached FieldStatus follows the group and describes it                                                                      | Error, warning, or success status     |
| Handlerless standalone     | Inert; read-only, unavailable, or invalid-usage meaning is unsettled                                                         | No policy is introduced by this draft |

### Transformation and precedence order

- **ORD1 — Checked state.** Collection `value` → optimistic pending value →
  item membership; standalone items use `isChecked` only outside collection
  mode.
- **ORD2 — Toggle.** disabled, read-only, or busy guard → next value →
  `onChange` → `changeAction` in a transition that adds the item to the pending
  set.
- **ORD3 — Availability.** Item disabled or group disabled wins; a group reason
  changes focusability, not operability; read-only applies to mutation only.

### Performance and resources

- **PR1 — Bounded resources.** The component owns no observer or global
  listener. Tooltip listeners are scoped to the group element and its lifetime.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Group identity.** The group name and its description, status, and
  disabled-reason relationships MUST remain programmatically determinable.
- **AR2 — Option semantics.** Each option MUST remain a native checkbox with a
  determinable name, checked or mixed state, disabled, read-only, and busy
  state.
- **AR3 — Keyboard parity.** Tab MUST reach each option's checkbox exactly once
  and Space MUST follow the same availability and change rules as pointer
  activation.
- **AR4 — Disabled reasons.** A group reason MUST stay discoverable by keyboard
  focus and assistive technology while toggling stays blocked.
- **AR5 — Busy perception.** A pending option MUST expose busy state in the
  accessibility tree and visibly through Spinner.

## Design relationships

| Anatomy or state   | Design requirement                                                           | Representation authority                                   | Hierarchy role | Component contract |
| ------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------- | ------------------ |
| Group              | Contains the current checkbox-group composition.                             | Current source and public docs                             | Supporting     | FR1, FR2           |
| Options and rows   | Present the List-owned list and row root plus Item-rendered child structure. | Current source                                             | Supporting     | FR1, FR3, FR13     |
| Checkbox           | Presents each option's current selection indicator.                          | CheckboxInput owner and `design:user-states` for its press | Prominent      | FR3, FR9–FR11      |
| Checked-row fill   | Supplements the checkbox state on enabled, editable checked rows.            | unsettled (GAP2)                                           | Supporting     | GAP2               |
| Spinner and status | Present the current conditional feedback components.                         | Current shared-component source                            | Supporting     | FR4, FR7           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Group": {"target": "checkbox-list"},
  "Group label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Description": {
    "none": {
      "reason": "unsettled: No current public target reaches the stable Description; future exposure still needs an owner decision"
    }
  },
  "Options list": {
    "delegatesTo": {"owner": "component:List", "target": "list"}
  },
  "Option row": {
    "delegatesTo": {"owner": "component:List", "target": "list-item"}
  },
  "Checkbox": {
    "delegatesTo": {
      "owner": "component:CheckboxInput",
      "target": "checkbox-indicator"
    }
  },
  "Option label": {
    "none": {
      "reason": "unsettled: Item rather than Text renders the stable Option label in a separate untargeted span; future exposure still needs an owner decision"
    }
  },
  "Option description": {
    "none": {
      "reason": "unsettled: Item rather than Text renders the stable Option description in a separate untargeted span; future exposure still needs an owner decision"
    }
  },
  "End content": {
    "none": {
      "reason": "intentional: End content is caller-provided content outside CheckboxList's public theming ownership"
    }
  },
  "Spinner": {
    "delegatesTo": {"owner": "component:Spinner", "target": "spinner"}
  },
  "Status message": {
    "delegatesTo": {
      "owner": "component:FieldStatus",
      "target": "field-status"
    }
  }
}
```

`Description` remains stable consumer anatomy, but no current public target
reaches it. Item, not Text, renders option labels and descriptions in separate
untargeted spans, so neither delegates to Text nor inherits the row-root
`list-item` target; future exposure remains unsettled. Rich label content and end
content are caller-provided, and end content intentionally stays outside
CheckboxList's public theming ownership. The `Option row` delegation reaches the
row surface, but not a checked-row state (GAP2).

## Family and system relationships

- `architecture:public-component-api` owns export reachability, pass-through
  preservation, styling composition, refs, and released-change rules.
- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, composition-preserving target ownership, and state
  reflection.
- `architecture:interaction-modality` owns focus visibility and the boundary
  between the focused checkbox and the element that paints its ring.
- `spec:AST-021` owns the reusable checkbox accessibility binding for
  CheckboxListItem and its exact known-failure lifecycle.
- `spec:AST-011` records `isReadOnly` as the name for visible, focusable,
  non-editable values.
- `spec:AST-038/FR7` stops CheckboxList context at a layer boundary; an item
  inside a layer needs its own provider.
- `component:CheckboxListItem` owns the per-option contract this group
  composes.
- List, CheckboxInput, Field, FieldStatus, Spinner, and Tooltip retain their
  existing public target and behavior contracts when composed by CheckboxList.

## Verification map

| Contract             | Verification                                                                                       | Representative states                                                                                                        | Mutation or failure expectation                                                                                                            | Audit section                   |
| -------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| FR1, AR1             | `CheckboxList.test.tsx` group naming, description, status, and disabled-reason assertions          | Named group; description plus status; disabled reason                                                                        | Dropping the label, description, status, or tooltip id from the group fails the accessible name or description assertions.                 | `audit:CheckboxList/a11y`       |
| FR3, FR5, FR11, FR12 | `CheckboxList.test.tsx` structure, naming, delegation, and tab-order suites                        | Collection mode; string/rich label; description; end content; row-surface click                                              | A second tab stop, lost delegation, or a wrong name or description breaks existing interaction and ARIA assertions.                        | `audit:CheckboxList/behavior`   |
| FR4, FR7, AR5        | `CheckboxList.test.tsx` loading and pending suites; Chromium `pending-*` receipts                  | Item loading; one pending item; two pending items; settled                                                                   | Clearing an earlier pending item, allowing its re-toggle, or leaving busy state after settlement fails the tests and receipts.             | `audit:CheckboxList/behavior`   |
| FR6, FR8             | `CheckboxList.test.tsx` collection and standalone suites                                           | add, remove, mixed, select-all                                                                                               | A wrong array, wrong boolean, or missing `value` error fails callback assertions.                                                          | `audit:CheckboxList/behavior`   |
| FR9, FR10, AR2–AR4   | Shared checkbox jsdom and Chromium bindings; `CheckboxList.test.tsx` disabled and read-only suites | Group disabled; disabled with reason; item disabled; read-only with and without an item `onClick`; handlerless known failure | A focusability, state, reason, or single-fire expectation fails, a read-only toggle succeeds, or the recorded known failure becomes stale. | `audit:CheckboxList/a11y`       |
| FR13                 | Chromium density, divider, long-content, and RTL receipts                                          | compact, balanced, spacious; dividers; 320px long content; RTL                                                               | A size, divider, width, overflow, or direction sensor fails.                                                                               | `audit:CheckboxList/responsive` |
| Local target source  | `themingTargets.test.ts`                                                                           | `checkbox-list`                                                                                                              | Source/docs target drift fails the repository target guard.                                                                                | `audit:CheckboxList/theming`    |
| Theming anatomy map  | `scripts/check-knowledge.mjs`                                                                      | Canonical anatomy and current local target                                                                                   | Canonical-key drift, invalid dispositions or target spelling, or an unclaimed current local target fails repository validation.            | `audit:CheckboxList/theming`    |

No current repository check resolves `delegatesTo` owner/target pairs; the pairs
in this draft were verified manually, so semantic delegation drift remains a
validation gap.

## Decision log

None. This draft records shipped behavior and two objective remediations; it
introduces no new API, default, target, or subjective visual decision.

## Open questions

- **OQ1 — What does a standalone item with `isChecked` and no `onCheck`
  mean?** (`human-api`) It is inert while exposed as editable. Direction must
  choose read-only, unavailable, or invalid usage, consistent with the matching
  CheckboxInput decision.
- **OQ2 — How should a theme reach the checked-row fill?** (`human-api`) The
  fill is component-owned paint on a delegated List row with no reflected state;
  exposing it needs a target or state decision.
- **OQ3 — Should an error status expose invalid state, and what should a status
  without a message render?** (`human-api`)
- **OQ4 — Which element owns consumer ARIA pass-throughs on CheckboxList?**
  (`human-api`) They currently reach the field root rather than the group.
- **OQ5 — What hover and pressed feedback should a checked row show?**
  (`human-design`) The checked-row fill currently replaces both overlays.
- **OQ6 — Which element paints the focus ring for an option?** (`human-design`)
  The row ring and the indicator ring both paint today;
  `architecture:interaction-modality/INV3` requires one owning indicator, and
  RadioList composes the same two painters.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or shared-component contracts. It links to their
owners.
