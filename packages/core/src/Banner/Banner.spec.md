---
schema_version: 3
template_version: 4
kind: component
id: component:Banner
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-07
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
outer-surface question can be reviewed against explicit facts. It documents the
existing outer frame as anatomy, but does not choose a new target or change
runtime behavior.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The current status surface as Banner's primary painted surface.
- The optional content surface below it.
- The Banner frame that groups both surfaces and carries the current whole-banner
  elevation and elevated-card silhouette.

**Does not own / non-goals**

- Painting for action and dismiss controls — delegated to `component:Button`.
- A public theming target for the Banner frame — no such target exists today,
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

| ID  | Candidate invariant                                                                                                                                                                          | Basis                                      | Draft review state                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| FR1 | The current render places `banner` on the colored status surface, which is Banner's primary painted surface and reflects `container` and `status`.                                           | Current source, public docs, and tests     | Verified current behavior; no target change decided          |
| FR2 | The Banner frame receives the public ref, role, supported DOM props, `xstyle`, `className`, and `style`; it also paints the selected `boxShadow`.                                            | Current source and tests                   | Verified current behavior; future ownership remains open     |
| FR3 | An elevated `card` frame also paints the whole-banner radius. A `section` frame remains square. A non-elevated frame does not receive the frame-radius style.                                | Current source and elevation tests         | Verified current behavior; future ownership remains open     |
| FR4 | Card shape is split across surface owners: the status surface owns all corners without visible content or the top corners with visible content; the content surface owns the bottom corners. | Current source                             | Verified current behavior; no DOM or clipping change decided |
| FR5 | Theme-authored `borderRadius` on `banner` currently expands to the private `--_banner-radius` variable used by the status surface, content surface, and elevated card frame.                 | Current component docs and theme compiler  | Verified current routing; private variable stays private     |
| FR6 | The Banner frame has no public theming target and reflects neither `container` nor `elevation` through `themeProps`. `elevation` is not reflected on any current Banner target.              | Current source and public target inventory | Verified current absence; admission is a human decision      |
| FR7 | The current public targets are `banner`, `banner-icon`, `banner-description`, and `banner-content`; their exact anatomy ownership is recorded below.                                         | Current public docs and source             | Verified current behavior; no target added or removed        |

### Allowed variation

- **AV1 — Content presence.** The content surface may be absent, collapsed,
  expanded, or always visible under the existing `collapsible` contract.
- **AV2 — Current theme overrides.** Themes may use the four current targets and
  the existing derived radius route without gaining a selector for the Banner
  frame.

### Representative states

| State                          | Required current behavior                                                                                           | Allowed variation                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Flat card, no visible content  | Status surface is the full rounded painted surface; frame shadow is `none` and frame radius styling is absent.      | Status, text, controls, and theme paint |
| Elevated card, visible content | Frame paints the whole shadow and radius; status surface paints top corners; content surface paints bottom corners. | Elevation tier and content              |
| Elevated section               | Frame paints the whole shadow without card radius; status and content surfaces remain square.                       | Elevation tier and content              |
| Custom radius theme            | `banner` border-radius authoring routes through the private radius variable to each current surface owner.          | Authored radius value                   |

### Transformation and precedence order

- **ORD1 — Surface resolution.** Resolve `container`, `elevation`, and visible
  content; apply whole-banner elevation and any elevated-card radius to the
  Banner frame; then render the targeted status and optional targeted content
  surfaces.
- **ORD2 — Radius routing.** Theme compilation turns `borderRadius` authored on
  `banner` into the private radius variable before the current surface owners
  consume it. Consumers do not author the private variable directly.

### Performance and resources

This draft introduces no new measurement, observer, listener, render pass, or
runtime work.

## Accessibility contract

This draft does not change Banner's current status roles, announcements, focus
handoff, disclosure controls, or accessible control names.

## Design relationships

| Anatomy or state        | Design requirement                                                                                 | Representation authority       | Hierarchy role | Component contract |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Banner frame            | Groups the status and optional content surfaces and carries their shared silhouette and elevation. | Current source and public docs | Supporting     | FR2, FR3, FR4      |
| Status surface          | Acts as Banner's primary painted surface, carrying the status fill, message, and controls.         | Current source and public docs | Prominent      | FR1                |
| Content surface         | Carries optional supporting detail below the status surface.                                       | Current source and public docs | Supporting     | FR4, FR7           |
| Action/dismiss controls | Keep their own Button painting and target ownership.                                               | Current composition            | Supporting     | FR7                |

The Banner frame is stable anatomy and a current surface owner. Its separate
public theme ownership remains undecided.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Banner frame": {
    "none": {
      "reason": "unsettled: The current frame owns whole-banner elevation and the elevated-card silhouette, but whether it needs separate public theme ownership is undecided."
    }
  },
  "Status surface": {"target": "banner"},
  "Icon": {"target": "banner-icon"},
  "Title": {"inherits": "banner"},
  "Description": {"target": "banner-description"},
  "Action button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Dismiss button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Content surface": {"target": "banner-content"}
}
```

This map records current consumer anatomy and current targets. `banner` belongs
to the primary Status surface rather than the outermost DOM element. The Banner
frame is named anatomy because it owns the visible whole-banner silhouette; its
`none` disposition records that no current target reaches it without deciding
whether a future target should.

## Family and system relationships

- `architecture:component-theming-surface` owns target qualification, anatomy
  mapping, and the requirement that public targets sit on stable painted parts.
- `architecture:public-component-api` owns admission and compatibility for a new
  public theming seam.
- `architecture:theme-compilation` owns the private derived-variable route that
  currently carries Banner radius across its painters.

## Verification map

| Contract            | Verification                                                      | Representative states                                    | Mutation or failure expectation                                                                      | Audit section           |
| ------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1, FR6, FR7       | `Banner.test.tsx` and `themingTargets.test.ts`                    | Status surface, content surface, all current target axes | Moving, adding, or removing a target changes current class/data-attribute assertions.                | `audit:Banner/theming`  |
| FR2, FR3, FR4       | `Banner.test.tsx` plus current source inspection                  | Flat/elevated card and elevated section                  | Frame, status surface, content surface, shadow, or radius ownership changes from the recorded state. | `audit:Banner/surfaces` |
| FR5                 | Component docs, derived registry checks, and theme compiler tests | Card with and without content; elevated card             | Radius authoring stops reaching one of the current surface owners or exposes the private var.        | `audit:Banner/radius`   |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                     | Eight anatomy entries and four current targets           | Missing, extra, prefixed, stale, or unclaimed mappings fail validation.                              | `audit:Banner/theming`  |

## Decision log

None. This draft records current facts and introduces no component-local design
or public-API decision.

## Open questions

- **OQ1 — Should the Banner frame receive separate public theme ownership for
  whole-banner elevation and silhouette, or should the existing `banner` target
  continue to route supported frame paint internally? If separate, what
  role-based target name should it use?** (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables or examples, choose the
outer-target outcome, add implementation steps, or restate system theming rules.
