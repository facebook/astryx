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
applies_to:
  [
    AGENTS.md,
    .github/PULL_REQUEST_TEMPLATE/,
    docs/,
    packages/core/src/,
    packages/lab/src/,
  ]
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
- Audit records hold current evidence and findings. The operational store is the
  automated wiki `component-scores.json`, which supplies the current post-fix score
  and unresolved findings to the sandbox. The bootstrap reserved colocated
  `<PublicName>.audit.json` files, but no schema or records activated that path; it is
  not an audit datastore or current migration target.

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
- **INV10 — Records describe ideal behavior, not pull-request verdicts.** A current
  record states durable requirements, prohibitions, compatibility, ownership, and
  evidence independently of any one implementation change. It never exists to
  approve a pull request and never approves, rejects, classifies, designates, or
  authorizes a specific one. Pull requests and issues may appear only as clearly
  non-authoritative examples, historical evidence, or references; the rule must
  remain complete without them. The reviewer owns each change's disposition
  against current authority.
- **INV11 — Every public delta has an authority result.** Every public API update
  and every public behavior change is matched to current committed authority
  before acceptance. Package-export shape is not the only trigger: reachable
  supporting types, context members, hook returns, defaults, and observable
  behavior participate too.
- **INV12 — Audit state has one automated datastore.** Wiki
  `component-scores.json` is the operational source for current scores and
  unresolved findings. The unactivated `<PublicName>.audit.json` convention is
  retired. A future storage change requires an explicit system decision, versioned
  data contract, automated migration and reconciliation, sandbox-reader cutover,
  and rollback evidence; it MUST NOT create per-component shadow ledgers by
  convention.
- **INV13 — Authors search before creating authority.** Before creating or
  materially expanding a record, search current records and open pull requests by
  proposed canonical owner/id, affected paths and exported symbols, and semantic
  behavior terms. Extend or project the existing canonical owner by default. A new
  record requires a distinct fact boundary and an explicit explanation of why no
  existing owner can contain it. Open pull requests coordinate overlapping work;
  they remain non-authoritative evidence.
- **INV14 — Current authority is claim-scoped.** `authority: current` approves the
  explicit claims inside a record's stated ownership boundary. It does not promise
  that every behavior of the named component, module, family, or code path has been
  specified. Review MUST NOT expand one narrow decision into adjacent uncontracted
  behavior unless the pull request's exact delta depends on that behavior.
- **INV15 — Review contracts toward one landing-ready intent.** Authors identify one
  primary intent and reviewers classify each observable delta separately. A
  separable delta that violates current authority or requires a new human decision
  is removed or split before review asks the primary change to carry new authority.
  A specification is the path for an intentional durable decision, not the default
  remedy for unrelated scope discovered during review.
- **INV16 — Specs govern; generated review context only informs.** Committed current
  component, module, family, design, theme, architecture, and system records own
  intended product behavior. Reviewer-generated summaries, sections, checklists,
  tests, screenshots, measurements, and recommendations are context or evidence
  only. They may prove conformance, contradiction, or an implementation defect;
  they MUST NOT invent direction, authorize a delta, reverse a human hold, or
  upgrade the authority result.
- **INV17 — Missing review context stays problem-bound.** Review reads the pull
  request and current authority first, then fills only missing context. It traces
  why the problem occurs, why it harms the affected task, and why the harm matters;
  maps the proposed solution and each primary or supporting delta back to that
  problem; and identifies independently removable tagalongs. Product impact remains
  owned by the applicable product record. Review may explain who is affected, in
  what supported state, and what the change enables or prevents, but that generated
  explanation remains context until a current canonical owner records the behavior.
- **INV18 — Product contracts preserve implementation freedom.** Component, module,
  family, design, theme, and system specifications own observable inputs, outputs,
  states, guarantees, failures, compatibility, and caller-visible ownership. A new
  or materially amended requirement MUST NOT prescribe internal modules, files,
  function names, algorithms, data structures, storage layouts, manifests,
  journals, locks, transaction protocols, or CI job/workflow topology unless that
  exact mechanism is itself an intentional public contract. Internal ownership,
  seams, and mechanisms belong in an architecture record. A verification map names
  evidence sufficient to prove a claim; it does not authorize the implementation or
  CI structure that produces it. Existing current records continue to govern their
  explicit claims until their human owner deliberately migrates them; this invariant
  does not silently invalidate or reinterpret those records.
- **INV19 — Automated spec review informs a human decision.** A pull request whose
  primary intent creates, amends, adopts, or supersedes a product contract receives
  written advisory analysis before the named human owner decides it. The analysis
  identifies the canonical knowledge owner, applicable current claims, overlapping
  current and open work, ownership collisions or missing owners, claim-scope gaps,
  behavior-versus-architecture leakage, and exact claims to keep, remove, move, or
  clarify. Automation may report contradictions, evidence gaps, and proposed edits;
  it MUST NOT approve, adopt, ratify, or make the contract current. A human approval
  remains required even when the advisory analysis finds no defect.

## Writing specifications and contracts

These rules guide writing. They do not permit semantic compaction. They come from
directional evidence and project-owner judgment; the agent benchmark did not
measure human readability, so this is not a quantified readability claim.

Before writing:

1. Search current records for the behavior, public symbols, affected paths, and
   proposed canonical owner/id.
2. Search open pull requests for the same owner path, symbols, and semantic terms.
3. Update the canonical owner or coordinate with the overlapping work. Create a
   new record only when the fact has a distinct owner and explain that boundary in
   the pull-request summary.

Then write the contract:

- Use familiar words and short, direct sentences.
- State each rule once, beside the conditions and exceptions that control it.
- Contract only the semantic slice being decided. Name adjacent behavior as a
  non-goal or uncontracted gap; do not fill it merely to make the record `current`.
- Use readable tables for branches or state matrices when they improve scanning.
  Never remove contract content merely to shorten a record.

Plain language must preserve normative force, predicates, cardinality, defaults,
compatibility, authority, owners, IDs, evidence state, and decision status. Do not
delete, weaken, merge, or hide distinct normative content. Replace a local fact
with a link only when this record's ownership rules assign that fact to another
canonical owner.

Qualifiers and authority verbs are contract semantics, not polish. Words such as
`only`, `every`, `consistently`, `current`, `records`, `owns`, `delegates`, and
`inherits` MUST NOT be dropped, generalized, weakened, or upgraded during a
rewrite. When reshaping a rule, keep its action, activating conditions,
exceptions or non-goals, owner, and evidence state in the same row or bullet as
the claim they limit.

Aim to keep a single specification record at or below 200 lines. This is a soft
readability ceiling, not a schema rule, validation gate, deletion target, or
reason to migrate accepted history. Exceed it when the full contract, exact
conditions, evidence boundaries, decisions, or required template structure need
more room. First remove true duplication, shorten prose without changing meaning,
use readable tables or lists, and link genuinely shared authority as INV2
requires. If the record still exceeds 200 lines, keep the content and explain why
in pull-request review. Do not minify tables or paragraphs to game the count;
human scanability wins.

### Same rule, plainer form

Dense:

> When `items` contains exactly one visible item, the component MUST announce that
> item exactly once; when `items` contains zero or more than one visible item, it
> MUST NOT announce an item, and consumers that omit `items` MUST retain the
> existing silent behavior.

Plain:

| Condition                           | Required behavior                       |
| ----------------------------------- | --------------------------------------- |
| `items` is omitted                  | MUST keep the existing silent behavior. |
| Exactly one visible item is present | MUST announce that item exactly once.   |
| Zero or more than one is present    | MUST NOT announce an item.              |

The plain version changes the shape, not the meaning.

### Before review

- [ ] Compare the edited text with its source and confirm that every contract
      property named above remains explicit.
- [ ] Confirm each rule's action, conditions, qualifiers, exceptions or non-goals,
      owner, authority verb, and evidence state remain explicit and adjacent to the
      claim they limit.
- [ ] Confirm tables and lists improve scanning without hiding content; if the
      record exceeds 200 lines, explain why it needs the extra space.

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
3. Review starts from the pull request's declared primary intent and classifies
   each public delta independently as one of five results:
   - `preserves`: the exact delta restores or retains current authority without
     adding public API or behavior beyond it;
   - `settled`: an existing current human decision covers the exact delta and is
     cited;
   - `violates`: the exact delta contradicts current authority;
   - `novel-human`: no current authority settles the exact public API, behavior,
     ownership, compatibility, or design delta; or
   - `out-of-scope`: another component, module, family, system, or product owns it.
4. `preserves` and `settled` enter normal correctness review. They are eligible
   for approval only when the implementation and evidence also pass.
5. `violates` receives request-changes with the smallest conforming remedy:
   change or remove the violating delta. Review does not recommend a specification
   merely to rescue contradictory implementation; an owner may separately choose
   to propose a policy change.
6. A separable `novel-human` tagalong is removed or split from the primary intent.
   Review may request that contraction without deciding the tagalong's semantics,
   then continue reviewing the remaining change. A `novel-human` delta enters a
   private human hold only when it is the primary intent, is inseparable from it,
   or the author or owner explicitly chooses to pursue it.
7. A bug fix is `preserves` only when it restores existing current authority
   without changing public API or public behavior beyond that contract. Any
   separable API, visual, layout, or interaction tagalong follows step 5 or 6
   rather than making the restoration wait for a broader specification.
8. A visual correction may be `preserves` or `settled` when current component,
   family, design, theme, or objective accessibility authority covers its exact
   outcome. Real rendered evidence must prove the affected state and representative
   unchanged states. A new visual representation remains `novel-human`; calling it
   an improvement does not settle it.
9. Audit freshness is computed from the same code and test relationship, so a
   relevant code change cannot leave an audit looking current.

Audit-storage migration is a separate contract change. It requires a versioned
data contract, automated conversion and reconciliation of existing wiki rows, a
named source of truth during transition, sandbox-reader cutover, and rollback
evidence. Repository-local per-component files are not a migration plan by
themselves.

### Contract before escalation

Review and build should converge on the smallest ideal change that can land:

1. State the pull request's primary intent and partition its observable deltas.
2. Apply current authority to each delta. Existing design and objective standards
   can settle a visual correction even when a component record does not enumerate
   its exact paint.
3. For a contradiction, conform or remove it. Do not propose changing the
   specification unless changing policy is itself an intentional, separately
   reviewable goal.
4. For an unsettled but separable delta, remove or split it. Continue the primary
   change without asking the contributor to solve adjacent system design.
5. Escalate only a surviving, intentional `novel-human` delta. Record only the
   exact decision needed for that delta; adjacent module behavior may stay
   uncontracted.

The actionable review result names the acceptance criteria for that landing-ready
contraction. It does not merely report that authority is missing.

### Recording a new human decision

1. A contributor explains the intended behavior and primary intent in normal
   pull-request language and responds to review. They do not need to know the
   repository's spec system.
2. A reviewer or agent applies the contraction path above. Only a surviving,
   intentional `novel-human` question proceeds; the contributor does not invent
   the answer or specify unrelated adjacent behavior.
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
  `preserves`; continue to normal correctness review with no human question.
- A new NumberInput path uses the same previously approved transformation order.
  Result: `settled`; cite that `DEC` and continue to normal correctness review.
- A package-exported context changes a required function parameter while its
  current contract preserves the earlier operation shape. Result: `violates`;
  request the smallest conforming change. A new compatibility policy is a separate
  proposal, not the default repair.
- A scroll-overflow fix also introduces a new hover disclosure. The overflow
  restoration proceeds under its current layout authority. If disclosure lacks
  authority, remove or split that separable visual tagalong; do not require the bug
  fix to specify the whole interaction module.
- Selector removes empty indicator space as its primary intent, but no current
  decision says whether option labels must stay aligned. Result: `novel-human`;
  hold privately while the owner decides the exact alignment contract.
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
- Wiki `component-scores.json` is the current operational audit datastore. The
  historical `<PublicName>.audit.json` reservation never received a schema or active
  records and is retired by INV12.
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

### DEC-3 — Search overlapping authority before writing

**Reference:** `architecture:knowledge-contracts/DEC-3`
**Decider:** `cixzhang`, `2026-09-07`

Before drafting a new record or materially expanding one, search current records
and open pull requests using more than the proposed title: canonical owner/id,
affected paths, exported symbols, and semantic behavior terms. Extend or project
the canonical owner when the fact already belongs there. Create a new record only
for a distinct fact boundary and explain why the existing owner cannot contain it.

Rejected: searching only filenames or landed records. Semantic overlap may use a
different title, and open work may already be changing the same owner before it
lands. Open pull requests coordinate work and provide evidence; they do not become
authority.

### DEC-4 — Contraction precedes new authority

**Reference:** `architecture:knowledge-contracts/DEC-4`
**Decider:** `cixzhang`, `2026-09-11`

When an otherwise reviewable change carries a separable contradiction or unsettled
decision, remove or split that delta and keep the primary intent moving. Recommend
a specification only when the surviving delta is intentionally pursued as durable
behavior, not because review discovered adjacent incompleteness.

Rejected: turning every uncontracted tagalong into a specification project, because
that makes a narrow repair absorb unrelated design work and leaves the contributor
without a landing-ready path.

### DEC-5 — Current approval is claim-scoped

**Reference:** `architecture:knowledge-contracts/DEC-5`
**Decider:** `cixzhang`, `2026-09-11`

A current record authorizes only its explicit claims within its stated ownership
boundary. It may deliberately leave adjacent behavior uncontracted. Reviewers do
not treat `current` as certification that a whole component or public module is
fully specified, and do not demand unrelated coverage before applying a narrow
approved decision.

Rejected: requiring a narrow visual or behavior decision to contract every API,
composition, accessibility, and implementation fact of the named module.

### DEC-6 — Product specs govern; generated review context informs

**Reference:** `architecture:knowledge-contracts/DEC-6`
**Decider:** `cixzhang`, `2026-09-12`

Committed current product records decide intended behavior. A review begins with
those claims and uses generated context, checklists, tests, screenshots,
measurements, and recommendations only to prove conformance, contradiction, or a
concrete defect. Generated completeness and green checks never create authority or
upgrade the authority result.

When the pull request or current record leaves context implicit, review may fill the
gap by tracing the problem through three why questions, mapping the solution back to
that problem, and naming tagalongs. It may also explain affected users, supported
states, enabled or prevented behavior, and caller burden. Those explanations remain
context unless the canonical product owner records them as current behavior.

Rejected: treating a complete review form, persuasive impact story, or passing
validation matrix as an alternative source of product direction.

### DEC-7 — Product specs contract behavior, not internal architecture

**Reference:** `architecture:knowledge-contracts/DEC-7`
**Decider:** `cixzhang`, `2026-09-12`

A new or materially amended product specification states the observable contract a
conforming implementation must satisfy and leaves equivalent internal implementations
free. It names an exact mechanism only when callers or interoperating systems
intentionally depend on that mechanism as public behavior. Otherwise, internal
ownership and seams belong in an architecture record, and verification remains
evidence rather than a prescribed CI or test topology.

This authoring rule is prospective. Existing current records retain their explicit
authority until the named human owner migrates them; adding this rule cannot silently
void a requirement such as a legacy implementation constraint. When an amendment
touches such a requirement, the owner either demonstrates that the mechanism is
publicly observable or moves it to the applicable architecture record.

Rejected: promoting a successful prototype's module graph, algorithm, manifest,
journal, lock, transaction design, filesystem layout, or CI job into product
requirements merely because that implementation supplied the decision evidence.

### DEC-8 — Spec review is advisory analysis for the human owner

**Reference:** `architecture:knowledge-contracts/DEC-8`
**Decider:** `cixzhang`, `2026-09-12`

Automated review of a specification does not stop at routing the change to a human.
It first produces written, evidence-backed feedback about the canonical owner,
existing and overlapping claims, ownership collisions, claim scope, misplaced
architecture, and exact contract edits. That analysis helps the human owner inspect
the decision; it never substitutes for the owner's approval or becomes authority.

Rejected: automatically approving a specification because its checks are green, or
returning only “needs human” without giving the owner the contract and ownership
analysis already available to the reviewer.

## Verification

| Invariant                         | Evidence                                                    | Failure signal                                                                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV1, INV6                        | `scripts/check-knowledge.test.mjs`                          | An unapproved current record or unmigrated active record passes                                                                                                                                       |
| INV5, INV7                        | `.github/scripts/change-scope.test.mjs`                     | A template, schema, guidance, architecture, code change, unsafe rename, or truncated list qualifies as spec-only                                                                                      |
| Approval follows the current head | `.github/scripts/spec-owner-decision.test.mjs`              | An approval for another commit clears the gate, a self-declared owner becomes an approver, or the wrong owner group approves a current theme record                                                   |
| INV3, INV4, INV11                 | Blinded historical review benchmark                         | Reviewer re-asks a settled decision, invents a new one, approves an unsettled public delta, or treats a contradiction as preserves                                                                    |
| INV10                             | Record-content and review-disposition fixtures              | A spec assigns a PR verdict, or a reviewer treats a PR link as authority                                                                                                                              |
| INV13                             | Blinded spec-authorship fixture plus overlap-search receipt | An author creates parallel authority, searches only landed records or filenames, misses open work on the canonical owner, or treats an open PR as authority                                           |
| INV14, INV15                      | Narrow-decision and mixed-intent review fixtures            | A current visual slice is forced to contract its whole module, a separable tagalong blocks a repair, or review reports a gap without a landing-ready remedy                                           |
| INV16, INV17                      | Spec-first review and missing-context fixtures              | Generated checklist completeness overrides authority, review invents product direction, restates supplied context, or fails to identify an unrelated tagalong or affected caller state                |
| INV18                             | Spec-review mechanism analysis plus owner migration receipt | A new/amended product spec requires a private mechanism without proving it is public, silently invalidates an existing current record, or leaves touched architecture wording in the product contract |
| INV19                             | Spec-review ownership-collision receipt and human decision  | Automated review approves a product contract, omits current/open owner overlap, misses a collision or architecture leak, or returns only a human hold without actionable written analysis             |

Current enforcement gap: no checked-in gate yet proves the open-pull-request
search. Until one exists, the pull-request summary records the search terms,
canonical owner/path, and overlapping open work inspected.
