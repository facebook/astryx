---
schema_version: 3
template_version: 5
kind: component
id: component:ChartTooltip
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/charts/src/ChartTooltip.test.tsx,
    apps/storybook/stories/charts/Tooltip.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-test-sufficiency,
    architecture:component-theming-surface,
    architecture:knowledge-contracts,
    architecture:layer-runtime,
    architecture:react-component-runtime,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-003, spec:AST-027, spec:AST-029]
---

# ChartTooltip component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | No API shape or default changes. This draft records the shipped grouped-content, indicator, dot, custom-render, and placement surfaces.                                                                 |
| Behavior                | The nearest pointer x selects one datum; the card, enabled SVG indicator, and eligible dots update together. The card uses Layer fixed mode and browser top-layer promotion.                            |
| End-user impact         | Pointer users can read the same chart details when the chart is clipped or inside browser top-layer UI; the card content, position calculation, indicators, and existing public API remain unchanged.   |
| Builder impact          | None. `Chart tooltip`, tooltip configuration objects, and direct `ChartTooltip` composition continue to use the same props and defaults.                                                                |
| Compatibility/readiness | Canary-compatible behavioral repair. This observational draft is non-authoritative; placement meaning, focus association, and future theming reachability remain unresolved owner choices.              |
| Review checks           | Reject a body-portal-only stacking mechanism, changed API/default, lost pointer cleanup, duplicate custom-render invocation, invalid SVG coordinates, or any claim that the open questions are settled. |
| Governing rules         | `spec:AST-027/FR7–FR8`, `architecture:layer-runtime/INV1–INV3`, `architecture:component-test-sufficiency/INV1–INV11`, and `spec:AST-029/FR3–FR8`.                                                       |

This table is a review projection; the body below is authoritative.

## Intent

ChartTooltip renders supplemental grouped values for the chart datum nearest the
pointer. It owns the pointer-selected card, its viewport positioning, optional
crosshair or band highlight, and eligible hover dots. Chart owns data, scales,
plot geometry, pointer dispatch, accessible naming, and its supported equivalent
data view.

## Compatibility and migration

- Released default preserved: yes at the canary surface; the package has no stable release.
- Compatibility class: no public API or default change; the card moves from a fixed body portal with a page-level z-index to the shared fixed Layer runtime.
- Controlled/uncontrolled behavior: not applicable; Chart's pointer stream owns the active index.
- Migration decision: none; `spec:AST-027/FR7–FR8` already requires the Layer migration.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Selecting tooltip content from the nearest chart pointer event.
- Deriving ordered visible-series rows for the hovered datum.
- Rendering the default card or caller-supplied card content.
- Positioning and viewport-clamping the card through Layer fixed mode.
- Rendering the current crosshair or bar-band indicator and eligible hover dots.
- Unsubscribing from Chart's pointer stream when the component unmounts.

**Does not own / non-goals**

- Chart data, scales, plot geometry, or pointer-event generation — owned by `component:Chart`.
- Product-specific value formatting, series labels, and colors — owned by the product callsite and series definitions.
- The chart's accessible name, hidden data table, summary, or another equivalent non-pointer data view — owned by `component:Chart` and the product callsite.
- A new focusable data-point model or tooltip trigger relationship; those require an owner decision under `spec:AST-002` and `spec:AST-003`.

## Public concepts

| Concept          | Closed values or states                                       | Meaning                                                                                   | Availability by variant/orientation/state | Default                 | Owner                        | Stability    | Invalid-value behavior                                            |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- | ---------------------------- | ------------ | ----------------------------------------------------------------- |
| Series source    | caller array or omitted                                       | Supplies row labels, values, colors, mark types, and hover-dot eligibility.               | Every ChartTooltip                        | empty array             | product callsite             | experimental | Unresolved, utility, missing, and non-finite values are filtered. |
| Card content     | default body; custom React node; custom `null`                | Shows grouped details or suppresses only the card.                                        | Hovered datum                             | default grouped content | `component:ChartTooltip`     | experimental | A custom `null` keeps enabled SVG indicators and dots.            |
| Hover indicator  | enabled or disabled; bar-band or vertical crosshair           | Marks the active x position inside the plot.                                              | Valid hovered datum                       | enabled                 | `component:ChartTooltip`     | experimental | Invalid or non-finite chart coordinates suppress the mark.        |
| Hover dots       | enabled or disabled; one per eligible resolved non-bar series | Marks each eligible series point at the active index.                                     | Valid finite resolved points              | enabled                 | `component:ChartTooltip`     | experimental | Missing and non-finite resolved points are skipped.               |
| Card placement   | `auto`, `right`, `left`, `top`                                | Selects horizontal placement from the hovered x coordinate and the current vertical rule. | Visible card                              | `auto`                  | `component:ChartTooltip`     | experimental | Unknown values are rejected by TypeScript.                        |
| Layer visibility | closed or browser top-layer open                              | Keeps the visible card above clipping and modal stacking contexts.                        | Browser render                            | closed                  | `architecture:layer-runtime` | settled      | Unsupported Popover API browsers use Layer's visibility fallback. |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant                                                                                                                                                                                                             | Basis                                                          | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| FR1 | Chart's `tooltip` shorthand MUST inject the chart series; direct composition currently requires the caller to pass the same series array when rows and dots are wanted.                                                         | implementation, types, docs, and focused tests                 | verify             |
| FR2 | The nearest pointer event MUST select one data index; leaving the plot or selecting a stale index MUST hide the card, and a later valid index MUST be able to reveal it again.                                                  | implementation and focused tests                               | verify             |
| FR3 | The default card MUST show the x value and either one bare value or one labelled row per visible resolved series. A custom renderer MUST receive the x value and ordered rows once per render and MAY return `null`.            | implementation and focused tests                               | verify             |
| FR4 | Enabled indicators MUST render a band highlight for bar series on a band scale and a vertical crosshair otherwise. Enabled dots MUST exclude bars and non-finite or missing resolved points.                                    | implementation and focused tests                               | verify             |
| FR5 | `auto` currently starts to the right and flips left on inline overflow; explicit `right`, `left`, and `top` use the hovered x coordinate, while every mode uses the plot top as its vertical origin and clamps to the viewport. | implementation and partial focused tests                       | human decision     |
| FR6 | A visible card MUST use `useLayer({mode: 'fixed'})`, native browser top-layer promotion, and Layer's unsupported-browser fallback. A body portal or numeric z-index is not a substitute.                                        | `spec:AST-027/FR7–FR8`; `architecture:layer-runtime/INV1–INV3` | settled            |
| FR7 | The component MUST subscribe once per active callback identity and MUST release that subscription on unmount.                                                                                                                   | implementation and focused test                                | verify             |
| FR8 | Server rendering MUST omit the browser-only layer without reading a portal target; SVG indicators remain render-derived.                                                                                                        | implementation and focused server-render test                  | verify             |

### Allowed variation

- **AV1 — Series content.** Callers may choose labels, colors, order, values, and custom rendered card content through existing public inputs.
- **AV2 — Chart geometry.** Chart may change plot dimensions and scale output; ChartTooltip follows the supplied pointer coordinates and clamps the card to the viewport.
- **AV3 — Supplemental surface.** Products may omit the tooltip when the chart's non-pointer presentation already supplies sufficient detail.

### Representative states

| State                        | Required invariant                                                       | Allowed variation                                            |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Initial / pointer leave      | Card is closed and no stale card content is exposed.                     | SVG indicators are absent.                                   |
| Single series                | Card shows x value plus one value.                                       | Caller label, color, and value vary.                         |
| Multiple series              | Card preserves the derived visible-series order and labels each row.     | Number and type of rows vary.                                |
| Custom content               | Renderer receives the current x value and rows.                          | Any non-interactive React content may be returned.           |
| Custom `null`                | Card closes while enabled plot indicators remain.                        | Indicator and dot options remain independently configurable. |
| Bar on band scale            | Band highlight replaces the crosshair; bars receive no hover dot.        | Band geometry follows the scale.                             |
| Line, area, or dot           | Crosshair and eligible finite hover dots follow the selected index.      | Series paint and resolved coordinates vary.                  |
| Clipped or modal composition | Layer host is an open native popover above clipping and top-layer peers. | Surrounding clipping and modal geometry vary.                |
| Server render                | No portal or browser layer is emitted.                                   | Rendered SVG fragment may be empty without pointer state.    |

### Transformation and precedence order

- **ORD1 — Pointer selection.** Receive Chart pointer event → resolve nearest data index → derive datum and rows → resolve custom or default card content → show or hide Layer → measure and clamp final card geometry.
- **ORD2 — Indicator selection.** Check `hoverIndicator` → prefer bar-band representation when any bar uses a band scale → otherwise resolve the crosshair x → suppress non-finite output.
- **ORD3 — Dot selection.** Check `showHoverDots` → retain eligible non-bar series → find the current resolved point → suppress missing or non-finite points.

### Performance and resources

- **PR1 — Pointer render boundary.** Pointer movement within one resolved data index SHOULD NOT force a React commit when the computed card position is unchanged.
- **PR2 — Subscription ownership.** ChartTooltip owns exactly one current pointer subscription and MUST release it when the subscription identity changes or the component unmounts.
- **PR3 — Render callback.** A custom card renderer MUST NOT be invoked twice for one React render merely to decide visibility.

## Accessibility contract

- **AR1 — Supplemental information.** Tooltip-only content does not replace Chart's accessible name, supported hidden data table, summary, or another complete data view.
- **AR2 — Current semantics.** The card currently exposes `role="tooltip"` and remains non-interactive. This draft does not assert that the pointer-only trigger path completes the WAI-ARIA tooltip pattern.
- **AR3 — Association gap.** Keyboard exposure and an `aria-describedby` owner remain unresolved because Chart has no focusable data-point trigger. An audit MUST NOT invent that interaction or API without owner approval.

## Design relationships

| Anatomy or state | Design requirement                                                             | Representation authority                      | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------ | --------------------------------------------- | -------------- | ------------------ |
| Layer host       | Keep the card reachable above clipping and top-layer peers.                    | prescribed by `spec:AST-027/FR7–FR8`          | overlay        | FR6                |
| Tooltip card     | Present grouped supplemental detail without accepting pointer interaction.     | unsettled; no current design record is linked | supporting     | FR3, AR1–AR3       |
| Series row       | Associate one visible label and value with its decorative series swatch.       | observed implementation                       | supporting     | FR3                |
| Hover indicator  | Mark the active x region without changing the chart's data or accessible name. | unsettled; no current design record is linked | supporting     | FR4                |
| Hover dot        | Echo an eligible series point at the selected index.                           | unsettled; no current design record is linked | supporting     | FR4                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Layer host": {
    "none": {
      "reason": "unsettled: the host paints the card with semantic tokens but no current contract decides whether ChartTooltip needs a public target."
    }
  },
  "Tooltip card": {
    "none": {
      "reason": "intentional: the semantic role-only child adds no component-owned paint; the Layer host owns the card chrome."
    }
  },
  "Series row": {
    "none": {
      "reason": "intentional: shared Layout, Text, and ChartSwatch components own the rendered row surfaces."
    }
  },
  "Hover indicator": {
    "none": {
      "reason": "unsettled: semantic tokens paint the current SVG mark but no current contract selects public theme reachability."
    }
  },
  "Hover dot": {
    "none": {
      "reason": "unsettled: series-owned paint and current fixed geometry have no approved public theme target."
    }
  }
}
```

## Family and system relationships

- No current family or design record governs ChartTooltip.
- `architecture:layer-runtime` and `spec:AST-027/FR7–FR8` require fixed Layer composition and browser top-layer promotion for the card.
- `architecture:component-test-sufficiency` owns rational public-state partitions, observable assertions, and red-before-green audit remediation.
- `architecture:component-theming-surface` owns anatomy-to-target disposition; this draft records current absence without deciding future themeability.
- `architecture:knowledge-contracts` keeps consumer syntax in `ChartTooltip.doc.mjs` and observed behavior in this draft component record.
- `architecture:react-component-runtime` owns server-safe rendering and client-boundary requirements.
- `spec:AST-002` owns any future public API or compatibility decision.
- `spec:AST-003` owns any future passive-overlay coordination model.
- `spec:AST-029` owns this observational backfill, finite evidence inventory, objective remediation, and fail-closed readiness report.

## Verification map

| Contract | Verification                                                 | Representative states                                  | Mutation or failure expectation                                                      | Audit section                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------- |
| FR1–FR4  | `ChartTooltip.test.tsx`; Tooltip Storybook fixture           | single, multi, custom, null, bar, line, missing values | A public option changes output or a missing/non-finite point leaks invalid SVG.      | `audit:ChartTooltip/behavior`      |
| FR5      | focused placement test; source review                        | right; other modes remain gaps                         | Positioning changes without an owner ruling or evidence for every public value.      | `audit:ChartTooltip/api-behavior`  |
| FR6      | red/green Layer host test; modal Storybook play assertion    | closed, hovered inside native modal                    | Removing Layer loses `popover="manual"` or native open state above the modal.        | `audit:ChartTooltip/layering`      |
| FR7      | focused lifecycle test                                       | mount and unmount                                      | A pointer listener remains after unmount.                                            | `audit:ChartTooltip/code-health`   |
| FR8      | `renderToString` focused test                                | server render                                          | Server evaluation reads `document` or emits the browser-only card.                   | `audit:ChartTooltip/runtime`       |
| AR1–AR3  | Chart accessibility tests; focused axe; owner review pending | small-data alternative and hovered card                | Tooltip content becomes the only data path or draft semantics are treated as policy. | `audit:ChartTooltip/accessibility` |

## Decision log

None. This draft records observed behavior plus the Layer correction already required
by current shared authority; it does not approve new ChartTooltip policy.

## Open questions

- **OQ1 — Placement meaning.** Should `top`, `left`, `right`, and `auto` be relative to the hovered point in both axes, or should the public description name the current plot-top vertical origin? (`human-api`)
- **OQ2 — Keyboard and tooltip association.** Should Chart expose a focusable data-point trigger and `aria-describedby` relationship, or should this surface use different semantics while the data table remains the keyboard/AT path? (`human-api`)
- **OQ3 — Theming reachability.** Should the Layer host or any SVG indicator become a stable public theme target? (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit results,
implementation steps, or shared system rules. It links to their owners.
