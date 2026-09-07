---
schema_version: 3
template_version: 3
kind: component
id: component:Switch
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/Switch/Switch.test.tsx,
    packages/core/src/Switch/__tests__/Switch.a11y.test.tsx,
    packages/core/src/Switch/__tests__/Switch.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Switch component contract

## Intent

Switch presents a labeled boolean control whose change takes effect immediately.
This draft records current consumer anatomy and theming ownership without
changing runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged; Switch remains controlled
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The switch field, track, thumb, and label presentations represented by the
  existing `switch-field`, `switch`, `switch-thumb`, and `switch-label` targets.

**Does not own / non-goals**

- Description styling through a dedicated public target; none currently exists.
- Validation-message presentation — owned by `component:FieldStatus`.
- Loading-indicator presentation — owned by `component:Spinner`.
- Tooltip surfaces used for shared label and disabled-reason behavior.

## Public concepts

No new public concept is introduced. Consumer props, states, and usage remain
documented in `Switch.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                    | Basis                                   | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------- |
| FR1 | The current render places a thumb inside the switch track and arranges that control with its label.    | Current source, docs, and focused tests | Verified current behavior; no new behavior decided |
| FR2 | The field, track, thumb, and label carry their existing local targets.                                 | Current source, public docs, and tests  | Verified current behavior; no target change        |
| FR3 | A busy switch renders Spinner inside the thumb; a status message renders through detached FieldStatus. | Current source, docs, and focused tests | Verified conditional composition                   |

### Allowed variation

- Label position and spacing, size, checked state, and disabled state remain
  current target capabilities rather than separate anatomy parts.
- A description may be absent without changing the remaining anatomy.

### Representative states

| State               | Required invariant                                      | Allowed variation                      |
| ------------------- | ------------------------------------------------------- | -------------------------------------- |
| Off or on           | Track, thumb, and label render within the switch field. | Checked state, size, label placement   |
| Busy                | Spinner renders inside the thumb.                       | Controlled or optimistic checked value |
| Status with message | Detached FieldStatus follows the switch row.            | Error, warning, or success status      |

### Transformation and precedence order

- No new state, event, layout, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Switch's existing accessible name, switch
role, checked state, busy state, description/status association, or disabled
behavior.

Switch binds to the shared switch-pattern accessibility contract
(`internal/a11y-spec`, authored under
[AST-020](../../../../docs/specs/AST-020/spec.md) and migrated under
[AST-021](../../../../docs/specs/AST-021/spec.md)). The binding owns the
standards-derived outcomes — role, accessible name, exposed on/off state,
description, disabled exposure and inoperability, pointer and keyboard
activation, pointer cancellation, and focus staying put on change — across the
representative states listed in
`__tests__/Switch.a11y.states.ts`. Callback payloads, form participation,
disabled-reason tooltip composition, and styling remain Switch-owned and stay in
`Switch.test.tsx`.

## Design relationships

| Anatomy or state | Design requirement                                       | Representation authority        | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------- | ------------------------------- | -------------- | ------------------ |
| Field            | Arranges the switch control with its label and feedback. | Current source and public docs  | Supporting     | FR1, FR2           |
| Track and thumb  | Present the current on/off control.                      | Current source and public docs  | Prominent      | FR1, FR2           |
| Label            | Identifies the controlled setting.                       | Current source and public docs  | Prominent      | FR1, FR2           |
| Spinner/status   | Present conditional progress and validation feedback.    | Current shared-component source | Supporting     | FR3                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Field": {"target": "switch-field"},
  "Track": {"target": "switch"},
  "Thumb": {"target": "switch-thumb"},
  "Label": {"target": "switch-label"},
  "Description": {
    "none": {
      "reason": "unsettled: No current public target reaches the stable Description; future exposure still needs an owner decision"
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
reaches it. The map classifies future exposure as unsettled rather than silently
making the absence intentional.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, and composition-preserving target ownership.
- FieldStatus and Spinner retain their existing public target contracts when
  composed by Switch.

## Verification map

| Contract                         | Verification                                                                                                                                 | Representative states                                                                                                    | Mutation or failure expectation                                                                                                                                                                                                                                                                                        | Audit section          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR1                              | `Switch.test.tsx` structure and interaction suites                                                                                           | On/off, size, label position, hidden label                                                                               | Removing or reordering stable parts breaks existing role, label, or DOM assertions.                                                                                                                                                                                                                                    | `audit:Switch/anatomy` |
| FR2                              | `Switch.test.tsx` label-target suite and `themingTargets.test.ts`                                                                            | Current local targets                                                                                                    | Removing the label target fails focused coverage; source/docs drift fails the target guard.                                                                                                                                                                                                                            | `audit:Switch/theming` |
| FR3                              | `Switch.test.tsx` loading and status suites                                                                                                  | Busy and detached status                                                                                                 | Removing composed feedback breaks existing spinner, busy-state, or message assertions.                                                                                                                                                                                                                                 | `audit:Switch/anatomy` |
| Switch pattern — semantics       | `__tests__/Switch.a11y.test.tsx` (DOM layer, higher layers reported unrun) and `__tests__/Switch.a11y.chromium.spec.ts` (accessibility tree) | Off, on, on after a controlled update, described, hidden label, disabled, focusable-disabled, required, invalid, loading | Losing the switch role, the accessible name, the visible label's words within that name, the exposed on/off state, an attached description, or disabled, required, and invalid exposure fails the shared contract.                                                                                                     | `audit:Switch/anatomy` |
| Switch pattern — interaction     | `__tests__/Switch.a11y.chromium.spec.ts` (real browser)                                                                                      | Off, on, on after a controlled update, focusable-disabled, loading                                                       | Losing either direction of a pointer or Space round trip, letting a press slid off the control still change it (WCAG 2.5.2), moving focus when the state changes (WCAG 3.2.2), failing to reach or leave the control by Tab, or changing a state the user is not meant to be able to change fails the shared contract. | `audit:Switch/anatomy` |
| Switch pattern — label stability | `__tests__/Switch.a11y.chromium.spec.ts`, reported not gated                                                                                 | Every operable state                                                                                                     | The APG requires the label not to change with the state. No current record adopts it, so the expectation is advisory: a name that flips across a round trip is reported, and does not fail the build.                                                                                                                  | `audit:Switch/anatomy` |
| Switch pattern — state inventory | `__tests__/Switch.a11y.chromium.spec.ts` inventory assertion                                                                                 | Every bound state                                                                                                        | The labels `__tests__/Switch.a11y.states.ts` claims each state renders are compared against the rendered page, so a stale inventory is reported as one rather than as a standards failure.                                                                                                                             | `audit:Switch/anatomy` |
| Theming anatomy map              | `scripts/check-knowledge.mjs`                                                                                                                | Canonical anatomy and all current targets                                                                                | Canonical-key drift, invalid dispositions or target spelling, or an unclaimed current local target fails repository validation.                                                                                                                                                                                        | `audit:Switch/theming` |

The focused Switch suite pins `switch-label`, but does not separately assert the
exact `switch-field`, `switch`, or `switch-thumb` class placement. The
source/metadata target guard covers those local declarations. No current
repository check resolves `delegatesTo` owner/target pairs; the pairs in this
draft were verified manually, so semantic delegation drift remains a validation
gap.

## Decision log

None. This draft records current facts and introduces no component-local design
or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or shared-component contracts. It links to their owners.
