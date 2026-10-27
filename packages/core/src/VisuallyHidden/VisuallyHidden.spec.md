---
schema_version: 3
template_version: 7
kind: component
id: component:VisuallyHidden
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-27
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility]
verified_by:
  [
    .github/visual-baseline/manifest.json,
    packages/core/src/VisuallyHidden/VisuallyHidden.test.tsx,
    apps/storybook/stories/VisuallyHidden.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture: [architecture:public-component-api]
contributing: []
system_specs: [spec:AST-009, spec:AST-071]
---

# VisuallyHidden component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | A wrapper with required `children` and an optional `as` element; accessibility and data props pass through; it has no styling surface.  |
| Behavior                | Content stays in the accessibility tree and is clipped from sight by a fixed style block that no caller input can displace.             |
| End-user impact         | Screen-reader users hear names and announcements that sighted users do not need to see.                                                 |
| Builder impact          | None; the record describes shipped behavior.                                                                                            |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. One implementation gap is listed under Current-state impact. |
| Review checks           | Reject any path that applies caller styling, a `display: none` or `visibility: hidden` hide, or dropped `aria-*` passthrough.           |
| Governing rules         | `architecture:public-component-api/INV5,INV8`.                                                                                          |

This table is a review projection; the body below is authoritative.

## Intent

VisuallyHidden exposes content to assistive technology while keeping it out of
sight: names for icon-only controls, live announcement regions, and
supplementary screen-reader context. It owns the hiding technique and the
guarantee that the hidden node cannot be styled visible.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, or
  DOM output changes. `xstyle` is accepted by the type and ignored;
  `className` and `style` are not accepted
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Styling inputs not accepted (FR3).** VisuallyHidden drops `className` and
  `style` and ignores `xstyle`, so callers cannot style the element. That keeps
  the clip from being displaced, but no family decision records the exception
  `architecture:public-component-api` INV6 requires, and `spec:AST-071` does not
  list it as a known gap.

## Ownership boundary

**Owns**

- The rendered element and its fixed clip style block.
- Passing accessibility, identity, data, and event props through.

**Does not own / non-goals**

- What the hidden content says and whether it is a live region — owned by the
  caller, through `children`, `as`, and ARIA props.
- Shared status announcements — owned by `spec:AST-086` and its shared channel.
- Theming — VisuallyHidden has no theming target.

## Public concepts

| Concept | Closed values or states | Meaning                                | Availability by variant/orientation/state | Default | Owner                      | Stability | Invalid-value behavior  |
| ------- | ----------------------- | -------------------------------------- | ----------------------------------------- | ------- | -------------------------- | --------- | ----------------------- |
| Element | Any element type        | The rendered element, inline or block. | Always                                    | `span`  | `component:VisuallyHidden` | Stable    | Rendered as React does. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | VisuallyHidden renders `children` in the element named by `as` (default `span`), which stays in the accessibility tree.                                                                                                                                                                                                                                                                                                                                                                                                 | Current source and tests |
| FR2 | The element is absolutely positioned at the inline-start and block-start of its containing block, 1px by 1px with a −1px margin, no padding or border, clipped to an empty rectangle with hidden overflow, unwrapped, and ignores pointer events and selection.                                                                                                                                                                                                                                                         | Current source and tests |
| FR3 | `ref` reaches the element. Supported `aria-*`, `role`, `id`, `data-*`, and event props reach it. `className` and `style` are not forwarded, `xstyle` is ignored, and the clip styles apply after caller props so nothing displaces them. `architecture:public-component-api` INV6 has a component accept root styling inputs unless a family decision names an exception. Implementation gap: this styling-free surface has no such decision, and `spec:AST-071` lists no gap for `xstyle` here (Current-state impact). | Current source and tests |

### Allowed variation

- **AV1 — Element choice.** Callers choose an inline or block element, such as
  a `div` for block content or a live region.

### Representative states

| State             | Required invariant                                                | Allowed variation |
| ----------------- | ----------------------------------------------------------------- | ----------------- |
| Icon-only label   | Hidden `span` gives the control its accessible name.              | Text.             |
| Live region       | Block element with caller `aria-live` stays hidden and announced. | Politeness.       |
| Styling attempted | Caller `className`, `style`, and `xstyle` have no effect.         | —                 |

### Transformation and precedence order

- **ORD1 — Props.** Caller props (minus styling) → fixed clip styles.

### Performance and resources

- **PR1 — Static render.** VisuallyHidden holds no state and uses no hooks.

## Accessibility contract

- **AR1 — Perceivable to assistive technology.** Hiding uses clipping, never
  `display: none`, `visibility: hidden`, or `aria-hidden`, so the content is
  read and can name or describe other elements.
- **AR2 — Live regions by caller choice.** VisuallyHidden adds no role or live
  region of its own; a caller's `role` and `aria-live` pass through.

## Design relationships

| Anatomy or state | Design requirement                                  | Representation authority | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Hidden content   | Present to assistive technology, absent from sight. | Current source and docs  | Supporting     | FR1–FR3, AR1, AR2  |

Theming: VisuallyHidden has no theming target, by design; a visible style on a
hidden node would defeat its purpose.

## Family and system relationships

- `architecture:public-component-api` owns passthrough and ref rules; FR3
  records VisuallyHidden's narrower styling surface.

## Verification map

| Contract | Verification                                                                                     | Representative states                                                                   | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                   | Audit section                   |
| -------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1, AR1 | `VisuallyHidden.test.tsx` render and icon-label tests                                            | Default, `as`, icon-only control                                                        | Content leaving the accessibility tree or a lost accessible name fails.                                                                                                                                                                                                                                                                                           | `audit:VisuallyHidden/a11y`     |
| FR2      | `VisuallyHidden.test.tsx` clip-style test; stable visual baseline `core-visuallyhidden--default` | Default                                                                                 | A `hidden` attribute fails the unit test; content that becomes visible comes back changed in the visual baseline. Gap: no unit test asserts a clip declaration, although the test environment exposes them.                                                                                                                                                       | `audit:VisuallyHidden/behavior` |
| FR3, AR2 | `VisuallyHidden.test.tsx` `as`, ref, passthrough, and styling tests                              | `as` with `aria-live`; ref; `id`, `role`, `data-testid`; `className`, `style`, `xstyle` | A lost `aria-live`, a missed ref, a dropped `id` or `role`, or a forwarded `className`, `style`, or `xstyle` fails. Gap: no test asserts that VisuallyHidden adds no role or live region of its own; the ref test still passes when a wrapper receives the ref; and no test asserts other `aria-*` or event props, or that the clip styles win over caller props. | `audit:VisuallyHidden/behavior` |
| PR1      | Source review                                                                                    | Every state                                                                             | Gap: no automated check fails if VisuallyHidden adds state or a hook.                                                                                                                                                                                                                                                                                             | `audit:VisuallyHidden/behavior` |
| AR1      | Accessibility-tree evidence (`spec:AST-009` FR3)                                                 | Icon-only label; live region                                                            | Gap: no accessibility-tree check proves the hidden content stays in the tree; the unit tests query the DOM.                                                                                                                                                                                                                                                       | `audit:VisuallyHidden/a11y`     |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
