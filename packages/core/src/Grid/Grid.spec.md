---
schema_version: 1
template_version: 3
kind: component
id: component:Grid
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [layout, theming]
verified_by:
  [
    packages/core/src/Grid/Grid.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: [family:layout-primitives]
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: []
---

# Grid component contract

## Intent

Grid arranges caller-supplied items in two-dimensional tracks. GridSpan
optionally wraps one item to control its row or column participation. This draft
records the current consumer anatomy and theming ownership without changing
layout, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Grid container and its current `grid` theming target.
- The optional GridSpan wrapper and its current `grid-span` theming target.
- Grid track construction and GridSpan row/column participation.

**Does not own / non-goals**

- Content supplied to Grid or GridSpan — owned by the caller.
- Structural page-region or surface semantics.
- New responsive behavior, layout props, targets, or target placement.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in the canonical `Grid.doc.mjs` and the subordinate `GridSpan.doc.mjs`;
`family:layout-primitives` owns the shared composition vocabulary.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                           | Basis                                   | Draft review state                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------- |
| FR1 | Grid renders one Grid container carrying the current `grid` target and arranges caller content using the current track model. | Current source, docs, tests, and family | Verified current behavior; no new behavior decided |
| FR2 | GridSpan renders one optional Spanning item wrapper carrying the current `grid-span` target.                                  | Current source, docs, and tests         | Verified current behavior; no target change        |
| FR3 | GridSpan's current `columns` and `rows` inputs affect only the wrapped item's participation in its parent grid.               | Current source, tests, and family       | Verified current behavior; no layout change        |

### Allowed variation

- Grid may use fixed or intrinsic responsive tracks without changing Grid
  container ownership.
- Caller content may render directly in Grid or inside optional GridSpan wrappers.
- A Spanning item may span columns, rows, both, or neither while retaining the
  same target.

### Representative states

| State          | Required invariant                                        | Allowed variation                                     |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| Fixed Grid     | Grid container owns the current `grid` target.            | Positive fixed column count and spacing may vary.     |
| Intrinsic Grid | The same container owns responsive track construction.    | Fill/fit mode, minimum width, and count cap may vary. |
| Direct item    | Caller content participates without a Grid-owned wrapper. | Caller owns its element and styling.                  |
| Spanning item  | GridSpan owns one wrapper and the `grid-span` target.     | Column and row span values may vary.                  |

### Transformation and precedence order

- No new track construction, gap, alignment, sizing, or span precedence rule is
  introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not add semantic roles to Grid or GridSpan or change their
current DOM forwarding and caller-owned content semantics.

## Design relationships

| Anatomy or state | Design requirement                                                 | Representation authority                  | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------------- | -------------- | ------------------ |
| Grid container   | Presents the current two-dimensional layout container.             | Current source, docs, and family contract | Supporting     | FR1                |
| Spanning item    | Optionally changes one item's row or column participation in Grid. | Current source, docs, and family contract | Supporting     | FR2, FR3           |

Direct caller content is not an additional Grid-owned anatomy part.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Grid container": {"target": "grid"},
  "Spanning item": {"target": "grid-span"}
}
```

## Family and system relationships

- `family:layout-primitives` owns the shared spacing, sizing, alignment, and item
  participation vocabulary for Grid and GridSpan.
- `architecture:component-theming-surface` owns anatomy qualification and the
  two current local target mappings.
- `architecture:public-component-api` owns the stable prop surface; this
  documentation adds no API.

## Verification map

| Contract            | Verification                                                 | Representative states                        | Mutation or failure expectation                                                                                              | Audit section            |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1                 | `Grid.test.tsx` track, sizing, alignment, and content suites | Fixed, default, fill, fit, capped, and sized | Changing current track output or removing the container/content fails exact style-variable, inline-style, or content checks. | `audit:Grid/anatomy`     |
| FR2, FR3            | `Grid.test.tsx` GridSpan suites                              | Column, full-row, row, combined, and no span | Changing wrapper rendering or span values fails exact inline-style and content assertions.                                   | `audit:GridSpan/anatomy` |
| Target inventory    | Source inspection and `themingTargets.test.ts`               | Grid and GridSpan targets                    | Runtime and documented target metadata drift fails target validation.                                                        | `audit:Grid/theming`     |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                | Canonical anatomy and both current targets   | Missing, extra, prefixed, or stale mappings fail repository validation.                                                      | `audit:Grid/theming`     |

Grid tests pin track and span output, content rendering, and prop forwarding.
They do not assert both target classes in focused component tests; target
placement is source-inspected and the global inventory checks the runtime/docs
relationship.

## Decision log

None. This draft records current facts and introduces no component-local design,
layout, accessibility, or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, family layout
rules, track algorithms, implementation steps, or system rules. It links to
their owners.
