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
review_triggers: [public-api, behavior, layout, theming, accessibility]
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
system_specs: [spec:AST-009]
---

# Banner component contract

## Intent

Banner presents a persistent status message at the top of a page or section.
This contract records the current painted surfaces and the Banner frame as a
separately targetable surface. The status and content targets remain unchanged.

## Compatibility and migration

- Released default preserved: `no` — Banner no longer derives a live-region role from visual status
- Compatibility class: breaking accessibility-semantic correction; visual output, DOM structure, props, theming targets, and interaction behavior are unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: announce async outcomes in their transition handler with `useAnnounce`; add an explicit `role="status"` only for a persistent semantic mirror, and reserve `role="alert"` for genuinely urgent interruption

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The current status surface as Banner's primary painted surface.
- The optional content surface below it.
- The Banner frame that groups both surfaces and carries the current whole-banner
  elevation and elevated-card silhouette.

**Does not own / non-goals**

- Painting for action and dismiss controls — delegated to `component:Button`.
- A new theme property, prop, variant, or DOM element.

## Public concepts

The Banner frame is a stable public theming concept. Its target is
`banner-frame`, and it reflects the existing `container` and `elevation` axes.
The existing `banner` target remains on the Status surface and continues to
reflect `container` and `status`.

Consumer props, defaults, and usage remain documented in `Banner.doc.mjs`. No
prop vocabulary or extensibility rule changes.

## Behavioral and layout contract

The requirements below describe the current implementation and its additive
frame target contract.

| ID  | Invariant                                                                                                                                                                                                                                                                                                            | Basis                                                  | Contract state           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| FR1 | The current render places `banner` on the colored status surface, which is Banner's primary painted surface and reflects `container` and `status`.                                                                                                                                                                   | Current source, public docs, and tests                 | Current behavior         |
| FR2 | The Banner frame receives the public ref, role, supported DOM props, `xstyle`, `className`, and `style`; it also paints the selected `boxShadow`.                                                                                                                                                                    | Current source and tests                               | Current behavior         |
| FR3 | An elevated `card` frame also paints the whole-banner radius. A `section` frame remains square. A non-elevated frame does not receive the frame-radius style.                                                                                                                                                        | Current source and elevation tests                     | Current behavior         |
| FR4 | Card shape is split across surface owners: the status surface owns all corners without visible content or the top corners with visible content; the content surface owns the bottom corners.                                                                                                                         | Current source                                         | Current behavior         |
| FR5 | Theme-authored `borderRadius` on `banner` currently writes the private `--_banner-radius` variable on the Status surface only. CSS inheritance does not carry that value upward to the frame or sideways to the Content surface, so both keep their fallback radius.                                                 | Current compiler output and CSS inheritance            | Current reachability gap |
| FR6 | The Banner frame exposes `banner-frame` and reflects `container` and `elevation`. The existing `banner` target remains on the Status surface rather than moving to the outermost DOM element.                                                                                                                        | Owner decision; current source and tests               | Current behavior         |
| FR7 | `banner-frame` is additive. The existing `banner`, `banner-icon`, `banner-description`, and `banner-content` targets and their current axes remain unchanged.                                                                                                                                                        | Current target inventory; compatibility policy         | Current behavior         |
| FR8 | `status` controls visual meaning only and MUST NOT derive `role`, `aria-live`, or an announcement. Standard DOM props MAY provide an explicit persistent role. Async outcomes MUST announce from the transition handler through `useAnnounce`; `role="alert"` is reserved for genuinely urgent interruptive content. | Accessibility Checklist §Announcements; owner decision | Current behavior         |

### Allowed variation

- **AV1 — Content presence.** The content surface may be absent, collapsed,
  expanded, or always visible under the existing `collapsible` contract.
- **AV2 — Target scope.** Themes use `banner-frame` for the whole Banner
  silhouette and elevation, `banner` for the primary Status surface, and the
  existing child targets for their owned parts.

### Representative states

| State                          | Required current behavior                                                                                           | Allowed variation                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Flat card, no visible content  | Status surface is the full rounded painted surface; frame shadow is `none` and frame radius styling is absent.      | Status, text, controls, and theme paint |
| Elevated card, visible content | Frame paints the whole shadow and radius; status surface paints top corners; content surface paints bottom corners. | Elevation tier and content              |
| Elevated section               | Frame paints the whole shadow without card radius; status and content surfaces remain square.                       | Elevation tier and content              |
| Custom radius on `banner`      | Status surface receives the private radius value; frame and Content surface keep their fallback radius.             | Authored radius value                   |

### Transformation and precedence order

- **ORD1 — Surface resolution.** Resolve `container`, `elevation`, and visible
  content; apply whole-banner elevation and any elevated-card radius to the
  Banner frame; then render the targeted status and optional targeted content
  surfaces.
- **ORD2 — Current radius routing.** Theme compilation writes a
  `borderRadius` authored on `banner` to the private radius variable on the
  Status surface. That value does not inherit to the ancestor frame or sibling
  Content surface. Consumers do not author the private variable directly.

### Performance and resources

This contract introduces no new measurement, observer, listener, render pass, or
runtime work.

## Accessibility contract

`status` communicates visual category through color and icon; it does not choose
announcement urgency. Banner renders no live-region role by default. A caller may
provide `role="status"` through the standard DOM surface when the visible banner
is intentionally a persistent semantic mirror. Async outcomes use `useAnnounce`
from the transition handler, which writes into a previously mounted live region;
a Banner mounted together with its message is not a reliable announcement.
`role="alert"` remains available as an explicit native role, but is reserved for
genuinely urgent content that should interrupt current speech.

Dismissal focus handoff, disclosure controls, and accessible control names remain
unchanged.

## Design relationships

| Anatomy or state        | Design requirement                                                                                 | Representation authority       | Hierarchy role | Component contract |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Banner frame            | Groups the status and optional content surfaces and carries their shared silhouette and elevation. | Current source and public docs | Supporting     | FR2, FR3, FR4      |
| Status surface          | Acts as Banner's primary painted surface, carrying the status fill, message, and controls.         | Current source and public docs | Prominent      | FR1                |
| Content surface         | Carries optional supporting detail below the status surface.                                       | Current source and public docs | Supporting     | FR4, FR7           |
| Action/dismiss controls | Keep their own Button painting and target ownership.                                               | Current composition            | Supporting     | FR7                |

The Banner frame is stable anatomy and owns the additive `banner-frame` target.
The Status surface remains Banner's primary painted surface and keeps the
unqualified `banner` target.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Banner frame": {"target": "banner-frame"},
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

This map records runtime reachability. `banner` belongs to the primary Status
surface rather than the outermost DOM element, while `banner-frame` belongs to
the visible frame that owns whole-banner elevation and silhouette.

## Family and system relationships

- `architecture:component-theming-surface` owns target qualification, anatomy
  mapping, and the requirement that public targets sit on stable painted parts.
- `architecture:public-component-api` governs compatibility for the additive
  target admitted by DEC-1.
- `architecture:theme-compilation` owns the private derived-variable route that
  currently carries Banner radius across its painters.

## Verification map

| Contract            | Verification                                                   | Representative states                                               | Mutation or failure expectation                                                                                                         | Audit section           |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1, FR7            | `Banner.test.tsx` and `themingTargets.test.ts`                 | Status surface, content surface, current target axes                | Moving, removing, or changing an existing target breaks current assertions.                                                             | `audit:Banner/theming`  |
| FR2, FR3, FR4       | `Banner.test.tsx` plus current source inspection               | Flat/elevated card and elevated section                             | Frame, status surface, content surface, shadow, or radius ownership changes from the recorded state.                                    | `audit:Banner/surfaces` |
| FR5                 | Compiler output plus browser/computed-style evidence           | Card with and without content; elevated card                        | `banner.borderRadius` unexpectedly reaches the frame/content, or docs claim that the current route already does.                        | `audit:Banner/radius`   |
| FR6, FR7            | Implementation PR target, compiler, probe, and component tests | Card/section across none, low, med, and high elevation              | `banner-frame` is absent, uses another name, misses an axis, or moves the existing `banner` target.                                     | `audit:Banner/theming`  |
| FR8                 | `Banner.test.tsx`, consumer docs, Accessibility Checklist A6   | Default info/success/warning/error; explicit status and alert roles | A visual status creates a live region, an explicit role is dropped, or docs tell builders to announce by conditionally mounting Banner. | `audit:Banner/a11y`     |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                  | Eight anatomy entries and five current targets                      | Missing, extra, prefixed, stale, or unclaimed current mappings fail validation.                                                         | `audit:Banner/theming`  |

## Decision log

### DEC-1 — The Banner frame has separate public theme ownership

**Reference:** `component:Banner/DEC-1`

**Decider:** cixzhang, 2026-09-07

The Banner frame is stable visible anatomy that owns whole-banner elevation and
the elevated-card silhouette across the Status and optional Content surfaces.
It receives the additive `banner-frame` target with `container` and `elevation`
selector axes. The existing `banner` target remains on the primary Status
surface.

`frame` names the public visual role. `root` is rejected because it describes DOM
placement and would imply that the target must remain on the outermost element.

### DEC-2 — Visual status does not infer announcement urgency

**Reference:** `component:Banner/DEC-2`

**Decider:** cixzhang, 2026-09-24

Banner status selects color and icon only. It does not assign `role="status"` or
`role="alert"`. Async outcomes announce through `useAnnounce` from the transition
handler so the message reaches a persistent live region rather than one mounted
with its content. An explicit native role remains available through BaseProps for
a persistent semantic mirror or the rare genuinely urgent alert.

Rejected: deriving alert urgency from `warning` or `error`. Severity and urgency
are independent, and a static error present on first paint is not an event that
should interrupt screen-reader output.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, implementation
steps, or system theming rules.
