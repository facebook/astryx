---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-002
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
phase: accepted
owners: [cixzhang, imdreamrunner]
affects_architecture: []
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: []
---

# Public component prop admission

## Intent

Keep Astryx public APIs intentional. A prop should represent a distinction the
caller owns, not expose a choice the component can make correctly by itself.
That need is only the first gate. The proposed API must also have clear meaning,
dependable behavior, and promises the component can keep.

Every public prop becomes a permanent concept that consumers, documentation,
tests, themes, migrations, and reviewers must understand. The burden is to show
why the caller must provide information, not merely that a prop can solve the
immediate example.

## Non-goals

- Removing semantic state, controlled-value, accessibility, or composition APIs.
- Preventing utility components from exposing the fine-grained controls that are
  their purpose.
- Replacing existing styling escape hatches with component-specific layout props.
- Rejecting a prop only because its implementation is difficult.

## Requirements

A new prop is admitted only when it passes both gates:

1. **Need:** the caller owns information the component cannot derive.
2. **Contract:** the API clearly describes a dependable result the component can
   enforce.

- **FR1 — A prop represents caller-owned intent.** A new public prop is justified
  only when two otherwise identical situations require different resolved design
  outcomes and the caller owns which outcome applies.
- **FR2 — Derivable differences stay internal.** Do not add a prop when the
  component can derive the correct outcome from its state, content, measured or
  CSS layout, parent context, platform capability, or another existing public
  concept.
- **FR3 — Implementation choices are not public concepts.** Internal thresholds,
  optical tuning, algorithm choices, and one-off fixes remain internal unless
  FR1 proves that callers need to distinguish semantically identical cases.
- **FR4 — Existing composition and styling seams come first.** A component does
  not add a specialized prop when an existing slot, child contract, theme target,
  `xstyle`, `className`, `style`, or owning layout component already expresses
  caller intent at the correct layer.
- **FR5 — The admission argument is reviewable.** A public-API proposal names the
  two otherwise identical cases, the different required outcomes, why the caller
  knows the difference, and why the component cannot derive it.
- **FR6 — High-level components have a higher threshold.** Opinionated
  compositions prefer internal resolution and composition over accumulating
  low-level tuning props.
- **FR7 — The public concept is understandable.** Its name and values describe
  caller intent without requiring consumers to know the rendering technique that
  implements it.
- **FR8 — The result is predictable.** Each value has a stable, observable effect
  that consumers can explain and tests can verify. A data attribute, theme hook,
  or implementation difference alone is not a public outcome.
- **FR9 — The API can keep its stated promise.** The API shape carries or owns
  the information needed to produce the claimed result. Documentation and review
  arguments do not credit an enum or styling switch with accessibility,
  association, or validation behavior it cannot perform. The contract depends
  only on props, owned children, owned context, and platform facts the component
  can verify.
- **FR10 — Every supported state is independently correct.** Accessibility,
  behavior, and required visual communication do not become valid only when an
  unverified external condition is assumed. Solve the base component problem
  before adding API to select between incomplete solutions.

### Platform support

- Supported feature/engine floor: the rule applies to every exported component
  API on every supported renderer.
- Unsupported behavior: a browser or renderer implementation limitation is not
  itself evidence that callers should receive a permanent prop.
- Browser evidence: layout-based derivability claims are verified in real
  supported browsers before concluding that a prop is necessary.

## Current-state impact

- API review guidance must require both the caller-need argument and the
  dependable-contract argument before new props are accepted.
- Before this rule is used as an automated or routine blocking gate, a blinded
  historical benchmark must measure both correct pauses and false blocks. A
  pattern of pausing clearly justified APIs means the rule needs refinement.
- Component-spec public concepts should record caller ownership, why the
  distinction is not derivable, the observable result, and how the component can
  keep the promise.
- Existing props are not removed automatically. They are evaluated when touched,
  when an adjacent prop is proposed, or when they cause a concrete maintenance or
  consistency problem.
- The proposed PowerSearch editor-popover maximum width is the motivating case
  for the need gate: its width is an internal resolved design choice rather than
  a caller-owned distinction, so a new public tuning prop does not pass.
- A styling switch cannot be justified by accessibility, association, validation,
  or other behavior its mechanism cannot perform. Solve the component behavior
  first; consider API only when a clear, enforceable caller-owned distinction
  remains.

## Verification

| Contract  | Verification                                                                | Representative states                                                 | Mutation or failure expectation                                                           |
| --------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| FR1, FR5  | Blinded historical API review benchmark                                     | recent utility, mid-range, and composition API additions              | Reviewer accepts a prop without identifying caller-owned semantic variation               |
| FR2, FR3  | Component tests and real-browser layout evidence                            | content, container, viewport, parent context, and platform variation  | Public API exposes a value the component can derive reliably                              |
| FR4, FR6  | API surface review for utility, mid-range, and composition components       | existing slot, theme, style, layout, and behavior seams               | High-level component accumulates one-off tuning props instead of using its owning layer   |
| FR7, FR8  | Consumer examples and behavior tests                                        | default, each public value, composed use, and unsupported use         | Meaning depends on implementation knowledge or tests assert only classes/data attributes  |
| FR9, FR10 | Component ownership and accessibility review                                | owned content, external sibling content, missing or incorrect context | A state is correct only when the caller fulfills a promise the component cannot verify    |
| Burden    | Benchmark classification: allow, correct pause, false block, not applicable | recent accepted and rejected API changes                              | Clearly justified APIs are repeatedly paused or blocked without surfacing a real decision |

## Decision log

### DEC-1 — Public props require a non-derivable caller distinction

**Reference:** `spec:AST-002/DEC-1`
**Decider:** `cixzhang`, `2026-08-30`

A new public component prop is appropriate only when otherwise identical
situations need different resolved design decisions and the component cannot
derive the distinction from information available to it. Public props represent
caller-owned intent, not implementation knobs.

Rejected: adding props whenever a consumer asks for a different internal layout
value. That approach duplicates design decisions across callsites and expands the
permanent API without adding semantic information.

### DEC-2 — Caller need does not admit an unclear or unenforceable API

**Reference:** `spec:AST-002/DEC-2`
**Decider:** `cixzhang`, `2026-08-30`

A non-derivable caller distinction passes only the need gate. The proposed prop
must also name an understandable concept, produce a dependable observable result,
and use a mechanism capable of fulfilling the promise used to justify it.

Rejected: admitting a styling switch because review text gives it accessibility,
association, or validation meaning its mechanism cannot provide. Solve the base
component behavior first; consider public API only when a clear, enforceable
caller-owned distinction remains.

## Open questions

None.
