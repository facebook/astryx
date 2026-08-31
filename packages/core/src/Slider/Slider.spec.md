---
schema_version: 1
template_version: 3
kind: component
id: component:Slider
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/Slider/Slider.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Slider component contract

## Intent

Slider presents a labeled control for selecting one numeric value or a bounded
range. This draft records its current consumer anatomy and theming ownership
without changing runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged; Slider remains controlled
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The current slider row, background track, filled range, tick marks and labels,
  thumbs, and adjacent text value presentation.
- The existing `slider`, `slider-track`, and `slider-thumb` public targets.

**Does not own / non-goals**

- Label and validation-message presentation — owned by `component:Field` and
  `component:FieldStatus`.
- Value-tooltip presentation — owned by `component:Tooltip`.
- New public targets for the filled range, tick marks, mark labels, description,
  or adjacent text value display.
- A decision that the current target asymmetry should be preserved or removed.

## Public concepts

No new public concept is introduced. Consumer props, modes, states, and usage
remain documented in `Slider.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                       | Basis                                   | Draft review state                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------- |
| FR1 | The current render places a filled range, one or two thumbs, and optional tick marks over the background track.                           | Current source, docs, and focused tests | Verified current behavior; no new behavior decided |
| FR2 | `Slider`, `Track`, and `Thumb` carry the existing `slider`, `slider-track`, and `slider-thumb` targets respectively.                      | Current source and public docs          | Verified current behavior; no target change        |
| FR3 | Filled range, tick marks, mark labels, and adjacent text value display are stable rendered parts without their own current Slider target. | Current source and public docs          | Verified current asymmetry; not ratified as policy |
| FR4 | Label and status presentation continue to use Field and FieldStatus; value tooltips continue to use Tooltip.                              | Current source and focused tests        | Verified composition boundary                      |

### Observed current target asymmetry

ProgressBar currently exposes targets for its fill and marks, while Slider
exposes targets for its root row, background track, and thumbs but not its
filled range, tick marks, mark labels, or adjacent text value display. This is
implementation evidence for a joint audit, not approval of either target shape.

### Allowed variation

- Orientation, single or range mode, disabled state, value-display mode, and the
  number or labels of supplied marks remain current capabilities rather than
  separate target names.
- A description, status message, mark label, text value, or value tooltip may be
  absent without changing the remaining anatomy.

### Representative states

| State                    | Required invariant                                                      | Allowed variation                                  |
| ------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Single value             | One thumb and a filled range render over the track.                     | Orientation, value, disabled state, value display  |
| Range value              | Two thumbs bound the filled range.                                      | Values and minimum step separation                 |
| With marks               | Tick marks and optional mark labels align to the same range geometry.   | Mark count, values, and label presence             |
| With shared field output | Field or Tooltip renders the requested label, feedback, or value layer. | Description, status, disabled reason, tooltip mode |

### Transformation and precedence order

- No new value, snapping, geometry, interaction, or styling precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Slider's existing accessible name, value,
range-thumb naming, description/status association, keyboard behavior, disabled
behavior, or value-tooltip behavior.

## Design relationships

| Anatomy or state        | Design requirement                                            | Representation authority        | Hierarchy role | Component contract |
| ----------------------- | ------------------------------------------------------------- | ------------------------------- | -------------- | ------------------ |
| Label and description   | Identify and explain the numeric setting.                     | Current shared-component source | Supporting     | FR4                |
| Slider and track        | Arrange the current interactive range control and rail.       | Current source and public docs  | Prominent      | FR1, FR2           |
| Filled range and thumbs | Show the selected value or interval over the available range. | Current source and public docs  | Prominent      | FR1, FR2, FR3      |
| Tick marks and labels   | Show optional supplied positions and their text.              | Current source and public docs  | Supporting     | FR1, FR3           |
| Value presentation      | Shows the formatted value as text or a shared Tooltip.        | Current source and public docs  | Supporting     | FR3, FR4           |
| Status message          | Presents shared validation feedback below the slider.         | Current shared-component source | Supporting     | FR4                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Description": {
    "none": {
      "reason": "unsettled: No current public target reaches this part; future target ownership is undecided."
    }
  },
  "Slider": {"target": "slider"},
  "Track": {"target": "slider-track"},
  "Filled range": {
    "none": {
      "reason": "unsettled: No current public Slider target reaches this part; future target ownership is undecided."
    }
  },
  "Tick mark": {
    "none": {
      "reason": "unsettled: No current public Slider target reaches this part; future target ownership is undecided."
    }
  },
  "Mark label": {
    "none": {
      "reason": "unsettled: No current public Slider target reaches this part; future target ownership is undecided."
    }
  },
  "Thumb": {"target": "slider-thumb"},
  "Value display": {
    "none": {
      "reason": "unsettled: No current public Slider target reaches this part; future target ownership is undecided."
    }
  },
  "Value tooltip": {
    "delegatesTo": {"owner": "component:Tooltip", "target": "tooltip"}
  },
  "Status message": {
    "delegatesTo": {
      "owner": "component:FieldStatus",
      "target": "field-status"
    }
  }
}
```

`Filled range`, `Tick mark`, `Mark label`, and `Value display` remain stable
consumer anatomy, but no current Slider target reaches them. The map records
those gaps without making their absence intentional. `Value display` names the
adjacent text mode; the separately listed value tooltip retains Tooltip's target.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, and composition-preserving target ownership.
- Field, FieldStatus, and Tooltip retain their existing public target contracts
  when composed by Slider.
- Slider and ProgressBar both render a track, a filled segment, positioned
  indicators, and optional value presentation, while their current target
  coverage differs. That evidence requires a future joint family/audit pass; it
  does not declare a current family, require a new target, or authorize runtime
  behavior changes.

## Verification map

| Contract            | Verification                                                                           | Representative states                             | Mutation or failure expectation                                                                                      | Audit section          |
| ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR1                 | `Slider.test.tsx` structure, range, and marks suites                                   | Single, range, horizontal, vertical, marks        | Removing or misaligning stable parts breaks existing role, position, or mark assertions.                             | `audit:Slider/anatomy` |
| FR2                 | `themingTargets.test.ts`                                                               | Root, track, and thumb target call sites          | Source and public target metadata drift fails the target guard.                                                      | `audit:Slider/theming` |
| FR3                 | Source and consumer-doc review                                                         | Filled range, marks, labels, adjacent text value  | A missing target is inaccurately documented as present or intentionally permanent.                                   | `audit:Slider/theming` |
| FR4                 | Source inspection; focused tests cover label, status, and disabled-reason Tooltip only | Label, status, value tooltip, disabled reason     | Shared composition or its accessible association disappears; value-tooltip composition still lacks focused coverage. | `audit:Slider/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                          | Canonical anatomy and three current local targets | Missing, extra, prefixed, stale, or unclaimed mappings fail repository validation.                                   | `audit:Slider/theming` |

The focused Slider suite does not separately assert the exact `slider`,
`slider-track`, or `slider-thumb` class placement. The source/metadata target
guard covers those declarations. It also covers only the disabled-reason
Tooltip path, not the `valueDisplay="tooltip"` composition; that anatomy is
source-inspected and remains missing focused test coverage.

## Decision log

None. This draft records current facts and introduces no component-local design,
family, theming, or API decision.

## Open questions

- **OQ1 — After a joint ProgressBar and Slider family audit, should any shared
  painted parts have aligned target coverage?** (`human-api`)

This question records the audit need only. It does not presume that either
component should add, remove, or rename a target.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, audit outcomes, or shared-component contracts. It links to their owners.
