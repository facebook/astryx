---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-013
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-01
phase: accepted
owners: [cixzhang, imdreamrunner]
affects_architecture:
  [architecture:layer-runtime, architecture:public-component-api]
affects_families: [family:overlay-dismissal]
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [browser-support, useLayer, Popover, Toast, Dialog]
---

# Browser and platform support system spec

## Intent

Give stable Astryx web components one owner for browser support, native-feature
adoption, and reduced fallback. Component specs inherit this shared baseline and
record only explicit exceptions.

Full and fallback paths must satisfy the component's current accessibility
contract and applicable [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/)
requirements. Assistive-technology evidence remains separately owned.

## Non-goals

- Requiring identical implementation or pixels when user outcomes are equivalent.
- Polyfilling every missing browser feature.
- Replacing the layer-specific contract in [AST-003](../AST-003/spec.md) or the
  public API admission rules in [AST-002](../AST-002/spec.md).
- Implementing generated rows, consumer-doc updates, CI, or release tooling in
  this specification pull request.

## Requirements

- **FR1 — One rolling compatibility model.** Current Web Platform Baseline is the
  full-support tier. Baseline minus two years is the reduced-fallback tier. Astryx
  makes no support promise below that tier.
- **FR2 — Compatibility rows are generated.** Browser/version rows are generated
  from the approved Baseline data and authoritative browser release data; they are
  never maintained as handwritten version claims. The generated rows live in the
  public [Browser Support guide](../../../packages/cli/assets/docs/browser-support.doc.mjs)
  and record their source and refresh date. TypeScript targets, build targets, and
  feature tables are not support evidence.
- **FR3 — Two official browser rows are always included.** Independently of the
  generated Baseline coverage, Astryx officially supports and tests:
  - the latest stable Chrome release on desktop; and
  - Safari on the latest stable iOS release.

  “Latest” means the current stable release identified and refreshed from
  authoritative browser release data, not a handwritten version. Other browsers
  may remain represented by the generated Baseline compatibility rows; this
  decision does not name desktop Safari or Firefox as additional official test
  rows.

- **FR4 — Compatibility and test coverage stay distinct.** The Browser Support
  guide labels the generated Baseline compatibility rows separately from the
  named official test matrix. A browser's presence in generated compatibility
  data does not claim that Astryx runs an official browser lane for it.
- **FR5 — Supported browsers receive full required behavior.** Every browser in
  the full-support tier and each named official browser row receives the
  component's current behavior, accessibility, state, renderer, and interaction
  contracts. A missing native feature does not silently narrow those requirements.
- **FR6 — Native features are capability-detected.** Components detect the API or
  CSS capability they use rather than inferring it from a browser name. A narrow
  engine workaround is allowed only for a reproduced defect with a regression
  fixture and a review or removal condition.
- **FR7 — Reduced fallback preserves the task.** In the Baseline-minus-two tier, a
  component either provides equivalent behavior or documents a reduced fallback.
  The fallback may omit only named enhancements and must preserve the primary
  task, applicable accessibility requirements, stable state and callbacks,
  cleanup, and repeated use.
- **FR8 — Reduced fallback must not be broken.** It must not throw, render invalid
  or `NaN` geometry, hide essential content, make controls unreachable, orphan or
  trap focus, block the surrounding page, corrupt controlled state, remain stuck
  pending, or flash a false open, closed, loading, positioned, or styled state.
- **FR9 — SSR and hydration are consistent.** SSR-capable components do not read
  browser capability, geometry, input modality, or user-agent state during server
  render. The first client render matches the server contract. Post-hydration
  enhancement begins from a usable state and introduces no mismatch, broken
  intermediate state, or visible false state.
- **FR10 — Browser-owned behavior needs real-browser evidence.** Source, unit, and
  jsdom tests may prove guards and deterministic state. Layout, paint, focus,
  native Popover or Dialog behavior, top-layer order, browser event timing, and
  hydration presentation require evidence in the actual browser that owns the
  claim. Chromium does not substitute for iOS Safari, and Playwright WebKit does
  not prove Safari behavior.
- **FR11 — Raising the floor is compatibility work.** Removing a supported browser,
  moving it from full behavior to reduced fallback, or removing a documented
  fallback requires owner approval, a Changeset, user-impact and migration notes,
  updated generated rows, and evidence that every remaining full-support and
  named official browser row still receives full required behavior.
- **FR12 — Component specs inherit the baseline.** Component specs link
  `spec:AST-013` and record only stricter requirements or explicit exceptions. An
  exception names the affected capability, observable reduction, preserved
  FR7–FR9 obligations, evidence, owner, and review condition.

### Platform support

- Full support: current Web Platform Baseline, plus the named official rows in FR3.
- Reduced fallback: Baseline minus two years, satisfying FR7–FR9.
- Unsupported: below Baseline minus two years; Astryx makes no support promise.
- Browser evidence: the actual named browser is required for browser-owned claims.

## Current-state impact

The public guide currently has handwritten Baseline tiers and version rows, and
routine browser CI primarily exercises Chromium. Generated compatibility rows,
the separately labeled official test matrix, and the latest stable Chrome desktop
and Safari-on-latest-stable-iOS evidence remain implementation work. These gaps do
not change the accepted contract or imply that the future lanes already exist.
Focused bug fixes continue against current contracts without waiting for that
infrastructure.

## Verification

| Contract  | Required evidence                                                 | Failure signal                                                                                                 |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| FR1–FR5   | Generated-row check plus guide/package/test-matrix reconciliation | A handwritten/build version becomes a support claim, official rows disappear, or supported behavior is reduced |
| FR6–FR8   | Feature-present/absent tests and active fallback fixtures         | Browser sniffing selects ordinary behavior, or fallback is unusable, inaccessible, unstable, or visibly broken |
| FR9       | Server render, hydration, and post-hydration browser fixture      | Markup diverges, browser state is read on the server, or a false/broken state flashes                          |
| FR10      | Actual-browser fixture for every browser-owned claim              | Chromium or Playwright WebKit is credited with iOS Safari behavior                                             |
| FR11–FR12 | Release review and knowledge-record checks                        | A floor/fallback disappears without compatibility treatment, or a component silently overrides the baseline    |

## Decision log

### DEC-1 — Rolling Baseline tiers plus two official browser rows

**Reference:** `spec:AST-013/DEC-1`
**Decider:** `cixzhang`, `2026-09-01`

Astryx uses current Web Platform Baseline for full support, Baseline minus two
years for reduced fallback, and no promise below that tier. Latest stable Chrome
on desktop and Safari on latest stable iOS are always included as official support
and test rows independently of generated Baseline coverage. Generated compatibility
rows and the named official test matrix remain distinct public facts.

## Open questions

None.
