---
schema_version: 3
template_version: 4
kind: component
id: component:Center
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Center/Center.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/rtl-audit/targets.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:layout-primitives]
design_specs: []
architecture:
  [
    architecture:knowledge-contracts,
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:container-padding,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-029]
---

# Center component contract

## Intent

Center arranges caller-supplied content at the horizontal center, vertical center,
or both within its own box. This draft records verified released behavior, the
objective owned-attribute repair in the accompanying audit, and the existing
vertical-writing mismatch against current family authority. It does not add public
API, defaults, responsive behavior, container-bleed participation, or product
meaning.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: defect repair plus additive observational documentation;
  public types, defaults, supported values, DOM element, and theme target remain
  unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none; the inherited vertical-writing mismatch remains
  unchanged and requires a separate runtime correction with DOM, flow, RSC, and
  caller-content compatibility evidence

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The fixed `div` container and its flex or inline-flex display mode.
- Centering along the selected public axis or axes.
- The current box-size inputs and logical padding precedence.
- The current `center` theme target and its reflected `axis` value.

**Does not own / non-goals**

- The semantics, paint, interaction, intrinsic size, or reading order of caller
  content.
- Page or structural-region layout; those remain with Layout, AppShell, and the
  product callsite.
- Gap between multiple children, responsive breakpoints, overflow, or automatic
  sizing on an axis.
- Container inset publication or descendant bleed behavior. Center padding remains
  local under `architecture:container-padding`.
- New visual treatment, public values, or element polymorphism.

## Public concepts

Consumer syntax remains in `Center.doc.mjs`. This table records observable concepts
rather than duplicating its prop table.

| Concept        | Closed values or states                                         | Meaning                                                                                                               | Availability by variant/orientation/state                                     | Default                                          | Owner                               | Stability                 | Invalid-value behavior                                                                          |
| -------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| Centering axis | `both`, `horizontal`, `vertical`                                | Selects which physical axis or axes align caller content to the center of Center's box.                               | Every render.                                                                 | `both`                                           | `component:Center`                  | Observed released surface | Values rejected by the public type are outside this draft.                                      |
| Display mode   | flex or inline-flex                                             | Selects a block-level or inline-level flex container without changing centering semantics.                            | Every axis value.                                                             | flex                                             | `component:Center`                  | Observed released surface | The public boolean type admits only enabled or omitted.                                         |
| Box size       | number or CSS value string for current width/height constraints | Applies the shared `SizeValue` contract to Center's own box.                                                          | Every axis and display mode.                                                  | Intrinsic/containing-layout result when omitted. | `family:layout-primitives`          | Observed released surface | Runtime-invalid CSS follows browser CSS handling; this draft adds no validation.                |
| Local padding  | Shared spacing step on uniform, axis, or logical edge inputs    | Insets caller content inside Center without publishing container-bleed geometry.                                      | Every axis and display mode; logical edges follow writing mode and direction. | No component padding when omitted.               | `family:layout-primitives`          | Observed released surface | Values rejected by `SpacingStep` are outside this draft.                                        |
| DOM extension  | Supported BaseProps inputs and ref                              | Supported DOM, ARIA, data, event, class, style, and StyleX inputs reach the current root; the ref reaches that `div`. | Every render.                                                                 | No additional inputs.                            | `architecture:public-component-api` | Observed released surface | Component-owned target reflection remains authoritative when a generic data attribute collides. |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                   | Basis                                                                                                   | Draft review state                                                                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1 | The current root is one `div`. It renders as flex by default and inline-flex when the current inline flag is enabled.                                                                                                                                                                                                                                                 | Released declarations, source, docs, tests, and browser evidence                                        | Verified released behavior; no element or display change decided                                                                                                                                              |
| FR2 | `both` centers the physical horizontal and vertical axes. `horizontal` and `vertical` are physical-axis aliases under `family:layout-primitives`, independent of writing mode. The current flex implementation satisfies this in horizontal writing but swaps the one-axis results under vertical writing because it maps the names directly to flex main/cross axes. | Current family contract, source, docs, tests, and Chromium vertical-writing evidence                    | Pre-existing current-authority conformance gap; this audit records the BLOCK and leaves runtime remediation out because a safe fix must preserve DOM, flow, server rendering, and caller content writing mode |
| FR3 | Current width, height, maximum-width, and minimum-height inputs use `SizeValue`: numbers resolve as CSS pixels and strings pass through as CSS values.                                                                                                                                                                                                                | Current family contract, public declarations, docs, source, and browser evidence                        | Verified released behavior; no sizing API change                                                                                                                                                              |
| FR4 | Padding resolves independently per logical edge: explicit logical edge, then matching axis, then uniform padding. Inline and block edges resolve from writing mode and direction.                                                                                                                                                                                     | `family:layout-primitives/FR1–FR3`, source, tests, RTL audit, and browser evidence                      | Settled shared behavior; audit coverage completed                                                                                                                                                             |
| FR5 | Center padding remains local. It does not publish the internal container-padding variables that descendants use for bleed compensation.                                                                                                                                                                                                                               | `family:layout-primitives/FR8` and `architecture:container-padding/INV8`                                | Verified released boundary; no protocol participation added                                                                                                                                                   |
| FR6 | The root carries the current `center` target and reflects the resolved axis. Supported consumer styling composes on that same element, while a colliding generic `data-axis` value does not replace component-owned target state.                                                                                                                                     | `architecture:public-component-api/INV5–INV6`, current source, docs, target tests, and audit regression | Objective contract restoration in this audit; no target or API addition                                                                                                                                       |
| FR7 | Center creates no breakpoint, automatic overflow behavior, gap between children, structural region, or content-specific semantic wrapper.                                                                                                                                                                                                                             | `family:layout-primitives/FR4, FR7, AV3–AV5`, source, and docs                                          | Verified released boundary; no new capability inferred                                                                                                                                                        |

### Allowed variation

- **AV1 — Caller content.** Any renderable caller content may appear inside the
  current root and retains its own semantics, paint, interaction, and theme ownership.
- **AV2 — Available space.** Parent layout and current size inputs may change the
  box available for centering without changing the axis contract.
- **AV3 — Consumer styling.** Supported class, style, and StyleX inputs may alter
  the root through the documented escape hatches while the component-owned target
  name and resolved axis reflection remain present.

### Representative states

| State                            | Required invariant                                                                                         | Allowed variation                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Both axes                        | Physical horizontal and vertical alignment are centered in every writing mode.                             | Caller content and available width/height may vary.               |
| Horizontal only                  | The physical horizontal axis is centered; Center does not add physical vertical centering.                 | Height and caller-owned vertical placement may vary.              |
| Vertical only                    | The physical vertical axis is centered; Center does not add physical horizontal centering.                 | Width and caller-owned horizontal placement may vary.             |
| Vertical writing                 | The physical-axis requirements above remain unchanged. Current source reverses the one-axis outcomes.      | Writing mode and caller content may vary; the violation does not. |
| Inline                           | The root is inline-flex and retains the selected axis behavior.                                            | Surrounding inline content and caller children may vary.          |
| Asymmetric logical padding       | Logical start/end values keep their meaning while resolved physical inline-axis edges swap with direction. | Spacing steps, writing mode, and block-edge padding may vary.     |
| Narrow or coarse-pointer context | The passive container preserves its layout contract without adding a breakpoint or interaction mode.       | Parent width and caller content may wrap or size themselves.      |

### Transformation and precedence order

- **ORD1 — Layout resolution.** Resolve display mode and preserve the public
  physical-axis meaning across writing modes before applying current box-size inputs.
  Current source instead maps `horizontal` to flex main-axis alignment and `vertical`
  to flex cross-axis alignment, producing the FR2 conformance gap in vertical writing.
- **ORD2 — Padding resolution.** Resolve each edge from edge input to axis input to
  uniform input, preserving zero as an explicit spacing step.
- **ORD3 — Root composition.** Combine the `center` target, resolved axis reflection,
  component styles, and supported consumer styling on one root. Forward remaining
  supported DOM inputs without allowing them to replace component-owned target state.

### Performance and resources

- Center owns no state, Effect, listener, observer, timer, portal, measurement, or
  asynchronous resource. Its current render performs only synchronous prop
  resolution and one DOM render.

## Accessibility contract

- **AR1 — Passive semantics.** Center adds no interactive role, accessible name,
  state, focus behavior, keyboard handling, or live region. Caller content keeps its
  own semantic and interaction ownership.
- **AR2 — Supported DOM semantics.** Supported caller ARIA, role, data, event, and
  ref inputs reach the current root unless the attribute is component-owned target
  reflection under FR6.
- **AR3 — Reading order.** Center renders caller children in caller order and does
  not visually reorder them.

## Design relationships

| Anatomy or state | Design requirement                                                                                       | Representation authority                             | Hierarchy role    | Component contract |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- | ------------------ |
| Container        | Supplies one- or two-axis alignment and optional local inset without adding a visual surface by default. | Current source, docs, and `family:layout-primitives` | Supporting layout | FR1–FR7            |
| Content          | Retains caller-owned semantics, paint, interaction, and hierarchy inside the container.                  | Caller-owned content                                 | Context-dependent | AV1, AR1, AR3      |

This observational draft records current layout relationships. It does not decide a
new density, breakpoint, visual treatment, or content hierarchy.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "center"},
  "Content": {
    "none": {
      "reason": "intentional: Caller-supplied content retains its own theming ownership; Center applies no content target."
    }
  }
}
```

## Family and system relationships

- `family:layout-primitives` owns the shared `SizeValue`, `SpacingStep`, logical
  padding, padding precedence, and Center arrangement vocabulary.
- `architecture:container-padding` records that Center's current padding is local
  and does not publish descendant bleed geometry.
- `architecture:component-theming-surface` owns anatomy qualification, target
  placement, and axis reflection on the current target.
- `architecture:public-component-api` owns the released subpath, BaseProps
  passthrough, styling composition, ref reachability, and owned-attribute boundary.
- `architecture:knowledge-contracts` and `spec:AST-029` keep this observational
  draft from settling new behavior and require exact-head owner approval.
- `spec:AST-002` owns admission for any future public or behavioral delta.

## Verification map

| Contract                  | Verification                                                                             | Representative states                                                   | Mutation or failure expectation                                                                                          | Audit section                |
| ------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| FR1                       | `Center.test.tsx`, `Center.stories.tsx`, and receipted Chromium evidence                 | Block and inline display                                                | Removing a display style changes the public DOM/computed layout and fails focused or browser evidence.                   | `audit:Center/behavior`      |
| FR2                       | Receipted Chromium geometry in horizontal and `vertical-rl` writing modes                | Both, horizontal, and vertical axes across writing modes                | A one-axis value that centers the opposite physical dimension remains an open BLOCK until runtime behavior conforms.     | `audit:Center/behavior`      |
| FR3                       | Public declarations, source, focused tests, and browser evidence                         | Numeric and string width/height constraints                             | Changing SizeValue lowering or dropping a size input changes the current root's computed box.                            | `audit:Center/api`           |
| FR4                       | `Center.test.tsx`, writing-mode-aware `targets.json` D8, and LTR/RTL browser receipts    | Uniform, axis, per-edge, zero, horizontal writing, and vertical writing | Wrong precedence changes functional StyleX output; fixed left/right assumptions fail the vertical-writing D8 self-check. | `audit:Center/layout`        |
| FR5, FR7                  | Source review against family and container-padding authority                             | Padded and narrow containers                                            | Publishing bleed geometry or adding implicit responsive/overflow behavior contradicts the current boundary.              | `audit:Center/architecture`  |
| FR6                       | `Center.test.tsx` and `themingTargets.test.ts`                                           | Every axis plus a colliding consumer data attribute                     | Missing target/axis metadata or consumer replacement of component-owned reflection fails focused tests.                  | `audit:Center/theming`       |
| AR1–AR3                   | Source, passthrough tests, component-scoped axe, and browser inspection                  | Passive content, caller ARIA/role, and multiple children                | Added component semantics, dropped supported semantics, or visual reordering becomes observable.                         | `audit:Center/accessibility` |
| Documentation and surface | `Center.doc.mjs`, block/docsite checks, export checks, and `scripts/check-knowledge.mjs` | Consumer docs, examples, package entry points, and this draft           | Missing or stale docs, exports, required structure, relationships, or anatomy mapping fails repository checks.           | `audit:Center/docs`          |

Current audit scores, screenshots, eligibility, and per-run receipts remain in their
existing wiki, pull-request, and trusted-check owners rather than this contract.

## Decision log

None. Current family authority already settles the physical-axis meaning. The
vertical-writing mismatch is an implementation conformance gap, not an unresolved API
or design decision; this observational draft neither waives it nor prescribes a risky
fix.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit scores or
screenshots, implementation steps, shared layout vocabulary, container-padding
mechanics, or system API/theming rules. It links to their owners.
