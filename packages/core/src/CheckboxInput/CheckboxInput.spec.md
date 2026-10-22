---
schema_version: 3
template_version: 6
kind: component
id: component:CheckboxInput
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [public-api, behavior, interaction, theming, accessibility, visual]
verified_by:
  [
    packages/core/src/CheckboxInput/CheckboxInput.test.tsx,
    packages/core/src/CheckboxInput/__tests__/Checkbox.a11y.test.tsx,
    packages/core/src/CheckboxInput/__tests__/Checkbox.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/CheckboxInput.stories.tsx,
  ]
modules: []
families: []
design_specs: [design:user-states]
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
    architecture:interaction-modality,
  ]
contributing: []
system_specs: [spec:AST-021]
---

# CheckboxInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckboxInput` is a controlled native checkbox with a required `label` and `value`; it supports synchronous and transition-backed change handlers, loading, disabled, disabled-reason, read-only, validation, sizing, and field content.                                        |
| Behavior                | The native input owns role, state, focus, form participation, and activation. A replaceable CheckboxIndicator owns the visible box while CheckboxInput owns its focus ring and pressed overlay.                                                                                  |
| End-user impact         | People can identify and operate available choices, review inert values as read-only, discover disabled reasons from the keyboard, and perceive busy, validation, focus, and pressed states.                                                                                      |
| Builder impact          | Builders control the value and may use `onChange`, `changeAction`, or both. The semantic meaning of omitting both handlers remains an explicit owner decision.                                                                                                                   |
| Compatibility/readiness | The released controlled API, DOM ownership, canonical and legacy targets, and existing composition remain supported. This draft records shipped and objectively remediated behavior.                                                                                             |
| Review checks           | Reject state/name drift, duplicate activation, disabled or read-only mutation, lost form semantics, missing focus/pressed feedback, inaccessible supporting text, or target ownership changes.                                                                                   |
| Governing rules         | `spec:AST-021/FR4–FR10`; `design:user-states/DR1–DR5`; `architecture:interaction-modality/INV1–INV5,INV9`; `architecture:public-component-api/INV1,INV5–INV9`; `architecture:component-theming-surface/INV3–INV8,INV12`; WCAG 2.2 1.3.1, 1.4.11, 2.1.1, 2.4.7, 3.3.1, and 4.1.2. |

This table is a review projection; the body below becomes authoritative only after owner approval.

## Intent

Render one controlled checkbox choice whose visible value, accessible state, interaction availability, and supporting field content remain aligned across pointer, keyboard, touch, forms, and assistive technology.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: observational and documentation-only; runtime, public types, defaults, focus order, visual treatment, and form behavior remain unchanged
- Controlled/uncontrolled behavior: controlled only; `value` remains required and all state changes remain caller-owned
- Migration decision: none; handlerless semantics remain unresolved rather than being inferred by this draft

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Native checkbox role, checked/mixed state, label, description/status relationships, focus, activation, availability, read-only state, required/invalid/busy state, and form participation.
- Composition of the resolved checkbox indicator, owner-painted focus ring and pressed overlay, disabled-reason tooltip, field label, description, and detached status.
- Ordering between `onChange`, `preventDefault`, optimistic pending state, and `changeAction`.

**Does not own / non-goals**

- The checkbox indicator's internal paint and theme targets — owned by `component:CheckboxIndicator` and the Indicator registry.
- Multi-option grouping, collection values, and group-level disabled reasons — owned by `component:CheckboxList`.
- Generic label, status-message, spinner, tooltip, or icon implementation.
- A new uncontrolled/default-value API or any change to checked-value serialization.

## Public concepts

| Concept        | Closed values or states                           | Meaning                                                                                                                              | Availability by variant/orientation/state               | Default               | Owner                      | Stability                              | Invalid-value behavior                       |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------------- | -------------------------- | -------------------------------------- | -------------------------------------------- |
| value          | `false`, `true`, `indeterminate`                  | Controlled visible and native checkbox state.                                                                                        | All paths.                                              | required              | caller                     | stable                                 | rejected by the public type                  |
| change path    | `onChange`, `changeAction`, both, neither         | Accepts immediate and/or transition-backed user intent; neither leaves the controlled value inert but does not settle its semantics. | Enabled, non-busy controls.                             | neither               | caller and component       | shipped; handlerless meaning unsettled | no handler means no component-owned mutation |
| availability   | enabled, disabled, focusable-disabled with reason | Controls activation, form submission, opacity, and reason discovery.                                                                 | All values.                                             | enabled               | component                  | stable                                 | disabled wins over activation                |
| read-only      | explicit                                          | Preserves a focusable, full-opacity controlled value while blocking mutation.                                                        | All values; disabled may coexist and wins availability. | false                 | component                  | stable                                 | boolean only                                 |
| busy           | explicit loading or optimistic transition         | Preserves focus, blocks duplicate change, exposes busy state, and replaces the indicator mark with Spinner.                          | Enabled and read-only values.                           | false                 | component                  | stable                                 | boolean/transition state only                |
| field content  | label, description, status, labelIcon             | Names and explains the choice and communicates validation.                                                                           | All values and availability states.                     | label required        | caller and composed owners | stable                                 | typed values only                            |
| size and width | `sm`, `md`; `SizeValue`                           | Sizes the indicator row and the complete field.                                                                                      | All states.                                             | `md`; intrinsic width | component                  | stable                                 | rejected by public types                     |

## Behavioral and layout contract

| ID   | Candidate invariant                                                                                                                                                                                                                                          | Basis                                                                                                               | Draft review state |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------ |
| FR1  | The role-bearing element MUST remain a native `input[type=checkbox]` named by the rendered label, with `checked` derived from `value === true` and the native `indeterminate` property derived from `value === 'indeterminate'`.                             | shipped source; shared checkbox contract; WCAG 4.1.2                                                                | verify             |
| FR2  | Enabled activation MUST call `onChange` first with the next boolean value, then call `changeAction` only when present and the event was not prevented.                                                                                                       | shipped source and component tests                                                                                  | verify             |
| FR3  | While `isLoading` or an optimistic action is pending, the input MUST expose busy state, refuse another change, and show Spinner in the indicator without losing focus.                                                                                       | shipped source, tests, and stories; `architecture:interaction-modality/INV5`                                        | verify             |
| FR4  | `isDisabled` without a reason MUST use native disabled behavior. With `disabledMessage`, the input MUST remain focusable through `aria-disabled`, stay inoperable, leave form data, and expose the tooltip description.                                      | shipped source and component tests; WCAG 2.1.1 and 4.1.2                                                            | verify             |
| FR5  | Explicit `isReadOnly` MUST preserve the controlled value and ordinary focusability, expose read-only state, remain full-opacity, and refuse mutation.                                                                                                        | shipped source and shared checkbox binding; WCAG 4.1.2                                                              | verify             |
| GAP1 | With neither `onChange` nor `changeAction`, the current controlled checkbox is inert but does not declare read-only or unavailable semantics. The expected public meaning remains unresolved.                                                                | shared checkbox known-failure record; issue #6165 owner decision                                                    | owner decision     |
| FR6  | Description, status, disabled reason, and caller-provided `aria-describedby` ids MUST compose without dropping any source; error status MUST expose invalid state.                                                                                           | shipped source and tests; WCAG 1.3.1, 3.3.1, 4.1.2                                                                  | verify             |
| FR7  | Explicit required state MUST retain native form validation; inherited required presentation MUST expose `aria-required` without silently enabling native validation.                                                                                         | shipped source and shared checkbox binding                                                                          | verify             |
| FR8  | Caller DOM props MUST reach the input, while component-owned type, checked, disabled, read-only, required, busy, invalid, description, ref, and styling values retain precedence.                                                                            | `architecture:public-component-api/INV5–INV8`; component tests                                                      | verify             |
| FR9  | The outer field MUST retain `checkbox-input`, the label MUST retain `checkbox-label`, and the built-in CheckboxIndicator path MUST retain its canonical targets and compatibility aliases. Replacement indicators are not required to accept target classes. | source/docs target inventory; replacement component tests; `architecture:component-theming-surface/INV4–INV8,INV12` | settled            |
| FR10 | Keyboard/programmatic focus on the hidden native input MUST paint the shared focus-visible outline on the resolved indicator element, including a replacement indicator that forwards no props.                                                              | `architecture:interaction-modality/INV1–INV3`; component tests                                                      | verify             |
| FR11 | Pointer hold on an enabled row MUST paint the pressed overlay on the indicator; disabled rows MUST not gain that treatment and release/cancellation MUST restore the resting pixels.                                                                         | `design:user-states/DR1–DR5`                                                                                        | verify             |
| FR12 | `sm` and `md` MUST keep the native input, indicator, focus paint, and row geometry aligned; field `width` MUST size the whole field rather than only the input.                                                                                              | shipped source, tests, and stories                                                                                  | verify             |

### Allowed variation

- **AV1 — Indicator replacement.** A theme may replace the named checkbox indicator if it preserves the Indicator prop and decorative ownership contracts; CheckboxInput still paints focus and pressed feedback on the resolved root.
- **AV2 — Theme paint.** Canonical component targets and semantic tokens may change admitted visual properties without changing native semantics, state precedence, or interaction ownership.
- **AV3 — Caller field content.** Label, description, status text, icon/content, and width may vary within their public types.

### Representative states

| State                     | Required invariant                                                                                           | Allowed variation                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| unchecked, checked, mixed | Native and visual states agree; activation proposes the next boolean value.                                  | Theme-owned paint and indicator replacement. |
| loading/pending           | Focus remains; busy is exposed; duplicate change is blocked; Spinner replaces the mark.                      | Caller-controlled loading duration.          |
| disabled                  | Inoperable and excluded from form data; native disabled unless a reason must remain focus-discoverable.      | Optional disabled-reason text.               |
| read-only                 | Explicit `isReadOnly` keeps the value visible, focusable, submitted, and immutable with read-only semantics. | Caller-controlled explicit state.            |
| handlerless               | The controlled value is inert, but its read-only, unavailable, or invalid-usage meaning remains unsettled.   | No policy is introduced by this draft.       |
| invalid/status            | Status is described and errors expose invalid state.                                                         | Error, warning, or success content.          |
| hidden label              | The label remains in the accessibility tree and names the input.                                             | Visual hiding only.                          |

### Transformation and precedence order

- **ORD1 — State precedence.** Controlled `value` → optimistic pending value → visible indicator state.
- **ORD2 — Activation precedence.** disabled/busy/read-only guard → next native boolean → `onChange` → `preventDefault` check → optimistic `changeAction`.
- **ORD3 — Availability precedence.** disabled owns availability and form exclusion; a disabled reason changes focusability but not operability; read-only applies only to value mutation.
- **ORD4 — Attribute precedence.** caller rest props → component-owned semantic/form attributes → component-owned StyleX props.

### Performance and resources

- **PR1 — Bounded resources.** The component owns no global listener or observer. Tooltip and transition resources remain scoped to their existing hooks and component lifetime.

## Accessibility contract

- **AR1 — Native checkbox semantics.** Name, role, checked/mixed state, required, invalid, busy, disabled, and read-only state MUST remain programmatically determinable.
- **AR2 — Keyboard parity.** Space activation follows the same availability and change-order rules as pointer activation; focus remains on the native input.
- **AR3 — Focus visibility.** The hidden input's focus MUST remain visibly represented on the indicator for keyboard modality, including indicator replacements.
- **AR4 — Supporting content.** Visible descriptions, statuses, and disabled reasons MUST be referenced without replacing caller descriptions.
- **AR5 — Visual state.** Meaningful checkbox boundaries, marks, focus rings, and busy indicators MUST remain perceivable under supported themes and forced colors.

## Design relationships

| Anatomy or state | Design requirement                                                              | Representation authority                                               | Hierarchy role      | Component contract      |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------- | ----------------------- |
| Checkbox         | Visible state cue, pressed overlay, and focus ring align with the native input. | Indicator owner plus `design:user-states` and interaction architecture | primary control     | FR1, FR3–FR5, FR10–FR12 |
| Label            | Visible or visually hidden text names the native input.                         | FieldLabel composition                                                 | primary content     | FR1, FR6                |
| Description      | Supporting text remains associated without entering the accessible name.        | FieldLabel composition                                                 | supporting content  | FR6                     |
| Status message   | Detached status communicates validation and participates in description.        | FieldStatus composition                                                | supporting feedback | FR6                     |

The shared consumer record includes composed targets owned by CheckboxIndicator, FieldLabel, and FieldStatus. This draft does not add an `anatomy-theming:v1` block while that cross-component inventory remains canonical; the block is optional during migration.

## Family and system relationships

- `spec:AST-021` owns the reusable checkbox accessibility binding, state inventory, evidence layers, and exact known-failure lifecycle.
- `design:user-states` owns enabled/disabled pointer-hold paint for CheckboxInput.
- `architecture:interaction-modality` owns focus-visibility modality and the boundary between semantic focus and indicator paint.
- `architecture:component-theming-surface` owns target placement, state reflection, and legacy alias compatibility.
- CheckboxIndicator, FieldLabel, FieldStatus, Spinner, Tooltip, and the Indicator registry retain their own implementation and theming ownership when composed here.

## Verification map

| Contract               | Verification                                                                             | Representative states                                                                                                      | Mutation or failure expectation                                                                        | Audit section                         |
| ---------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| FR1, FR4–FR7, AR1–AR4  | Shared checkbox jsdom and Chromium bindings                                              | value states; hidden/described label; disabled; disabled reason; loading; read-only; handlerless; required; invalid/status | A role/name/state/focusability/description expectation fails or a removed known failure becomes stale. | `audit:CheckboxInput/a11y`            |
| FR2–FR4, FR6–FR8, FR12 | `CheckboxInput.test.tsx`                                                                 | pointer/label activation; changeAction-only; form; disabled reason; passthrough/ref; size/direction                        | Callback, form, association, precedence, or layout assertions fail.                                    | `audit:CheckboxInput/behavior`        |
| FR9                    | theming target guards and component tests                                                | root, label, built-in CheckboxIndicator canonical/legacy targets                                                           | A component-owned target disappears, moves off its owner, or loses required reflected state.           | `audit:CheckboxInput/theming`         |
| FR10                   | focus-ring ownership tests plus exact-head Chromium                                      | built-in and prop-dropping replacement indicators                                                                          | Focus becomes invisible or paints on the wrong element.                                                | `audit:CheckboxInput/a11y`            |
| FR11                   | pressed-state source tests and exact-head Chromium evidence                              | enabled hold/release/cancel; disabled                                                                                      | Enabled feedback disappears, disabled paint changes, or release fails to restore rest.                 | `audit:CheckboxInput/design-rendered` |
| All                    | Storybook, strict lint, package typechecks, component-scoped axe, visual, and RTL audits | all value, size, availability, status, label, theme, and interaction states                                                | A public state becomes unreachable, visually regresses, or gains an accessibility/direction failure.   | `audit:CheckboxInput/testing`         |

## Decision log

None. This draft records shipped behavior and objective documentation/test coverage improvements; it introduces no new API, handlerless-state policy, or subjective visual decision.

## Open questions

- **OQ1 — What does a controlled CheckboxInput with neither `onChange` nor `changeAction` mean?** (`human-api`) Current behavior is inert while exposed as editable. Owner direction must choose read-only, unavailable, or invalid usage before implementation; issue #6165 records the hold.

## Content boundary

This file does not duplicate consumer prop tables/examples, implementation steps, generated evidence, or shared-component contracts. It links to their owners.
