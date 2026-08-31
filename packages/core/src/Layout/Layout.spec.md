---
schema_version: 1
template_version: 3
kind: component
id: component:Layout
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/__tests__/childrenAsContent.test.tsx,
    packages/core/src/Layout/__tests__/contentWidth.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
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

# Layout component contract

## Intent

Layout provides the page shell that arranges optional Header, Panel, Content
area, and Footer regions. This draft records the current aggregate consumer
anatomy and theming ownership without changing runtime behavior, DOM, styling,
targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Page shell and its current `layout` target.
- The aggregate Header, Panel, Content area, and Footer anatomy and their current
  `layout-header`, `layout-panel`, `layout-content`, and `layout-footer` targets.
- One Panel concept for both logical start and end positions.

**Does not own / non-goals**

- Product meaning or content supplied to any region — owned by the caller.
- Automatic responsive substitution of regions — owned by the caller, AppShell,
  or another higher-level composition.
- Resize interaction — owned by useResizable and ResizeHandle.
- Correcting current container-padding publication mismatches or preventing two
  adjacent divider owners from both painting; those remain current gaps and
  caller obligations recorded below.
- New runtime behavior, API, target, alias, or region wrapper.

## Public concepts

No new public concept is introduced. Consumer props, slots, defaults, and usage
remain documented in `Layout.doc.mjs` and the region subcomponent docs.
`family:layout-regions` owns the shared region vocabulary.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                               | Basis                                     | Draft review state                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| FR1 | Layout renders one Page shell carrying the current `layout` target and places each supplied named region according to the existing shell topology.                                                                                | Current source, docs, tests, and family   | Verified current behavior; no new behavior decided |
| FR2 | Header, Content area, and Footer use their current `layout-header`, `layout-content`, and `layout-footer` targets on the corresponding Layout region components.                                                                  | Current source and target metadata        | Verified current inventory; no target change       |
| FR3 | A Panel in either logical start or end position is the same aggregate Panel part and uses the current `layout-panel` target; position does not create a second anatomy row or target.                                             | Current source, docs, tests, and family   | Verified current ownership; no API change          |
| FR4 | `Layout.doc.mjs` is the canonical aggregate consumer document for all five current `layout*` targets; region subcomponent docs continue to document their own props and usage without duplicating the aggregate target inventory. | Current documentation organization        | Verified current ownership                         |
| FR5 | LayoutContent and LayoutPanel retain their shipped automatic container-padding publication behavior, including the mismatches recorded by `architecture:container-padding`; this documentation does not claim exact parity.       | Current source and architecture record    | Current conformance gap; not fixed here            |
| FR6 | When an adjacent ResizeHandle owns a panel divider, the caller must keep `LayoutPanel hasDivider={false}`; current composition does not prevent both components from painting the same boundary.                                  | Current source, docs, and family contract | Current caller obligation; not fixed here          |

### Current evidence and gaps

- LayoutContent does not republish a matching inline-end container-padding value
  on its automatic no-end path, and its no-start path writes the outer inline
  value to both inline geometry variables. LayoutPanel applies automatic outer
  shell-edge padding while retaining baseline inner geometry variables. A
  full-bleed descendant can therefore compensate against a published value that
  differs from the region's applied padding. This is shipped evidence and a
  runtime conformance gap, not behavior corrected or approved by this draft.
- LayoutPanel and an adjacent ResizeHandle can both draw the same content-facing
  divider. The current caller obligation is to set
  `LayoutPanel hasDivider={false}` when ResizeHandle owns that line. This draft
  does not add coordination or duplicate-divider prevention.

### Allowed variation

- **AV1 — Slot presence.** Header, start Panel, Content area, end Panel, and Footer
  may be independently present or absent within the existing shell topology.
- **AV2 — Panel position.** A Panel may occupy logical start or end, or Panels may
  occupy both positions; all use the same conceptual part and target owner.
- **AV3 — Region content.** Caller-provided region content retains its own
  semantics and theming ownership.

### Representative states

| State                 | Required invariant                                                         | Allowed variation                                      |
| --------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| Content-only shell    | Page shell and Content area use their current targets.                     | Caller content and current height/width configuration. |
| Header/content/footer | Each supplied region uses its corresponding aggregate part and target.     | Divider selection, size, padding, and caller content.  |
| Start or end Panel    | Either logical position uses the one Panel part and `layout-panel` target. | Position, width, scrolling, padding, and caller role.  |
| Two Panels            | Both instances remain one repeated conceptual Panel part.                  | Independent content, width, and local configuration.   |
| ResizeHandle-adjacent | Divider ownership follows the current caller obligation in FR6.            | Resize state remains owned by the resize components.   |

### Transformation and precedence order

- No new slot, padding, content-width, divider, scrolling, sizing, or styling
  precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not add inferred landmark semantics. LayoutHeader,
LayoutContent, LayoutFooter, and LayoutPanel retain their current explicit
caller-supplied role and label behavior.

## Design relationships

| Anatomy or state | Design requirement                                             | Representation authority                  | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------------- | ----------------------------------------- | -------------- | ------------------ |
| Page shell       | Arranges the named page regions.                               | Current source, docs, and family contract | Supporting     | FR1                |
| Header           | Presents optional top-region content.                          | Current source, docs, and family contract | Supporting     | FR1, FR2           |
| Panel            | Presents optional side-region content at logical start or end. | Current source, docs, and family contract | Supporting     | FR1, FR3, FR6      |
| Content area     | Presents optional central page content.                        | Current source, docs, and family contract | Prominent      | FR1, FR2, FR5      |
| Footer           | Presents optional bottom-region content.                       | Current source, docs, and family contract | Supporting     | FR1, FR2           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Page shell": {"target": "layout"},
  "Header": {"target": "layout-header"},
  "Panel": {"target": "layout-panel"},
  "Content area": {"target": "layout-content"},
  "Footer": {"target": "layout-footer"}
}
```

The exact map records the five current public targets. Start and end Panels are
instances of the same stable conceptual part and therefore share one map row.

## Family and system relationships

- `family:layout-regions` owns the shared shell-region topology, logical
  direction, boundaries, scrolling, and component ownership.
- `architecture:container-padding` owns Layout inset publication and the current
  LayoutContent/LayoutPanel conformance gap.
- `architecture:component-theming-surface` owns anatomy qualification and exact
  target mapping rules.
- `architecture:public-component-api` owns the stable slots, props, exports, and
  compatibility boundary; this documentation adds no API.

## Verification map

| Contract      | Verification                                                                  | Representative states                               | Mutation or failure expectation                                                                     | Audit section                |
| ------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1–FR3       | Layout render, slot, children-as-content, and target inventory tests          | Content-only, all regions, logical start/end Panels | Removing a region or target fails existing structure, context, or target inventory assertions.      | `audit:Layout/anatomy`       |
| FR4           | `scripts/check-knowledge.mjs`                                                 | Canonical aggregate doc and exact five-target map   | Duplicated, missing, extra, prefixed, or stale target mappings fail repository validation.          | `audit:Layout/theming`       |
| FR5           | Source inspection plus `architecture:container-padding` verification evidence | Automatic outer-edge Content area and Panel paths   | This draft adds no parity assertion; a runtime correction requires separate compatibility evidence. | `audit:Layout/layout`        |
| FR6           | LayoutPanel source/docs plus `family:layout-regions` verification evidence    | Panel beside a divider-owning ResizeHandle          | This draft adds no prevention assertion; changing ownership requires separate runtime coverage.     | `audit:Layout/layout`        |
| Accessibility | `LayoutSlots.test.tsx` landmark assertions                                    | Header, Content area, Footer, and Panel roles       | Supplied role or label no longer reaches the region element.                                        | `audit:Layout/accessibility` |

## Decision log

None. This draft records current facts and introduces no component-local design,
layout, API, target, or behavior decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, family region
rules, container-padding mechanics, resize interaction, implementation steps,
or system rules. It links to their owners.
