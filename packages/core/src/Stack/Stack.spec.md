---
schema_version: 3
template_version: 3
kind: component
id: component:Stack
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [layout, theming]
verified_by:
  [
    packages/core/src/Stack/Stack.test.tsx,
    packages/core/src/Stack/StackItem.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:layout-primitives]
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:container-padding]
contributing: []
system_specs: []
---

# Stack component contract

## Intent

Stack arranges caller-supplied content along one flex axis. StackItem optionally
wraps one item to control its participation in that layout. This draft records
the current consumer anatomy and theming ownership without changing layout,
padding, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Stack container and its current `stack` theming target.
- The optional StackItem wrapper and its current `stack-item` theming target.

**Does not own / non-goals**

- Content supplied to Stack or StackItem — owned by the caller.
- Container-inset publication or descendant bleed behavior; Stack padding is
  currently local and does not participate in the container-padding protocol.
- New layout, padding, or responsive behavior.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `Stack.doc.mjs`; `family:layout-primitives` owns the shared layout vocabulary.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                            | Basis                                   | Draft review state                                 |
| --- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------- |
| FR1 | Stack, HStack, and VStack render caller content in a container carrying the current `stack` target.            | Current source, docs, tests, and family | Verified current behavior; no new behavior decided |
| FR2 | StackItem renders caller content in its own wrapper carrying the current `stack-item` target.                  | Current source, docs, and tests         | Verified current behavior; no new behavior decided |
| FR3 | Stack and StackItem render caller-supplied content directly without applying a content-specific public target. | Current source and tests                | Verified current behavior; no target change        |
| FR4 | Stack's existing padding remains local and does not publish container-padding geometry to descendants.         | Current source and architecture record  | Verified current behavior; no protocol change      |

### Allowed variation

- Caller content may render directly in Stack or inside optional StackItem
  wrappers without changing target ownership.

### Representative states

- Horizontal and vertical Stack forms use the same container target. StackItem
  uses its item target across static, fill, and scrollable behavior.

### Transformation and precedence order

- No new direction, alignment, spacing, sizing, or padding precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Stack's polymorphic element, forwarded DOM
props, or caller-owned content semantics.

## Design relationships

| Anatomy or state | Design requirement                                         | Representation authority                  | Hierarchy role    | Component contract |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------- | ----------------- | ------------------ |
| Stack container  | Presents the one-dimensional layout container.             | Current source, docs, and family contract | Supporting        | FR1, FR4           |
| Item             | Optionally controls one child's participation in Stack.    | Current source, docs, and family contract | Supporting        | FR2                |
| Content          | Presents caller-supplied content in either public wrapper. | Caller-supplied content                   | Context-dependent | FR1, FR2, FR3      |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Stack container": {"target": "stack"},
  "Item": {"target": "stack-item"},
  "Content": {
    "none": {
      "reason": "intentional: Caller-supplied content retains its own theming ownership; Stack and StackItem apply no content target."
    }
  }
}
```

## Family and system relationships

- `family:layout-primitives` owns Stack's shared direction, alignment, spacing,
  sizing, padding, and item-participation vocabulary.
- `architecture:container-padding` records that Stack padding is local and does
  not publish descendant bleed geometry.
- `architecture:component-theming-surface` owns anatomy qualification and target
  mapping rules.

## Verification map

| Contract            | Verification                                       | Representative states                          | Mutation or failure expectation                                                        | Audit section             |
| ------------------- | -------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------- |
| FR1, FR3, FR4       | `Stack.test.tsx` render, props, and padding suites | Horizontal/vertical, direct content, padding   | Removing the container/content or changing shipped local padding fails existing tests. | `audit:Stack/anatomy`     |
| FR2, FR3            | `StackItem.test.tsx` render and behavior suites    | Static, fill, polymorphic, and scrollable item | Removing the wrapper/content or changing current item behavior fails existing tests.   | `audit:StackItem/anatomy` |
| Target inventory    | `packages/core/src/theme/themingTargets.test.ts`   | Stack and StackItem targets                    | Runtime and documented target metadata drift fails target validation.                  | `audit:Stack/theming`     |
| Theming anatomy map | `scripts/check-knowledge.mjs`                      | Canonical anatomy and both current targets     | Missing, extra, prefixed, or stale mappings fail repository validation.                | `audit:Stack/theming`     |

## Decision log

None. This draft records current facts and introduces no component-local design,
layout, or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, family layout
rules, container-padding mechanics, implementation steps, or system rules. It
links to their owners.
