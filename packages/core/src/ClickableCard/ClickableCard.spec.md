---
schema_version: 3
template_version: 6
kind: component
id: component:ClickableCard
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [
    public-api,
    behavior,
    layout,
    theming,
    accessibility,
    interaction,
    navigation,
    testing,
  ]
verified_by:
  [
    packages/core/src/ClickableCard/ClickableCard.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/ClickableCard.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:knowledge-contracts,
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: [spec:AST-005, spec:AST-029]
---

# ClickableCard component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | No public API change. The released `ClickableCard` component, props, ref target, theme target, and defaults remain unchanged.                                                                   |
| Behavior                | A card provides one enlarged action or navigation surface while nested interactive descendants retain their own activation. A disabled card exposes no live activation or destination.          |
| End-user impact         | People using assistive technology cannot activate a destination from a card presented as disabled; enabled action, navigation, and nested-control paths remain unchanged.                       |
| Builder impact          | None. Existing `isDisabled` usage gains the disabled behavior its public docs already describe.                                                                                                 |
| Compatibility/readiness | Backward-compatible defect repair plus observational documentation. No migration is required.                                                                                                   |
| Review checks           | Reject a live destination in disabled state, duplicate activation, nested-control bubbling, a blocked navigation sink, lost focus indication, or a moved/reflected theme target.                |
| Governing rules         | `family:navigation-destinations`, `architecture:interaction-modality`, `architecture:public-component-api`, `architecture:component-theming-surface`, and objective disabled-control semantics. |

This table is a review projection; the body below is authoritative.

## Intent

ClickableCard turns a Card surface into one action or navigation target without taking
activation ownership from interactive descendants. This draft records verified released
behavior and the objective disabled-link repair in the accompanying audit. It does not
add a prop, destination mode, visual treatment, selection model, or caller obligation.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: backward-compatible defect repair; public declarations,
  defaults, theme target, DOM root, and enabled behavior remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none; disabled cards now consistently suppress every activation
  path already described as disabled

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One enlarged action or navigation surface and its accessible control.
- Suppression of card activation when the event belongs to a nested interactive
  descendant or selected text.
- Enabled, disabled, hover, pressed, and focus-indicator behavior on the card surface.
- The `clickable-card` target and reflected visual variant on the painted root.

**Does not own / non-goals**

- Selection or toggling; `component:SelectableCard` owns that model.
- Semantics, paint, or activation of caller-supplied descendants.
- Destination acceptance policy; `family:navigation-destinations` owns it.
- Card padding, variant paint, radius, elevation, and size primitives; `component:Card`
  supplies those released surfaces.
- A new action requirement when both `href` and `onClick` are omitted. This draft
  records the existing render without deciding a new API constraint.

## Public concepts

| Concept           | Closed values or states                                             | Meaning                                                                                                                             | Availability by variant/orientation/state    | Default                                                     | Owner                                          | Stability                                       | Invalid-value behavior                                                 |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| Activation mode   | action, navigation, no supplied action                              | A hidden native button or link owns card activation; omission preserves the current render without inventing a destination.         | Every visual variant.                        | No supplied action when both inputs are omitted.            | `component:ClickableCard`                      | Observed released surface                       | Public types reject unsupported modes.                                 |
| Interaction state | enabled, disabled                                                   | Enabled cards accept their supported activation paths. Disabled cards expose no live action or destination and leave the tab order. | Action and navigation modes.                 | enabled                                                     | `component:ClickableCard`                      | Observed released surface plus objective repair | Public boolean type admits only enabled or omitted.                    |
| Nested ownership  | card surface, nested interactive descendant, selected text          | Only the card surface activates the card; descendants and selected text retain their own outcomes.                                  | Enabled cards.                               | Card surface when no nested owner or selection applies.     | `component:ClickableCard`                      | Observed released surface                       | Event targets outside the supported DOM path do not activate the card. |
| Destination       | accepted or blocked                                                 | Every navigation sink uses the family decision before navigation.                                                                   | Navigation mode and every activation method. | No destination when `href` is omitted.                      | `family:navigation-destinations`               | Current family contract                         | Blocked destinations remain inert.                                     |
| Visual surface    | Card padding, variant, elevation, size, and `clickable-card` target | Card supplies base paint and geometry; ClickableCard adds interaction paint and target identity.                                    | Every mode and state.                        | Current Card defaults; `variant=default`, `elevation=none`. | `component:Card` and `component:ClickableCard` | Observed released surface                       | Public types reject unsupported closed values.                         |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                     | Basis                                                                                                                       | Draft review state                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| FR1 | The current root is Card's `div`. A visually hidden native button owns action semantics; a visually hidden native anchor owns enabled navigation semantics. The required label names that control.                                      | Released source, docs, tests, and objective accessible-name semantics                                                       | Verified released behavior; no role or root change decided                                |
| FR2 | Surface activation fires the consumer callback once, then performs an accepted navigation unless the callback cancels it. Activation belonging to a nested interactive descendant or selected text does not activate the card.          | Released docs, source, focused tests, and `architecture:public-component-api/INV7`                                          | Verified released behavior                                                                |
| FR3 | Plain, new-tab, modified, middle-click, and delegated navigation use the shared destination decision. Blocked destinations do not navigate.                                                                                             | `family:navigation-destinations/FR1, FR3–FR5`                                                                               | Settled current family behavior                                                           |
| FR4 | Disabled action cards use a native disabled button. Disabled navigation cards render an `aria-disabled` anchor with no live `href` or `target`, leave the tab order, cancel direct synthetic activation, and expose no surface handler. | Public disabled docs, objective ARIA disabled-control semantics, current Link precedent, and red/green audit evidence       | Objective contract restoration in this audit; no API or visual decision                   |
| FR5 | The root retains Card geometry and paint, adds pointer-capable hover and pressed overlay behavior only while enabled, and delegates focus indication from the hidden semantic control to the visible root.                              | Released source, stories, browser evidence, and `architecture:interaction-modality/INV2–INV5`                               | Verified released behavior; the separate open touch-press PR is not adopted by this draft |
| FR6 | The root carries `clickable-card`, reflects `variant`, and composes supported ref, DOM, ARIA, data, event, class, style, and StyleX inputs without replacing component-owned behavior.                                                  | `architecture:public-component-api/INV5–INV8`, `architecture:component-theming-surface/INV4–INV6`, source, and target tests | Verified released behavior                                                                |

### Allowed variation

- **AV1 — Caller content.** Renderable caller content retains its own semantics,
  theming, layout, and interaction ownership inside the card.
- **AV2 — Router integration.** An accepted destination may use the native anchor or
  the active LinkProvider implementation; a disabled or rejected destination invokes
  neither custom navigation nor an imperative sink.
- **AV3 — Card appearance.** Released Card variants, padding, elevation, and supported
  sizing may vary without changing activation ownership.

### Representative states

| State                 | Required invariant                                                                                                      | Allowed variation                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Enabled action        | Hidden button is operable by keyboard and card surface; callback runs once.                                             | Caller content and Card appearance may vary.                      |
| Enabled navigation    | Hidden link retains accepted destination and browser affordances; every enlarged-surface sink uses the family decision. | Native or provider router may own accepted navigation.            |
| Disabled action       | Native button is disabled and no card activation occurs.                                                                | Disabled paint follows current Card composition.                  |
| Disabled navigation   | Anchor has no destination or target, is out of the tab order, and direct or surface activation cannot navigate.         | The inert anchor retains its accessible label and disabled state. |
| Nested control        | Descendant control handles its own event without activating the card.                                                   | Any supported interactive descendant may own the event.           |
| Narrow or RTL context | Logical geometry and activation ownership remain unchanged.                                                             | Caller content may wrap; no directional glyph is owned here.      |

### Transformation and precedence order

- **ORD1 — Event ownership.** Disabled state first suppresses card behavior; text
  selection and nested interactive ownership then suppress card behavior; otherwise the
  consumer callback runs before any accepted destination sink and may cancel it.
- **ORD2 — Navigation.** Normalize and decide the destination before selecting native,
  router, same-tab, new-tab, modified, middle-click, or delegated activation.
- **ORD3 — Root composition.** Compose Card paint and geometry, `clickable-card`
  reflection, focus delegation, enabled interaction paint, and supported consumer
  styling on the visible root while the hidden control retains semantics.

### Performance and resources

- The component creates local refs and uses the shared clickable-container hook. It owns
  no timer, observer, network request, portal, asynchronous task, or layout measurement.
- Current hook attribute synchronization is shared implementation behavior, not a new
  component requirement in this draft.

## Accessibility contract

- **AR1 — Native semantic owner.** The hidden button or enabled anchor exposes the
  action's native role and the required label; the visual root does not duplicate that
  role.
- **AR2 — Disabled means inoperable.** `aria-disabled` never substitutes for behavior:
  the disabled navigation anchor has no live destination and direct activation is
  canceled. Disabled action mode uses native button disablement.
- **AR3 — One visible focus indicator.** Keyboard focus on the hidden control paints the
  shared focus indicator on the visible card root. Nested controls paint their own
  indicators.
- **AR4 — Modality parity.** Keyboard, pointer, and touch-capable users retain an
  operable enabled path. Hover is an enhancement and never the only activation path.

## Design relationships

| Anatomy or state | Design requirement                                                           | Representation authority                                             | Hierarchy role                   | Component contract |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------- | ------------------ |
| Container        | Paints the Card surface plus enabled interaction and delegated focus states. | Current Card and ClickableCard source plus shared interaction tokens | Context-dependent action surface | FR5–FR6, AR3–AR4   |
| Content          | Retains caller-owned hierarchy and descendant interaction.                   | Caller-owned content                                                 | Context-dependent                | FR2, AV1           |

This observational draft records current representation. It does not decide new
proportions, density, colour, motion, or interaction feel.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "clickable-card"},
  "Content": {
    "none": {
      "reason": "intentional: Caller-supplied content retains its own theming ownership; ClickableCard applies no content target."
    }
  }
}
```

## Family and system relationships

- `family:navigation-destinations` owns destination membership, accepted and blocked
  results, and parity across navigation sinks.
- `architecture:interaction-modality` owns shared modality and focus-indicator
  visibility; ClickableCard owns the visible proxy for its hidden semantic control.
- `architecture:component-theming-surface` owns target qualification and reflected
  visual state on the painted root.
- `architecture:public-component-api` owns the released subpath, BaseProps composition,
  event cancellation, ref reachability, and compatibility boundary.
- `architecture:component-test-sufficiency` and `spec:AST-029` own bounded audit
  evidence and the red-before-green remediation trace.
- `architecture:knowledge-contracts` keeps this observational draft from settling a
  new public or design decision.

## Verification map

| Contract                   | Verification                                                                                   | Representative states                                                          | Mutation or failure expectation                                                                                            | Audit section                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| FR1, AR1                   | `ClickableCard.test.tsx`, component-scoped axe, and Chromium accessibility inspection          | Action and navigation labels                                                   | Removing native semantics or the required name fails role/name evidence.                                                   | `audit:ClickableCard/accessibility`   |
| FR2                        | `ClickableCard.test.tsx`                                                                       | Surface, hidden control, nested button/input, selected text, canceled callback | Duplicate or misowned activation changes callback counts or descendant outcomes.                                           | `audit:ClickableCard/behavior`        |
| FR3                        | `useClickableContainer.test.tsx`, `ClickableCard.test.tsx`, and family-linked browser coverage | Plain, modified, middle, target, delegated, accepted, blocked                  | A blocked destination reaches any sink, or an accepted destination loses an activation method.                             | `audit:ClickableCard/navigation`      |
| FR4, AR2                   | `ClickableCard.test.tsx` red/green case plus exact-head DOM inspection                         | Disabled action and disabled navigation                                        | Restoring `href`/`target`, custom-router invocation, default activation, or a live surface handler fails the focused case. | `audit:ClickableCard/accessibility`   |
| FR5, AR3–AR4               | Storybook states, component-scoped a11y/RTL/visual checks, and receipted Chromium frames       | Enabled, disabled, keyboard focus, pointer hover/press, narrow, LTR/RTL        | Lost focus paint, hover-only operation, sticky disabled paint, or clipped/reflowed content fails browser evidence.         | `audit:ClickableCard/design-rendered` |
| FR6                        | `ClickableCard.test.tsx`, theming target guards, typechecks, and source review                 | Ref, BaseProps, all variants, enabled/disabled                                 | Lost target reflection, ref, supported pass-through, or styling composition fails focused or repository checks.            | `audit:ClickableCard/api-theming`     |
| Documentation and contract | `.doc.mjs`, Storybook, `scripts/check-knowledge.mjs`, changeset checks                         | Consumer docs, examples, draft contract, package subpath                       | Missing or stale docs, required structure, links, anatomy map, or release note fails repository checks.                    | `audit:ClickableCard/docs`            |

Current audit scores, screenshots, eligibility, and run receipts remain in their wiki,
pull-request, and trusted-check owners rather than this contract.

## Decision log

None. This audit restores the already documented disabled outcome and does not settle a
new public or design choice.

## Open questions

- **OQ1 — Should rendering ClickableCard without `href` or `onClick` remain a supported
  focusable no-op state, or should the public contract reject or inert that composition?**
  (`human-api`) Current released types and rendering admit it; this observational audit
  does not change that compatibility boundary.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit scores,
screenshots, implementation steps, shared destination rules, or Card styling details.
It links to their owners.
