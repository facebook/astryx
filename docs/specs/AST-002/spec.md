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

### Platform support

- Supported feature/engine floor: the rule applies to every exported component
  API on every supported renderer.
- Unsupported behavior: a browser or renderer implementation limitation is not
  itself evidence that callers should receive a permanent prop.
- Browser evidence: layout-based derivability claims are verified in real
  supported browsers before concluding that a prop is necessary.

## Current-state impact

- API review guidance must add the FR5 admission argument before new props are
  accepted.
- Before this rule is used as an automated or routine blocking gate, a blinded
  historical benchmark must measure both correct pauses and false blocks. A
  pattern of pausing clearly justified APIs means the rule needs refinement.
- Component-spec public concepts should record caller ownership and why the
  distinction is not derivable.
- Existing props are not removed automatically. They are evaluated when touched,
  when an adjacent prop is proposed, or when they cause a concrete maintenance or
  consistency problem.
- The proposed PowerSearch editor-popover maximum width is the motivating case:
  its width is an internal resolved design choice rather than a caller-owned
  distinction, so a new public tuning prop does not meet this rule.

## Verification

| Contract | Verification                                                                | Representative states                                                | Mutation or failure expectation                                                           |
| -------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| FR1, FR5 | Blinded historical API review benchmark                                     | recent utility, mid-range, and composition API additions             | Reviewer accepts a prop without identifying caller-owned semantic variation               |
| FR2, FR3 | Component tests and real-browser layout evidence                            | content, container, viewport, parent context, and platform variation | Public API exposes a value the component can derive reliably                              |
| FR4, FR6 | API surface review for utility, mid-range, and composition components       | existing slot, theme, style, layout, and behavior seams              | High-level component accumulates one-off tuning props instead of using its owning layer   |
| Burden   | Benchmark classification: allow, correct pause, false block, not applicable | recent accepted and rejected API changes                             | Clearly justified APIs are repeatedly paused or blocked without surfacing a real decision |

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

## Open questions

None.
