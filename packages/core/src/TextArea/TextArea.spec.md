---
schema_version: 1
template_version: 3
kind: component
id: component:TextArea
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/TextArea/TextArea.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# TextArea component contract

## Intent

TextArea presents a labeled multi-line text field. This draft records its current
consumer anatomy and the theming ownership of parts rendered by TextArea, Field,
FieldStatus, and Spinner. It changes no runtime behavior or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged; TextArea remains controlled
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The painted input container, native text area, and character counter represented
  by the existing `text-area`, `text-area-control`, and `text-area-counter`
  targets.

**Does not own / non-goals**

- Label and attached/detached validation-message presentation — owned by
  `component:Field` and `component:FieldStatus`.
- The tooltip-variant status surface — owned by `component:Tooltip`.
- Standard start-icon presentation and the shared on-field status icon — owned
  by `component:Icon` and `component:Field`, respectively.
- Loading-indicator presentation — owned by `component:Spinner`.
- Caller-provided custom start content outside Icon's supported source forms.
- The deprecated `textarea` alias as separate anatomy.

## Public concepts

No new public concept is introduced. Consumer props, states, and usage remain
documented in `TextArea.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                 | Basis                                   | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------- |
| FR1 | The current render places the native text area inside its painted input container.                                                                                  | Current source, docs, and focused tests | Verified current behavior; no new behavior decided |
| FR2 | The input container, native control, and conditional character counter carry the three current local targets.                                                       | Current source and public docs          | Verified current behavior; no target change        |
| FR3 | Label, standard start icon, loading indicator, status icon, and status surfaces continue to use their shared Field, Icon, Spinner, FieldStatus, and Tooltip owners. | Current source                          | Verified conditional composition boundary          |
| FR4 | Placeholder text remains part of the native control; the over-limit glyph remains part of the character counter.                                                    | Current source, docs, and focused tests | Verified current grouping                          |

### Allowed variation

- Value, placeholder, row count, size, status, disabled/read-only state, and
  optional slots remain current capabilities rather than separate target names.
- Start-icon content may be an Icon-supported value or caller-supplied ReactNode.

### Representative states

| State                | Required invariant                                                     | Allowed variation                   |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| Default editable     | Label, input container, and native text area render.                   | Value, placeholder, rows, and size  |
| With character limit | Character counter renders inside the input container.                  | Count and over-limit state          |
| Busy or status       | Shared Spinner or status presentation renders in its current location. | Status variant and message presence |

### Transformation and precedence order

- No new value, layout, status, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend TextArea's existing label, description,
status, counter, busy state, disabled/read-only state, or announcement behavior.

## Design relationships

| Anatomy or state      | Design requirement                                                   | Representation authority        | Hierarchy role | Component contract |
| --------------------- | -------------------------------------------------------------------- | ------------------------------- | -------------- | ------------------ |
| Input container       | Presents the current painted field boundary.                         | Current source and public docs  | Supporting     | FR1, FR2           |
| Text area             | Presents and edits the current multi-line value.                     | Current source and public docs  | Prominent      | FR1, FR2           |
| Character counter     | Presents current and maximum character counts.                       | Current source and public docs  | Supporting     | FR2, FR4           |
| Shared field feedback | Presents current label, standard icons, status, and loading content. | Current shared-component source | Supporting     | FR3                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Description": {
    "none": {
      "reason": "unsettled: No current public target reaches the stable Description; future exposure still needs an owner decision"
    }
  },
  "Input container": {"target": "text-area"},
  "Text area": {"target": "text-area-control"},
  "Placeholder": {"inherits": "text-area-control"},
  "Start icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Custom start content": {
    "none": {
      "reason": "intentional: Custom start content is caller-provided ReactNode content outside TextArea's public theming ownership"
    }
  },
  "Spinner": {
    "delegatesTo": {"owner": "component:Spinner", "target": "spinner"}
  },
  "Status icon": {
    "delegatesTo": {
      "owner": "component:Field",
      "target": "input-status-icon"
    }
  },
  "Character counter": {"target": "text-area-counter"},
  "Field status message": {
    "delegatesTo": {
      "owner": "component:FieldStatus",
      "target": "field-status"
    }
  },
  "Tooltip status message": {
    "delegatesTo": {"owner": "component:Tooltip", "target": "tooltip"}
  }
}
```

`Description` remains stable consumer anatomy, but no current public target
reaches it; future exposure remains unsettled. Semantic names and icon component
values render through Icon and delegate to its `icon` target; arbitrary ReactNode
start content is caller-provided and intentionally stays outside TextArea's
public theming ownership. Attached and detached status messages delegate to
FieldStatus, while the tooltip variant delegates its rendered surface to Tooltip.
The deprecated `textarea` alias is compatibility evidence only and does not
appear in the map.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, composition-preserving ownership, and alias exclusion.
- Field, FieldStatus, Icon, Spinner, and Tooltip retain their existing public
  target contracts when composed by TextArea.

## Verification map

| Contract            | Verification                                                                                  | Representative states                                                    | Mutation or failure expectation                                                                                                                 | Audit section            |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1, FR4            | `TextArea.test.tsx` structure and counter suites                                              | Default, placeholder, counter, over limit                                | Removing or regrouping stable parts breaks existing role, content, or DOM assertions.                                                           | `audit:TextArea/anatomy` |
| FR2                 | `TextArea.test.tsx` root-target suite and `themingTargets.test.ts`                            | Current and deprecated root names; current targets                       | Removing root compatibility classes fails focused coverage; source/docs drift fails the target guard.                                           | `audit:TextArea/theming` |
| FR3                 | `TextArea.test.tsx`, `useInputStatusIcon.test.tsx`, and source inspection of `renderIconSlot` | Standard/custom start content; Spinner; attached/detached/tooltip status | Removing or rerouting composed content breaks existing icon, spinner, tooltip, message, or association assertions.                              | `audit:TextArea/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                 | Canonical anatomy and current local targets                              | Canonical-key drift, invalid dispositions or target spelling, alias-backed local claims, or an unclaimed current local target fails validation. | `audit:TextArea/theming` |

The focused TextArea suite pins the current and deprecated root classes, but does
not separately assert the exact `text-area-control` or `text-area-counter` class
placement. The source/metadata target guard covers those local declarations. No
current repository check resolves `delegatesTo` owner/target pairs; the pairs in
this draft were verified manually, so semantic delegation drift remains a
validation gap.

## Decision log

None. This draft records current facts and introduces no component-local design
or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or shared-component contracts. It links to their owners.
