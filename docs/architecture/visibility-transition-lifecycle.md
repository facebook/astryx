---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:visibility-transition-lifecycle
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-06
owners: [cixzhang]
applies_to:
  [
    packages/core/src/AppShell/AppShell.tsx,
    packages/core/src/MobileNav/,
    packages/core/src/,
    packages/lab/src/,
  ]
verified_by:
  [
    packages/core/src/MobileNav/MobileNavCloseVisibility.test.tsx,
    packages/core/src/MobileNav/MobileNavCloseEdgeCases.test.tsx,
    scripts/check-knowledge.mjs,
  ]
deciding_specs: []
---

# Visibility transition lifecycle architecture

## Purpose

People should see a component's owned exit complete before its host removes that
component from presentation. This record defines the boundary between a child's
exit transition and an ancestor's stronger visibility or lifecycle mechanism.

It does not choose animation duration, easing, CSS properties, or one React API.
The component owns its observable exit and reduced-motion outcome. The ancestor
owns when it deactivates, hides, or unmounts the subtree.

## System model

A closing surface passes through four states:

1. **Visible.** The surface is mounted, paint-eligible, and interactive according
   to its component contract.
2. **Exiting.** Close intent has occurred. The surface remains mounted and
   paint-eligible while its owned normal or reduced-motion exit completes.
   Interaction may be disabled without suppressing paint.
3. **Complete.** The child reports that its exit outcome has completed.
4. **Deactivated.** The ancestor may now switch Activity/Offscreen to hidden,
   conditionally unmount, apply `hidden`, or use equivalent paint suppression.

Ancestor visibility mechanisms can be stronger than a child's CSS transition.
React Activity hidden mode, for example, may write inline
`display: none !important` before a frame paints. That declaration is evidence
of lifecycle preemption; this record does not ban `!important` as a CSS feature.
The fix belongs in state ordering rather than a specificity contest.

Current AppShell/MobileNav composition is an adoption gap. AppShell currently
switches its Activity boundary to hidden in the same commit as close intent, so
framework paint suppression can precede MobileNav's owned exit.

## Boundaries and invariants

- **INV1 — Child exit precedes ancestor deactivation.** After close intent, an
  ancestor MUST keep the child subtree mounted and paint-eligible until the
  child-owned normal or reduced-motion exit reaches its completion boundary.
- **INV2 — Paint suppression is distinct from interaction suppression.** During
  exit, the host MAY prevent interaction or focus entry without hiding the
  pixels needed for the transition. `inert` alone does not violate the paint
  contract.
- **INV3 — Strong visibility cannot preempt exit.** Before completion, the
  ancestor MUST NOT switch Activity/Offscreen to hidden, conditionally unmount,
  apply `hidden`, write inline `display: none !important`, or use equivalent
  paint suppression.
- **INV4 — Completion has one owner.** The child reports completion from its
  observable transition contract. The ancestor does not independently guess a
  duration that can drift from the child. Shared internal timing may implement
  the contract only when one owner defines it.
- **INV5 — Reduced motion uses the same lifecycle.** Reduced motion may complete
  immediately or with minimal movement as the component contract specifies. It
  still reports completion before ancestor deactivation.
- **INV6 — Reopen and interruption are coherent.** Reopening during exit cancels
  stale deactivation. A completion from an obsolete close attempt MUST NOT hide a
  currently visible surface or fire state changes twice.

## Change coupling

- A parent visibility, Activity/Offscreen, conditional-rendering, or unmount
  change inventories child-owned entrance and exit transitions.
- A component exit change names its completion signal and verifies normal motion,
  reduced motion, interruption, rapid reopen, unmount, Escape, backdrop, and
  explicit close paths where applicable.
- Real-browser painted-frame and computed-visibility evidence proves the subtree
  remains paint-eligible through exit. jsdom DOM/style assertions alone are not
  sufficient.
- A framework-generated inline style is traced to its lifecycle owner. Review
  MUST NOT respond by adding stronger CSS until the state-ordering contract is
  satisfied.
- Pull requests and issues may be cited as evidence only. This record never
  assigns their review classification or disposition.

## Owning code

- Host components and visibility boundaries — own when a child subtree becomes
  hidden, inactive, or unmounted.
- Exiting components — own their normal and reduced-motion transition outcomes
  and completion signal.
- `packages/core/src/AppShell/AppShell.tsx` — owns when its MobileNav Activity
  boundary becomes hidden.
- `packages/core/src/MobileNav/` — owns MobileNav's exit outcome and completion.

## Deciding specs

No separate system specification changes this record. `cixzhang` approved the
visibility and exit ownership boundary on 2026-09-06. Component contracts project
that boundary onto their concrete states without copying its general rationale.

## Verification

| Invariant  | Evidence                                                                      | Failure signal                                                                                                               |
| ---------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| INV1, INV3 | Real-browser frame sampling and computed visibility through close             | The subtree becomes non-painted before the child-owned exit completes                                                        |
| INV2       | Interaction/focus assertions during an otherwise visible exit                 | Preventing interaction also suppresses the transition, or the closing surface remains operable when its component forbids it |
| INV4, INV5 | Completion-count and timing-source tests under normal and reduced motion      | Parent and child use drifting duration guesses, or reduced motion deactivates before completion                              |
| INV6       | Rapid close/reopen, interrupted exit, unmount, and stale-completion mutations | A stale completion hides reopened content, completion fires twice, or cleanup leaks                                          |

The browser fixture must fail when ancestor hidden mode is coupled directly to
close intent, including when the framework implements that mode with inline
`display: none !important`.
