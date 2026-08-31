---
schema_version: 1
template_version: 3
kind: component
id: component:StatusDot
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/StatusDot/StatusDot.test.tsx, scripts/check-knowledge.mjs]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# StatusDot component contract

## Intent

StatusDot renders a compact painted status signal with an optional status icon.
This draft records the current consumer anatomy and theming ownership without
changing runtime behavior, target compatibility, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The painted dot and its current `status-dot` theming target.
- The wrapper that positions optional status-icon content inside the dot.

**Does not own / non-goals**

- The artwork supplied through `icon` — owned by the caller.
- The tooltip surface or trigger behavior when `tooltip` is supplied — owned by
  Tooltip.
- A built-in icon for each variant — the default dot remains childless.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `StatusDot.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                | Basis                           | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------- |
| FR1 | The current render always contains one painted dot carrying the `status-dot` target.                               | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | When renderable icon content is supplied, it appears in an assistive-technology-hidden wrapper inside the dot.     | Current source and tests        | Verified current behavior; no new behavior decided |
| FR3 | The deprecated `statusdot` class remains emitted beside `status-dot` for compatibility but is not current anatomy. | Current source, docs, and tests | Verified current behavior; no target change        |

### Allowed variation

- Caller-supplied icon artwork may vary without creating a separate public
  target.

### Representative states

- The anatomy and target ownership are unchanged across semantic variants and
  pulsing state. The optional status icon is absent when its content is not
  renderable.

### Transformation and precedence order

- No new rendering, styling, or target precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend StatusDot's existing role, accessible-name,
reduced-motion, or decorative-icon behavior.

## Design relationships

| Anatomy or state | Design requirement                                        | Representation authority       | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Dot              | Presents the current painted semantic-status signal.      | Current source and public docs | Supporting     | FR1, FR3           |
| Status icon      | Presents optional caller-supplied artwork inside the dot. | Current source and tests       | Supporting     | FR2                |

The deprecated `statusdot` alias is compatibility metadata, not a separate
anatomy part or current target.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Dot": {"target": "status-dot"},
  "Status icon": {"inherits": "status-dot"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification,
  inheritance, and deprecated-alias exclusion.

## Verification map

| Contract            | Verification                                       | Representative states                 | Mutation or failure expectation                                                       | Audit section             |
| ------------------- | -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| FR1, FR2            | `StatusDot.test.tsx` render and custom-icon suites | Plain dot and dot with supplied icon  | Removing the dot or changing optional icon rendering fails existing DOM assertions.   | `audit:StatusDot/anatomy` |
| FR3                 | `StatusDot.test.tsx` theme-target-name suite       | Current and deprecated target classes | Removing either emitted compatibility class fails the existing target assertion.      | `audit:StatusDot/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                      | Canonical anatomy and current target  | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation. | `audit:StatusDot/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
