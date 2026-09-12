---
schema_version: 3
template_version: 4
kind: component
id: component:ChartArea
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/lab/src/Chart/ChartArea.test.tsx,
    apps/storybook/stories/ChartArea.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-test-sufficiency, architecture:theme-tokens]
contributing: []
system_specs: [spec:AST-002, spec:AST-029]
---

# ChartArea component contract

## Intent

ChartArea draws one filled Cartesian band between two y-value fields inside a
legacy Lab `Chart`. It supports confidence intervals, ranges, and envelopes that
supplement another chart mark.

## Compatibility and migration

- Released default preserved: `yes`; the component is available only in the
  canary `@astryxdesign/lab` package.
- Compatibility class: this observational backfill changes no runtime API,
  default, geometry, paint, or behavior.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none; unresolved public input and visual questions remain
  open below.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Resolving an upper field and lower field, including the existing `baseline`
  fallback.
- Drawing the filled area path and its optional edge stroke from Chart's scales.

**Does not own / non-goals**

- Data domains, scales, plot dimensions, clipping, or the chart's accessible name
  and data-table alternative — owned by the parent `Chart`.
- Axes, legends, line or point marks, tooltip content, or product-specific
  interpretation of the range.
- Choosing a product's range color or deciding a new visual representation.

## Public concepts

| Concept      | Closed values or states        | Meaning                                                                                               | Availability by variant/orientation/state                | Default        | Owner                 | Stability    | Invalid-value behavior                                                                                          |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- | --------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Bound fields | `yUpper`, `yLower`, `baseline` | Selects the two data fields that enclose the band. `baseline` fills whichever direct bound is absent. | At least two resolved keys are needed for a useful band. | none           | `component:ChartArea` | experimental | With no two resolved keys, output is absent or zero-thickness; the future type/fallback contract is unresolved. |
| Fill color   | any CSS color string           | Paints the band and supplies the optional edge-stroke color.                                          | All visible bands.                                       | none; required | `component:ChartArea` | experimental | Browser CSS/SVG color parsing applies.                                                                          |
| Fill opacity | number                         | Applies SVG fill opacity to the band.                                                                 | All visible bands.                                       | `0.2`          | `component:ChartArea` | experimental | Browser SVG clamping applies; a component-owned range contract is unresolved.                                   |
| Edge stroke  | off or on, plus numeric width  | Draws the same closed path as an outline.                                                             | Optional.                                                | off; width `1` | `component:ChartArea` | experimental | Browser SVG width and opacity handling applies.                                                                 |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                               | Basis                                           | Draft review state                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| FR1 | ChartArea MUST consume the parent Chart's data, x key, x scale, and y scale; outside that provider, `useChart()` throws.                                          | current implementation and parent Chart context | verify                                    |
| FR2 | `yUpper` and `yLower` win independently; `baseline` fills only a missing direct bound. With neither pair resolved, the component emits no visible band.           | implementation, JSDoc, tests, and stories       | verify                                    |
| FR3 | Each datum contributes one monotone-x area point. Numeric lower and upper values use the parent y scale; non-numeric values currently substitute `0`.             | implementation and generated path evidence      | human decision for missing-data behavior  |
| FR4 | The fill path uses `color` and `opacity`. When `stroke` is true, a second copy of the closed path uses the same color, `strokeWidth`, and twice the fill opacity. | implementation and focused tests                | verify; opacity-range behavior unresolved |

### Allowed variation

- **AV1 — Caller-selected data fields.** Any row keys may supply the bounds when
  their values are numeric and the parent Chart includes their domain.
- **AV2 — Caller-selected paint.** Color, opacity, and edge width may vary while
  the path geometry remains tied to the same bounds.

### Representative states

| State                        | Required invariant                                       | Allowed variation                                               |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Direct upper and lower       | One closed filled path spans both fields.                | Color and opacity.                                              |
| Upper plus baseline          | Baseline supplies the lower field.                       | Color, opacity, and edge stroke.                                |
| Lower plus baseline          | Baseline supplies the upper field.                       | Color, opacity, and edge stroke.                                |
| Edge stroke                  | A second copy of the area path is outlined without fill. | Width and computed opacity.                                     |
| Fewer than two resolved keys | No useful visible band.                                  | The future static/runtime invalid-state contract is unresolved. |
| Non-numeric bound value      | Current implementation substitutes chart value `0`.      | Correct missing-data behavior is unresolved.                    |

### Transformation and precedence order

- **ORD1 — Bound resolution.** Resolve `upper = yUpper ?? baseline` and
  `lower = yLower ?? baseline`; stop when either is absent.
- **ORD2 — Geometry.** Map each row through the parent x scale and both resolved
  y values, then generate one `curveMonotoneX` closed area path.
- **ORD3 — Paint.** Draw the fill first; draw the optional edge stroke second.

### Performance and resources

- **PR1 — Geometry memoization.** Recompute the path only when the parent data,
  scales, x key, or resolved bound keys change.

## Accessibility contract

- **AR1 — Parent-owned semantics.** ChartArea adds no independent interactive or
  semantic SVG node. The parent Chart owns the named-image semantics and, for its
  supported small-data path, the hidden data table.
- **AR2 — Meaningful graphical contrast gap.** The current low-opacity fill can
  fall below WCAG 2.2 SC 1.4.11's 3:1 threshold. This draft records the audit
  finding but does not choose a new opacity, stroke default, or representation.

## Design relationships

| Anatomy or state | Design requirement                                        | Representation authority                                  | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------- | -------------- | ------------------ |
| Area band        | Meaningful range graphics meet rendered non-text contrast | objective WCAG threshold; exact representation unsettled  | supporting     | FR2–FR4, AR2       |
| Edge stroke      | Optional boundary follows the same range geometry         | component implementation; default/contrast role unsettled | supporting     | FR4                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Area band": {
    "none": {
      "reason": "unsettled: ChartArea is a Lab component that accepts caller-supplied paint and is not enrolled in public component theming."
    }
  },
  "Edge stroke": {
    "none": {
      "reason": "unsettled: the optional caller-supplied stroke has no public theme target."
    }
  }
}
```

## Family and system relationships

- `architecture:component-test-sufficiency` owns rational evidence partitioning.
- `architecture:theme-tokens` owns the shared data-visualization token vocabulary
  that `useChartColors()` resolves for SVG consumers.
- `spec:AST-002` owns public input admission and invalid-state prevention.
- `spec:AST-029` owns this observational backfill and the external audit receipt.

## Verification map

| Contract                | Verification                                                   | Representative states                                              | Mutation or failure expectation                                                             | Audit section                     |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1–FR3, ORD1–ORD2, PR1 | `ChartArea.test.tsx`; ChartArea Storybook receipts             | direct bounds; upper+baseline; no bounds; light/dark/custom/narrow | Removing a bound, scale dependency, or provider relationship removes or misplaces the band. | `audit:ChartArea/behavior`        |
| FR4, ORD3               | `ChartArea.test.tsx`; `ChartArea.stories.tsx`                  | fill-only and outlined bands                                       | Fill/stroke count, attributes, or visible paint diverge.                                    | `audit:ChartArea/behavior-design` |
| AR1                     | Parent Chart semantics in focused tests and scoped browser axe | each owned ChartArea story                                         | The composed chart loses its name or data alternative.                                      | `audit:ChartArea/accessibility`   |
| AR2                     | Real Chromium contrast-pair matrix                             | light, dark, and custom theme                                      | Meaningful band/backdrop pairs remain below 3:1 or lose their boundary.                     | `audit:ChartArea/design-rendered` |

## Decision log

None. This draft records observed behavior and open gaps only.

## Open questions

- **OQ1 — Bound combinations.** Should the public type make exactly two resolved
  bound keys statically required, or should runtime provide another fallback?
  (`human-api`)
- **OQ2 — Missing values.** Should a non-numeric row create a gap, omit the band,
  reject the input, or follow another chart-wide missing-data contract?
  (`human-api`)
- **OQ3 — Contrast representation.** Which fill, boundary, or composite treatment
  should guarantee meaningful range contrast without turning a supporting band
  into the primary mark? (`human-design`)
- **OQ4 — Numeric ranges.** What public validation or fallback should own invalid
  opacity and stroke-width values? (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables, current audit scores, run
receipts, implementation steps, or shared system rules. It records only observed
ChartArea behavior and unresolved owner questions.
