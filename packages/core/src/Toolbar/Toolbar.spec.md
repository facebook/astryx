---
schema_version: 1
template_version: 3
kind: component
id: component:Toolbar
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Toolbar/Toolbar.test.tsx,
    packages/core/src/Section/Section.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
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

# Toolbar component contract

## Intent

Toolbar presents a named contextual action region with one semantic toolbar row
inside Section-owned outer chrome. This draft records the current consumer
anatomy and theming ownership without changing layout, keyboard behavior,
targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The named toolbar row, toolbar semantics, start/optional-center/end layout,
  keyboard movement, size cascade, and current `toolbar` target.

**Does not own / non-goals**

- The painted outer chrome, variant, block padding, and selected divider edges —
  delegated to `component:Section`.
- Content supplied through the three layout slots — owned by the caller or its
  rendered components.
- A general arbitrary-child layout primitive contract.
- New runtime behavior, targets, props, or target placement.

## Public concepts

No new public concept is introduced. Consumer props, slots, and usage remain
documented in `Toolbar.doc.mjs`; `family:layout-regions` owns the shared
structural-region boundary.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                              | Basis                                      | Draft review state                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| FR1 | The current render contains Section-owned Outer chrome around one named Toolbar carrying `role="toolbar"` and the current `toolbar` target.                      | Current source, docs, tests, and family    | Verified current behavior; no new behavior decided |
| FR2 | The Toolbar uses its current two-lane layout without center content and its current three-lane layout when center content is supplied.                           | Current source and focused structure tests | Verified current behavior; no layout change        |
| FR3 | Variant, selected divider edges, and outer padding remain delegated to Section, while Toolbar retains toolbar semantics, keyboard behavior, and internal layout. | Current source, docs, and family contract  | Verified current ownership; no target change       |

### Allowed variation

- Caller content may be absent or supplied in the start, center, and end slots
  without changing Outer chrome or Toolbar ownership.
- Size and orientation may change the current row geometry and keyboard axis
  without creating separate anatomy parts or targets.

### Representative states

| State             | Required invariant                                      | Allowed variation                                   |
| ----------------- | ------------------------------------------------------- | --------------------------------------------------- |
| Empty toolbar     | Outer chrome and named Toolbar remain rendered.         | No caller slot content.                             |
| Two-lane layout   | Start and/or end content use the current flex layout.   | Either lane may be absent.                          |
| Three-lane layout | Center content selects the current three-column layout. | Start or end content may be absent.                 |
| Vertical toolbar  | Toolbar semantics and target remain unchanged.          | Layout and keyboard movement use the vertical axis. |

### Transformation and precedence order

- No new slot, layout, edge-compensation, padding, or event precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Toolbar's current accessible name,
orientation, roving-tabindex, keyboard-hint, caret-guard, or event-composition
behavior.

## Design relationships

| Anatomy or state | Design requirement                                                               | Representation authority                  | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------- | -------------- | ------------------ |
| Outer chrome     | Supplies the painted surface, padding, and selected boundaries around the row.   | `component:Section`                       | Supporting     | FR1, FR3           |
| Toolbar          | Presents the named toolbar semantics and current two- or three-lane arrangement. | Current source, docs, and family contract | Prominent      | FR1, FR2, FR3      |

The slot contents are caller-owned content inside Toolbar's layout. They do not
become additional Toolbar-owned anatomy or targets.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Outer chrome": {
    "delegatesTo": {"owner": "component:Section", "target": "section"}
  },
  "Toolbar": {"target": "toolbar"}
}
```

## Family and system relationships

- `family:layout-regions` owns the structural-region vocabulary and records
  Toolbar as a Section-backed contextual action region.
- `architecture:container-padding` owns the inherited inset and edge-compensation
  geometry used by the composed Section and Toolbar.
- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, and component delegation.
- `architecture:public-component-api` owns the stable prop and slot surface; this
  documentation adds no API.

## Verification map

| Contract            | Verification                                                    | Representative states                          | Mutation or failure expectation                                                                                      | Audit section           |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | `Toolbar.test.tsx` role, name, pass-through, and Section suites | Empty and populated Toolbar                    | Removing the role/name, Toolbar target, Section composition, or delegated Section target fails current evidence.     | `audit:Toolbar/anatomy` |
| FR2                 | `Toolbar.test.tsx` slot and child-count suites                  | Start-only, end-only, two-lane, and three-lane | Changing current slot presence or two-/three-lane structure fails focused assertions.                                | `audit:Toolbar/layout`  |
| FR3                 | Toolbar and Section source plus their focused tests             | Variant, divider, size, and orientation states | Moving outer chrome ownership into Toolbar or moving toolbar semantics onto Section contradicts source and coverage. | `audit:Toolbar/theming` |
| Target inventory    | `packages/core/src/theme/themingTargets.test.ts`                | Toolbar and delegated Section targets          | Runtime and documented target metadata drift fails target validation.                                                | `audit:Toolbar/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                   | Canonical anatomy and current local target     | Missing, extra, prefixed, or stale mappings fail repository validation.                                              | `audit:Toolbar/theming` |

Existing tests assert the semantic row, slot structure, and Section composition.
They do not prove computed inset or edge-compensation geometry for every parent
padding state; this documentation does not claim that coverage.

## Decision log

None. This draft records current facts and introduces no component-local design,
layout, accessibility, or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, family layout
rules, container-padding mechanics, keyboard algorithms, implementation steps,
or system rules. It links to their owners.
