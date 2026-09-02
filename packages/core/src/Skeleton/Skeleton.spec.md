---
schema_version: 3
template_version: 3
kind: component
id: component:Skeleton
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/Skeleton/Skeleton.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: []
---

# Skeleton component contract

## Intent

Skeleton renders a placeholder shape while surrounding content loads. This draft
records the component's current consumer anatomy and theming ownership without
changing its runtime contract.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The rendered placeholder shape and its existing `skeleton` theming target.

**Does not own / non-goals**

- The surrounding content's loading state, layout, or replacement timing — owned
  by the product callsite.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Skeleton.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                 | Basis                           | Draft review state                                 |
| --- | ----------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | The current render contains one painted placeholder carrying the `skeleton` target. | Current source, docs, and tests | Verified current behavior; no new behavior decided |

### Allowed variation

- This documentation does not constrain behavior beyond the factual anatomy and
  target relationship recorded here.

### Representative states

- The anatomy and target relationship is the same for the documented size,
  radius, and animation inputs.

### Transformation and precedence order

- No new ordering rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Skeleton's existing accessibility behavior.

## Design relationships

| Anatomy or state | Design requirement                         | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------ | ------------------------------ | -------------- | ------------------ |
| Placeholder      | Represents the current painted loading UI. | Current source and public docs | Supporting     | FR1                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Placeholder": {"target": "skeleton"}
}
```

## Family and system relationships

This draft references the current shared owners without restating their rules:
`architecture:component-theming-surface` and
`architecture:public-component-api`.

## Verification map

| Contract            | Verification                     | Representative states                | Mutation or failure expectation                                         | Audit section            |
| ------------------- | -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- | ------------------------ |
| FR1                 | `Skeleton.test.tsx` render suite | A rendered placeholder               | Removing the placeholder fails the existing render assertion.           | `audit:Skeleton/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`    | Canonical anatomy and current target | Missing, extra, prefixed, or stale mappings fail repository validation. | `audit:Skeleton/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
