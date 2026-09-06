---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:component-theming-surface
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/,
    packages/lab/src/,
    packages/charts/src/,
    packages/richtext/src/,
    packages/core/src/utils/themeProps.ts,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/theme/extensibleAxes.test.ts,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    docs/contributing/api-conventions.md,
    docs/templates/knowledge/component-spec.md,
    scripts/check-knowledge.mjs,
  ]
verified_by:
  [
    scripts/check-knowledge.mjs,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/theme/extensibleAxes.test.ts,
    packages/core/src/theme/derivedVarRegistry.test.ts,
  ]
deciding_specs: []
---

# Component theming surface

This record defines how component anatomy relates to the public theming API.

## Purpose

Theme authors need stable names for the visible component parts they can style,
without exposing every wrapper, slot, state, or implementation detail as a
permanent selector.

Component anatomy is the semantic inventory. The theming surface is an explicit,
qualified projection of that inventory—not a one-to-one copy.

## System model

A machine-readable block in each component spec maps every consumer-facing
anatomy entry to one theming disposition. The map is not included in generated
consumer docs:

1. **`target`** — this component promises a stable public target for the visible
   part, such as `selector-popup`.
2. **`inherits`** — the part has no separate target. It uses styles from this
   component's parent target, such as a Button label inheriting from `button`.
3. **`delegatesTo`** — another Astryx component owns the part and its target, such
   as a Selector label using `Field/field-label`.
4. **`none` with classified reason** — no current public target reaches this
   stable anatomy part. The required reason begins with exactly one factual
   classification:
   - `intentional:` — an approved boundary makes the part non-themeable now;
   - `reachability-gap:` — a current target should reach the part, but does not;
   - `unsettled:` — whether or how to expose the part still needs an owner decision.

`none` records current reachability. It does not by itself decide that a part must
remain unthemeable or authorize a future public target.

Every current, non-deprecated public target maps to an anatomy entry or to an
explicit family owner. Consumer `.doc.mjs` files continue to own anatomy names,
descriptions, and public target documentation. Component specs own the exact map
and explain only non-obvious rationale or exceptions.

Visual prop axes and states are selector capabilities of a target. They are not
separate anatomy parts or separate targets. Runtime `themeProps()` reflection,
public `.doc.mjs` `theming.targets[].visualProps` / `states` metadata, and checked
component-spec metadata describe those selector axes without exposing maintainer
dispositions to consumers; they do not declare which CSS properties have
guaranteed behavior.

The shared guaranteed-property catalog is:

| Category     | Exact authoring keys                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paint        | `color`, `backgroundColor`, `opacity`, `outlineColor`, `outlineOffset`, `outlineStyle`, `outlineWidth`, `boxShadow`, `textShadow`                                                                               |
| Border/shape | `borderColor`, `borderStyle`, `borderWidth`, `borderRadius`                                                                                                                                                     |
| Typography   | `fontFamily`, `fontSize`, `fontStyle`, `fontWeight`, `letterSpacing`, `lineHeight`, `textAlign`, `textDecorationColor`, `textDecorationLine`, `textDecorationStyle`, `textDecorationThickness`, `textTransform` |
| Padding      | `padding`, `paddingBlock`, `paddingBlockStart`, `paddingBlockEnd`, `paddingInline`, `paddingInlineStart`, `paddingInlineEnd`                                                                                    |

The initial catalog contains every standard CSS key used by the seven shipped
package themes except `height`: `backgroundColor`, `borderColor`, `borderRadius`,
`borderStyle`, `borderWidth`, `color`, `fontFamily`, `fontSize`, `fontWeight`,
`lineHeight`, `padding`, `paddingBlock`, and `paddingInline`. It adds the explicit
paint, typography, and logical-padding keys needed to make those categories
coherent. `height` remains a target-specific addition because it changes layout.

The catalog is a vocabulary, not an automatic guarantee on every target. Each
target's `guaranteedProperties` lists the exact rational subset it supports from
this catalog and any exact reviewed target-specific additions. Omission means
best effort; no exception entry is required.

The list is literal. A listed shorthand does not imply its longhands; a logical
property does not imply a physical counterpart; and one property does not imply
an alias such as `background`, `inlineSize`, or `outline`. Properties outside the
catalog, including `height`, `width`, `gap`, positioning, overflow, and grid/flex
structure, require an explicit target addition to become guaranteed.

Every declared property must produce a rational, observable result on the anatomy
part the target owns. Generic component styling may accept other CSS properties,
but acceptance alone is best effort, not a compatibility promise.

## Boundaries and invariants

- **INV1 — Participation is capability-based.** Core components participate.
  Lab components are exempt until they opt into public component theming or are
  prepared for promotion. At that point they must provide the same targets,
  metadata, anatomy dispositions, and validation as other participating
  components. Consuming semantic tokens alone does not enroll a component.
- **INV2 — Anatomy anchors public targets.** Every current target represents a
  stable semantic part, either locally or through an explicit family owner.
- **INV3 — Anatomy does not imply target proliferation.** Every participating
  anatomy entry has one component-spec mapping, but inheritance, delegation, and
  factual `none` are valid outcomes. A `none` reason distinguishes an intentional
  current boundary from a reachability gap or unsettled future exposure; it never
  silently decides future themeability. When desktop and touch render different
  parts or use different theming owners, they use separate anatomy rows.
- **INV4 — Targets paint.** A target belongs on a stable visible element that
  paints theme-controlled output—not an event wrapper, speculative internal
  structure, or a node created only for layout plumbing.
- **INV5 — Composition preserves ownership.** A part rendered by a shared Astryx
  primitive delegates to that primitive's target unless the parent guarantees a
  distinct public visual contract.
- **INV6 — State stays on the owning target.** Variant, size, selection, disabled,
  and interaction state are reflected as target capabilities through
  `themeProps`; they do not create parallel targets solely for each state.
- **INV7 — Guarantees use one catalog and exact target declarations.** The shared
  catalog defines the supported vocabulary, not an automatic target promise. Each
  target's `guaranteedProperties` lists the rational catalog subset it guarantees
  and any reviewed target-specific additions. Every listed property must produce
  an observable result on the owned anatomy part, with representative compiler
  and runtime evidence.
- **INV8 — Names imply nothing beyond themselves.** No shorthand, longhand,
  logical/physical counterpart, alias, or custom property is guaranteed unless
  its exact authoring key appears in that target's declaration. Omitted properties
  remain best effort; no exception mechanism is needed.
- **INV9 — Generic styling is best effort.** A target may accept CSS properties
  outside its declared guaranteed set through the generic styling pipeline. That
  acceptance does not promise a useful effect or compatibility across releases.
- **INV10 — Public semantic variables are admitted, not inferred.** When no
  guaranteed CSS property can express a caller-owned need, a component may expose
  a reviewed public custom property with purpose-based meaning, stable default or
  fallback, defined target/state scope, consumer docs, and compatibility
  coverage. It must pass the admission bar in
  `architecture:public-component-api`; an implementation gap does not
  automatically justify a new variable.
- **INV11 — Private expansion stays private.** The compiler may translate a
  guaranteed public property into one or more private `--_*` variables so the
  owning component can route, compose, or transform the value across its internal
  painters. By contract, those variables must not be authored directly or relied
  on by consumers. Exact mappings remain checked code/metadata, not copied prose;
  known enforcement gaps are recorded in `architecture:theme-compilation`.
- **INV12 — Aliases are compatibility, not anatomy.** Deprecated target aliases
  may remain supported but do not count as current semantic parts.
- **INV13 — Family ownership is explicit.** A family document may own a shared
  target for several components, but local docs link to that owner rather than
  leaving ownership to inference.
- **INV14 — Extensible axes need a theme-independent fallback.** A prop axis may
  be theme-extensible only when it is visual and an unavailable custom value has
  one safe, deterministic baseline that does not depend on the active theme.
  `Heading.type` qualifies because required `Heading.level` provides that
  baseline. `Icon.size` does not: no missing custom size can be inferred without
  silently changing geometry, alignment, or composition. Behavioral, structural,
  placement, directional, and state-machine axes remain closed regardless. A
  theme may redefine an existing value on a closed axis, but it may not add one.

This record does not own semantic token definitions, theme authoring precedence,
how themes become output, or the design rationale for a component's appearance.

## Change coupling

- Adding or renaming a `themeProps()` target updates its component-spec map,
  `.doc.mjs` public target metadata, compatibility aliases when required,
  generated/CLI discovery, and validation together.
- Adding consumer anatomy requires a deliberate component-spec mapping to a
  target, inheritance, delegation, or factual `none`. It does not automatically
  create CSS API. A `none` entry classifies the current state as `intentional`,
  `reachability-gap`, or `unsettled`; changing reachability updates the mapping,
  while future exposure still follows normal public-target review.
- Opening a prop axis to theme-defined values classifies the axis and records its
  no-match fallback in the owning component contract or governing system spec.
  Review proves the axis is visual, the fallback is safe and theme-independent,
  and every ineligible axis stays closed. A focused component test covers the
  custom value with no matching active theme rule. `extensibleAxes.test.ts`
  checks only the structural wiring: the public map, `themeProps()` reflection,
  and consumer metadata.
- Adding a property to a target's `guaranteedProperties` records its purpose and
  scope, proves a rational observable effect on the owned anatomy part, and adds
  representative compiler/runtime coverage. Catalog membership alone does not add
  a target guarantee; target-specific behavior outside the catalog is admitted by
  the same reviewed declaration. Common property-to-variable behavior belongs to
  theme compilation.
- Adding a public semantic custom property first shows why no guaranteed CSS
  property expresses the need, then updates its component contract, consumer
  docs, stable fallback/default, scope, runtime evidence, and compatibility
  coverage together. It is not the default response to an unsupported property.
- Moving target ownership to a family updates every member's disposition and
  link in the same reviewed change.
- Expanding participation to another package first extends the consistency guard
  to that package; partial public targets without metadata are defects.

## Owning code

- Component `.doc.mjs` `usage.anatomy[]` owns the consumer-facing semantic part
  inventory and contains no theming disposition or maintainer rationale.
- Component `.doc.mjs` `theming.targets[]` owns discoverable public targets and
  their visual prop/state selector axes. `visualProps` does not declare CSS
  property support.
- The approved property catalog is owned by this record. Target
  `guaranteedProperties` declarations will live in component `.doc.mjs`
  `theming.targets[]` once the authoring schema supports them; there is not yet a
  machine-readable field.
- Component `.doc.mjs` `theming.vars[]` owns documented custom properties and
  marks private implementation variables; `theming.derived[]` records checked
  public-property expansion metadata.
- A colocated component `.spec.md` `### Theming anatomy` block owns the exact,
  machine-readable anatomy-to-target dispositions. It is optional during
  migration, checked against consumer anatomy, and excluded from generated
  consumer docs. Nearby component-spec prose owns non-obvious rationale,
  exceptions, and links.
- Runtime `themeProps()` calls emit the target and state contract.
- `scripts/check-knowledge.mjs`, `themingTargets.test.ts`,
  `extensibleAxes.test.ts`, and `derivedVarRegistry.test.ts` enforce the
  source/metadata/generated relationship. `extensibleAxes.test.ts` proves only
  structural consistency; component contracts, review, and focused component
  tests prove whether an axis may be open and whether its fallback is safe.
- Family contracts own shared target semantics when multiple components adopt
  one part contract.

## Deciding specs

None. The qualification rule, consumer boundary, property support tiers, and
capability-based package scope were selected by the system owner.

## Verification

| Invariant    | Evidence                                                                                                           | Failure signal                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| INV1         | Cross-package target/documentation inventory                                                                       | An exported target in a participating package is invisible to metadata or CLI validation                                    |
| INV2, INV3   | Bidirectional anatomy-disposition/target check                                                                     | A current target has no semantic part owner, anatomy mechanically creates targets, or `none` silently becomes future policy |
| INV4, INV5   | Component review plus rendered DOM inspection                                                                      | Public target lands on non-painting plumbing or aliases a child primitive without distinct semantics                        |
| INV6         | `themingTargets.test.ts` and `extensibleAxes.test.ts`                                                              | State/variant is invisible to the owner target or becomes an unnecessary parallel target                                    |
| INV7, INV8   | Existing property fixtures (partial; gaps below)                                                                   | A declared property is missing evidence, or an unlisted counterpart is treated as implied                                   |
| INV9         | API docs and compatibility review                                                                                  | Generic property acceptance is presented as a supported compatibility promise                                               |
| INV10, INV11 | Existing registry/public-var/runtime tests (partial; gaps below)                                                   | A public semantic var bypasses admission, or a consumer must write a private var to reach promised behavior                 |
| INV12, INV13 | Alias and family-owner fixtures                                                                                    | Deprecated aliases count as current parts or cross-doc ownership remains implicit                                           |
| INV14        | Component contract, owner review, focused no-match fallback test, and structural `extensibleAxes.test.ts` coverage | An ineligible axis opens, a missing rule changes behavior unpredictably, or the map/reflection/docs wiring drifts           |

Known conformance and verification gaps:

- The component schema has no machine-readable axis-classification or fallback
  field. `extensibleAxes.test.ts` therefore checks only structural consistency;
  it cannot infer whether an axis is visual or its fallback is semantically safe.
  Component contracts or governing system specs, owner review, and focused
  fallback tests provide that evidence without treating the structural guard as
  admission policy.
- Existing map-backed axes have not all been audited against INV14.
  `Pagination.variant` and `Banner.container` are known open structural axes and
  remain conformance gaps until their vocabularies are closed. Passing the
  structural guard does not make them eligible for extension.
- The shared catalog is approved, but the component-doc authoring schema has no
  `guaranteedProperties` field. The follow-up must add the exact-name field,
  migrate each current target with its rational catalog subset and reviewed
  additions, expose the declarations to discovery, and reject unknown or implied
  names. Until that migration lands, the catalog does not automatically guarantee
  any property on any target.
- CI does not yet require representative compiler and runtime evidence for each
  declared target/property pair. The follow-up must make missing output-path or
  observable runtime evidence fail validation; layout-sensitive additions also
  require internal-coupling and directionality evidence.
- Runtime/build private-variable rejection and media-surface derived expansion are
  separate compiler conformance gaps owned and specified by
  `architecture:theme-compilation`.

### Migration work from the 2026-08-30 audit

- Forty-three participating Core component docs have no anatomy inventory.
- Several anatomy docs rely on parent/family-owned targets without an explicit
  owner link.
- Lab components stay exempt until they declare public theming or prepare for
  promotion. The existing promotion guard checks participating Lab components.

Backfill component-spec maps and Core anatomy before making bidirectional
validation mandatory. The audit inventory is migration evidence, not policy.
