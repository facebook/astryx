---
schema_version: 3
template_version: 5
kind: component
id: component:ChatComposerDrawer
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Chat/ChatComposerDrawer.test.tsx,
    apps/storybook/stories/ChatComposerDrawer.stories.tsx,
    apps/storybook/rtl-audit/verified-not-applicable.json,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-029]
---

# ChatComposerDrawer component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | No API or default change. ChatComposerDrawer remains a required-content panel whose optional `count` enables a controlled or uncontrolled disclosure.                                                  |
| Behavior                | The disclosure reports expanded state and its controlled region, preserves mounted content for animation, and makes collapsed descendants unavailable to keyboard and assistive-technology navigation. |
| End-user impact         | Keyboard and screen-reader users do not enter visually hidden drawer actions, and keyboard focus remains visible on the disclosure control.                                                            |
| Builder impact          | None. Existing props, defaults, exports, child composition, and callback values remain unchanged.                                                                                                      |
| Compatibility/readiness | Patch-compatible accessibility correction to released behavior. This observational record remains draft; collapsed-summary representation is not decided here.                                         |
| Review checks           | Reject hidden focusable descendants, an invisible disclosure focus state, broken `aria-controls`, changed callback values, or any claim that the collapsed-summary representation is settled.          |
| Governing rules         | `architecture:interaction-modality/INV1–INV4, INV9`; `architecture:knowledge-contracts/INV11, INV16`; `spec:AST-002/FR14, FR19`; WCAG 2.4.3 and 2.4.7.                                                 |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposerDrawer composes supplementary content above ChatComposer input. When
`count` is present, builders may let people collapse that content while keeping a
compact summary available.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: patch-compatible behavior correction; no public type or default changes
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

## Ownership boundary

**Owns**

- The drawer surface, optional disclosure state, disclosure association, and availability of collapsed descendants.
- Controlled and uncontrolled collapse requests.

**Does not own / non-goals**

- The meaning or behavior of arbitrary caller children.
- ChatComposer input, submission, status, and action behavior.
- The final visual representation of the collapsed count-and-label summary; this draft records only shipped observation.

## Public concepts

| Concept          | Closed values or states          | Meaning                                                                  | Availability by state               | Default      | Owner                          | Stability | Invalid-value behavior                               |
| ---------------- | -------------------------------- | ------------------------------------------------------------------------ | ----------------------------------- | ------------ | ------------------------------ | --------- | ---------------------------------------------------- |
| drawer content   | any React node                   | Supplementary content composed above the chat input.                     | always                              | none         | `component:ChatComposerDrawer` | stable    | Missing content is rejected by the required type.    |
| collapse support | unavailable, expanded, collapsed | `count` enables a disclosure and supplies its summary count.             | unavailable when `count` is omitted | unavailable  | `component:ChatComposerDrawer` | stable    | Collapse props have no visible effect without count. |
| collapse control | uncontrolled, controlled         | Internal state or `isCollapsed` determines the current disclosure state. | when collapse support is available  | uncontrolled | `component:ChatComposerDrawer` | stable    | Controlled state wins over the initial default.      |
| collapse request | next state                       | Activation asks for the opposite effective state.                        | when collapse support is available  | none         | `component:ChatComposerDrawer` | stable    | No request is emitted without a disclosure.          |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                 | Basis                                                                             | Draft review state |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| FR1 | When `count` is present, the component MUST expose one named disclosure control with `aria-expanded` and a resolvable `aria-controls` relationship. | Shipped API and implementation; WAI-ARIA disclosure semantics.                    | verify             |
| FR2 | Pointer activation, Enter, and Space MUST request the opposite effective collapsed state exactly once.                                              | Shipped implementation and public callback contract.                              | verify             |
| FR3 | In controlled mode, `isCollapsed` MUST remain authoritative; in uncontrolled mode, activation MUST update internal state before the next render.    | Shipped implementation and consumer docs.                                         | verify             |
| FR4 | Collapsed content MAY remain mounted for the grid transition, but its descendants MUST be absent from keyboard and assistive-technology navigation. | WCAG 2.4.3 and 2.4.7; objective restoration of the shipped visually hidden state. | settled            |
| FR5 | Keyboard focus on the disclosure MUST remain visibly perceivable through the shared focus-indicator mechanism.                                      | `architecture:interaction-modality/INV1–INV4`; WCAG 2.4.7.                        | settled            |
| FR6 | Omitting `count` MUST render content directly and MUST NOT create a disclosure control.                                                             | Shipped implementation and consumer docs.                                         | verify             |
| FR7 | The root MUST continue forwarding its ref, BaseProps attributes, and styling seams without moving them to an internal child.                        | Released public surface and `architecture:knowledge-contracts/INV11`.             | verify             |

### Allowed variation

- **AV1 — Child composition.** Builders choose the child content and its own semantics.
- **AV2 — Collapsed summary paint.** The current count-and-label presentation is observation, not an approved durable representation.

### Representative states

| State                         | Required invariant                                                                 | Allowed variation                                 |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| count omitted                 | Content is visible and no disclosure is rendered.                                  | Child content and root styling.                   |
| uncontrolled expanded         | Disclosure is expanded and descendants are available.                              | Child content and count value.                    |
| uncontrolled collapsed        | Disclosure is collapsed and mounted descendants are inert.                         | Current summary presentation.                     |
| controlled expanded/collapsed | Rendered state follows `isCollapsed`; activation reports the requested next state. | Parent timing and whether it accepts the request. |

### Transformation and precedence order

- **ORD1 — Effective state.** `isCollapsed` when defined → otherwise internal state initialized from `defaultIsCollapsed` → disclosure output only when `count` is present.

### Performance and resources

- **PR1 — Local state only.** The component owns no Effect, observer, listener, timer, or external resource.

## Accessibility contract

- **AR1 — Disclosure relationship.** The toggle exposes a name, expanded state, and a resolvable controlled-content ID.
- **AR2 — Hidden content is unavailable.** A visually collapsed mounted subtree is inert until expansion.
- **AR3 — Focus remains visible.** Keyboard focus on the toggle uses the shared focus indicator.

## Design relationships

| Anatomy or state  | Design requirement | Representation authority | Hierarchy role | Component contract |
| ----------------- | ------------------ | ------------------------ | -------------- | ------------------ |
| root surface      | unsettled          | human-selected           | supporting     | FR7                |
| disclosure toggle | unsettled          | human-selected           | supporting     | FR1, FR5           |
| collapsed summary | unsettled          | human-selected           | supporting     | AV2                |
| content area      | unsettled          | human-selected           | supporting     | FR4, FR6           |

The existing `chat-composer-drawer` target remains on the painted root. This
observational draft does not add targets or decide a separate theming boundary for
the disclosure, summary, or content area.

## Family and system relationships

- `architecture:interaction-modality` owns shared focus-visibility mechanics; this component owns the disclosure as its semantic focus owner.
- `architecture:component-theming-surface` owns target and anatomy mapping rules; this component exposes only the existing root target.
- `spec:AST-029` owns the observational audit-backfill boundary.

## Verification map

| Contract     | Verification                                                    | Representative states                                  | Mutation or failure expectation                                                                 | Audit section                            |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| FR1–FR3, FR6 | `ChatComposerDrawer.test.tsx`                                   | no count; controlled; uncontrolled; Enter; Space       | Relationship breaks, state authority changes, or callback reports the wrong next state.         | `audit:ChatComposerDrawer/behavior`      |
| FR4, AR2     | focused inert-state test plus exact-head accessibility CI       | expanded → collapsed → expanded with focusable child   | A visually hidden child remains reachable or expansion fails to restore availability.           | `audit:ChatComposerDrawer/accessibility` |
| FR5, AR3     | `KeyboardFocus` Storybook play and exact-head visual/a11y gates | keyboard focus in representative light and dark themes | Focus has no shared visible indicator or pointer interaction changes the keyboard-only outcome. | `audit:ChatComposerDrawer/accessibility` |
| FR7          | focused DOM/type tests and package checks                       | ref, BaseProps, xstyle, className, style               | Root ownership or a styling seam moves or disappears.                                           | `audit:ChatComposerDrawer/api`           |

## Decision log

No component-local policy decision is created by this observational draft.

## Open questions

- **OQ1 — Collapsed-summary representation.** Should the existing count badge remain, or should the summary use another representation? (`human-design`)

## Content boundary

This file does not duplicate consumer prop tables, examples, current audit scores,
or visual design rationale. It records observed behavior, objective remediation,
and the unresolved representation boundary without deciding it.
