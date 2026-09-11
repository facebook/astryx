---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:interaction-modality
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-10
owners: [cixzhang]
applies_to:
  [
    packages/core/src/utils/interactionModality.ts,
    packages/core/src/utils/focusOutline.stylex.ts,
    packages/core/src/hooks/useFocusReturnVisibility.ts,
    packages/core/src/hooks/useIndicatorFocusRing.tsx,
    packages/core/src/Layer/useTouchTrigger.ts,
    packages/core/src/,
  ]
verified_by:
  [
    packages/core/src/CheckboxInput/CheckboxInput.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/Selector/Selector.test.tsx,
    packages/core/src/Slider/Slider.test.tsx,
  ]
deciding_specs: []
---

# Interaction modality architecture

## Purpose

Astryx components behave predictably when people move between keyboard, pointer,
touch, pen, and programmatic focus. Essential actions remain perceivable and
reachable while their controlled state or task context is presented, and newer user
intent remains authoritative over stale work. This record defines those shared
interaction invariants, the shared modality state, the boundary between modality and
component focus ownership, and the evidence required when any of them changes.

It does not define focus-ring appearance, hover paint, press treatment, or new
component APIs. Those remain with Design Conventions, theme tokens, and the
owning component family.

## System model

Astryx tracks the last input modality as one shared state:

- a key press without Meta, Alt, or Control held sets `keyboard`;
- a pointer press, including mouse, touch, or pen, sets `pointer`;
- a key press with Meta, Alt, or Control held does not change modality; and
- before any input, the state is `keyboard` so initial or restored focus remains
  perceivable.

Programmatic focus does not create a new modality. Its focus indicator follows
the last input modality: it is hidden after pointer input and shown after
keyboard input. Components use the browser's `:focus-visible` behavior together
with the shared modality state where `:focus-visible` alone cannot distinguish
the initiating input.

Modality answers **whether the shared focus indicator should be visible**.
Component ownership answers **which element paints it**. The semantic focus
owner may paint on itself, delegate paint to an owning wrapper, or paint on a
visual proxy when the focusable element is intentionally hidden. That ownership
does not change the modality state.

Hover capability is separate from modality history. Hover behavior is available
only to hover-capable pointers and remains an enhancement over keyboard, click,
and touch paths. Touch and pen presses participate in pointer modality even when
a family gives them different gesture behavior.

Disabled, busy, read-only, intentionally hidden, and intentionally unavailable
semantics are separate from modality. Their current component, family, or system
contracts decide whether an action is present, focusable, or operable; modality only
controls the focus indicator on an eligible focus owner.

An action is **essential for a supported state and modality** when it is the only
supported control that can continue, reverse, dismiss, or change the component-owned
context at the point where that context is offered for interaction. Layout and
composition may move or proxy that action, but MUST NOT remove or separate every
supported path from that interaction point. This does not require an action to remain
continuously onscreen, sticky, or visually prominent. Ordinary scrolling is valid
unless the supported composition keeps the controlled context at the interaction
point while stranding its sole action.

Current component and family contracts define accepted intent, owner replacement,
pending presentation, and which close, cancellation, disablement, or unmount
transitions supersede the same interaction outcome. Once that owner defines
supersession, completion of older pending, deferred, or asynchronous work MUST NOT
change the current outcome's content, selection, status or announcement, visibility,
focus, or activation. This rule does not cancel or reassign unrelated background
work.

## Boundaries and invariants

- **INV1 — Last input owns programmatic focus visibility.** Programmatic focus
  preserves the current modality. After pointer input it does not show the shared
  focus indicator; after keyboard input it does.
- **INV2 — Modality and focus ownership stay separate.** Shared modality decides
  visibility. Each component family decides the semantic focus owner and the
  element that paints on its behalf.
- **INV3 — One focus move has one owning indicator.** A wrapper or visual proxy
  may paint for the semantic owner, but sibling controls paint their own focus
  and replacement content cannot silently remove the owner's indicator.
- **INV4 — Every modality has an operable path.** Keyboard, pointer, and touch or
  pen can reach each supported interaction. Hover is never the only discovery or
  activation path.
- **INV5 — Existing state semantics win.** Disabled controls do not become
  interactive because of modality. Read-only and busy controls preserve their
  documented focus and activation behavior.
- **INV6 — Modality remains internal.** Components derive modality from shared
  browser input state. A public focus-visibility or modality prop requires a
  separate public-API decision.
- **INV7 — Essential actions remain reachable.** At the interaction point where a
  component offers an essential action's controlled context, every supported
  modality has a perceivable and operable path to that action. Layout, scrolling,
  overflow, reflow, responsive composition, replacement content, or a
  custom-renderer seam MUST NOT separate every path from that context. This does not
  require continuous visibility, sticky behavior, or increased prominence. A
  current component, family, or system contract MAY intentionally hide, disable, or
  make the action unavailable in a named state.
- **INV8 — Newer owner-accepted intent owns the current outcome.** Current component
  and family contracts define intent acceptance, pending presentation, and
  supersession for the same interaction outcome. Once superseded, completion of
  older work MUST NOT change the current outcome's content, selection, status or
  announcement, visibility, focus, or activation. Unrelated background work keeps
  its existing owner and lifetime.
- **INV9 — Interaction findings require observable harm.** A shared interaction
  violation requires concrete user harm in a reproducible supported state and
  modality. Evidence names the lost or stale outcome and verifies representative
  normal or legacy paths remain unchanged by the remedy. Aesthetic preference,
  speculative unsupported states, and a claim that an action merely could be easier
  to discover do not establish a violation.

## Allowed variation

Component families keep their shipped interaction models:

- actions may paint the shared outline on the focusable action;
- bordered fields may paint their established field-focus treatment on an owning
  wrapper;
- hidden native inputs may have owner code paint on the visible indicator;
- menus may move focus with mouse hover so pointer and keyboard share one
  highlighted item; and
- spatial controls may move focus during a pointer gesture without showing the
  keyboard focus indicator.

These are ownership and behavior choices, not alternate modality definitions.
A new visual representation still requires design review; this record does not
authorize one.

## Restorative-change routing

`architecture:knowledge-contracts` alone defines change disposition. INV7 and INV8
may supply the current outcome a change restores, but they do not authorize another
observable public delta. New APIs, exceptions, defaults, interaction models, icon or
control sizing, sticky behavior, and caller-owned layout remain with their direct
current owner unless evidence proves that exact mechanism is necessary to restore
the invariant and representative unaffected paths remain unchanged.

## Change coupling

- A change to modality tracking, focus-return visibility, shared focus styles, or
  visual-proxy ownership updates the relevant representative tests in the same
  pull request.
- Moving a component's semantic focus owner or paint owner verifies keyboard
  order, programmatic focus after both modalities, one-indicator ownership, and
  disabled, busy, and read-only behavior where applicable.
- Adding pointer-dependent behavior verifies mouse, touch, and pen as applicable,
  including a non-hover path.
- Moving, hiding, clipping, replacing, or asynchronously updating an essential
  action verifies each supported modality in the affected state, close and
  supersession where applicable, and a representative unaffected state.
- A change presented as an interaction restoration inventories every additional
  public behavior delta. Layout, sizing, API, default, and exception changes that
  are not proven necessary remain separately routed.
- Changing focus appearance remains coupled to Design Conventions and theme
  verification. Exposing modality through public API remains coupled to
  `architecture:public-component-api`.

## Owning code

- `utils/interactionModality.ts` — records and exposes the shared last-input
  modality.
- `utils/focusOutline.stylex.ts` and focus tokens — provide the shared focus
  indicator mechanics and theme seam without choosing component ownership.
- `hooks/useFocusReturnVisibility.ts` — applies last-input visibility when focus
  returns from adaptive surfaces.
- `hooks/useIndicatorFocusRing.tsx` — lets the semantic owner guarantee paint on
  a replaceable visual indicator.
- Current component and family records define focus destination, keyboard and pointer
  behavior, essential-action availability, accepted intent, supersession, pending
  lifetimes, and focus-paint ownership.
- `architecture:react-component-runtime` owns shared lifecycle and resource
  mechanisms. This record owns only the cross-cutting modality-path and
  no-stale-interaction-outcome requirements.

## Deciding specs

No separate specification changes this record. The last-input rule was approved as
a system architecture decision by `cixzhang` on 2026-08-30. Essential-action
reachability, newer-intent precedence, and the evidence/scope guard were approved by
`cixzhang` on 2026-09-10.

## Verification

| Invariant  | Evidence                                                                                                                     | Failure signal                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV1, INV2 | Programmatic-focus cases after keyboard and pointer input in representative component tests                                  | Programmatic focus invents a modality, or pointer history paints the keyboard indicator                                                                                      |
| INV3       | Direct-owner, wrapper-owner, replaceable-indicator, and nested-action cases                                                  | No indicator, two indicators, or replacement content can opt out                                                                                                             |
| INV4       | Keyboard, mouse, touch, and pen browser paths where applicable                                                               | Hover-only behavior, sticky touch hover, or unreachable action                                                                                                               |
| INV5       | Disabled, busy, and read-only DOM and activation assertions                                                                  | Inactive control reacts, eligible control loses focus, or state changes with modality                                                                                        |
| INV6       | Public API review and representative source inspection                                                                       | A component adds caller-controlled modality without a separate API decision                                                                                                  |
| INV7       | Rendered-browser affected-state checks across geometry, clipping, scrolling, hit testing, built-in and custom-renderer paths | At an offered interaction point one modality loses every essential path, or evidence substitutes class equality for reachability/perceptibility                              |
| INV8       | Owner-defined intent order, pending, close, cancellation, disablement, and unmount mutations                                 | Older work changes current content, selection, status or announcement, visibility, focus, or activation after owner-defined supersession                                     |
| INV9       | Concrete-harm reproduction, representative normal/legacy/no-new-prop paths, and coincident public-delta inventory            | Unsupported or aesthetic preference is treated as harm, unaffected behavior changes, or an API, layout, sizing, default, sticky, or exception delta escapes direct authority |

Real-browser evidence is required when the behavior depends on
`:focus-visible`, pointer capability, touch or pen synthesis, rendered focus
ownership, scrolling, clipping, hit testing, or whether an essential control remains
perceivable in the supported presentation. Unit tests prove event routing, DOM state,
and deterministic intent ordering but do not replace those browser outcomes.

[PR #5648](https://github.com/facebook/astryx/pull/5648) is a verification
benchmark for the record, not an authority for it. Its ChatComposer fixture
covers keyboard-owned editor focus, pointer suppression, clearing an existing
keyboard indicator on pointer press, and keeping internal action focus owned by
the action. The benchmark also verifies programmatic editor focus after both
keyboard and pointer input before the behavior is treated as complete.
