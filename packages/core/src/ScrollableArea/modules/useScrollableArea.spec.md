---
schema_version: 3
template_version: 1
kind: module
id: module:ScrollableArea/useScrollableArea
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-11
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility]
verified_by: [packages/core/src/hooks/useScrollableArea.test.tsx]
parent_component: component:ScrollableArea
references: [architecture:public-component-api, spec:AST-025/DEC-1]
---

# useScrollableArea module contract

## Intent

useScrollableArea is the canonical reusable behavior core for components that
already own a viewport and content root. It provides safe prop/ref composition,
logical-axis measurement, live owner registration, edge state, keyboard access,
and scroll chaining without inserting structure.

## Compatibility and migration

- Released default preserved: not yet released
- Compatibility class: additive public hook and types
- Migration decision: `spec:AST-025/DEC-1`

## Ownership boundary

**Owns**

- Effective-axis measurement and stable logical-edge state.
- Observation, invalidation, DOM owner registration, conditional viewport access,
  and effective-axis chaining.
- Safe composition of caller viewport/content props and refs.

**Does not own / non-goals**

- Viewport layout, paint, overflow declarations, scrollbar presentation, or
  insertion of a content wrapper.
- Sticky positioning and public owner lookup.

## Public API and concepts

| Concept           | Closed values or states              | Meaning                               | Default                   | Owner                                     | Stability |
| ----------------- | ------------------------------------ | ------------------------------------- | ------------------------- | ----------------------------------------- | --------- |
| axis              | `inline`, `block`, `both`            | requested logical scroll intent       | required                  | `spec:AST-025`                            | stable    |
| keyboard owner    | `content`, named `viewport`          | where keyboard scrolling is reached   | required                  | `spec:AST-025`                            | stable    |
| overscroll        | `allow`, `contain`                   | edge propagation on effective axes    | `allow`                   | `spec:AST-025`                            | stable    |
| axis state        | `isScrollable`, `atStart`, `atEnd`   | effective ownership and logical edges | inactive, both edges true | `module:ScrollableArea/useScrollableArea` | stable    |
| overflow geometry | inline/block booleans                | excess geometry before CSS capability | both false                | `module:ScrollableArea/useScrollableArea` | stable    |
| axis mapping      | logical inline/block to physical x/y | writing-mode-aware behavior styling   | horizontal-tb mapping     | `module:ScrollableArea/useScrollableArea` | stable    |

## Behavioral contract

| ID  | Invariant                                                                                                                                                                                                                    | Basis                       | Acceptance and implementation state     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------- |
| FR1 | An axis MUST be effective only when requested, computed overflow is scroll-capable, and geometry exceeds 1px.                                                                                                                | `spec:AST-025` FR1–FR4      | implemented                             |
| FR2 | Viewport and content geometry MUST be observed; invalidations MUST coalesce and preserve the last valid state while unmeasurable.                                                                                            | `spec:AST-025` FR5–FR9      | implemented                             |
| FR3 | Logical edges MUST map through direction and horizontal, vertical, or sideways writing modes, and the current mapping MUST be returned so adopters can apply physical-axis StyleX behavior without losing logical semantics. | `spec:AST-025` FR1, FR3–FR4 | implemented                             |
| FR4 | The nearest registered effective owner MUST win independently by axis.                                                                                                                                                       | `spec:AST-025` FR10, FR18   | implemented privately for future Sticky |
| FR5 | Viewport keyboard props and containment MUST appear only while applicable requested axes are effective.                                                                                                                      | `spec:AST-025` FR12–FR14    | implemented                             |
| FR6 | Prop getters MUST compose refs and preserve caller handlers/classes/styles/ARIA while behavior-owned accessibility and non-cancellable behavior win conflicts.                                                               | `spec:AST-025` IR4          | implemented                             |
| FR7 | Requested-axis excess geometry MUST be returned independently of computed overflow capability so adopters can activate a CSS scroll boundary only after content exceeds the viewport.                                        | `spec:AST-025` FR21         | implemented                             |

### Transformation and precedence order

- **ORD1 — Effective state.** requested logical axis → computed physical axis →
  scroll-capable overflow → geometry tolerance → normalized logical edge.
- **ORD2 — Prop composition.** caller props → stable composed ref →
  behavior-owned keyboard, state, and chaining outputs.

### Performance and resources

- **PR1 — Stable publication.** Equal effective/edge state reuses the prior object.
- **PR2 — Shared observation.** Both element boxes use the shared ResizeObserver;
  all secondary invalidation signals coalesce through one animation frame.

## Accessibility contract

- **AR1 — Named viewport owner.** Viewport-owned access requires a label and adds
  the viewport to the tab order only while an applicable axis is effective.
- **AR2 — Focus continuity.** State changes never move or blur focus.

## Design relationships

No visual representation is owned by this hook.

## Parent and system relationships

- `component:ScrollableArea` owns the reference viewport/content composition.
- `spec:AST-025` owns the shared behavior and adoption boundary.

## Verification map

| Contract         | Verification                                                   | Representative states                                                                 | Mutation or failure expectation                                                                                |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| FR1–FR6, AR1–AR2 | `useScrollableArea.test.tsx` plus real-browser Storybook probe | horizontal/vertical/sideways, LTR/RTL, fit/overflow/edge, nested owners, focused loss | style-only or geometry-only ownership, physical-edge leakage, stale state, ref loss, or dead containment fails |

## Decision log

### DEC-1 — Prop getters are the public composition seam

**Reference:** `module:ScrollableArea/useScrollableArea/DEC-1`
**Decider:** cixzhang, 2026-09-11

One returned prop object per owned element keeps refs, accessibility, handlers,
and behavior together without making consumer spread order part of correctness.

## Open questions

None.

## Content boundary

This file does not duplicate consumer signatures/examples, ScrollableArea's
structure/presentation, or Sticky's future API and positioning mechanism.
