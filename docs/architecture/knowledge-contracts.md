---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:knowledge-contracts
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-01
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

- Component contracts describe aggregate behavior one component promises.
- Module contracts describe an independently contractible public hook, plugin,
  utility, or subsystem owned by one component. Private implementation helpers do
  not require records.
- Family contracts describe behavior sibling components share.
- Design specs record human-owned visual and interaction decisions, including the
  cross-theme accessibility and contrast methodology used to judge token/color
  pairings.
- Theme specs record one package theme's intent, inherited base, selected token
  and palette mappings, required pairings/states, theme-specific exceptions,
  measured receipts, known gaps, compatibility, and artifacts.
- System specs record decisions that cross components or themes or change architecture.
- Consumer docs explain props, examples, and usage.
- Audit records hold current evidence and findings.

The reviewer starts with the changed code and the nearest current component or
module contract. They follow only the links needed for the question:

```text
changed code or theme source
  → nearest current component, module, or theme contract
  → relevant family or design requirement
  → architecture or system decision only when referenced
  → mapped tests and audit evidence
```

A current record may cite a previous human decision. When the new case is within
that decision's stated scope, the reviewer applies it without asking again.

Theme records sit between shared theming architecture and downstream records.
Cross-theme API, vocabulary, inheritance, validation, compiler behavior, and
artifact policy remain in architecture or system specs. Cross-theme human visual
and accessibility methodology for contrast belongs in a current design record;
shared measurement/tool implementation belongs to architecture or tooling. One
theme's selected token/palette mappings, required pairings and states,
exceptions, measured receipts, known gaps, migration, and artifacts belong in
its package-local theme record. Components and families continue to own
observable behavior; consumer docs continue to own supported syntax and examples.

Every record is either:

- `draft`: useful for review, but not a rule;
- `current`: explicitly approved and safe to rely on;
- `archived`: retained for history and linked to its replacement when one exists.

## Boundaries and invariants

- **INV1 — Current means approved.** Only `current` records guide implementation
  and review.
- **INV2 — One fact has one owner.** A component or theme record does not copy
  family, design, system, consumer, audit, or tooling content. Cross-theme API and
  compiler behavior stay in architecture/system records; human contrast
  methodology stays in design; shared measurement implementation stays in
  architecture/tooling; theme-specific mappings, states, exceptions, receipts,
  and gaps stay in the package-local theme record; aggregate observable component
  behavior stays in component/family records; independently contractible public
  component-module behavior stays in module records; consumer syntax stays in
  consumer docs.
- **INV3 — Existing decisions are reusable.** A reviewer cites an applicable
  decision and proceeds without asking the human again.
- **INV4 — New judgment is explicit.** A reviewer asks a human when no current
  decision applies, existing decisions conflict, or the choice is deliberately
  human-owned.
- **INV5 — Blank forms are not policy.** Templates only create drafts. Search
  and review never present template text as an approved Astryx decision.
- **INV6 — Required structure changes per kind.** Template wording may change
  without touching existing records. Adding a new kind does not migrate unrelated
  kinds. Adding or removing a required field or section from an existing kind
  creates a later schema definition for that kind and migrates every active record
  of that kind in the same pull request.
- **INV7 — Only pure spec changes use lightweight CI.** Every changed file must
  be a component, module, family, design, theme, or system spec. A change to code,
  architecture, guidance, templates, schemas, audits, or any unknown path runs
  normal CI.
- **INV8 — Private operations stay private.** Public records never name or link
  private release or automation systems.
- **INV9 — Current records have no implicit precedence.** A newer, narrower, or
  more local current record does not silently override another current record.
- **INV10 — Admission follows a decision boundary.** Create a record only for an
  independent semantic surface with one owner, review triggers, and evidence.
  Otherwise amend the nearest current owner; a pull request, component, or
  investigation is not a record boundary by itself.
- **INV11 — Durable authoring is concise and normative.** New records and
  materially amended boundaries keep intent, ownership, normative contract,
  decisions, compatibility, relationships, and evidence links. They exclude review
  history, implementation narration, exhaustive test matrices, repeated shared
  rules, and copied audit evidence. Roughly 100–150 lines is useful guidance for an
  ordinary component or module record, never a validation gate. Extra length must
  serve one coherent behavior matrix that would lose meaning if split, not
  review-dossier prose. Existing current records remain authoritative until their
  boundary is amended; concision is a review signal, not retroactive invalidation.
- **INV12 — Consolidation moves shared facts upward.** When a rule repeats, move it
  to the canonical family, design, architecture, or system owner and replace lower
  copies with links in the same pull request.
- **INV13 — Freshness and retirement are graph changes.** A change that modifies a
  current contract updates its canonical record in the same pull request; a
  `preserves` result requires no spec edit. Removing or superseding a concept
  archives its record and migrates every inbound reference in that same pull
  request.
- **INV14 — Drafts and indexes are non-authoritative aids.** Drafts are review
  context; age prompts review but never automatic deletion. Indexes route to
  canonical records and never duplicate contract text.

### When current records disagree

1. A draft is context only and cannot conflict with current policy.
2. Identify the canonical owner from the fact's scope: aggregate component
   behavior, independent public module behavior, family behavior, design
   representation, one theme's semantics/mappings, cross-theme architecture,
   consumer usage, or audit evidence.
3. If two current records make different claims, review stops. Do not choose by
   recency, path proximity, or specificity; record a `novel-human` gap.
4. Resolve the gap by changing the canonical owner and removing the copied claim.
   A deliberate exception is recorded by that owner; affected records link to
   it instead of restating it.
5. A system-spec decision may authorize the change, but the current owning
   contract must change in the same pull request before reviewers rely on it.

## Change coupling

A document does not stay current by convention alone.

Before any component, module, family, design, theme, or architecture record becomes
`current`, the repository must support this flow:

1. The record names the code surface that can affect it and the checks that
   verify it.
2. A pull request touching that surface triggers a focused contract review.
3. The review records one of four results:
   - `preserves`: the change still satisfies the current contract;
   - `settled`: an existing human decision applies and is cited;
   - `novel-human`: the contract needs a new human decision;
   - `out-of-scope`: another component, module, family, system, or product owns it.
4. `preserves` and `settled` proceed without asking the human again.
5. `novel-human` remains blocked until the owning record contains the new
   decision and receives approval.
6. Audit freshness is computed from the same code and test relationship, so a
   relevant code change cannot leave an audit looking current.

### Recording a new human decision

1. A contributor explains the intended behavior in normal pull-request language
   and responds to review. They do not need to know the repository's spec system.
2. A reviewer or agent identifies any `novel-human` question. The contributor
   does not invent the answer.
3. An authorized owner answers in the pull-request review.
4. A maintainer or agent records that ruling in the canonical owning record.
   - Prefer a commit in the same pull request when maintainers can update the
     branch.
   - If they cannot update the contributor branch, open a small linked spec pull
     request below it and rebase the implementation after that decision lands.
   - If the direction is accepted, the contributor updates the code when needed.
   - If the direction is rejected, the rejected implementation is removed or
     changed. Record the rejected alternative only when the boundary is
     consequential and likely to come up again.
5. The final commits invalidate prior approval. The owner approves the exact
   heads after the record and implementation agree.

If no implementation direction is accepted, close the contributor pull request.
The maintainer-owned spec pull request remains only when the ruling is useful
independently.

Review comments are evidence of the conversation; the checked-in record is the
canonical decision.

Record the durable outcome, not the review transcript. A ruling belongs in a
canonical record when at least one is true:

- it changes or clarifies an owning component, module, family, or system boundary;
- it establishes a requirement or prohibition future work must preserve; or
- it rejects an alternative that is consequential and likely to recur.

A prop name, implementation mechanism, or failed visual experiment from an
abandoned pull request stays in review history unless that detail itself passes
this test.

Use a separate lower spec pull request only when the ruling changes a shared
contract beyond the contributor change and should land or be reused
independently. The implementation pull request then rebases onto that decision.

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

The bootstrap does not mark any component, module, or family record current until
this flow passes the historical review benchmark and is enforced on pull requests.

## Owning code

- `AGENTS.md` points reviewers to the narrowest relevant record.
- `docs/templates/knowledge/` contains authoring forms.
- Component records are direct `<PublicName>.spec.md` children of a Core or Lab
  component root. The public name normally matches the root; a parent/member
  exception requires an exact top-level or full inline consumer-doc entry in
  that root. Public semantic module records are nested at least one directory
  beneath the same root as `<PublicName>.spec.md`; the parent component's
  `modules` list and the module's `parent_component` field must agree. Hidden,
  fixture, test, generated, build-output, coverage, dependency, and
  `*.generated.spec.md` paths are ignored consistently by discovery and PR
  routing.
- `packages/themes/<theme>/<theme>.spec.md` contains that package theme's
  canonical record; `docs/themes/README.md` is guidance and an index only.
- `docs/schemas/knowledge/` defines required structure.
- `scripts/check-knowledge.mjs` validates templates, records, and approval
  metadata.
- `.github/scripts/change-scope.cjs` identifies pure spec-record changes.
- `.github/workflows/spec-owner-gate.yml` binds approval to the exact pull
  request head. Theme approval derives from the committed union of
  `.github/ENGOWNERS` and `.github/DESIGNOWNERS`; record metadata never
  self-authorizes. The workflow enables auto-merge only for pure spec changes.

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

### DEC-2 — New rulings normally stay in the contributor pull request

**Reference:** `architecture:knowledge-contracts/DEC-2`
**Decider:** `cixzhang`, `2026-08-30`

A human ruling is normally discussed in the pull request that exposed the gap.
The contributor is responsible for explaining intent and changing their code;
maintainers and review agents are responsible for the spec system. They record
the ruling in the same branch when possible, or in a small linked lower spec PR
when the contributor branch cannot be updated. Rejected implementation is
removed or changed; a rejected alternative is recorded only when it protects a
consequential boundary from being debated again. Final exact-head approval
attests that the decision and implementation agree.

Rejected: requiring the owner to open a second pull request for every ruling,
because it separates the answer from the change and adds unnecessary review
work.

### DEC-3 — Records follow one durable decision boundary through their lifecycle

**Reference:** `architecture:knowledge-contracts/DEC-3`
**Decider:** `cixzhang`, `2026-09-01`

Admit a record only when one independent semantic surface can name its owner,
triggers, and evidence. During exploration, drafts and open questions may carry
review context. Once settled, fold the durable answer into the canonical current
owner, archive or supersede transient material, and migrate inbound references.
Repeated shared rules move upward; lower records and indexes link instead of copy.
A change that modifies the durable contract updates its canonical current owner in
the same pull request; a change classified `preserves` requires no spec edit.

Rejected: record-per-pull-request or record-per-artifact filing, deleting drafts by
age, duplicating contract text in indexes, and splitting one coherent behavior
matrix merely to satisfy a line target. Those choices trade navigation and review
clarity for dossier churn.

## Verification

| Invariant                         | Evidence                                       | Failure signal                                                                                                                                      |
| --------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV1, INV6                        | `scripts/check-knowledge.test.mjs`             | An unapproved current record or unmigrated active record passes                                                                                     |
| INV5, INV7                        | `.github/scripts/change-scope.test.mjs`        | A template, schema, guidance, architecture, code change, unsafe rename, or truncated list qualifies as spec-only                                    |
| Approval follows the current head | `.github/scripts/spec-owner-decision.test.mjs` | An approval for another commit clears the gate, a self-declared owner becomes an approver, or the wrong owner group approves a current theme record |
| INV3, INV4                        | Blinded historical review benchmark            | Reviewer re-asks a settled decision or invents a new one                                                                                            |
| INV10–INV14                       | Owner review                                   | A new or amended record has no independent owner/triggers/evidence, copies another owner, carries dossier prose, or leaves stale references         |
