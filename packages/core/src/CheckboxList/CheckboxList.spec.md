---
schema_version: 1
template_version: 3
kind: component
id: component:CheckboxList
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/CheckboxList/CheckboxList.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# CheckboxList component contract

## Intent

CheckboxList presents a labeled group of checkbox options. This draft records
its current consumer anatomy and the theming ownership of parts rendered by
CheckboxList, List, CheckboxInput, Field, FieldStatus, and Spinner. It changes no
runtime behavior or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The checkbox-group composition and its existing `checkbox-list` target.
- Collection state shared with CheckboxListItem.

**Does not own / non-goals**

- List and option-row presentation — owned by `component:List`; its
  `list-item` target reaches only the row root.
- Standard option-label and option-description wrappers — rendered as separate,
  untargeted spans by Item rather than Text; rich label content and end content
  remain caller-owned.
- The checkbox indicator — owned by `component:CheckboxInput`.
- Group-label and validation-message presentation — owned by `component:Field`
  and `component:FieldStatus`.
- Loading-indicator presentation — owned by `component:Spinner`.
- New targets for untargeted descriptions or caller-provided item content.

## Public concepts

No new public concept is introduced. Consumer props, collection and standalone
item modes, and usage remain documented in `CheckboxList.doc.mjs` and
`CheckboxListItem.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                    | Basis                                   | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------- |
| FR1 | The current render places CheckboxListItem children inside a List and a group named by the group label.                                                | Current source, docs, and focused tests | Verified current behavior; no new behavior decided |
| FR2 | The CheckboxList root carries the current `checkbox-list` target.                                                                                      | Current source and public docs          | Verified current behavior; no target change        |
| FR3 | The option-row root and checkbox indicator continue to be rendered by List and CheckboxInput rather than reimplemented.                                | Current source                          | Verified composition boundary                      |
| FR5 | Item renders option label and description as separate untargeted children; end content remains caller-provided inside its own untargeted slot wrapper. | Current source and focused tests        | Verified child ownership; no target change         |
| FR4 | A pending item renders Spinner inside that item's checkbox; a status message renders through detached FieldStatus.                                     | Current source, docs, and focused tests | Verified conditional composition                   |

### Allowed variation

- Option labels, descriptions, and end content may vary with caller-provided
  CheckboxListItem content without becoming new CheckboxList targets.
- Density, dividers, checked state, and disabled state remain capabilities of
  their current owning components rather than separate anatomy parts.

### Representative states

| State                     | Required invariant                                              | Allowed variation                  |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------- |
| Default collection        | Named group, options list, rows, and checkbox indicators render | Option content and selected values |
| Item pending              | Only the pending checkbox includes a Spinner                    | Which option is pending            |
| Group status with message | Detached FieldStatus follows the group                          | Error, warning, or success status  |

### Transformation and precedence order

- No new state, event, layout, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend CheckboxList's existing group naming,
checkbox semantics, focus order, busy state, or description/status association.

## Design relationships

| Anatomy or state   | Design requirement                                                           | Representation authority        | Hierarchy role | Component contract |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------- | -------------- | ------------------ |
| Group              | Contains the current checkbox-group composition.                             | Current source and public docs  | Supporting     | FR1, FR2           |
| Options and rows   | Present the List-owned list and row root plus Item-rendered child structure. | Current source                  | Supporting     | FR1, FR3           |
| Checkbox           | Presents each option's current selection indicator.                          | Current CheckboxInput source    | Prominent      | FR3                |
| Spinner and status | Present the current conditional feedback components.                         | Current shared-component source | Supporting     | FR4                |

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
CheckboxList's public theming ownership.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, and composition-preserving target ownership.
- List, CheckboxInput, Field, FieldStatus, and Spinner retain their existing
  public target contracts when composed by CheckboxList.

## Verification map

| Contract            | Verification                                                                                         | Representative states                                        | Mutation or failure expectation                                                                                                 | Audit section                |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, FR3, FR5       | `CheckboxList.test.tsx` structure, content, and interaction suites plus `Item.tsx` source inspection | Collection mode; string/rich label; description; end content | Removing the group, row, checkbox, or separate content children breaks existing DOM and interaction assertions.                 | `audit:CheckboxList/anatomy` |
| FR4                 | `CheckboxList.test.tsx` loading and status suites                                                    | Pending item and detached status                             | Removing composed feedback breaks existing spinner, busy-state, or message assertions.                                          | `audit:CheckboxList/anatomy` |
| Local target source | `themingTargets.test.ts`                                                                             | `checkbox-list`                                              | Source/docs target drift fails the repository target guard.                                                                     | `audit:CheckboxList/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                        | Canonical anatomy and current local target                   | Canonical-key drift, invalid dispositions or target spelling, or an unclaimed current local target fails repository validation. | `audit:CheckboxList/theming` |

The focused CheckboxList suite does not pin the exact delegated target classes
or the local `checkbox-list` class in rendered DOM. The source/metadata target
guard independently verifies that each owner's emitted targets remain
documented. No current repository check resolves `delegatesTo` owner/target
pairs; the pairs in this draft were verified manually, so semantic delegation
drift remains a validation gap.

## Decision log

None. This draft records current facts and introduces no component-local design
or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or shared-component contracts. It links to their owners.
