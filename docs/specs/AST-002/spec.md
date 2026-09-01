---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-002
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-01
phase: accepted
owners: [cixzhang, imdreamrunner]
affects_architecture: []
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: []
---

# Public API admission and operation shape

## Intent

Keep Astryx public APIs intentional. A public API should represent a distinction
the caller owns, not expose a choice the component can make correctly by itself.
That need is only the first gate. The proposed API must also have clear meaning,
dependable behavior, and promises the component can keep.

Every public prop, hook, utility, and operation becomes a permanent concept that
consumers, documentation, tests, themes, migrations, and reviewers must
understand. The burden is to show why the caller must provide information, not
merely that an API can solve the immediate example.

## Non-goals

- Removing semantic state, controlled-value, accessibility, or composition APIs.
- Preventing utility components from exposing the fine-grained controls that are
  their purpose.
- Replacing existing styling escape hatches with component-specific layout props.
- Rejecting an API only because its implementation is difficult.

## Requirements

A public API proposal is admitted only when it passes both gates:

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
- **FR11 — One semantic action has one canonical operation.** Within one
  component module, any public or package-internal operations that implement the
  same caller-owned action use one canonical operation name. The public contract
  may expose a narrower option set while the package-internal implementation
  accepts wider semantic options under that same operation. Add another operation
  only for genuinely distinct caller-owned intent with a different contract.
- **FR12 — Mechanical screening does not outrun contract coverage.** Every API
  addition or semantic change is rejected now when the pull request lacks a
  readable semantic delta or fails to update or add the canonical owning record.
  Component-local semantics belong in the component spec; family-, architecture-,
  or system-owned semantics update that owner instead. A draft record is valid
  review context but not policy. Mechanical review also rejects derivable choices,
  overloaded inputs, hidden conditional precedence, and duplicate operations now.
  Only rejection because the canonical owner lacks `current` authority is deferred
  until a current policy explicitly activates coverage enforcement for the
  affected scope.
- **FR13 — Surviving changes make the semantic delta explicit.** Owner review
  receives a link to the canonical owner, one sentence stating the semantic
  before → after, the applicable review classification, and representative syntax
  only when public syntax changes.
- **FR14 — Contract restorations are preserves.** A fix that restores a current
  contract or standard is classified `preserves` and supplies regression evidence.
  It does not create a new API decision or semantic spec delta unless consumer
  usage or a documented promise also changes.
- **FR15 — Invalid states are prevented where practical.** Public APIs prevent
  bad results when doing so does not make the API harder to understand. Make
  statically knowable invalid combinations unrepresentable where practical;
  otherwise validate or warn, or choose a safe documented fallback. Do not
  silently render a broken state or over-constrain legitimate composition.
- **FR16 — Public inputs keep one semantic responsibility.** Across its full
  value domain and every accepted input shape, each public input has one stable
  semantic responsibility, and its name and type disclose the caller-owned
  meaning. One semantic input may derive several visual details when they form one
  cohesive named outcome, such as a semantic status or variant owning both tone
  and a signifier. Reject an input when its value or shape changes which axis it
  controls, or when consumers need implementation knowledge to predict the
  controlled axes. Independently caller-owned axes use separate inputs with
  invalid and conflicting combinations prevented under FR15; system-owned
  coordination exposes the semantic concept and derives its details instead of
  naming the input after one mechanism. Parallel inputs do not create hidden
  conditional precedence: an override is valid only when its name, type, and
  behavior across every combination form an explicit coherent contract.

### Platform support

- Supported feature/engine floor: the rule applies to every exported component,
  hook, and utility API on every supported renderer.
- Unsupported behavior: a browser or renderer implementation limitation is not
  itself evidence that callers should receive a permanent API.
- Browser evidence: layout-based derivability claims are verified in real
  supported browsers before concluding that public API is necessary.

## Current-state impact

- API review guidance must require both the caller-need argument and the
  dependable-contract argument before new public API is accepted.
- Public API additions and semantic changes that overload an input or create
  hidden conditional precedence are rejected now under FR16, even when the
  canonical owner is draft or missing. Missing `current` authority alone remains
  staged and non-blocking.
- Before broad rejection for missing `current` authority on a canonical owning
  record is activated, a blinded historical benchmark must measure both correct
  pauses and false blocks. A pattern of pausing clearly justified APIs means the
  gate needs refinement.
- Component specs own component-local semantic API contracts, including public
  hooks and utilities they explicitly co-own. Family, architecture, and system
  records own their respective shared semantics. The component's `.doc.mjs`
  remains the consumer syntax and reference authority.
- Component specs inherit current family contracts and record only local public
  concepts, additions, and explicit exceptions; they do not copy shared rules.

### Staged contract coverage

Semantic contract coverage is incomplete. During the staged rollout:

1. The pull request states the semantic before → after, identifies the canonical
   owner by scope, and updates or adds that record. Component-local semantics use
   the component spec; shared family, architecture, or system semantics use that
   owner. A draft record is acceptable review context and names its intended
   owner, but it is not policy.
2. Review applies only current component, family, architecture, and system rules.
   A draft routes an unresolved `novel-human` delta to the owner; it cannot clear
   the gate or be cited as `settled`.
3. The owner decides in the pull request. Exact-head owner approval settles only
   that change. An accepted contract and its evidence remain in the canonical
   owning record; rejected direction is removed unless it protects a durable
   boundary.
4. An owning record becomes `current` only after its local requirements,
   verification, relationships, approval, and every applicable acceptance
   prerequisite in current architecture are complete. For component specs, this
   includes the historical benchmark and pull-request enforcement required by the
   current knowledge contract. Only then can later reviews reuse it as policy.

Missing `current` authority on a canonical owning record becomes a mechanical
rejection only after a current policy change explicitly activates enforcement for
a named scope, that scope has current contract coverage, and the historical
benchmark has passed. Until then, missing current authority uses the staged owner
path rather than rejecting the API.

That deferral applies only to authority coverage. It does not defer current
cross-component rules: an API addition or semantic change that violates FR16 is
rejected now even when its canonical component owner is draft or missing.

- Existing props and operations are not removed automatically. They are evaluated
  when touched, when adjacent API is proposed, or when they cause a concrete
  maintenance or consistency problem.
- The proposed PowerSearch editor-popover maximum width is the motivating case
  for the need gate: its width is an internal resolved design choice rather than
  a caller-owned distinction, so a new public tuning prop does not pass.
- A styling switch cannot be justified by accessibility, association, validation,
  or other behavior its mechanism cannot perform. Solve the component behavior
  first; consider API only when a clear, enforceable caller-owned distinction
  remains.
- [PR #5373](https://github.com/facebook/astryx/pull/5373) is evidence that
  parallel public and package-internal operations for one semantic action create
  avoidable surface area. Its particular operation names and options are not
  policy.
- `TableRowStatus.color` is the motivating overloaded-input counterexample. Its
  palette and raw values control tone only, while `success`, `warning`, and
  `error` also select a default themed icon; the optional `icon` then
  conditionally overrides that representation. This shape would be rejected
  under FR16 pending a canonical `component:Table` contract. AST-002 does not
  prescribe the replacement API.
- Implementing the mechanical API gate and its benchmark is follow-up work. This
  policy and template change does not add gate implementation code.

## Verification

| Contract   | Verification                                                                       | Representative states                                                      | Mutation or failure expectation                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR5   | Blinded historical API review benchmark                                            | recent utility, mid-range, and composition API additions                   | Reviewer accepts a prop without identifying caller-owned semantic variation                                                           |
| FR2, FR3   | Component tests and real-browser layout evidence                                   | content, container, viewport, parent context, and platform variation       | Public API exposes a value the component can derive reliably                                                                          |
| FR4, FR6   | API surface review for utility, mid-range, and composition components              | existing slot, theme, style, layout, and behavior seams                    | High-level component accumulates one-off tuning props instead of using its owning layer                                               |
| FR7, FR8   | Consumer examples and behavior tests                                               | default, each public value, composed use, and unsupported use              | Meaning depends on implementation knowledge or tests assert only classes/data attributes                                              |
| FR9, FR10  | Component ownership and accessibility review                                       | owned content, external sibling content, missing or incorrect context      | A state is correct only when the caller fulfills a promise the component cannot verify                                                |
| FR11       | Public and package-internal operation inventory; PR #5373                          | one component module and one semantic action                               | One semantic action gains parallel operation names distinguished only by implementation needs                                         |
| FR12, FR13 | PR delta/canonical-owner update check, staged owner routing, and blinded benchmark | missing delta/update, draft or current authority, and owner-ready delta    | Missing delta/owner update passes, missing current authority dead-ends rollout, draft becomes policy, or automation decides semantics |
| FR14       | Focused regression tests against the current contract or standard                  | defect state and representative unchanged states                           | A restoration invents a new decision or lacks evidence that the regression stays fixed                                                |
| FR15       | Type-level constraints plus runtime validation and behavior tests                  | invalid values, unsupported combinations, and legitimate composition       | The API silently renders a broken state or prevents a valid composition                                                               |
| FR16       | Full value-domain, input-shape, and parallel-combination contract review           | semantic variants, raw or palette values, explicit overrides, and defaults | One value or shape switches the controlled axis, or a parallel input silently changes precedence                                      |
| Burden     | Benchmark classification: allow, correct pause, false block, not applicable        | recent accepted and rejected API changes                                   | Clearly justified APIs are repeatedly paused or blocked without surfacing a real decision                                             |

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

### DEC-3 — One semantic action uses one canonical operation name

**Reference:** `spec:AST-002/DEC-3`
**Decider:** `cixzhang`, `2026-08-31`

A component module uses one canonical operation name for one semantic action across
its public and package-internal forms. The public contract may expose a narrower
option set while the package-internal implementation accepts wider semantic
options under that same name. A second operation is admitted only for genuinely
distinct caller-owned intent and contract.

Rejected: creating a parallel operation because one internal call path needs
additional control. That choice exposes internal call-path differences and leaves
maintainers or consumers to distinguish two names for one action.

### DEC-4 — API review separates objective rejection from owner judgment

**Reference:** `spec:AST-002/DEC-4`
**Decider:** `cixzhang`, `2026-08-31`

The API gate rejects a missing PR-readable semantic delta, a missing canonical-
owner-record update, a derivable implementation choice, an overloaded input,
hidden conditional precedence, or duplicate operation names for one semantic
action now. Component-local semantics update the component spec; shared semantics
update their family, architecture, or system owner. During rollout, that canonical
record may be draft context routed to its owner; draft context never becomes
policy. Only rejection because the canonical owner lacks `current` authority waits
for a later current policy that activates enforcement for a covered, benchmarked
scope. A surviving proposal is presented as an explicit semantic delta for the
human owner to accept, reject, or refine. Automation does not make that judgment.

Rejected: asking owners to discover both mechanical defects and the intended
semantic change from implementation code, or rejecting all API work until every
component contract is current. Either path wastes human judgment or dead-ends the
coverage rollout.

### DEC-5 — Semantic contracts apply now; broad coverage rejection activates later

**Reference:** `spec:AST-002/DEC-5`
**Decider:** `cixzhang`, `2026-08-31`

Semantic API contracts apply now at their canonical owner, and the one-canonical-
operation rule applies now to public and package-internal forms of the same
semantic action. API changes that lack a PR-readable semantic delta or fail to
update or add the canonical owning record are rejected now. Component-local
semantics use the component spec; family-, architecture-, or system-owned
semantics use that record. The canonical record may remain draft context routed
to its owner.

Broad mechanical rejection because that canonical owner lacks `current`
authority is not active. It requires a later current policy decision that names
the enforced scope after that scope has current contract coverage and the
historical benchmark shows the gate can block changes without unacceptable false
rejections.

Rejected: delaying semantic contract ownership until every owning record is
current, or treating this decision as immediate authorization to reject every API
change whose canonical owner is draft or missing.

### DEC-6 — Public inputs keep one semantic responsibility

**Reference:** `spec:AST-002/DEC-6`
**Decider:** `cixzhang`, `2026-09-01`

Every public input has one stable semantic responsibility across its full value
domain and every accepted input shape. Its name and type disclose the
caller-owned meaning. One semantic input may derive several visual details when
they form one cohesive named outcome, such as a status or variant owning tone and
a signifier. A property is rejected when its values or shapes change which axis
it controls, or when consumers need implementation knowledge to predict the
controlled axes.

When two axes are independently caller-owned, expose separate inputs and prevent
invalid or conflicting combinations under FR15. When the system owns their
coordination, expose the semantic concept and derive both details rather than
naming the input after one mechanism. Parallel inputs may override one another
only when their names, types, and behavior across every combination define an
explicit coherent contract and prevent invalid or conflicting states.

Rejected: `TableRowStatus.color`, whose palette and raw values mean tone only
while `success`, `warning`, and `error` mean tone plus a default themed icon, with
an optional `icon` that conditionally overrides representation. That shape would
not pass current API review pending a canonical `component:Table` contract. This
decision does not prescribe the replacement API.

## Open questions

None.
