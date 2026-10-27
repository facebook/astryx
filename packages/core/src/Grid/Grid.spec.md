---
schema_version: 3
template_version: 7
kind: component
id: component:Grid
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Grid/Grid.test.tsx,
    apps/storybook/stories/Grid.stories.tsx,
    .github/scripts/story-play-guard.js,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:layout-primitives]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:public-component-api,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: []
---

# Grid component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Grid` owns fixed and intrinsic column-track construction; `GridSpan` changes one direct item's row or column participation. Both accept root `BaseProps`.                                                             |
| Behavior                | A positive number creates exactly N `1fr` tracks without reflow; an object creates fill/fit tracks from a pixel minimum and optional count cap; axis gaps override uniform gap.                                        |
| End-user impact         | Content keeps DOM order and logical direction while responsive object-form grids reduce their count to fit. Fixed tracks may narrow or overflow when their content cannot shrink.                                      |
| Builder impact          | Builders choose fixed numeric tracks or responsive object tracks explicitly. `'full'` spans all explicit columns, not implicit tracks created by an oversized numeric span.                                            |
| Compatibility/readiness | This draft records released behavior. It changes no public API, default, target, or runtime behavior.                                                                                                                  |
| Review checks           | Reject automatic reflow for numeric columns, equal-width promises that ignore minimum content, lost gap precedence, raw inline track templates, caller-overridable owned metadata, or `'full'` as all implicit tracks. |
| Governing rules         | `family:layout-primitives/FR1–FR7`; `architecture:public-component-api/INV5–INV9`; `architecture:component-theming-surface/INV2–INV6`.                                                                                 |

This table is a review projection; the body below is authoritative.

## Intent

Grid arranges caller-supplied items in two-dimensional tracks. GridSpan optionally wraps one item to control its row or column participation. Neither component owns the content, a surface, or structural page semantics.

## Compatibility and migration

- Released default preserved: yes; omitted, zero, or negative numeric `columns` resolves to one track.
- Compatibility class: observational only; runtime, DOM, styling, targets, and public API remain unchanged.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Grid's root container, current `grid` target, track construction, axis gaps, item alignment, and explicit box dimensions.
- GridSpan's optional wrapper, current `grid-span` target, and one item's row/column participation.
- Root prop and style composition on each owned element.

**Does not own / non-goals**

- Caller content, item semantics, surfaces, or interaction — owned by the product callsite or rendered child component.
- A shared breakpoint or automatic reflow for numeric columns — responsiveness is selected by Grid's object form.
- Implicit tracks created by CSS Grid when a numeric span exceeds the explicit grid.

## Public concepts

| Concept              | Closed values or states                    | Meaning                                                                 | Availability by variant/orientation/state | Default                     | Owner                      | Stability | Invalid-value behavior                                    |
| -------------------- | ------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------- | --------------------------- | -------------------------- | --------- | --------------------------------------------------------- |
| column shape         | fixed number; responsive object; omitted   | Selects fixed `1fr` tracks or intrinsic fill/fit tracks.                | Every Grid                                | one track                   | `component:Grid`           | released  | zero/negative number falls back to one track              |
| responsive repeat    | `fill`; `fit`                              | Keeps empty tracks or collapses them so present items stretch.          | Object-form columns                       | `fill`                      | `component:Grid`           | released  | Type-constrained                                          |
| responsive count cap | absent; positive `max`; non-positive `max` | Caps the number of intrinsic tracks while allowing present tracks fill. | Object-form columns                       | absent                      | `component:Grid`           | released  | non-positive behaves as uncapped                          |
| spacing              | shared `SpacingStep` values                | Separates rows/columns; axis values override uniform gap.               | Every Grid                                | browser grid gap default    | `family:layout-primitives` | released  | Type-constrained                                          |
| item alignment       | `start`; `center`; `end`; `stretch`        | Sets `align-items` and `justify-items`.                                 | Every Grid                                | `stretch`                   | `component:Grid`           | released  | Type-constrained                                          |
| box size             | number; CSS value string; absent           | Sizes the Grid box; numbers become pixels.                              | Every Grid                                | caller/container-determined | `family:layout-primitives` | released  | Browser validates strings                                 |
| implicit row height  | number; absent                             | Sets pixel height for implicit rows used by row spans.                  | Every Grid                                | browser `auto`              | `component:Grid`           | released  | Browser validates the resulting CSS                       |
| column participation | number; `full`; absent                     | Spans N columns or every explicit column.                               | GridSpan under a grid                     | intrinsic item placement    | `component:GridSpan`       | released  | Browser resolves numeric spans, including implicit tracks |
| row participation    | number; absent                             | Spans N rows.                                                           | GridSpan under a grid                     | intrinsic item placement    | `component:GridSpan`       | released  | Browser validates the resulting CSS                       |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                    | Basis                                                       | Draft review state  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------- |
| FR1 | A positive numeric `columns={N}` creates exactly N `1fr` tracks at every width and never reflows; minimum content may widen one track and overflow a narrow container.                                                                                                                                                 | DEC-1; released docs, source, tests, and browser evidence   | settled observation |
| FR2 | Object-form columns use auto-fill by default or auto-fit for `repeat: 'fit'`; `minWidth` is the track floor, while a positive `max` caps count and allows a lone track to shrink to the container.                                                                                                                     | Released docs, source, tests, and browser evidence          | settled observation |
| FR3 | `rowGap` overrides `gap` only for rows, and `columnGap` overrides `gap` only for columns; the effective column gap participates in capped-track math.                                                                                                                                                                  | `family:layout-primitives/FR4`; source and tests            | settled observation |
| FR4 | Grid's dynamic track template uses CSS-variable-backed StyleX so caller `xstyle` and class rules, including media rules, can replace it. Caller `style` wins other inline declarations, including `gridTemplateColumns`; explicit `width`, `height`, `maxWidth`, and `minHeight` props override matching `style` keys. | `architecture:public-component-api/INV5–INV8`; source/tests | settled observation |
| FR5 | GridSpan changes only its wrapper's participation. `columns="full"` uses `1 / -1`, which covers explicit tracks; a wider numeric span may create implicit tracks that participate in later placement.                                                                                                                  | Released source, tests, and browser CSS Grid behavior       | settled observation |
| FR6 | Root refs, DOM/data/ARIA/events, `xstyle`, class name, and inline style reach or compose on the owned root without replacing the canonical target or Grid's owned reflected metadata.                                                                                                                                  | `architecture:public-component-api/INV5–INV8`               | settled observation |
| FR7 | Grid and GridSpan preserve caller DOM order and use the document's logical inline direction; neither creates a separate keyboard order.                                                                                                                                                                                | Platform layout behavior and browser evidence               | settled observation |

### Allowed variation

- **AV1 — Caller content.** Any caller-owned element may participate directly or inside GridSpan; Grid does not inspect or rewrite it.
- **AV2 — Track count.** Container width, minimum content, gaps, and object-form options may change the rendered responsive count within FR1–FR3.
- **AV3 — Root styling.** Caller styles may replace track templates or box presentation while preserving component-owned targets and metadata.

### Representative states

| State                 | Required invariant                                                       | Allowed variation                                     |
| --------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| fixed Grid            | Exactly N explicit `1fr` tracks; no component-owned reflow.              | N, content minimums, gaps, and caller styling.        |
| responsive fill       | Empty tracks remain allocated while count responds to available width.   | Minimum width, cap, content count, and effective gap. |
| responsive fit        | Empty tracks collapse and present items stretch.                         | Minimum width, cap, content count, and effective gap. |
| capped narrow Grid    | Count drops and one present track can fill a container below `minWidth`. | Container width and caller content.                   |
| direct item           | Caller content participates without a Grid-owned wrapper.                | Any caller-owned element and semantics.               |
| numeric spanning item | The wrapper spans N rows/columns and may cause implicit tracks.          | Positive browser-valid span counts.                   |
| full spanning item    | The wrapper covers the explicit grid from line 1 to -1.                  | Explicit count and caller content.                    |

### Transformation and precedence order

- **ORD1 — Track shape.** Responsive object with positive `max` → capped fill/fit template; responsive object without positive `max` → uncapped fill/fit template; positive number → fixed `repeat(N, 1fr)`; otherwise → one `1fr` track.
- **ORD2 — Gap.** Axis gap → uniform gap → zero gap for capped-track arithmetic.
- **ORD3 — Root composition.** Neutral pass-throughs apply first; component-owned target/reflection and StyleX compose next; `xstyle`, class name, and caller inline style retain their documented styling precedence.
- **ORD4 — Span.** `'full'` becomes `1 / -1`; a number becomes `span N`; absence leaves browser placement intrinsic.

### Performance and resources

- **PR1 — CSS-owned layout.** Grid and GridSpan own no state, effect, observer, listener, timer, or JavaScript measurement loop; layout and reflow remain CSS-owned.

## Accessibility contract

- **AR1 — Layout remains nonsemantic.** Grid and GridSpan render `<div>` elements without inventing grid, list, group, or landmark semantics; callers provide semantics when their composition needs them.
- **AR2 — Order remains perceivable.** DOM order remains the reading and keyboard order in LTR and RTL; visual tracks do not create a second sequence.
- **AR3 — Content remains reachable.** GridSpan keeps a zero inline minimum so supported shrinkable descendants can remain inside their track; caller content that cannot shrink may still overflow under FR1.

## Design relationships

No current component-local or shared design record prescribes a Grid-specific visual representation. Grid and GridSpan own geometry only; caller content owns visible surfaces and states.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Grid container": {"target": "grid"},
  "Spanning item": {"target": "grid-span"}
}
```

## Family and system relationships

- `family:layout-primitives` owns shared spacing, sizing, alignment, and item-participation vocabulary; Grid owns the two-dimensional realization.
- `architecture:public-component-api` owns root prop, styling, event, ref, and released-type composition.
- `architecture:component-theming-surface` owns the two exact target mappings and Grid's reflected visual axes.
- `architecture:component-test-sufficiency` owns bounded, mutation-sensitive evidence selection.

## Verification map

| Contract        | Verification                                                              | Representative states                                    | Mutation or failure expectation                                                                    | Audit section             |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1–FR3, ORD1–2 | `Grid.test.tsx` exact track tests and exact-head AuditMatrix story guards | fixed; fill; fit; capped wide/narrow; uniform/axis gap   | Track output, count, fill behavior, or gap precedence changes fail exact source or browser checks. | `audit:Grid/behavior`     |
| FR4, FR6, ORD3  | root composition tests, BaseProps lint, theming target tests              | DOM/data/ARIA/events; class/style/xstyle; reflected axes | A caller input drops, owned metadata is replaced, or a raw inline track defeats media xstyle.      | `audit:Grid/api`          |
| FR5, ORD4, AR3  | `Grid.test.tsx`, long-content play, and AuditMatrix full-span assertion   | numeric/full/row/combined spans; long shrinkable child   | Span CSS, explicit-grid coverage, target, or bounded shrink behavior changes.                      | `audit:GridSpan/behavior` |
| FR7, AR1–AR2    | DOM tests and exact-head LTR/RTL AuditMatrix guards                       | plain roots; fixed tracks in LTR/RTL                     | A semantic role appears, DOM order changes, or logical order stops mirroring.                      | `audit:Grid/a11y-rtl`     |
| Theming anatomy | knowledge validation and `themingTargets.test.ts`                         | Grid and GridSpan targets                                | A target loses its semantic owner or the anatomy map drifts.                                       | `audit:Grid/theming`      |
| Documentation   | docs typecheck, prop literal/reference tests, and Storybook typecheck     | fixed/responsive columns; row height; spans              | Docs claim equal widths, automatic numeric reflow, whole implicit rows, or omit public behavior.   | `audit:Grid/docs`         |

## Decision log

### DEC-1 — Numeric `columns` stays fixed; reflow uses the existing object form

**Reference:** `component:Grid/DEC-1`
**Decider:** `cixzhang`, `2026-10-11`

`columns={N}` means exactly N `1fr` tracks at every width, and a grid that reflows on small screens uses `{minWidth, max?, repeat?}`. The number is the fixed contract; the object form is the responsive contract.

Rejected: redefining the number as "at most N" would break released numeric grids; a `{count, isFixed}` shape would duplicate the number and the `max` cap.

## Open questions

None.

## Content boundary

This file records verified shipped behavior. It does not duplicate consumer prop tables or examples, prescribe caller content or visuals, approve a new API or target, or store audit scores and run evidence.
