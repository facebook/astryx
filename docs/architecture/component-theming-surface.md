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
  ]
verified_by:
  [
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
4. **`none` with reason** — the part is intentionally not themeable. Common
   reasons are consumer-owned content, non-visual structure, or fixed design.

Every current, non-deprecated public target maps to an anatomy entry or to an
explicit family owner. Consumer `.doc.mjs` files continue to own anatomy names,
descriptions, and public target documentation. Component specs own the exact map
and explain only non-obvious rationale or exceptions.

Visual props, states, and public CSS properties are capabilities of a target.
They are not separate anatomy parts or separate targets. Runtime `themeProps()`
reflection, `.doc.mjs` metadata, generated types, and CLI validation describe one
public surface.

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
  `none` are valid outcomes. When desktop and touch render different parts or
  use different theming owners, they use separate anatomy rows.
- **INV4 — Targets paint.** A target belongs on a stable visible element that
  paints theme-controlled output—not an event wrapper, speculative internal
  structure, or a node created only for layout plumbing.
- **INV5 — Composition preserves ownership.** A part rendered by a shared Astryx
  primitive delegates to that primitive's target unless the parent guarantees a
  distinct public visual contract.
- **INV6 — State stays on the owning target.** Variant, size, selection, disabled,
  and interaction state are reflected as target capabilities through
  `themeProps`; they do not create parallel targets solely for each state.
- **INV7 — Public properties and private expansion are separate.** This record
  owns which public properties a target supports and their component semantics.
  `architecture:theme-compilation` owns turning those properties into private
  variables. Exact mappings remain checked code/metadata, not copied prose.
- **INV8 — Aliases are compatibility, not anatomy.** Deprecated target aliases
  may remain supported but do not count as current semantic parts.
- **INV9 — Family ownership is explicit.** A family document may own a shared
  target for several components, but local docs link to that owner rather than
  leaving ownership to inference.

This record does not own semantic token definitions, theme authoring precedence,
how themes become output, or the design rationale for a component's appearance.

## Change coupling

- Adding or renaming a `themeProps()` target updates its component-spec map,
  `.doc.mjs` public target metadata, compatibility aliases when required,
  generated/CLI discovery, and validation together.
- Adding consumer anatomy requires a deliberate component-spec mapping to a
  target, inheritance, delegation, or `none`. It does not automatically create
  CSS API.
- Adding a public target property records its semantic purpose in metadata. A
  component-specific exception belongs in its component contract; common
  property-to-variable behavior belongs to theme compilation.
- Moving target ownership to a family updates every member's disposition and
  link in the same reviewed change.
- Expanding participation to another package first extends the consistency guard
  to that package; partial public targets without metadata are defects.

## Owning code

- Component `.doc.mjs` `usage.anatomy[]` owns consumer-facing parts.
- Component `.doc.mjs` `theming.targets[]` owns discoverable public targets and
  their public properties/states.
- Colocated component `.spec.md` files own the exact anatomy-to-target map and
  any non-obvious rationale. CI validates that map against both consumer doc
  sections. The map is excluded from generated consumer docs.
- Runtime `themeProps()` calls emit the target and state contract.
- `themingTargets.test.ts`, `extensibleAxes.test.ts`, and
  `derivedVarRegistry.test.ts` enforce the source/metadata/generated relationship.
- Family contracts own shared target semantics when multiple components adopt
  one part contract.

## Deciding specs

None. The qualification rule, consumer boundary, and capability-based package
scope were selected by the system owner.

## Verification

| Invariant  | Evidence                                              | Failure signal                                                                                       |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| INV1       | Cross-package target/documentation inventory          | An exported target in a participating package is invisible to metadata or CLI validation             |
| INV2, INV3 | Bidirectional anatomy-disposition/target check        | A current target has no semantic part owner, or anatomy mechanically creates unnecessary targets     |
| INV4, INV5 | Component review plus rendered DOM inspection         | Public target lands on non-painting plumbing or aliases a child primitive without distinct semantics |
| INV6       | `themingTargets.test.ts` and `extensibleAxes.test.ts` | State/variant is invisible to the owner target or becomes an unnecessary parallel target             |
| INV7       | Metadata plus compiler registry tests                 | A public property lacks semantics or private expansion is duplicated in component prose/code         |
| INV8, INV9 | Alias and family-owner fixtures                       | Deprecated aliases count as current parts or cross-doc ownership remains implicit                    |

### Migration work from the 2026-08-30 audit

- Forty-three participating Core component docs have no anatomy inventory.
- Several anatomy docs rely on parent/family-owned targets without an explicit
  owner link.
- Lab components stay exempt until they declare public theming or prepare for
  promotion. The existing promotion guard checks participating Lab components.

Backfill component-spec maps and Core anatomy before making bidirectional
validation mandatory. The audit inventory is migration evidence, not policy.
