---
schema_version: 3
template_version: 3
kind: component
id: component:Section
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/Section/Section.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: [family:layout-regions]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Section component contract

## Intent

Section renders a painted container for a page region and places caller-provided
content inside it. This draft records current consumer anatomy and theming
ownership without changing layout, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The painted section container and its existing `section` theming target.

**Does not own / non-goals**

- The caller-provided content rendered inside the section.
- The outer layout wrapper as a consumer-facing anatomy part or theming target.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Section.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                         | Basis                           | Draft review state                                 |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | The current render places caller-provided content inside the inner container carrying the `section` target. | Current source, docs, and tests | Verified current behavior; no new behavior decided |

### Allowed variation

- Caller-provided content may vary without becoming Section-owned anatomy.

### Representative states

- The anatomy and target ownership are unchanged across the documented section
  variants, sizes, dividers, and padding inputs.

### Transformation and precedence order

- No new layout or style precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Section's existing accessibility behavior.

## Design relationships

| Anatomy or state  | Design requirement                                          | Representation authority       | Hierarchy role    | Component contract |
| ----------------- | ----------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Section container | Presents the current painted page-region container.         | Current source and public docs | Supporting        | FR1                |
| Consumer content  | Presents content supplied by the caller inside the section. | Caller-supplied content        | Context-dependent | FR1                |

The outer layout wrapper remains implementation structure and is not listed as
consumer anatomy.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Section container": {"target": "section"},
  "Consumer content": {
    "none": {
      "reason": "unsettled: No Section theming target reaches caller-provided content."
    }
  }
}
```

## Family and system relationships

This draft references the current shared owners without restating their rules:
`family:layout-regions`, `architecture:component-theming-surface`,
`architecture:container-padding`, and `architecture:public-component-api`.

## Verification map

| Contract            | Verification                               | Representative states                | Mutation or failure expectation                                                         | Audit section           |
| ------------------- | ------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | `Section.test.tsx` structure/target suites | Inner container and consumer content | Moving or removing the target or content fails existing structure and class assertions. | `audit:Section/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`              | Canonical anatomy and current target | Missing, extra, prefixed, or stale mappings fail repository validation.                 | `audit:Section/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
