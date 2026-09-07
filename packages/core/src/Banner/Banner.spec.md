---
schema_version: 3
template_version: 4
kind: component
id: component:Banner
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, layout, theming]
verified_by:
  [
    packages/core/src/Banner/Banner.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:theme-compilation,
  ]
contributing: []
system_specs: []
---

# Banner component contract

## Intent

Banner presents a persistent status message at the top of a page or section.
This draft records the current painted surfaces and theming ownership so the
outer-surface question can be reviewed against explicit facts. It does not choose
a new target, change runtime behavior, or make the outer wrapper public anatomy.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The current header as Banner's main painted status surface.
- The optional content surface below the header.
- The current whole-banner elevation and shape behavior described below.

**Does not own / non-goals**

- Painting for action and dismiss controls — delegated to `component:Button`.
- A public theming target for the outer wrapper — no such target exists today,
  and this draft does not decide whether to add one.
- A new theme property, prop, variant, or DOM element.

## Public concepts

No new public concept is introduced. Consumer props, defaults, and usage remain
documented in `Banner.doc.mjs`.

The current `status`, `container`, and `elevation` props continue to select the
existing presentation. This draft does not change which axes are extensible or
which values themes may add.

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                  | Basis                                      | Draft review state                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| FR1 | The current render places `banner` on the colored header, which is the main painted status surface and reflects `container` and `status`.                                            | Current source, public docs, and tests     | Verified current behavior; no target change decided          |
| FR2 | The outer root receives the public ref, role, supported DOM props, `xstyle`, `className`, and `style`; it also paints the selected `boxShadow`.                                      | Current source and tests                   | Verified current behavior; future ownership remains open     |
| FR3 | An elevated `card` root also paints the whole-banner radius. A `section` root remains square. A non-elevated root does not receive the root-radius style.                            | Current source and elevation tests         | Verified current behavior; future ownership remains open     |
| FR4 | Card shape is split across painters: the header owns all corners without visible content or the top corners with visible content; content owns the bottom corners.                   | Current source                             | Verified current behavior; no DOM or clipping change decided |
| FR5 | Theme-authored `borderRadius` on `banner` currently expands to the private `--_banner-radius` variable used by the header, content, and elevated card root.                          | Current component docs and theme compiler  | Verified current routing; private variable stays private     |
| FR6 | The outer root has no public Banner theming target and reflects neither `container` nor `elevation` through `themeProps`. `elevation` is not reflected on any current Banner target. | Current source and public target inventory | Verified current absence; admission is a human decision      |
| FR7 | The current public targets are `banner`, `banner-icon`, `banner-description`, and `banner-content`; their exact anatomy ownership is recorded below.                                 | Current public docs and source             | Verified current behavior; no target added or removed        |

### Allowed variation

- **AV1 — Content presence.** Content may be absent, collapsed, expanded, or
  always visible under the existing `collapsible` contract.
- **AV2 — Current theme overrides.** Themes may use the four current targets and
  the existing derived radius route without gaining a selector for the outer
  root.

### Representative states

| State                          | Required current behavior                                                                                | Allowed variation                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Flat card, no visible content  | Header is the full rounded painted surface; root shadow is `none` and root radius styling is absent.     | Status, text, controls, and theme paint |
| Elevated card, visible content | Root paints the whole shadow and radius; header paints top corners; content paints bottom corners.       | Elevation tier and content              |
| Elevated section               | Root paints the whole shadow without card radius; header and content remain square.                      | Elevation tier and content              |
| Custom radius theme            | `banner` border-radius authoring routes through the private radius variable to each current shape owner. | Authored radius value                   |

### Transformation and precedence order

- **ORD1 — Surface resolution.** Resolve `container`, `elevation`, and visible
  content; apply whole-banner elevation and any elevated-card radius to the
  root; then render the targeted header and optional targeted content surfaces.
- **ORD2 — Radius routing.** Theme compilation turns `borderRadius` authored on
  `banner` into the private radius variable before the current painters consume
  it. Consumers do not author the private variable directly.

### Performance and resources

This draft introduces no new measurement, observer, listener, render pass, or
runtime work.

## Accessibility contract

This draft does not change Banner's current status roles, announcements, focus
handoff, disclosure controls, or accessible control names.

## Design relationships

| Anatomy or state        | Design requirement                                                                | Representation authority       | Hierarchy role | Component contract |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Header                  | Carries the main status fill and contains the message and controls.               | Current source and public docs | Prominent      | FR1                |
| Whole-banner silhouette | Carries the shadow and, for an elevated card, the radius that shapes that shadow. | Current source only            | Supporting     | FR2, FR3, FR4      |
| Content                 | Carries the optional detail surface below the header.                             | Current source and public docs | Supporting     | FR4, FR7           |
| Action/dismiss controls | Keep their own Button painting and target ownership.                              | Current composition            | Supporting     | FR7                |

The whole-banner silhouette is current implementation structure, not listed
consumer anatomy. This draft records what it paints without deciding whether it
should become a stable public part.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Header": {"target": "banner"},
  "Icon": {"target": "banner-icon"},
  "Title": {"inherits": "banner"},
  "Description": {"target": "banner-description"},
  "Action button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Dismiss button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Content": {"target": "banner-content"}
}
```

This map records current consumer anatomy and current targets. It intentionally
contains no outer-root entry because the outer wrapper is not current consumer
anatomy and has no public target. That absence is a fact, not a decision that the
wrapper must remain private.

## Family and system relationships

- `architecture:component-theming-surface` owns target qualification, anatomy
  mapping, and the requirement that public targets sit on stable painted parts.
- `architecture:public-component-api` owns admission and compatibility for a new
  public theming seam.
- `architecture:theme-compilation` owns the private derived-variable route that
  currently carries Banner radius across its painters.

## Verification map

| Contract            | Verification                                                      | Representative states                          | Mutation or failure expectation                                                         | Audit section           |
| ------------------- | ----------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| FR1, FR6, FR7       | `Banner.test.tsx` and `themingTargets.test.ts`                    | Header, content, all current target axes       | Moving, adding, or removing a target changes current class/data-attribute assertions.   | `audit:Banner/theming`  |
| FR2, FR3, FR4       | `Banner.test.tsx` plus current source inspection                  | Flat/elevated card and elevated section        | Root, header, content, shadow, or radius ownership changes from the recorded state.     | `audit:Banner/surfaces` |
| FR5                 | Component docs, derived registry checks, and theme compiler tests | Card with and without content; elevated card   | Radius authoring stops reaching one of the current painters or exposes the private var. | `audit:Banner/radius`   |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                     | Seven anatomy entries and four current targets | Missing, extra, prefixed, stale, or unclaimed mappings fail validation.                 | `audit:Banner/theming`  |

## Decision log

None. This draft records current facts and introduces no component-local design
or public-API decision.

## Open questions

- **OQ1 — Should the whole-banner elevation/radius painter become stable public
  anatomy with its own target, or should the existing `banner` target remain
  Banner's public component surface and route any supported outer paint
  internally?** (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables or examples, choose the
outer-target outcome, add implementation steps, or restate system theming rules.
