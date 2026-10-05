---
schema_version: 3
template_version: 7
kind: component
id: component:CollapsibleGroup
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, layout, accessibility, theming]
verified_by:
  [
    packages/core/src/Collapsible/CollapsibleGroup.test.tsx,
    packages/core/src/Collapsible/Collapsible.test.tsx,
    packages/core/src/Collapsible/__tests__/Collapsible.a11y.test.tsx,
    packages/core/src/Collapsible/__tests__/Collapsible.a11y.chromium.spec.ts,
    packages/core/src/Collapsible/__tests__/CollapsibleGroup.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/CollapsibleGroup.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-029]
---

# CollapsibleGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CollapsibleGroup` coordinates public `Collapsible` children in `single` or `multiple` mode, supports controlled and uncontrolled values, and optionally supplies divider, density, and chevron-position presentation defaults. |
| Behavior                | Direct children with a `value` read group state; opening an item replaces or extends the open-value set according to mode. The group renders no wrapper unless divider chrome is enabled.                                       |
| End-user impact         | People can reveal one section or several sections without disclosure state drifting between sibling rows; divided groups keep one coherent visual and directional treatment.                                                    |
| Builder impact          | Builders choose state ownership and selection mode, give participating items stable values, and may opt into divided-row presentation.                                                                                          |
| Compatibility/readiness | Released DOM output, props, defaults, targets, and migration promises are unchanged. An unchanged controlled string preserves the coordination broadcast identity instead of rerendering every consumer.                        |
| Review checks           | Reject lost single/multiple coordination, controlled state that mutates internally, uncontrolled state that stops updating, presentation leakage into nested disclosures, or a wrapper appearing when dividers are absent.      |
| Governing rules         | `component:Collapsible/FR7–FR9,DEC-2`; `architecture:public-component-api/INV1,INV5–INV9`; `architecture:react-component-runtime/INV1,INV8–INV9`; `architecture:component-theming-surface/INV3–INV7`.                           |

This table is a review projection; the body below is authoritative only after owner approval.

## Intent

Coordinate a set of disclosure items so their open state follows one group owner while each `Collapsible` continues to own its trigger, region, and disclosure semantics.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: compatible runtime efficiency correction; no DOM output, public type, default, target, export, or migration change
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- sibling open-value coordination in single and multiple modes;
- controlled and uncontrolled group state ownership and the shape delivered to `onChange`;
- the optional divided-row wrapper, density default, and group presentation context; and
- direct-item defaults for density and chevron position.

**Does not own / non-goals**

- disclosure trigger, region, chevron artwork, semantics, or nested presentation reset — owned by `component:Collapsible`;
- caller content, item labels, or the meaning and uniqueness of caller-supplied values — owned by the product callsite; or
- arbitrary selection models beyond the released single and multiple modes.

## Public concepts

| Concept              | Closed values or states                     | Meaning                                                                     | Availability          | Default                        | Owner                        | Stability | Invalid-value behavior      |
| -------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | --------------------- | ------------------------------ | ---------------------------- | --------- | --------------------------- |
| coordination mode    | `single`, `multiple`                        | Replaces the open set or toggles one member within it.                      | Every group.          | `single`                       | `component:CollapsibleGroup` | stable    | rejected by the public type |
| state ownership      | uncontrolled, controlled                    | Internal state starts from `defaultValue`, or `value` remains caller-owned. | Every group.          | uncontrolled                   | `component:CollapsibleGroup` | stable    | ordinary React semantics    |
| divided presentation | absent, present                             | Adds one wrapper and asks direct items to draw row dividers.                | Every group.          | absent                         | `component:CollapsibleGroup` | stable    | rejected by the public type |
| row density          | unpadded, `compact`, `balanced`, `spacious` | Supplies direct-item block padding; divided groups fall back to balanced.   | Direct grouped items. | unpadded; balanced if divided  | `component:CollapsibleGroup` | stable    | rejected by the public type |
| chevron default      | absent, `start`, `end`                      | Supplies the position default owned by `component:Collapsible`.             | Direct grouped items. | absent; item resolves to `end` | `component:Collapsible`      | stable    | rejected by the public type |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                   | Basis                                                                                             | Draft review state |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| FR1 | In `single` mode, toggling a closed direct item MUST replace the open-value set with that item, and toggling the open item MUST clear the set.                                                        | shipped source, consumer docs, and focused interaction tests                                      | verify             |
| FR2 | In `multiple` mode, toggling a direct item MUST add or remove only that value while preserving the state of other values.                                                                             | shipped source, consumer docs, and focused interaction tests                                      | verify             |
| FR3 | Supplying `value` MUST keep state caller-owned and report requested changes through `onChange`; omitting it MUST keep state internal after initialization from `defaultValue`.                        | `architecture:react-component-runtime/INV1,INV8`; shipped controlled and uncontrolled tests       | verify             |
| FR4 | A direct `Collapsible` with a `value` MUST use group coordination; an item without a value MUST retain standalone ownership.                                                                          | shipped hook behavior and focused group/standalone tests                                          | verify             |
| FR5 | With `hasDividers=false`, the group MUST add no DOM wrapper. With dividers enabled it MUST render one wrapper that receives documented root props and the `collapsible-group` target.                 | `architecture:public-component-api/INV5–INV8`; `architecture:component-theming-surface/INV3–INV7` | verify             |
| FR6 | Density, divider, and chevron defaults MUST reach direct items without leaking through a direct item's revealed content into nested independent disclosures.                                          | `component:Collapsible/FR7–FR8,DEC-2`; focused nesting tests                                      | settled            |
| FR7 | Presentation context identity MUST remain stable while divider, density, and chevron inputs are unchanged; coordination identity MUST change only when the open-value behavior it broadcasts changes. | `architecture:react-component-runtime/INV9`; memoized source and interaction tests                | verify             |

### Allowed variation

- **AV1 — Internal state representation.** The group may represent open values with arrays or another private structure while preserving FR1–FR4 and callback output.
- **AV2 — Wrapper implementation.** Divider mode may change internal layout technique while retaining one painting wrapper, the public target, root-prop reachability, and direct-item results.
- **AV3 — Item composition.** Callers may place direct Collapsible items beside non-participating content; only valued Collapsible children join coordination.

### Representative states

| State                              | Required invariant                                                            | Allowed variation             |
| ---------------------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| single, uncontrolled               | One valued item or none is open and internal state updates after each toggle. | Item labels and content.      |
| multiple, uncontrolled             | Any number of valued items may remain open.                                   | Item order and content.       |
| controlled                         | Rendered state follows `value`; `onChange` reports requested next state.      | Parent update timing.         |
| divided, density omitted           | One wrapper paints the group target and direct items use balanced density.    | Theme paint.                  |
| plain, density omitted             | No wrapper appears and direct items remain unpadded.                          | Surrounding caller layout.    |
| group position with nested content | Direct items inherit the group position; nested disclosures reset it.         | Item-level explicit override. |

### Transformation and precedence order

- **ORD1 — State ownership.** Controlled `value` when present → internal value initialized from `defaultValue` otherwise → mode-specific toggle → callback in the mode's documented output shape.
- **ORD2 — Density.** Explicit group density → `balanced` when dividers are enabled → no group density.
- **ORD3 — Chevron position.** Explicit item position → direct group position → Collapsible default `end`, as owned by `component:Collapsible/ORD1`.

### Performance and resources

- **PR1 — Render-owned coordination.** The group derives output from props, state, and context and owns no Effect, listener, observer, timer, request, subscription, or imperative browser resource.
- **PR2 — Stable broadcasts.** Memoized context values prevent unchanged semantic payloads from broadcasting new identities to direct consumers.

## Accessibility contract

- **AR1 — Child semantics remain primary.** Group coordination MUST preserve each Collapsible button's accessible name, `aria-expanded`, `aria-controls`, controlled region, and keyboard activation.
- **AR2 — Presentation adds no competing interaction.** The divider wrapper MUST NOT add a role, focus target, accessible name, or keyboard behavior.
- **AR3 — Direction stays with Collapsible.** Group chevron defaults MUST preserve `component:Collapsible/AR1–AR3`, including the inward leading cue under LTR and RTL.

## Design relationships

| Anatomy or state | Design requirement                                                        | Representation authority        | Hierarchy role      | Component contract |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------- | ------------------- | ------------------ |
| Group container  | Optional divider chrome visually associates sibling disclosures as a set. | observed shipped representation | aggregate container | FR5–FR6, AR2       |
| Direct item      | Density and chevron defaults remain consistent across sibling rows.       | `component:Collapsible/FR7–FR8` | disclosure row      | FR6, AR3           |

No current design record prescribes exact CollapsibleGroup pixels. This observational draft records the shipped divided and plain relationships without deciding new visual direction.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "collapsible"},
  "Trigger": {"target": "collapsible-trigger"},
  "Chevron": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Content": {"target": "collapsible-content"},
  "Group container": {"target": "collapsible-group"}
}
```

The Group container is CollapsibleGroup's conditional aggregate wrapper. The other anatomy rows remain owned by `component:Collapsible`; they are repeated in this observational subcomponent map only because the released consumer anatomy and target inventory are shared. Trigger, content, chevron, open state, disabled state, density padding, and per-item dividers remain with Collapsible's contract.

## Family and system relationships

- `component:Collapsible` owns direct-item disclosure semantics, chevron representation, item-level theming anatomy, and nested presentation reset.
- `architecture:public-component-api` owns export reachability, documented root-prop behavior, controlled API stability, styling composition, and conditional ref reachability.
- `architecture:react-component-runtime` owns render-derived state, stable context broadcast identity, and controlled-state ownership boundaries.
- `architecture:component-theming-surface` owns target qualification, target placement, visual-axis reflection, and delegated item ownership.
- `architecture:component-test-sufficiency` owns the rational evidence set across state coordination, browser accessibility, direction, and rendered presentation.

## Verification map

| Contract               | Verification                                                                        | Representative states                                     | Mutation or failure expectation                                                                                                           | Audit section                          |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR1–FR4, ORD1          | `CollapsibleGroup.test.tsx`; `useCollapsible.test.tsx`                              | single/multiple; controlled/uncontrolled; valued/unvalued | A sibling stays open in single mode, closes in multiple mode, controlled state mutates internally, or an unvalued item loses local state. | `audit:CollapsibleGroup/behavior`      |
| FR5–FR6, ORD2–ORD3     | `CollapsibleGroup.test.tsx`; `Collapsible.test.tsx`; `themingTargets.test.ts`       | plain/divided; each density; group/item/nested position   | Wrapper/target reachability changes, defaults stop reaching direct items, or presentation leaks into nested content.                      | `audit:CollapsibleGroup/theming`       |
| AR1–AR3                | DOM and Chromium accessibility suites; component-owned Storybook fixture; RTL audit | open/closed; single/multiple; leading/trailing; LTR/RTL   | Disclosure semantics diverge from state, the wrapper becomes interactive, or leading direction stops mirroring.                           | `audit:CollapsibleGroup/accessibility` |
| PR1–PR2, FR7           | source review plus context and interaction tests                                    | unchanged and changed state/presentation inputs           | An Effect/resource appears, unchanged payload broadcasts a new identity, or changed group behavior fails to reach consumers.              | `audit:CollapsibleGroup/code-health`   |
| Consumer documentation | CLI component projection, docs checks, and `CollapsibleGroup.stories.tsx`           | every public concept and representative composition       | A released prop/default is undiscoverable or the owned browser route loses representative state coverage.                                 | `audit:CollapsibleGroup/docs`          |

## Decision log

None. This audit records shipped behavior and delegates chevron representation to the current Collapsible contract; it makes no new product decision.

## Open questions

None. This observational draft does not broaden the released coordination modes or decide new presentation.

## Content boundary

This file does not duplicate consumer prop tables, examples, current audit scores, implementation steps, or Collapsible's disclosure and chevron rules. It links to their owners.
