---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-027
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang, imdreamrunner]
affects_architecture: [architecture:public-component-api]
affects_families: [family:layout-primitives, family:input-fields]
affects_contributing: [contributing:api-conventions]
affects_consumer_docs:
  [
    principles,
    Popover,
    usePopover,
    ContextMenu,
    OverflowList,
    Stack,
    PowerSearch,
    MultiSelector,
  ]
---

# Outermost DOM styling target system spec

## Intent

Consumers use `style`, `className`, and `xstyle` to place and adapt a component as
one unit. Those props are only predictable when they all style the component's
outermost DOM element. A consumer should not need implementation knowledge to know
whether margin, positioning, sizing, selectors, or integration classes land on a
wrapper, an inner semantic control, or a descendant chosen by one component.

Today Astryx requires accepted styling props to be forwarded and composed, but the
contract does not require the forwarding target to be the outermost element. The
current lint rule accepts a reference anywhere in the component body, a rest spread
to any DOM element, or a rest spread to any composed component. It therefore proves
that a prop was not obviously dropped, not that consumers style the component's
root.

This spec makes the target stable across stable public web components: when a
component accepts one or more of the three general styling props, every accepted
styling prop applies to that component's outermost DOM element. This is an
intentional proposed change to shipped composite components that currently style
an inner surface or have no single root; it is not only a lint clarification.

## Non-goals

- Make every component accept `style`, `className`, or `xstyle`.
- Apply a styling prop to every descendant, portal, slot, or internal element.
- Change the existing merge order or conflict behavior among component styles,
  `xstyle`, `className`, and `style`.
- Guarantee that arbitrary consumer CSS preserves component behavior,
  accessibility, layout, or theming.
- Move refs, semantic HTML attributes, or element-specific event handlers when a
  component has a separately documented target for them.
- Add a wrapper to every coordinating, fragment-returning, or portal-owning
  component merely to make general styling props available.
- Replace component theme targets or named props for styling a specific internal
  part.

## Terms

- **Stable public web component:** a component exported from a stable public web
  package. Today this means Core components governed by
  `architecture:public-component-api`; Lab components and hooks are outside this
  proposal's normative scope.
- **General styling props:** `style`, `className`, and `xstyle`.
- **Outermost DOM element:** the single caller-facing DOM element at the root of a
  component's rendered subtree. It may be rendered directly, supplied by one
  composed root component, or be the sole root rendered through a portal. It has no
  component-owned DOM ancestor in that subtree. A component that renders both an
  in-tree root and a detached surface has multiple roots.
- **Styling root:** the outermost DOM element that receives every general styling
  prop the component accepts.
- **Detached subtree:** DOM rendered outside the styling root through a portal or
  another detached rendering boundary. A detached subtree is not an alternate
  styling root.
- **Internal part:** a descendant, slotted element, semantic control, or detached
  subtree owned inside the component's implementation.

## Requirements

### One predictable target

- **FR1 — General styling props target the outermost DOM element.** A stable public
  web component that accepts `style`, `className`, or `xstyle` MUST apply each
  accepted prop to its outermost DOM element. Applying any of them only to an
  internal part does not satisfy the contract.
- **FR2 — Accepted styling props share one target.** When a component accepts more
  than one general styling prop, it MUST apply all of them to the same outermost DOM
  element. A component MUST NOT split `style`, `className`, and `xstyle` across a
  wrapper, semantic control, composed child, or portal.
- **FR3 — Outermost means rendered placement, not semantic importance.** An inner
  input, button, list, or other semantic element does not become the styling root
  merely because it owns focus, value, a ref, or native attributes. If a wrapper is
  the component's outermost DOM element, the general styling props apply to that
  wrapper.
- **FR4 — Composition preserves the same promise.** A component MAY forward its
  general styling props to one composed root component only when that root
  component guarantees that the props reach its own outermost DOM element. The
  resulting DOM element is the forwarding component's styling root. Passing props
  to an arbitrary nested component or slot is invalid.
- **FR5 — Styling props are not descendant-part APIs.** A component that wants to
  expose styling for an internal part MUST use the part's existing component API,
  a named slot, a theme target, or a separately named and documented prop. It MUST
  NOT reinterpret `style`, `className`, or `xstyle` as styling for that part.

### Components without one stable root

- **FR6 — No stable root means no general styling contract.** A component that
  returns multiple unrelated DOM roots, only coordinates children, or cannot keep
  one stable outermost DOM element MUST omit the general styling props it cannot
  honor. Extending `BaseProps` and intentionally discarding or redirecting those
  props is invalid.
- **FR7 — Detached content does not split the target.** A component with one
  caller-facing styling root MAY render implementation-owned detached subtrees.
  General styling props apply only to the styling root and MUST NOT be duplicated
  onto detached content. A component whose public output contains peer roots or
  both an in-tree root and a detached surface follows FR6. A portal-only component
  with exactly one DOM root follows FR1–FR5.
- **FR8 — Styling-target changes are observable compatibility.** A released
  component MUST NOT move general styling props from an inner or detached target to
  the outermost root, collapse split targets onto one root, move them between
  outermost roots, add or remove a wrapper above the styling root, or remove or
  narrow an accepted general styling prop without an explicit compatibility
  decision. Each breaking migration includes evidence, affected consumer-doc
  updates, and the repository's breaking Changeset path.

### Composition and existing behavior

- **FR9 — Existing component-specific precedence remains.** This spec changes the
  required target, not a component's documented precedence or merge semantics among
  component-owned styles and accepted consumer styling props. A separate owner
  decision is required before normalizing precedence across components.
- **FR10 — Styling and semantic DOM targets are explicit.** When the styling root
  differs from the semantic DOM contract element, `style`, `className`, and
  `xstyle` apply to the outermost root. `BaseProps<T>`'s element type `T`, `ref`,
  and the remaining inherited inputs—including `id`, neutral `data-*`, ARIA,
  `role`, `tabIndex`, and generic DOM events—continue to describe and reach the
  declared semantic contract element. The component spec and consumer docs MUST
  name both targets, or the component MUST expose a separately typed grouped API
  for element-specific inputs. Spread order alone MUST NOT decide the split.
- **FR11 — Consumer documentation names internal-part APIs, not implementation
  accidents.** Documentation MAY describe a named internal-part styling API. It
  MUST NOT document `style`, `className`, or `xstyle` as targeting an inner part or
  tell consumers to rely on current wrapper depth.
- **FR12 — Current owners change together.** Promotion or implementation MUST
  update every conflicting current architecture, family, and component record in
  the same pull request so no current records disagree. Affected component records
  add `spec:AST-027` to their `system_specs` relationship. In particular, the
  current `component:Popover` surface-styling promise must be replaced before this
  rule can become current.

### Enforcement

- **IR1 — Direct-root enforcement proves every render path.** Static enforcement
  MUST identify each component return path and prove that every accepted general
  styling prop reaches the same direct native root. A mere identifier reference,
  spread onto any DOM element, or forwarding to any component is insufficient.
  Conditional branches pass only when every branch preserves one root identity and
  target.
- **IR2 — Composed-root guarantees are machine-readable.** A checked repository
  manifest keyed by public component id records whether a styling root is direct,
  composed through another guaranteed component, or runtime-only, and links the
  current owning record. Static enforcement MAY trust a composed root only when
  this manifest resolves transitively to a direct guarantee. The checker rejects
  unknown, stale, cyclic, or ownerless entries.
- **IR3 — Arbitrary polymorphism is not statically trusted.** A native `as` branch
  may be checked directly, and an Astryx component branch may use IR2. An arbitrary
  consumer-supplied `ElementType` cannot establish final DOM placement; a component
  that permits such a branch MUST narrow the generic styling contract or supply
  runtime evidence and a public compatibility guarantee that satisfies FR1–FR8.
- **IR4 — Intentional discard is not a valid opt-out.** A leading-underscore
  binding or another unused-binding convention MUST NOT satisfy enforcement for a
  public component that still exposes the styling prop. The component omits the
  prop from its public type when it cannot honor the contract.
- **IR5 — Runtime evidence checks element identity.** Component tests MUST render
  distinct markers through `style`, `className`, and `xstyle`, assert that each
  marker reaches the same outermost DOM element on every render path, and assert
  that an inner semantic element does not receive it accidentally.
- **IR6 — Composite shapes receive representative coverage.** Verification MUST
  include a direct DOM root, a composed root, a wrapper around a semantic control,
  a portal-only root, and a component with additional detached content. Negative
  fixtures MUST include an inner-only target, split targets, multiple unrelated
  roots, conditional targets, arbitrary polymorphism, and inert `xstyle` spread
  onto a native element.

### Platform support

- Supported feature/engine floor: Core web components follow the
  [Browser Support](../../../packages/cli/assets/docs/browser-support.doc.mjs)
  Tier 1 and Tier 2 contract.
- Unsupported behavior: renderers that do not expose a DOM element are outside this
  web-DOM contract and require their own renderer-specific styling contract.
- Browser evidence: DOM identity and computed-style evidence uses current Tier 1
  Chrome for every representative shape. Portal and wrapper behavior also receives
  Safari evidence when it depends on top-layer or native element behavior; jsdom is
  sufficient only for static prop-placement assertions that make no layout claim.

## Current-state impact

This proposal changes no runtime or public API by itself. If accepted:

- `architecture:public-component-api` will separate the outermost styling root from
  the semantic DOM contract element in INV5, INV6, and INV8, and define which
  inherited `BaseProps` inputs follow each target;
- `family:layout-primitives`, `family:input-fields`, and every conflicting current
  component record will change in the same promotion or implementation pull request
  and add the required `system_specs` backlink;
- the contributor guide and `BaseProps` documentation will use `styling root`,
  `semantic contract element`, and `outermost DOM element` consistently;
- `require-baseprops-passthrough` will be strengthened from "referenced somewhere"
  to direct-root verification, backed by the checked composed-root manifest, and
  will remove the intentional-unused escape hatch for exposed styling props;
- stable Core components that expose general styling props will be inventoried for
  direct-root, inner-only, split-target, composed-root, polymorphic, conditional,
  and no-stable-root behavior;
- a component with a stable root will move every accepted general styling prop to
  that root, while a component without one will narrow its public type rather than
  silently redirect the prop; and
- every released target move, split-target collapse, or prop removal will update
  affected consumer docs, include migration evidence, and use the repository's
  breaking Changeset path rather than being changed by a bulk mechanical rewrite.

[PR #5656](https://github.com/facebook/astryx/pull/5656) addresses known
BaseProps pass-through defects, including one component that drops all three general
styling props. That work is compatible with this proposal but does not settle the
target rule: forwarding a value is necessary, while forwarding it to the outermost
DOM element is the additional contract here.

### Known compatibility conflicts

The implementation inventory starts with known shapes that cannot be treated as a
mechanical lint migration:

- `Popover` currently promises that its general styling props target the detached
  popover surface. Its current component contract must change before those props can
  move, be replaced by a named surface API, or be removed.
- `ContextMenu` currently styles its menu surface while a separately named
  `triggerXstyle` targets the trigger wrapper. The generic styling surface must be
  redesigned under the outermost-only rule.
- `OverflowList` renders a visible container and a peer measurement element, so it
  has no single outermost DOM element today.
- wrapped input components distinguish a visible shell from the semantic native
  control. The outer shell becomes the general styling target; refs, native input
  attributes, and named control APIs retain their separately documented targets.
- polymorphic components such as `Stack` can guarantee this contract only for
  native roots and composed roots that carry the same guarantee. An arbitrary
  consumer component cannot be assumed to preserve final DOM placement.
- `PowerSearch` and `MultiSelector` already have unresolved BaseProps target
  decisions in [PR #5656](https://github.com/facebook/astryx/pull/5656); their
  current records and public docs join the inventory rather than being treated as
  ordinary passthrough fixes.

These are explicit compatibility work, not exceptions to FR1–FR8. Promotion or
implementation requires the architecture, family, and component owners above to
change together. Each affected component must end with one outermost styling root
or without unsupported general styling props; no current owner record may retain an
inner-target exception.

## Verification

| Contract | Verification                                                                  | Representative states                                                      | Mutation or failure expectation                                                                                     |
| -------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3  | DOM identity tests for direct and wrapped components                          | root wrapper, inner input/button/list, native polymorphic root             | A styling prop lands only on the semantic descendant or a different node                                            |
| FR4–FR5  | Composed-root manifest checks plus component tests                            | guaranteed composed root, arbitrary component, slot, named part API        | Forwarding to any component passes without a transitive root guarantee                                              |
| FR6–FR8  | Public-type inventory, compatibility review, consumer docs, and Changesets    | peer roots, portal-only root, root plus detached surface, prop removal     | A no-root component exposes BaseProps or a breaking target/prop migration lacks evidence                            |
| FR9–FR12 | Precedence regression tests, DOM-target docs, and current-record graph checks | styling root differs from semantic target, current component-spec conflict | Target enforcement changes precedence, leaves inherited DOM props ambiguous, or permits current records to disagree |
| IR1–IR4  | Mutation-sensitive lint and manifest tests                                    | conditional roots, cycles, stale owners, arbitrary polymorphism, discard   | A descendant move, unproven composed root, `_xstyle`, or unsupported `as` branch still passes                       |
| IR5–IR6  | Runtime identity and Tier 1 browser checks                                    | direct, composed, wrapped semantic, portal-only, detached auxiliary output | Tests prove presence but not that every accepted prop shares the outermost element on every render path             |

### Completion criteria

This spec moves from `proposed` to `shipped` only when:

- the public API architecture, `family:layout-primitives`,
  `family:input-fields`, and every conflicting current component record change
  together and name the outermost DOM styling target;
- the checked root-contract manifest covers every stable Core component that
  accepts a general styling prop and rejects stale, cyclic, or ownerless entries;
- passthrough enforcement rejects inner-only, split, arbitrary-component,
  unsupported polymorphic, conditional-target, and intentionally discarded paths;
- every stable public component that accepts a general styling prop has been
  classified and either verified, migrated with compatibility evidence, consumer
  docs, and the required Changeset, or narrowed to the contract it can keep;
- representative direct, composed, wrapper-plus-semantic-control, portal-only, and
  detached-auxiliary cases prove the target at runtime; and
- consumer documentation no longer assigns a general styling prop to an internal
  part, and no current record retains a conflicting target.

## Decision log

### DEC-1 — General styling props always target the outermost DOM element

**Reference:** `spec:AST-027/DEC-1`
**Decider:** `imdreamrunner`, `2026-09-04`

`style`, `className`, and `xstyle` are the shared styling surface for placing and
adapting a component as one unit. Every accepted prop therefore applies to the same
outermost DOM element. Semantic importance, focus ownership, ref identity, or native
attribute forwarding does not move these general styling props to a descendant.

Rejected: letting each component choose a convenient internal target. That contract
requires consumers to inspect implementation structure and makes equivalent styling
props mean different things across Astryx.

### DEC-2 — Components without one stable root omit the general styling props

**Reference:** `spec:AST-027/DEC-2`
**Decider:** `imdreamrunner`, `2026-09-04`

A component cannot promise root styling when it has no single stable root. It omits
the unsupported general props instead of discarding them, splitting them across
peers, or redirecting them to an internal element. A wrapper may be introduced only
when the component's own structure and compatibility decision justify it, not as an
automatic consequence of this rule.

Rejected: retaining the public props while documenting that they do nothing or style
an arbitrary child. A typed escape hatch that cannot keep one predictable target is
not a valid contract.

### DEC-3 — Composed roots may carry the contract transitively

**Reference:** `spec:AST-027/DEC-3`
**Decider:** `imdreamrunner`, `2026-09-04`

A component may render one composed root instead of a native element. Forwarding is
valid only when the composed component guarantees the same outermost-element
behavior, so the final DOM target remains predictable and testable.

Rejected: treating any component spread as proof of passthrough. A nested component,
slot, or composed child can accept the prop while still placing it below the caller-
facing root.

## Open questions

- **OQ1 — Which released components conflict with the outermost-only rule?**
  (`checkable`) Complete the stable Core inventory across direct roots, composed
  roots, polymorphic branches, fragments, measurement siblings, hidden controls,
  and detached surfaces.
- **OQ2 — What compatibility path applies to each conflicting public contract?**
  (`human-api`) For each released component, choose a stable outer root, remove the
  unsupported general styling props with migration, or reject the proposal before
  it becomes current. A component-local exception that keeps a generic styling prop
  on an inner target does not satisfy this proposal.
