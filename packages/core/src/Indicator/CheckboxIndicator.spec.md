---
schema_version: 3
template_version: 6
kind: component
id: component:CheckboxIndicator
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, theming, accessibility, visual]
verified_by:
  [
    packages/core/src/Indicator/Indicator.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/Indicator.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: []
---

# CheckboxIndicator component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckboxIndicator` is exported from `@astryxdesign/core/Indicator`; `state` is required, `size` defaults to `md`, `isDisabled` defaults to `false`, and `children` may replace the built-in mark. |
| Behavior                | A decorative checkbox chrome is always rendered. Checked and indeterminate states draw their matching mark unless the shallow `isRenderable()` predicate treats `children` as replacement content. |
| End-user impact         | People receive one visible checkbox-state cue while the owning control retains all semantics, focus, keyboard, and activation behavior.                                                            |
| Builder impact          | Builders may restyle the canonical targets or replace the named indicator without taking over the owning control's semantics.                                                                      |
| Compatibility/readiness | The released component and legacy `checkbox` target remain supported. This draft records shipped behavior and introduces no API or runtime change.                                                 |
| Review checks           | Reject lost `aria-hidden`, missing state marks, dropped passthrough/ref/styling, changed replacement precedence, or removal of the legacy target before its approved window.                       |
| Governing rules         | `architecture:public-component-api/INV1,INV5,INV6,INV8,INV9`; `architecture:component-theming-surface/INV3–INV8,INV12`; `architecture:component-test-sufficiency/INV1–INV7,INV10–INV11`.           |

This table is a review projection; the body below is authoritative only after owner approval.

## Intent

Render the replaceable, decorative visual that communicates a checkbox owner's unchecked, checked, or indeterminate state without taking ownership of checkbox semantics or interaction.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: observational only; no runtime or public-type change
- Controlled/uncontrolled behavior: not applicable; `state` is supplied by the owner
- Migration decision: the deprecated `checkbox` target remains emitted beside `checkbox-indicator` under `architecture:component-theming-surface/INV12`

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Decorative checkbox chrome, state mark, disabled appearance, size, replacement-content precedence, and component theming targets.
- A root DOM ref plus supported neutral DOM and styling passthrough.

**Does not own / non-goals**

- Checkbox role, accessible name, focus, keyboard, activation, form participation, or busy semantics — owned by the composing control.
- Row placement and logical-edge layout — owned by the host component.
- The behavior or accessibility of consumer-supplied replacement content.

## Public concepts

| Concept             | Closed values or states                 | Meaning                                                                                                                                                       | Availability by variant/orientation/state | Default            | Owner                         | Stability                                  | Invalid-value behavior                             |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------ | ----------------------------- | ------------------------------------------ | -------------------------------------------------- |
| state               | `unchecked`, `checked`, `indeterminate` | Chooses the built-in visual state.                                                                                                                            | All render paths.                         | required           | `component:CheckboxIndicator` | stable                                     | rejected by the public type                        |
| size                | `sm`, `md`                              | Selects the 20px or 24px visual box and matching mark geometry.                                                                                               | All states.                               | `md`               | `component:CheckboxIndicator` | stable                                     | rejected by the public type                        |
| disabled appearance | enabled, disabled                       | Mirrors the owning control's disabled presentation without creating semantics.                                                                                | All states.                               | enabled            | `component:CheckboxIndicator` | stable                                     | boolean only                                       |
| replacement content | shallow renderable or empty             | Replaces both built-in marks when `isRenderable(children)` returns true. React elements and containers take this branch even when descendants render nothing. | All states.                               | built-in mark path | `component:CheckboxIndicator` | observed; empty-container policy unsettled | unsupported values follow React rendering behavior |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                  | Basis                                                              | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------ |
| FR1 | The component MUST render one decorative span chrome in every state and MUST set its own `aria-hidden="true"` after caller passthrough.                                                                                                                                                                                              | shipped source; `architecture:public-component-api/INV5`           | verify             |
| FR2 | `unchecked` MUST show no built-in mark, `checked` MUST show the checkmark, and `indeterminate` MUST show the dash.                                                                                                                                                                                                                   | shipped source, docs, tests, and stories                           | verify             |
| FR3 | The current implementation uses shallow `isRenderable(children)` replacement precedence: nullish values, booleans, and the empty string keep the state mark; React elements and containers replace it even when descendants render nothing. This draft does not settle whether empty-container behavior should remain public policy. | shipped source and regression tests                                | verify             |
| FR4 | The root MUST preserve supported DOM props, `ref`, `className`, `style`, and `xstyle` while keeping component-owned accessibility precedence.                                                                                                                                                                                        | `architecture:public-component-api/INV5,INV6,INV8`                 | verify             |
| FR5 | The canonical root target MUST be `checkbox-indicator`; `checkbox` MUST remain a same-element deprecated alias until its approved removal window.                                                                                                                                                                                    | `architecture:component-theming-surface/INV4,INV6,INV12`           | settled            |
| FR6 | Size, checked/indeterminate, and disabled state MUST be reflected on the root target; the check and dash MUST retain their dedicated painting targets.                                                                                                                                                                               | shipped source; `architecture:component-theming-surface/INV4,INV6` | verify             |
| FR7 | State transitions MUST honor reduced motion, and checked/indeterminate marks MUST remain perceivable in forced-colors mode.                                                                                                                                                                                                          | shipped source and WCAG 2.2 1.4.11                                 | verify             |

### Allowed variation

- **AV1 — Theme paint.** Tokens and canonical component targets may change color, border, radius, opacity, and other admitted visual properties without changing state or semantic ownership.
- **AV2 — Replacement component.** A theme may replace the named checkbox indicator when the replacement preserves this public prop and decorative-ownership contract.

### Representative states

| State               | Required invariant                                                                          | Allowed variation                |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| unchecked           | Chrome remains visible with no built-in mark.                                               | Theme-owned paint and shape.     |
| checked             | Chrome and checkmark remain visible.                                                        | Theme-owned paint and shape.     |
| indeterminate       | Chrome and dash remain visible.                                                             | Theme-owned paint and shape.     |
| disabled            | The requested state remains legible with muted treatment and no host-driven hover response. | Theme-owned inactive treatment.  |
| replacement content | Shallow-renderable content replaces both built-in marks inside the same chrome.             | Caller-owned decorative content. |

### Transformation and precedence order

- **ORD1 — Render precedence.** Caller passthrough → component-owned `aria-hidden` → merged theme/style inputs → shallow replacement-content decision → built-in state mark.

### Performance and resources

- **PR1 — Pure render.** The component owns no state, Effect, listener, observer, timer, or external resource.

## Accessibility contract

- **AR1 — Decorative ownership.** The root remains `aria-hidden`; the composing control owns role, name, state, focus, keyboard, activation, and form semantics.
- **AR2 — Forced colors.** Checked and indeterminate marks remain distinguishable when author colors are forced.
- **AR3 — Replacement boundary.** Replacement content is decorative within the hidden root and MUST NOT be the only semantic expression of the owning control's state.

## Design relationships

| Anatomy or state   | Design requirement                                  | Representation authority                   | Hierarchy role            | Component contract |
| ------------------ | --------------------------------------------------- | ------------------------------------------ | ------------------------- | ------------------ |
| Chrome             | Semantic theme tokens and canonical painting target | prescribed by current theming architecture | supporting control visual | FR1, FR5–FR7       |
| Checkmark          | Visible checked-state mark                          | observed shipped representation            | supporting state cue      | FR2, FR6–FR7       |
| Indeterminate mark | Visible partial-state mark                          | observed shipped representation            | supporting state cue      | FR2, FR6–FR7       |

The shared `Indicator.doc.mjs` owns anatomy and targets for CheckboxIndicator, CheckIndicator, and RadioIndicator together. This component draft does not add an `anatomy-theming:v1` block while that shared consumer record remains the canonical cross-component inventory; the block is optional during migration. The deprecated `checkbox` alias still maps to the CheckboxIndicator chrome for compatibility and is not a separate anatomy part.

## Family and system relationships

- `architecture:component-theming-surface` owns target placement, reflected state, and deprecated-alias compatibility.
- `architecture:public-component-api` owns export, passthrough, styling composition, ref, and compatibility requirements.
- `architecture:component-test-sufficiency` owns the evidence needed for each critical promise and distinct risk partition.

## Verification map

| Contract | Verification                                                | Representative states                                            | Mutation or failure expectation                                                              | Audit section                             |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1, AR1 | `Indicator.test.tsx` decorative-contract cases              | every built-in path; hostile `aria-hidden` input                 | Removing or reordering owned `aria-hidden` exposes duplicate semantics.                      | `audit:CheckboxIndicator/a11y`            |
| FR2–FR3  | `Indicator.test.tsx` state and replacement-content cases    | unchecked, checked, indeterminate, empty scalar, visible child   | Removing a state mark or choosing the wrong children branch fails observable DOM assertions. | `audit:CheckboxIndicator/behavior`        |
| FR4      | `Indicator.test.tsx`, strict lint, and public type checks   | neutral DOM props, ref, class/style/xstyle                       | Passthrough, ref, or styling composition stops reaching the root.                            | `audit:CheckboxIndicator/api`             |
| FR5–FR6  | theming target guards and `Indicator.test.tsx`              | canonical/legacy targets; size/state/disabled axes               | A target disappears, moves off its painter, or loses reflected state.                        | `audit:CheckboxIndicator/theming`         |
| FR7, AR2 | source review plus exact-head Chromium evidence             | light/dark; checked/indeterminate; reduced motion; forced colors | Motion persists under reduced motion or a state mark disappears in forced colors.            | `audit:CheckboxIndicator/design-rendered` |
| All      | `Indicator.stories.tsx`, component-scoped axe and RTL audit | all states, sizes, disabled, replacement content                 | A required rendered state is unreachable or gains an accessibility/RTL failure.              | `audit:CheckboxIndicator/testing`         |

## Decision log

None. This draft records only verified shipped behavior.

## Open questions

- Whether empty React containers should continue to suppress the built-in state mark is intentionally unsettled; this observational draft records the current branch without approving it as future policy.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit results, implementation steps, or family/system rules. It links to their owners.
