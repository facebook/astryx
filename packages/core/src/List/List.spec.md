---
schema_version: 3
template_version: 5
kind: component
id: component:List
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-21
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming]
verified_by:
  [
    packages/core/src/List/List.test.tsx,
    packages/core/src/Item/Item.test.tsx,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    packages/core/src/theme/generateThemeRules.test.ts,
    apps/storybook/stories/List.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:container-padding, architecture:public-component-api]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-002/DEC-1, spec:AST-002/DEC-2]
---

# List component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | Add optional `edgeCompensation?: 'inline'`; omission preserves current layout.                                                                                                                   |
| Behavior                | Every ListItem row moves its content toward a neutral host's inline content edges, reaching them when the host inset is at least the Item inset, while retaining Item-owned interaction padding. |
| End-user impact         | List content can reduce or remove the extra inset beside its optional header and adjacent content without shrinking hover, press, selection, or focus paint.                                     |
| Builder impact          | Builders opt in only when the List is placed directly in an eligible container-padding host state.                                                                                               |
| Compatibility/readiness | Additive API; implementation and required real-browser evidence are pending.                                                                                                                     |
| Review checks           | Reject header movement, unbounded negative margins, duplicated padding values, physical-edge logic, automatic opt-in, or a ListItem-level public prop.                                           |
| Governing rules         | `architecture:container-padding/INV9–INV11`; `spec:AST-002/DEC-1–DEC-2`.                                                                                                                         |

This table is a review projection; the body below is authoritative.

## Intent

List owns collection-wide edge alignment because its optional header is not
horizontally inset while every ListItem retains Item's inline padding. The caller
knows whether the List is placed in a neutral host where these content lines
should align; List cannot derive that design relationship from its children.

## Compatibility and migration

- Released default preserved: `yes`; omission keeps current List and ListItem geometry.
- Compatibility class: additive optional prop with no default behavior change.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: `component:List/DEC-1` and `component:List/DEC-2`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The collection-wide `edgeCompensation` opt-in and its propagation to every
  ListItem row.
- Keeping the optional header in place while moving row content toward its line.
- The supported relationship between ListItem row geometry and Item's normal
  density- and theme-aware inline inset.

**Does not own / non-goals**

- Container padding values, nesting, or overlay resets — owned by
  `architecture:container-padding`.
- A ListItem-level compensation prop, automatic host detection, full bleed, or
  arbitrary margin controls.
- TabList or Button projections.

## Public concepts

| Concept           | Closed values or states | Meaning                                                                                               | Availability by variant/orientation/state               | Default | Owner            | Stability                        | Invalid-value behavior                       |
| ----------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------- | ---------------- | -------------------------------- | -------------------------------------------- |
| Edge compensation | omitted, `inline`       | Move row content toward both logical host content edges while retaining row-local interaction padding | Every List density and marker style in an eligible host | omitted | `component:List` | accepted; implementation pending | Other values are rejected by the public type |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                         | Basis                                                               | Status                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| FR1 | List MUST own `edgeCompensation?: 'inline'`; ListItem MUST NOT expose a parallel public prop.                                                                                                                                                                                                                                                                     | `component:List/DEC-1`                                              | Accepted contract; implementation pending |
| FR2 | Omission MUST preserve current header, list, and row geometry. Enabling `inline` MUST leave the optional header in place and apply one compensation policy to every ListItem, including non-interactive rows.                                                                                                                                                     | Owner direction                                                     | Accepted contract; implementation pending |
| FR3 | Each row MUST resolve each logical margin independently as the negative smaller of its own component-owned inline inset and the matching available host inset. Missing host inset MUST resolve to zero. Content reaches the host line only when the host inset is at least the row inset; otherwise it moves toward that line without crossing the host boundary. | `architecture:container-padding/INV9–INV10`; `component:List/DEC-2` | Accepted contract; implementation pending |
| FR4 | The retained row inset MUST come from the same private density- and theme-derived source as Item's applied inline padding. A consumer override of row padding through `xstyle`, `className`, or `style` is outside the alignment guarantee; `edgeCompensation` MUST NOT mirror or infer that arbitrary CSS.                                                       | Shared two-owner geometry contract                                  | Accepted contract; implementation pending |
| FR5 | Compensation MUST preserve Item's hover, press, selection, focus, content, semantics, and hit target. It MUST NOT make the row a full-bleed surface or pull it past either available host edge.                                                                                                                                                                   | Owner direction                                                     | Accepted contract; implementation pending |
| FR6 | The opt-in is valid only under a host state whose published inline inset matches its applied padding and whose relevant boundary is visually neutral. Current automatic LayoutContent/LayoutPanel states with known publication mismatch are not eligible until that conformance gap is fixed.                                                                    | `architecture:container-padding/INV8–INV11`                         | Accepted contract; implementation pending |

### Allowed variation

- Density and `item.paddingInline` theme overrides may change the retained inset;
  compensation follows the same derived value.
- Container padding may be uniform, asymmetric, zero, or absent; each logical
  edge resolves independently.
- Labels, descriptions, markers, start/end content, interactivity, and selection
  may vary without changing the collection-wide alignment rule.

### Representative states

| State                                | Required invariant                                                                      | Allowed variation                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Default/omitted                      | Header and every row keep current geometry.                                             | Any current List content and density.                     |
| Host inset at least Item inset       | Row content reaches the host content line; row-local paint keeps Item padding.          | Uniform or asymmetric inline padding.                     |
| Smaller, zero, or missing host inset | The row moves only by the available inset and is never pulled beyond the host boundary. | Either logical edge may independently be smaller or zero. |
| LTR or RTL                           | Logical start/end mapping follows direction without changing the `inline` meaning.      | Writing direction.                                        |
| Themed Item padding                  | Row padding and compensation move together.                                             | Supported `item.paddingInline` value.                     |

### Transformation and precedence order

- **ORD1 — Host bound.** Read the matching published host inset for each selected
  logical edge, with missing values falling back to zero.
- **ORD2 — Local inset.** Resolve Item's component-owned inline inset from density
  and theme through the same private value that supplies applied padding.
- **ORD3 — Compensation.** Apply the negative minimum of those values to the row;
  then compose supported consumer styles without claiming alignment for a consumer
  override of row inline padding.

### Performance and resources

- **PR1 — CSS geometry only.** Edge compensation MUST add no measurement,
  observer, listener, state, Effect, or render pass.

## Accessibility contract

- **AR1 — Interaction geometry remains local.** Compensation MUST NOT change the
  interactive element, accessible role/name/state, focus target, tab order, or
  hit target.
- **AR2 — Direction remains logical.** The same `inline` value MUST produce the
  corresponding mirrored geometry under RTL without changing DOM order.

## Design relationships

| Anatomy or state | Design requirement                                                                                          | Representation authority | Hierarchy role     | Component contract |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------ | ------------------ |
| Optional header  | Stays on the host content line and is not moved by row compensation.                                        | `component:List/DEC-1`   | Context            | FR2                |
| ListItem row     | Retains local interaction paint and hit-target padding.                                                     | Item composition         | Supporting surface | FR3–FR5            |
| Row content      | Moves toward each host content line and reaches it only when the host inset can fully absorb the row inset. | `component:List/DEC-2`   | Prominent          | FR2–FR5            |

## Family and system relationships

- `architecture:container-padding` owns host publication, the shared
  `edgeCompensation` vocabulary, eligibility, logical-edge semantics, and overlay
  reset.
- `architecture:public-component-api` and `spec:AST-002` own public API admission.
- Item remains the implementation owner of row padding and interaction paint;
  List owns only the collection-level opt-in and row application.

## Verification map

| Contract         | Verification                                                 | Representative states                                                                                                               | Mutation or failure expectation                                                                          | Audit section       |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------- |
| FR1–FR4          | List, Item, and theme-registry tests                         | omitted/enabled; all densities; theme override; static/interactive rows                                                             | Removing context propagation, duplicating a padding value, or using one host edge for both margins fails | `audit:List/layout` |
| FR2–FR6, AR1–AR2 | Real-browser List geometry evidence                          | header; LTR/RTL; uniform/asymmetric/zero/missing host inset; host inset smaller/equal/larger than Item inset; hover/selection/focus | Header movement, over-pull, wrong bounded movement, or lost row-local paint fails                        | `audit:List/visual` |
| Documentation    | `List.doc.mjs`, Storybook, and `scripts/check-knowledge.mjs` | public prop/default and representative composition                                                                                  | Missing or stale contract, docs, or example fails                                                        | `audit:List/docs`   |

## Decision log

### DEC-1 — List owns the collection-wide opt-in

**Reference:** `component:List/DEC-1`

**Decider:** cixzhang, 2026-09-21

The List header and ListItem rows otherwise begin on different content lines.
Only the caller knows when the containing composition requires alignment, while
List can apply one consistent decision to every row without exposing Item-level
configuration.

### DEC-2 — Compensation is row-local and bounded

**Reference:** `component:List/DEC-2`

**Decider:** cixzhang, 2026-09-21

Each row cancels no more than its own component-owned inline inset or the
matching host inset. When the host inset is at least the row inset, content
reaches the host content line. When it is smaller, content moves toward that line
without pulling row paint beyond the host boundary.

Rejected: `isFullBleed`, because the row may stop inside the host padding and the
name would promise outer-edge bleed that the component does not provide.

## Open questions

None.

## Content boundary

This claim-scoped contract does not duplicate List's complete prop table,
container-padding internals, consumer examples, implementation steps, or future
TabList/Button projections. Those remain with their named owners.
