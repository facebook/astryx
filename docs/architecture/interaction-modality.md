---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:interaction-modality
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
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
touch, pen, and programmatic focus. This record defines the shared modality
state, the boundary between modality and component focus ownership, and the
evidence required when either changes.

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

Disabled, busy, and read-only semantics are also separate from modality. Their
existing API and accessibility contracts decide whether focus and activation are
available; modality only controls the focus indicator on an eligible focus
owner.

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

## Change coupling

- A change to modality tracking, focus-return visibility, shared focus styles, or
  visual-proxy ownership updates the relevant representative tests in the same
  pull request.
- Moving a component's semantic focus owner or paint owner verifies keyboard
  order, programmatic focus after both modalities, one-indicator ownership, and
  disabled, busy, and read-only behavior where applicable.
- Adding pointer-dependent behavior verifies mouse, touch, and pen as applicable,
  including a non-hover path.
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
- Component and family implementations — own focus destination, keyboard model,
  pointer and touch behavior, and any wrapper or proxy that paints the indicator.

## Deciding specs

No separate specification changes this record. The last-input rule was approved
as a system architecture decision by `cixzhang` on 2026-08-30.

## Verification

| Invariant  | Evidence                                                                                    | Failure signal                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| INV1, INV2 | Programmatic-focus cases after keyboard and pointer input in representative component tests | Programmatic focus invents a modality, or pointer history paints the keyboard indicator |
| INV3       | Direct-owner, wrapper-owner, replaceable-indicator, and nested-action cases                 | No indicator, two indicators, or replacement content can opt out                        |
| INV4       | Keyboard, mouse, touch, and pen browser paths where applicable                              | Hover-only behavior, sticky touch hover, or unreachable action                          |
| INV5       | Disabled, busy, and read-only DOM and activation assertions                                 | Inactive control reacts, eligible control loses focus, or state changes with modality   |
| INV6       | Public API review and representative source inspection                                      | A component adds caller-controlled modality without a separate API decision             |

Real-browser evidence is required when the behavior depends on
`:focus-visible`, pointer capability, touch or pen synthesis, or rendered focus
ownership. Unit tests prove event routing and DOM state but do not replace that
evidence.

[PR #5648](https://github.com/facebook/astryx/pull/5648) is a verification
benchmark for the record, not an authority for it. Its ChatComposer fixture
covers keyboard-owned editor focus, pointer suppression, clearing an existing
keyboard indicator on pointer press, and keeping internal action focus owned by
the action. The benchmark also verifies programmatic editor focus after both
keyboard and pointer input before the behavior is treated as complete.
