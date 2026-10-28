---
schema_version: 3
template_version: 7
kind: component
id: component:LayoutFooter
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-28
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/__tests__/Layout.a11y.test.tsx,
    packages/core/src/Layout/__tests__/Layout.a11y.chromium.spec.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:layout-regions]
design_specs: []
architecture:
  [
    architecture:container-padding,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# LayoutFooter component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `hasDivider`, `height`, `padding`, `label`, `role`, root `BaseProps`, and a root `ref`.                                     |
| Behavior                | A non-shrinking footer region whose inner wrapper applies and publishes the Layout inset and aligns to the Layout's content width.      |
| End-user impact         | People see a footer that keeps its height below scrolling content, with content aligned to the page's readable width.                   |
| Builder impact          | None; the record describes shipped behavior.                                                                                            |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                                                              |
| Review checks           | Reject a footer that shrinks, a published inset that differs from the applied padding, an inferred landmark, or a lost divider default. |
| Governing rules         | `family:layout-regions` FR1, FR4–FR6, FR8; `architecture:container-padding`; `architecture:public-component-api` INV5–INV8.             |

This table is a review projection; the body below is authoritative.

## Intent

LayoutFooter is the optional footer region a caller places in a Layout's
`footer` slot. It owns the footer's size, inset, divider, and caller-supplied
landmark semantics; the caller owns its content.

Consumer syntax and examples belong in `LayoutFooter.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — no divider unless a Layout default says
  so, automatic inset, no landmark role.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The footer root, which carries the `layout-footer` target that
  `component:Layout` maps, and its inner padding wrapper.
- Footer height, divider, inset, and caller-supplied role and label.

**Does not own / non-goals**

- Slot placement, the Layout-edge inset, content width, and the divider
  default — owned by `component:Layout`.
- Footer content and its meaning — owned by the caller.

## Public concepts

| Concept  | Closed values or states               | Meaning                                                                     | Availability by variant/orientation/state | Default                   | Owner                    | Stability | Invalid-value behavior           |
| -------- | ------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- | ------------------------ | --------- | -------------------------------- |
| Divider  | `true`, `false`, unset                | Draws a line on the footer's block-start edge.                              | Always                                    | Layout default, else none | `component:LayoutFooter` | Stable    | —                                |
| Height   | number (px); CSS length string; unset | Fixes the footer's block size.                                              | Always                                    | content height            | `component:LayoutFooter` | Stable    | —                                |
| Inset    | spacing step; `0`; unset              | Uniform padding that replaces the automatic inset; `0` is full bleed.       | Always                                    | automatic                 | `component:LayoutFooter` | Stable    | Closed union; rejected by types. |
| Landmark | caller `role` and `label`             | Exposes the footer as the role the caller names, with that accessible name. | Always                                    | none                      | caller                   | Stable    | —                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                             | Basis                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| FR1 | LayoutFooter renders a root `div` carrying the `layout-footer` target that does not shrink, around an inner `div` that holds the children, has the Layout's content width as its maximum width, and centers within the root. `height` fixes the root's block size, with numbers as pixels.                                            | Current source and tests                                                                |
| FR2 | Without `padding`, the inner wrapper's inline and block-end padding is the Layout-edge inset and its block-start padding is the inner inset, spacing step 4 when no Layout sets them. A `padding` step replaces all four edges, and `0` removes them. The wrapper publishes container-padding values equal to the padding it applies. | Current source and tests; `family:layout-regions` FR4; `architecture:container-padding` |
| FR3 | A divider draws a 1px solid `--color-border` line on the root's block-start edge and reflects `data-divider="true"`. `hasDivider` decides; when unset, the nearest Layout `defaultHasDividers` decides; otherwise there is no divider. A footer without a divider lets the middle row above it collapse its block-end spacing.        | Current source and tests; `family:layout-regions` FR6                                   |
| FR4 | `role` and `label` set the root's `role` and `aria-label`; LayoutFooter adds no role of its own.                                                                                                                                                                                                                                      | Current source and tests; `family:layout-regions` FR8                                   |
| FR5 | `ref` reaches the root. Supported DOM, data, ARIA, and event props reach the root after the component's own attributes; `xstyle`, `className`, and `style` compose after component styles.                                                                                                                                            | Current source and tests; `architecture:public-component-api` INV5–INV8                 |

### Allowed variation

- **AV1 — Content.** Any caller content may fill the footer.
- **AV2 — Landmark.** The caller chooses whether the footer is a landmark and
  which one.

### Representative states

| State                | Required invariant                                      | Allowed variation |
| -------------------- | ------------------------------------------------------- | ----------------- |
| Default in Layout    | Automatic inset, no divider, no role.                   | Content.          |
| With divider         | Block-end line and `data-divider="true"`.               | —                 |
| Explicit padding     | Uniform padding, published to children.                 | Step.             |
| Contentinfo landmark | `role="contentinfo"` and the caller's name on the root. | Name.             |

### Transformation and precedence order

- **ORD1 — Divider.** `hasDivider` → Layout `defaultHasDividers` → none.
- **ORD2 — Padding.** `padding` → the automatic inset.

### Performance and resources

- **PR1 — No external lifecycle.** LayoutFooter reads the divider default from
  its Layout and adds no listener, observer, timer, or measurement.

## Accessibility contract

- **AR1 — Explicit landmarks only.** The footer is a landmark only when the
  caller supplies `role`, and it is named only by the caller's `label`
  (`family:layout-regions` FR8).

## Design relationships

| Anatomy or state | Design requirement                                        | Representation authority | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Footer           | A fixed footer band with an optional block-start divider. | Current source and docs  | Supporting     | FR1–FR3            |

Theming: the root carries the `layout-footer` target, which `Layout.doc.mjs`
declares and `component:Layout` maps. `LayoutFooter.doc.mjs` declares no anatomy
of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `family:layout-regions` owns region boundaries, padding replacement, divider
  spacing, and landmark rules; FR2–FR4 and AR1 apply them.
- `architecture:container-padding` owns inset publication; FR2 applies it.
- `component:Layout` owns slot placement, the Layout-edge inset, content
  width, the divider default, and the `layout-footer` target mapping.
- `architecture:public-component-api` owns caller-input routing; FR5 applies
  it.

## Verification map

| Contract  | Verification                                                                                                               | Representative states                 | Mutation or failure expectation                                                                                                                                                                                                                            | Audit section                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| FR1       | `LayoutSlots.test.tsx` class test                                                                                          | Default                               | A lost `layout-footer` class fails. Gap: `height`, the inner wrapper, the non-shrinking root, the content-width maximum, and centering have no check.                                                                                                      | `audit:LayoutFooter/layout`        |
| FR2, ORD2 | Source review                                                                                                              | Automatic, explicit, and zero padding | Gap: no test covers the automatic inset, the `padding` replacement, full bleed, or the published values.                                                                                                                                                   | `audit:LayoutFooter/layout`        |
| FR3, ORD1 | `LayoutSlots.test.tsx` and `Layout.test.tsx` divider tests                                                                 | Default; `hasDivider`; Layout default | A missing or unexpected `data-divider`, or an ignored Layout default, fails. Gap: no test covers an explicit `false` beating a Layout default on a footer. Gap: the line's paint and the collapsed spacing above a footer without a divider have no check. | `audit:LayoutFooter/layout`        |
| FR4, AR1  | `LayoutSlots.test.tsx` landmark test; `Layout.a11y.test.tsx` and `Layout.a11y.chromium.spec.ts` `footer-contentinfo` state | Caller `contentinfo` role and label   | A lost role or name fails, including at the accessibility tree. Gap: no test asserts that a footer without `role` exposes none.                                                                                                                            | `audit:LayoutFooter/accessibility` |
| FR5       | `LayoutSlots.test.tsx` ref test                                                                                            | Ref                                   | A ref on another element fails. Gap: no test covers `className`, `style`, DOM, data, or event props, or the `xstyle` merge order.                                                                                                                          | `audit:LayoutFooter/api`           |
| PR1       | Source review                                                                                                              | Every state                           | Gap: no automated check fails if LayoutFooter adds a listener, timer, or measurement.                                                                                                                                                                      | `audit:LayoutFooter/behavior`      |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, Layout slot rules, or container-padding
mechanics. It links to their owners.
