---
schema_version: 3
template_version: 3
kind: component
id: component:Icon
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, theming, accessibility]
verified_by: [packages/core/src/Icon/Icon.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Icon component contract

## Intent

Icon presents one visual symbol with consistent size, color, and accessibility
semantics. Consumer usage remains documented in `Icon.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling, and
  public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none; this record characterizes the released component

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Accepting a semantic icon key or a supplied icon component as the glyph source.
- Applying Icon's size, color, theming target, and accessibility semantics to
  the rendered glyph.

**Does not own / non-goals**

- The shared registry's key-resolution and fallback order — owned by the shared
  icon system.
- The meaning of a glyph in product context or whether nearby text makes it
  decorative — owned by the product callsite.
- Interaction, focus, or control naming — owned by the interactive parent.
- The artwork supplied by a consumer or registered through a theme.

## Public concepts

| Concept       | Closed values or states                                   | Meaning                                                   | Availability by variant/orientation/state | Default    | Owner            | Stability | Invalid-value behavior                                 |
| ------------- | --------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------- | ---------- | ---------------- | --------- | ------------------------------------------------------ |
| Glyph source  | semantic key, namespaced extension key, or icon component | Selects the visual symbol.                                | Every render                              | Required   | `component:Icon` | Stable    | TypeScript rejects unsupported built-in string values. |
| Size          | `xsm`, `sm`, `md`, `lg`                                   | Selects the icon box size.                                | Every rendered glyph                      | `md`       | `component:Icon` | Stable    | TypeScript rejects unsupported values.                 |
| Color         | documented semantic and palette values                    | Selects the glyph color or inherits it from context.      | Every rendered glyph                      | `inherit`  | `component:Icon` | Stable    | TypeScript rejects unsupported values.                 |
| Accessibility | decorative or meaningfully labelled                       | Controls whether assistive technology receives the glyph. | Every rendered glyph                      | Decorative | `component:Icon` | Stable    | Empty labels use the decorative behavior.              |

A namespaced key that does not resolve currently renders nothing. This is
existing behavior, not an intentional fallback promise.

## Behavioral and layout contract

Requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                               | Basis                                      | Draft review state                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| FR1 | Icon MUST present at most one glyph from the supplied semantic key, namespaced key, or icon component.                                                                                            | Documented promise and current tests.      | Settled intent.                                         |
| FR2 | Every rendered glyph MUST carry the `icon` theming target with its selected size and color reflected as target data.                                                                              | Current source, docs, and theming tests.   | Settled intent.                                         |
| FR3 | Icon MUST apply the selected size as width and height for every glyph, plus font size where needed for 1em-based icon sources. This sizing contract MUST NOT promise an HTML or SVG element type. | Human decision, current source, and tests. | Settled intent.                                         |
| FR4 | Supported SVG and styling escape hatches MUST retain their established merge and override behavior.                                                                                               | Current source and regression tests.       | Current compatibility behavior; verify before changing. |

### Allowed variation

- **AV1 — Artwork.** The path, view box, and internal structure may vary by icon
  source or theme without changing Icon's one-part consumer anatomy.
- **AV2 — Rendering strategy.** Icon may render a supplied component directly or
  use an internal wrapper for a resolved key; neither element shape is public
  anatomy.
- **AV3 — Theme and consumer styling.** Existing theme and styling escape hatches
  may change visual CSS properties without changing glyph ownership.

### Representative states

| State                     | Required invariant                                    | Allowed variation                              |
| ------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| Semantic key              | One resolved glyph carries the `icon` target.         | Theme, registry, or built-in artwork.          |
| Namespaced extension key  | A resolved extension glyph carries the `icon` target. | Consumer- or library-owned artwork.            |
| Supplied icon component   | The supplied glyph carries the `icon` target.         | Component implementation and SVG internals.    |
| Unresolved namespaced key | No glyph is currently rendered.                       | No fallback behavior is established by intent. |

### Transformation and precedence order

- **ORD1 — Presentation.** Apply the target, component size and color styles,
  then merge consumer `xstyle`, `className`, inline `style`, and supported
  pass-through props in their established order.

### Performance and resources

- **PR1 — Render work.** Icon owns no listeners, observers, or layout
  measurement; semantic resolution is synchronous during render.

## Accessibility contract

- **AR1 — Decorative default.** Without a non-empty `label`, Icon MUST hide its
  glyph from assistive technology by default.
- **AR2 — Meaningful glyph.** A non-empty `label` MUST expose the glyph as an
  image with that accessible name.
- **AR3 — Parent-owned interaction.** Icon MUST NOT add interactive semantics or
  focus behavior; an interactive parent owns the control and its name.

## Design relationships

| Anatomy or state | Design requirement                                                  | Representation authority                                      | Hierarchy role    | Component contract |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------- | ------------------ |
| Glyph            | Carries the selected visual symbol at the requested size and color. | Consumer or registry selects artwork; Icon owns presentation. | Context-dependent | FR1, FR2, FR3      |

`Glyph` is the single conceptual consumer part in both source modes. Current
implementation may render a supplied icon component directly or place a
registry-resolved icon in an internal wrapper; this contract intentionally does
not promise a `span`, `svg`, or other element type.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Glyph": {"target": "icon"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns the qualification and validation
  rules for the `icon` target.
- `architecture:icon-resolution-and-component-slots` owns semantic-key and
  component-slot resolution before Icon renders the selected source.
- `architecture:public-component-api` owns admission and compatibility rules for
  Icon's public props.
- Icon has no current family contract.

## Verification map

| Contract            | Verification                                                 | Representative states                         | Mutation or failure expectation                                                                                                                            | Audit section              |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1, FR3            | `Icon.test.tsx` source-mode and sizing suites                | Built-in, themed, namespaced, component       | Breaking source rendering or cross-mode sizing fails assertions.                                                                                           | `audit:Icon/behavior`      |
| FR2, FR4            | `Icon.test.tsx` target/styling suites plus source inspection | Both source modes; size and color variants    | Removing the target or breaking override composition fails existing assertions; `data-size` and `data-color` reflection currently lack focused assertions. | `audit:Icon/theming`       |
| AR1, AR2, AR3       | `Icon.test.tsx` accessible-name suites                       | Decorative, labelled, explicit ARIA override  | Changing default or labelled semantics fails accessibility assertions.                                                                                     | `audit:Icon/accessibility` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                | Canonical consumer anatomy and current target | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                    | `audit:Icon/theming`       |

Focused coverage for `data-size` and `data-color` on both glyph source modes is
a checkable test gap; source inspection is the current evidence for that part of
FR2.

## Decision log

### DEC-1 — One conceptual Glyph across source modes

**Reference:** `component:Icon/DEC-1`
**Decider:** cixzhang, 2026-08-30

Consumers theme and reason about one visual symbol regardless of whether it
comes from a semantic key or a supplied component. `Glyph` therefore maps to the
existing `icon` target without freezing either mode's current element shape.
Icon applies width and height for every source and adds font size where a 1em-
based source needs it. This preserves one consistent icon box without promising
a `span`, `svg`, or other element.

Rejected: separate wrapper and SVG anatomy entries, because those describe
implementation strategies rather than stable consumer concepts.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or system rules. It links to their owners.
