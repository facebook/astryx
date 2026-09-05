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
    ContextMenu,
    OverflowList,
    Stack,
    PowerSearch,
    MultiSelector,
    TextInput,
  ]
---

# Outermost DOM styling target

## Intent

`style`, `className`, and `xstyle` style a component as one unit. Consumers should
not need to inspect a component to learn whether those props reach a wrapper, an
inner control, or a detached surface.

Astryx currently requires accepted styling props to be forwarded and composed, but
not to reach a particular element. This proposal gives them one meaning: every
accepted general styling prop applies to the component's outermost DOM element.

## Non-goals

- Require every component to accept general styling props.
- Apply root styles to descendants, slots, or detached content.
- Change component-specific style precedence.
- Replace named props or theme targets for styling an internal part.

## Requirements

- **FR1 — One outermost target.** A stable Core web component that accepts any of
  `style`, `className`, or `xstyle` MUST apply every accepted general styling prop
  to the same outermost DOM element on every render path. The outermost element is
  the single caller-facing root with no component-owned DOM ancestor. A sole root
  rendered through a portal qualifies.
- **FR2 — No root, no general styling props.** A component with multiple peer roots,
  both an in-tree root and a detached public surface, or no owned DOM root MUST omit
  the general styling props. A component contract cannot create an exception by
  naming one inner or peer element as the target.
- **FR3 — Internal parts use explicit APIs.** Styling an inner control, surface, or
  slot requires a separately named prop, slot contract, or theme target. General
  styling props MUST NOT serve as internal-part APIs.
- **FR4 — Composition preserves the guarantee.** A component MAY forward general
  styling props to one composed root only when that component guarantees the same
  outermost-element behavior. Arbitrary consumer components, including unrestricted
  polymorphic `as` values, do not provide that guarantee.
- **FR5 — Semantic DOM props remain explicit.** When an inner element owns native
  semantics, `BaseProps<T>`'s element type, `ref`, `id`, `data-*`, ARIA, `role`,
  `tabIndex`, and DOM events MAY target that element. The component contract and
  consumer docs MUST distinguish that semantic target from the outermost styling
  target.
- **FR6 — Target changes are compatibility changes.** Moving general styling props,
  combining split targets, adding or removing the outer root, or removing an
  accepted styling prop requires an explicit compatibility decision, updated
  consumer docs, migration evidence, and the repository's breaking Changeset path.
- **FR7 — Current records change together.** Promotion or implementation MUST update
  every conflicting current architecture, family, and component record in the same
  pull request. Affected component records link `spec:AST-027` through
  `system_specs`.

### Enforcement

- **IR1 — Static checks prove direct roots.** Enforcement checks every render path
  and rejects props that are unused, split, or forwarded only to a descendant.
- **IR2 — Composed roots use a checked guarantee.** A repository-owned registry of
  public components records direct and composed root guarantees. Enforcement rejects
  unknown, stale, cyclic, or arbitrary-component forwarding.
- **IR3 — Runtime tests prove element identity.** Tests apply distinct `style`,
  `className`, and `xstyle` markers and assert that they reach the same outermost
  element, not an inner or detached element.

### Platform support

This contract applies to stable Core web components. Lab components, hooks, and
non-DOM renderers are outside its scope.

## Current-state impact

This proposal changes no runtime behavior by itself. Implementation updates the
shared API records and enforcement, inventories all stable Core components, and
resolves the known conflicts below.

### Known conflicts with the proposal

This list is not exhaustive until the Core inventory is complete.

| Component                                | Current `style` / `className` / `xstyle` target                            | What makes it non-outermost or uncertain                                                                                    | Current status                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Popover / `usePopover`                   | Painted surface `<div>` (`contentRef`) inside the layer.                   | Trigger or trigger-wrapper is a separate peer; the layer also owns positioning outside the painted surface.                 | Explicit current surface-styling contract; not a violation today.        |
| ContextMenu                              | Menu `<div role="menu">`; bottom-sheet mode uses its menu-content `<div>`. | Trigger-wrapper `<div>` is a peer and has separate `triggerXstyle`.                                                         | Intentional split target; not established as a violation today.          |
| OverflowList                             | Visible list-container `<div>`.                                            | Hidden inert measurement `<div>` is a peer root.                                                                            | Current multi-root implementation; not established as a violation today. |
| Stack / StackItem                        | The element or component selected by `as`.                                 | Native tags are direct roots; arbitrary React components may forward styles to any descendant.                              | Final DOM target is unguaranteed for custom `as` values.                 |
| PowerSearch                              | Inner Tokenizer's outer `<Field>` root `<div>`.                            | PowerSearch adds its own trigger-wrapper `<div>` outside that Field and renders a detached editor popover as a peer.        | Target is unresolved in the current contract.                            |
| MultiSelector                            | Trigger-container `<div>` around the button.                               | Standalone mode adds an outer `<Field>` root; InputGroup mode returns a fragment; its selection surface is detached.        | Target is unresolved in the current contract.                            |
| TextInput and similar Field-based inputs | Control-wrapper `<div>` around the native input.                           | Standalone mode adds an outer `<Field>` root; InputGroup mode may return a fragment; ref and native props target `<input>`. | Existing styling/semantic target split; migration needs owner review.    |

Each component must end with one outermost styling root or omit unsupported general
styling props before this proposal can become current.

## Verification

| Contract | Evidence                                                                   | Failure signal                                                               |
| -------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| FR1–FR3  | Root identity tests for direct, wrapped, portal, and multi-root components | A general styling prop reaches an inner, detached, or different element      |
| FR4      | Checked composed-root registry and polymorphic fixtures                    | Arbitrary component forwarding is accepted as a root guarantee               |
| FR5      | Component contract, type, ref, and DOM pass-through tests                  | Styling and semantic targets are ambiguous or change by spread order         |
| FR6–FR7  | Record graph, consumer docs, migration evidence, and Changesets            | Conflicting current promises remain or a breaking target change is untracked |
| IR1–IR3  | Mutation-sensitive lint and runtime tests                                  | Moving one prop off the root still passes                                    |

## Decision log

### DEC-1 — General styling props always target the outermost DOM element

**Reference:** `spec:AST-027/DEC-1`
**Proposed decider:** `imdreamrunner`

General styling props place and adapt a component as one unit, so all accepted
`style`, `className`, and `xstyle` values target the same outermost DOM element.
A component without one stable root omits the props.

Rejected: allowing each component to choose an inner target. That makes equivalent
props depend on implementation knowledge.

## Open questions

- **OQ1 — Which released components conflict?** (`checkable`) Complete the stable
  Core inventory.
- **OQ2 — How does each conflicting component migrate?** (`human-api`) Choose one
  outer root or remove the unsupported props; an inner-target exception does not
  satisfy this proposal.
