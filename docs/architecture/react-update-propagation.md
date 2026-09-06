---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:react-update-propagation
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-06
owners: [cixzhang]
applies_to: [packages/core/src/, packages/lab/src/]
verified_by:
  [packages/core/src/Stepper/Stepper.test.tsx, scripts/check-knowledge.mjs]
deciding_specs: []
---

# React update propagation architecture

## Purpose

A local state change should update the people-facing output that depends on it
without forcing unrelated component work. This record defines the shared
boundaries for child-to-parent registration, mutable metadata, context-provider
fan-out, pre-paint writes, and render-isolation evidence.

It does not set a universal render-count budget or require one React storage
primitive. Component and family contracts own their observable behavior and name
which consumers legitimately depend on an update. This architecture owns how a
change proves that its propagation is no broader than that contract requires.

## System model

Astryx components use four distinct update roles:

- **Membership** records that a mounted participant with one stable identity
  exists. Mount, unmount, and identity changes may update it.
- **Mutable metadata** changes while that participant remains mounted, such as
  availability or measurements used by one dependent affordance.
- **Render data** directly changes the participant's own observable output.
- **Shared context** broadcasts a provider value to every consumer of that
  context when its identity changes.

These roles may share internal primitives only when their observable update
boundaries remain separate. A mutable prop is not a membership event merely
because registration initially received it. A value needed by one dependent
control does not become shared render data for every context consumer merely
because the parent can place it in one provider object.

`useLayoutEffect` and ref callbacks run before paint and may synchronously update
ancestor state. That timing is reserved for observable pre-paint correctness that
cannot be derived during render or represented through lifecycle-stable storage.
It is not the default registration mechanism.

Current Stepper source is an adoption gap: changing one mounted Step's
`isDisabled` value currently reruns registration, writes parent membership and
metadata state, and replaces the context value consumed by every Step. The
component contract defines the required bounded outcome; this architecture does
not authorize or classify any pull request that changes it.

## Boundaries and invariants

- **INV1 — Pre-paint upward writes are exceptional.** A child MUST NOT use
  `useLayoutEffect`, a ref callback, or another pre-paint lifecycle path to
  register upward by writing ancestor or provider state unless the owning
  contract requires a pre-paint observable result, render-time derivation or
  lifecycle-stable storage cannot satisfy it, and focused evidence proves bounded
  fan-out and StrictMode-safe setup and cleanup. Ordinary membership bookkeeping
  defaults to mount/unmount identity and does not require a pre-paint ancestor
  state write.
- **INV2 — Membership and mutable metadata stay separate.** A mutable prop or
  derived state MUST NOT participate in membership registration when changing it
  would unregister and re-register the same mounted child. Membership changes
  only when lifecycle or stable identity changes. Mutable metadata uses a
  separate narrow update channel.
- **INV3 — Context is a broadcast boundary.** Expanding a provider value or
  changing its identity is reviewed as fan-out to every consumer. State needed by
  only a subset uses split context, a narrowly subscribed store, or another
  equivalently bounded channel unless measured evidence justifies broadcasting
  it.
- **INV4 — Render isolation is observable.** A local child-state change MAY
  rerender that child and consumers whose observable output depends on it. It
  MUST NOT rerender unrelated siblings or replace unrelated provider values
  without an explicit requirement in the owning current contract.
- **INV5 — Propagation patterns trigger performance review.** Child-to-parent
  registration, layout-effect ancestor writes, provider-value expansion or
  replacement, and mutable props participating in membership MUST receive
  performance review with render-count, provider-identity, registration-count,
  cleanup, and StrictMode evidence.
- **INV6 — Storage mechanisms remain implementation details.** A component MAY
  use lifecycle-stable refs, split contexts, external stores, selectors, or
  another clear mechanism. The mechanism is not normative; its update boundary,
  cleanup, and observable behavior are.

## Change coupling

- A change that adds child-to-parent registration or changes its dependencies
  identifies the stable member identity, the exact mount/unmount behavior, and
  every mutable value carried through registration.
- A mutable prop added to membership registration separates lifecycle from
  metadata before review proceeds, unless an owner-approved current contract
  explicitly defines the prop change as a membership change.
- A `useLayoutEffect`, ref callback, or other pre-paint path that writes ancestor
  state states the observable pre-paint requirement and adds a mutation proving a
  post-paint or lifecycle-stable alternative cannot satisfy it.
- A context-provider field or identity change inventories every consumer and
  proves that unrelated consumers keep stable provider inputs and render counts.
- Each triggered review covers local updates, mount/unmount, identity changes,
  StrictMode setup/cleanup, and the unchanged sibling path. A passing functional
  test without propagation evidence is incomplete.
- The owning component or family record states which outputs may react. This
  architecture never approves, classifies, designates, or authorizes a specific
  pull request; reviewers classify each change against current authority.

## Owning code

- Component and family provider modules — own context shape, context splitting,
  and provider identity.
- Component registration hooks and stores — own membership lifecycle, mutable
  metadata updates, subscriptions, and cleanup.
- Component contracts — own the observable outputs that may react to an update
  and representative unchanged siblings.
- `packages/core/src/Stepper/` — current representative adoption gap and focused
  verification surface for lifecycle-stable membership.

No single shared runtime module is required. A future shared helper must preserve
these boundaries and receive its own public or internal ownership review.

## Deciding specs

No separate system specification changes this record. `cixzhang` approved the
shared update-propagation boundaries on 2026-09-06. Component and family records
project concrete behavior without repeating these cross-component rules.

## Verification

| Invariant | Evidence                                                                                                                 | Failure signal                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| INV1      | Pre-paint justification plus render/layout mutation against a lifecycle-stable alternative                               | Registration writes ancestor state before paint without a required observable outcome, or StrictMode duplicates setup/cleanup |
| INV2      | Registration-count and membership-state assertions across mutable metadata changes, identity changes, mount, and unmount | A mutable prop unregisters/re-registers the same child or changes membership/count state                                      |
| INV3      | Provider-identity and consumer-render instrumentation before and after the narrow update                                 | One narrow metadata update replaces a shared value or rerenders every context consumer                                        |
| INV4      | Render counters for the affected child, dependent controls, and representative unrelated siblings                        | An unrelated sibling rerenders or a required dependent consumer stays stale                                                   |
| INV5      | Review-scope guard plus focused render, identity, registration, cleanup, and StrictMode cases                            | A triggering pattern passes with functional assertions alone                                                                  |
| INV6      | Equivalent behavioral and cleanup tests across the chosen implementation boundary                                        | The contract mandates one storage primitive, leaks subscriptions, or replays stale metadata                                   |

The test must fail when membership is keyed to mutable metadata and when narrow
metadata is added to a provider consumed by unrelated siblings. It must also
prove that mount, unmount, and stable-identity changes still update membership
exactly once and that the owning component's DOM and accessibility semantics
remain correct.
