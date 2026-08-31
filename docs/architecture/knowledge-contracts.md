---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:knowledge-contracts
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang]
applies_to: [AGENTS.md, docs/, packages/core/src/, packages/lab/src/]
verified_by:
  [
    scripts/check-knowledge.test.mjs,
    .github/scripts/change-scope.test.mjs,
    .github/scripts/spec-owner-decision.test.mjs,
  ]
deciding_specs: []
---

# Knowledge contracts and decisions

## Purpose

A reviewer should be able to answer two questions without rereading old pull
requests:

1. What behavior has a human already decided?
2. Is this pull request making a new decision that needs a human?

## System model

Astryx keeps different facts in different places:

- Component contracts describe behavior one component promises.
- Family contracts describe behavior sibling components share.
- Design specs record human-owned visual and interaction decisions.
- System specs record decisions that cross components or change architecture.
- Consumer docs explain props, examples, and usage.
- Audit records hold current evidence and findings.

The reviewer starts with the changed code and the nearest current component
contract. They follow only the links needed for the question:

```text
changed code
  → nearest current component contract
  → relevant family or design requirement
  → architecture or system decision only when referenced
  → mapped tests and audit evidence
```

A current record may cite a previous human decision. When the new case is within
that decision's stated scope, the reviewer applies it without asking again.

Every record is either:

- `draft`: useful for review, but not a rule;
- `current`: explicitly approved and safe to rely on;
- `archived`: retained for history and linked to its replacement when one exists.

## Boundaries and invariants

- **INV1 — Current means approved.** Only `current` records guide implementation
  and review.
- **INV2 — One fact has one owner.** A component record does not copy family,
  design, consumer, or audit content.
- **INV3 — Existing decisions are reusable.** A reviewer cites an applicable
  decision and proceeds without asking the human again.
- **INV4 — New judgment is explicit.** A reviewer asks a human when no current
  decision applies, existing decisions conflict, or the choice is deliberately
  human-owned.
- **INV5 — Blank forms are not policy.** Templates only create drafts. Search
  and review never present template text as an approved Astryx decision.
- **INV6 — Required structure changes together.** Template wording may change
  without touching existing records. Adding or removing a required field or
  section must update every draft and current record in the same pull request.
- **INV7 — Only pure spec changes use lightweight CI.** Every changed file must
  be a component, family, design, or system spec. A change to code, architecture,
  templates, schemas, audits, or any unknown path runs normal CI.
- **INV8 — Private operations stay private.** Public records never name or link
  private release or automation systems.
- **INV9 — Current records have no implicit precedence.** A newer, narrower, or
  more local current record does not silently override another current record.

### When current records disagree

1. A draft is context only and cannot conflict with current policy.
2. Identify the canonical owner from the fact's scope: component behavior,
   family behavior, design representation, consumer usage, or audit evidence.
3. If two current records make different claims, review stops. Do not choose by
   recency, path proximity, or specificity; record a `novel-human` gap.
4. Resolve the gap by changing the canonical owner and removing the copied claim.
   A deliberate exception is recorded by that owner; affected records link to
   it instead of restating it.
5. A system-spec decision may authorize the change, but the current owning
   contract must change in the same pull request before reviewers rely on it.

## Change coupling

A document does not stay current by convention alone.

Before any component, family, design, or architecture record becomes `current`,
the repository must support this flow:

1. The record names the code surface that can affect it and the checks that
   verify it.
2. A pull request touching that surface triggers a focused contract review.
3. The review records one of four results:
   - `preserves`: the change still satisfies the current contract;
   - `settled`: an existing human decision applies and is cited;
   - `novel-human`: the contract needs a new human decision;
   - `out-of-scope`: another component, family, system, or product owns it.
4. `preserves` and `settled` proceed without asking the human again.
5. `novel-human` remains blocked until the owning record contains the new
   decision and receives approval.
6. Audit freshness is computed from the same code and test relationship, so a
   relevant code change cannot leave an audit looking current.

Examples:

- NumberInput changes its stepping math. Its current contract says the final
  operation clamps to `min`/`max`, and the mapped tests still pass. Result:
  `preserves`; no human question and no spec edit.
- A new NumberInput path uses the same previously approved transformation order.
  Result: `settled`; cite that `DEC` and continue without asking again.
- Selector removes empty indicator space, but no current decision says whether
  option labels must stay aligned. Result: `novel-human`; the reviewer asks the
  alignment question and records the answer in Selector's contract.
- A product requests a one-off width prop for a family-owned input layout rule.
  Result: `out-of-scope`; route the change to the family contract rather than
  creating a component-specific API.

A draft record cannot clear a review gap. Only a verified `current` contract or
an applicable decision can produce `preserves` or `settled`.

The bootstrap does not mark any component or family record current until this
flow passes the historical review benchmark and is enforced on pull requests.

## Owning code

- `AGENTS.md` points reviewers to the narrowest relevant record.
- `docs/templates/knowledge/` contains authoring forms.
- `docs/schemas/knowledge/` defines required structure.
- `scripts/check-knowledge.mjs` validates templates, records, and approval
  metadata.
- `.github/scripts/change-scope.cjs` identifies pure spec-record changes.
- `.github/workflows/spec-owner-gate.yml` binds approval to the exact pull
  request head and enables auto-merge only for pure spec changes.

## Deciding specs

### DEC-1 — Current-record conflicts do not resolve by precedence

**Reference:** `architecture:knowledge-contracts/DEC-1`
**Decider:** `cixzhang`, `2026-08-30`

A current record does not override another by being newer, narrower, or closer
to the code. Review stops, identifies the canonical owner, and resolves the
conflict there. Other records link to the owning decision rather than copying
it.

Rejected: silently choosing the newest or most specific record, because that
turns documentation order into unreviewed system policy.

## Verification

| Invariant                         | Evidence                                       | Failure signal                                                                                         |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| INV1, INV6                        | `scripts/check-knowledge.test.mjs`             | An unapproved current record or unmigrated active record passes                                        |
| INV5, INV7                        | `.github/scripts/change-scope.test.mjs`        | A template, schema, architecture, code change, unsafe rename, or truncated list qualifies as spec-only |
| Approval follows the current head | `.github/scripts/spec-owner-decision.test.mjs` | An approval for another commit clears the gate                                                         |
| INV3, INV4                        | Blinded historical review benchmark            | Reviewer re-asks a settled decision or invents a new one                                               |
