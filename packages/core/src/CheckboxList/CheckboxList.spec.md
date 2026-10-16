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

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckboxList` is a labeled `role="group"` of `CheckboxListItem` rows. A `value` array selects controlled collection mode (`onChange`, `changeAction`); without it, its items are standalone. The group owns naming, description, disabled, disabled-reason, read-only, pending values, and status. Each option's behavior is `component:CheckboxListItem`. |
| Behavior                | The group names and describes its options, tracks every value whose `changeAction` is pending so each saving option stays busy while the others stay interactive, and applies disabled, read-only, and status to every option.                                                                                                                              |
| End-user impact         | People can identify the group, operate every option by pointer, touch, and keyboard, learn why a group is unavailable, and see which options are still saving.                                                                                                                                                                                              |
| Builder impact          | Builders choose collection mode by passing `value`, and then supply stable item `value`s. Invalid-status and group pass-through-target meaning remain owner decisions here; per-option owner decisions are recorded in `component:CheckboxListItem`.                                                                                                        |
| Compatibility/readiness | Released API, defaults, DOM ownership, and targets are unchanged. This draft records shipped behavior, including the concurrent-pending fix from the CheckboxList audit (#6777).                                                                                                                                                                            |
| Review checks           | Reject a pending value that loses its busy state or re-toggle guard when another option is toggled, dropped group naming or description ids, a toggle while the group is disabled or read-only, or new target or state API introduced without an owner decision. Per-option checks are in `component:CheckboxListItem`.                                     |
| Governing rules         | `architecture:public-component-api/INV1–INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:interaction-modality/INV1–INV5`; `architecture:component-test-sufficiency/INV1–INV7`; `architecture:knowledge-contracts/INV2`; `spec:AST-021/FR8–FR10`; `spec:AST-038/FR7`; WCAG 2.2 1.3.1, 2.1.1, 4.1.2.                                  |

This table is a review projection; the body below becomes authoritative only after owner approval.

## Intent

Present a small, labeled set of independent checkbox options whose checked,
available, read-only, busy, and status states stay aligned across pointer,
touch, keyboard, and assistive technology.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: observational record, including the CheckboxList audit's
  concurrent-pending fix; public types, defaults, DOM ownership, targets, and
  focus order are unchanged
- Controlled/uncontrolled behavior: collection mode is controlled by `value`;
  standalone items follow `component:CheckboxListItem`; no uncontrolled mode
  exists
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The labeled checkbox group, its `checkbox-list` target, and the group's
  description, status, and disabled-reason relationships.
- Collection state shared with CheckboxListItem: checked membership, change
  ordering, optimistic pending values, and group-level availability.
- The composed option anatomy and its target dispositions (Theming anatomy
  below).

**Does not own / non-goals**

- Each option's behavior — its checkbox, naming and description, standalone
  mode, row-surface delegation and `onClick` routing, item disabled and loading
  states, density sizing, and checked-row fill — owned by
  `component:CheckboxListItem`.
- List and option-row presentation — owned by `component:List`; its
  `list-item` target reaches only the row root.
- The checkbox control, its indicator, focus ring, and pressed overlay — owned
  by `component:CheckboxInput` and `component:CheckboxIndicator`.
- Group-label and validation-message presentation — owned by `component:Field`
  and `component:FieldStatus`.
- Loading-indicator presentation — owned by `component:Spinner`; tooltip
  behavior — owned by `useTooltip`.
- New targets or reflected states for the row, descriptions, or caller content.

## Public concepts

| Concept          | Closed values or states                                     | Meaning                                                                                                              | Availability by variant/orientation/state | Default                   | Owner                  | Stability                              | Invalid-value behavior                                       |
| ---------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- | ---------------------- | -------------------------------------- | ------------------------------------------------------------ |
| group naming     | `label`, `isLabelHidden`, `description`                     | Names and describes the `role="group"`; a hidden label still names it.                                               | All states.                               | label required; visible   | caller and Field       | stable                                 | rejected by the public type                                  |
| collection value | `value` array present or absent                             | Present: the group owns checked membership and change handling for its items. Absent: its items are standalone.      | All states.                               | absent                    | caller and component   | stable                                 | an item without `value` in collection mode throws (item FR4) |
| change path      | `onChange`, `changeAction`, both, neither                   | Reports the next value array; `changeAction` runs after `onChange` in a transition with an optimistic value.         | Collection mode.                          | neither                   | caller and component   | shipped; handlerless meaning unsettled | no handler means no component-owned mutation                 |
| availability     | enabled, `isDisabled`, `isDisabled` with `disabledMessage`  | Blocks toggling on every item; a reason keeps the items focusable through `aria-disabled` and shows a group tooltip. | Reason applies only with `isDisabled`.    | enabled                   | component              | stable                                 | a reason without `isDisabled` renders nothing                |
| read-only        | `isReadOnly`                                                | Makes every item read-only.                                                                                          | Group-wide.                               | false                     | component              | stable                                 | boolean only                                                 |
| pending values   | the values whose `changeAction` is pending                  | Each pending value's item renders busy; toggling another item does not clear it; concurrent values settle together.  | Collection mode with `changeAction`.      | none                      | component              | stable                                 | transition state only                                        |
| status           | `warning`, `error`, `success`, optional message             | A message renders a detached FieldStatus after the list and describes the group.                                     | All states.                               | none                      | caller and FieldStatus | shipped; invalid semantics unsettled   | a status without a message renders nothing                   |
| row layout       | `density` compact/balanced/spacious; `hasDividers`; `width` | Density reaches the List and its rows; dividers separate rows; width sizes the label, list, and status together.     | All states.                               | balanced; none; intrinsic | component and List     | stable                                 | rejected by the public types                                 |
| pass-through     | CheckboxList rest, `ref`, `className`, `style`, `xstyle`    | Reach the field root.                                                                                                | All states.                               | none                      | component              | shipped; ARIA target unsettled         | component-owned attributes win                               |

Item props (`label`, `aria-label`, `description`, `endContent`, `isChecked`,
`onCheck`, item `isDisabled`, `isLoading`, and item pass-through) are concepts
of `component:CheckboxListItem`.

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                        | Basis                                                                             | Draft review state |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| FR1  | The render MUST place CheckboxListItem children inside a List within a `role="group"` named by the group label through `aria-labelledby`; its `aria-describedby` MUST list the description, status message, and disabled-reason tooltip that are present, in that order.                                   | shipped source; focused tests; WCAG 1.3.1 and 4.1.2                               | verify             |
| FR2  | The CheckboxList root MUST carry the current `checkbox-list` target.                                                                                                                                                                                                                                       | shipped source and public docs                                                    | settled            |
| FR4  | A status message MUST render through a detached FieldStatus after the list.                                                                                                                                                                                                                                | shipped source, focused tests, and Chromium receipts                              | verify             |
| FR6  | With a `value` array, the group MUST provide membership to its items, call `onChange` with the next array an item proposes (`component:CheckboxListItem` FR4), and then run `changeAction` with the same array in a transition with an optimistic value.                                                   | shipped source and focused tests                                                  | verify             |
| FR7  | The group MUST track every value whose `changeAction` is pending and expose it to its items, each of which renders busy (`component:CheckboxListItem` FR7); toggling another item MUST NOT clear an earlier pending value. Concurrent pending values settle together, after which every busy state clears. | shipped public `changeAction` promise; focused regression test; Chromium receipts | verify             |
| FR9  | Group `isDisabled` MUST natively disable every checkbox unless `disabledMessage` is set; with a reason, checkboxes MUST stay focusable through `aria-disabled`, show the reason tooltip on group hover and focus, and refuse toggling.                                                                     | shipped source, focused tests, and shared checkbox binding                        | verify             |
| FR10 | Group `isReadOnly` MUST make every item in the group read-only (`component:CheckboxListItem` FR8 and FR10).                                                                                                                                                                                                | shipped source; shared checkbox binding; `spec:AST-011` read-only vocabulary      | verify             |
| FR13 | `density` MUST reach the List and its rows (the checkbox size follows `component:CheckboxListItem` FR11); `hasDividers` MUST separate rows without a divider after the last row; `width` MUST size the label, list, and status together.                                                                   | shipped source, docs, and Chromium receipts                                       | verify             |
| GAP3 | An error `status` exposes no programmatic invalid state on the group or its checkboxes, and a status without a message renders nothing.                                                                                                                                                                    | shipped source; `spec:AST-002/FR15`                                               | owner decision     |
| GAP4 | Consumer ARIA pass-throughs on CheckboxList reach the field root rather than the named `role="group"`.                                                                                                                                                                                                     | shipped source; `architecture:public-component-api/INV5`                          | owner decision     |

Per-option requirements and gaps that earlier drafts listed here have one owner
(`architecture:knowledge-contracts/INV2`): former FR3 is
`component:CheckboxListItem` FR1; FR5 is its FR2, FR3, and content concept (the
target dispositions stay in the theming anatomy below); FR8 is its FR5; FR11 is
its FR1, FR9, and FR10; FR12 is its FR2 and FR3; and GAP1, GAP2, GAP5, and GAP6
keep their numbers there.

### Allowed variation

- **AV1 — Group content.** The label, description, status message, and width
  may vary within their public types.
- **AV2 — Theme paint.** The `checkbox-list` target and the composed group
  targets may change admitted visual properties without changing semantics or
  state precedence.

Option variation is `component:CheckboxListItem` AV1–AV3.

### Representative states

| State                      | Required invariant                                                                        | Allowed variation                  |
| -------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| Default collection         | Named group, options list, and rows render; membership reaches every item                 | Option content and selected values |
| Pending values             | Each pending value keeps its item busy until every pending value settles                  | Which options are pending          |
| Group disabled with reason | Checkboxes stay focusable and inoperable; the reason is reachable by hover, focus, and AT | Reason text                        |
| Group read-only            | Every item is read-only                                                                   | Which values are checked           |
| Group status with message  | Detached FieldStatus follows the group and describes it                                   | Error, warning, or success status  |

### Transformation and precedence order

- **ORD1 — Checked state.** Collection `value` → optimistic pending value → the
  membership each item reads (`component:CheckboxListItem` ORD1).
- **ORD2 — Toggle.** An item's proposed next array (`component:CheckboxListItem`
  ORD2) → `onChange` → `changeAction` in a transition that adds the toggled value
  to the pending set.
- **ORD3 — Availability.** Group disabled wins; a group reason changes
  focusability, not operability; group read-only applies to mutation only.

### Performance and resources

- **PR1 — Bounded resources.** The component owns no observer or global
  listener. Tooltip listeners are scoped to the group element and its lifetime.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Group identity.** The group name and its description, status, and
  disabled-reason relationships MUST remain programmatically determinable.
- **AR2, AR3, AR5 — Option semantics, keyboard parity, and busy perception** are
  owned by `component:CheckboxListItem` AR1, AR2, and AR4.
- **AR4 — Disabled reasons.** A group reason MUST stay discoverable by keyboard
  focus and assistive technology while toggling stays blocked.

## Design relationships

| Anatomy or state | Design requirement                                                           | Representation authority        | Hierarchy role | Component contract                    |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------- | -------------- | ------------------------------------- |
| Group            | Contains the current checkbox-group composition.                             | Current source and public docs  | Supporting     | FR1, FR2                              |
| Options list     | Presents the List-owned list and row roots.                                  | Current source                  | Supporting     | FR1, FR13                             |
| Option rows      | Present each option's checkbox, content, busy spinner, and checked-row fill. | `component:CheckboxListItem`    | Prominent      | `component:CheckboxListItem` FR1–FR13 |
| Status message   | Presents the group's current status.                                         | Current shared-component source | Supporting     | FR4                                   |

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
row surface, but not a checked-row state (`component:CheckboxListItem` GAP2).

## Family and system relationships

- `architecture:public-component-api` owns export reachability, pass-through
  preservation, styling composition, refs, and released-change rules.
- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, composition-preserving target ownership, and state
  reflection.
- `architecture:interaction-modality` owns focus visibility and the boundary
  between the focused checkbox and the element that paints its ring.
- `architecture:knowledge-contracts/INV2` keeps each per-option fact in
  `component:CheckboxListItem` rather than copying it here.
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

| Contract            | Verification                                                                                  | Representative states                                               | Mutation or failure expectation                                                                                                     | Audit section                   |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1, AR1            | `CheckboxList.test.tsx` group naming, description, status, and disabled-reason assertions     | Named group; description plus status; disabled reason               | Dropping the label, description, status, or tooltip id from the group fails the accessible name or description assertions.          | `audit:CheckboxList/a11y`       |
| FR4, FR6, FR7       | `CheckboxList.test.tsx` collection, status, and pending suites; Chromium `pending-*` receipts | add, remove; status; one pending value; two pending values; settled | A wrong array, a missing status, clearing an earlier pending value, allowing its re-toggle, or leaving busy after settlement fails. | `audit:CheckboxList/behavior`   |
| FR9, FR10, AR4      | `CheckboxList.test.tsx` disabled and read-only suites; shared checkbox bindings               | Group disabled; disabled with reason; group read-only               | A focusability, state, or reason expectation fails, or a toggle succeeds while the group is disabled or read-only.                  | `audit:CheckboxList/a11y`       |
| FR13                | Chromium density, divider, long-content, and RTL receipts                                     | compact, balanced, spacious; dividers; 320px long content; RTL      | A density, divider, width, overflow, or direction sensor fails.                                                                     | `audit:CheckboxList/responsive` |
| Local target source | `themingTargets.test.ts`                                                                      | `checkbox-list`                                                     | Source/docs target drift fails the repository target guard.                                                                         | `audit:CheckboxList/theming`    |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                 | Canonical anatomy and current local target                          | Canonical-key drift, invalid dispositions or target spelling, or an unclaimed current local target fails repository validation.     | `audit:CheckboxList/theming`    |

Per-option verification is owned by `component:CheckboxListItem`'s
verification map. No current repository check resolves `delegatesTo`
owner/target pairs; the pairs in this draft were verified manually, so semantic
delegation drift remains a validation gap.

## Decision log

None. This draft records shipped behavior; it introduces no new API, default,
target, or subjective visual decision.

## Open questions

- **OQ3 — Should an error status expose invalid state, and what should a status
  without a message render?** (`human-api`)
- **OQ4 — Which element owns consumer ARIA pass-throughs on CheckboxList?**
  (`human-api`) They currently reach the field root rather than the group.

Former OQ1, OQ2, OQ5, and OQ6 are per-option questions and keep their numbers in
`component:CheckboxListItem`.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, the per-option contract, or shared-component
contracts. It links to their owners.
