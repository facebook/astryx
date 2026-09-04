---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-029
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:knowledge-contracts]
affects_families: []
affects_contributing: [contributing:component-specs]
affects_consumer_docs: []
---

# Component audit contract backfill and auto-merge system spec

## Intent

Make whole-component audits painless and safe to automate. Every public component
in a registered component-bearing package begins from a complete repository
contract. A Night Watch audit may backfill that contract and repair objective gaps
in one pull request, then auto-merge only when the exact head contains no new
product judgment.

## Non-goals

- Add, improve, remove, or reinterpret behavior while backfilling a spec.
- Replace grading, promotion, or review-mode issue and ledger rules.
- Use line, branch, or statement coverage percentages as proof of contract quality.
- Auto-merge public API, compatibility, ownership, or subjective design decisions.
- Decide the final general-purpose test-quality rubric; this record establishes the
  evidence gate needed for observational backfills.

## Terms

- **Observational backfill:** a component contract derived from verified shipped
  behavior without changing what the component promises or does.
- **Closed evidence matrix:** one or more rows cover every public concept and every
  reachable state or transition; every claim names its source and verification,
  and every empty or conflicting cell is an explicit gap.
- **Objective remediation:** a change whose required result is already settled by
  a current shared record, objective standard, or the component's verified local
  behavior.
- **Manual boundary:** a change requiring judgment about public API, compatibility,
  ownership, or subjective design.

## Requirements

- **FR1 — One component-package registry.** Audit roster generation, sandbox
  display, component-spec path classification, knowledge discovery, and validation
  MUST consume one checked-in registry of component-bearing packages. The initial
  registry contains Core, Lab, Charts, Rich Text, and Vega. Adding a package there
  MUST make its public components visible to the queue and sandbox without another
  hand-maintained roster.
- **FR2 — Public component discovery is structural.** Directory-layout packages
  discover rendering component roots. Flat packages discover a component only
  when `src/index.ts` exports a PascalCase symbol matching a colocated TSX module.
  Private helpers and hooks whose exported name does not match the module MUST NOT
  become audit rows.
- **FR3 — Every public component has a canonical spec location.** Directory-layout
  packages use `src/<ComponentRoot>/<PublicName>.spec.md`. Flat packages use
  `src/<PublicName>.spec.md`. Independently contractible modules remain nested
  beneath the owning component namespace and link both ways with the parent.
- **FR4 — Backfills are observational only.** A backfill MUST describe verified
  shipped behavior and MUST NOT add, improve, remove, or reinterpret behavior.
  Proposed behavior remains an explicit open question or separate decision.
- **FR5 — Completeness is closed-world.** Before approval, the backfill MUST name
  every public concept and reachable state or transition in a closed evidence
  matrix. Each contract claim MUST link the relevant export/source, existing
  tests, consumer docs, story or rendered evidence, and applicable current shared
  owner or objective standard. Missing evidence MUST be a named gap.
- **FR6 — Local implementation breaks local ties.** When component-local source,
  tests, docs, and rendered behavior disagree, verified implementation defines the
  observational baseline. The audit fixes stale local tests, docs, and evidence to
  match it. This rule does not override FR7.
- **FR7 — Shared authority overrides local implementation.** A current family,
  design, architecture, theme, or system record, and an objective external
  standard within its stated scope, overrides conflicting component
  implementation. The component behavior is a fixable audit defect; the backfill
  MUST NOT canonize the violation.
- **FR8 — Backfills become reusable only after approval.** An evidence-complete
  observational backfill MAY become `authority: current` after normal exact-head
  owner approval. A draft cannot clear an audit finding as settled policy.
- **FR9 — One Night Watch pull request may contain objective remediation.** The PR
  MAY combine the observational backfill with missing behavior tests, stable
  visual-regression coverage, consumer-doc drift fixes, and implementation bug
  fixes required by FR6 or FR7. The PR MUST separate baseline evidence from each
  remediation's before/after proof.
- **FR10 — Four boundaries require manual review.** A pull request is not
  auto-merge eligible when it changes public API meaning or shape, a default or
  compatibility/migration promise, an ownership boundary or conflict between
  current records, or a subjective representation, proportion, density, or
  interaction-feel decision.
- **FR11 — Auto-merge fails closed.** An eligible Night Watch PR MUST have a closed
  evidence matrix, exact-head spec-owner approval, required local checks, green CI
  and review signals, no unresolved manual boundary, no unrelated cleanup, and
  before/after evidence for every remediation. Any missing condition keeps the PR
  open for human review.
- **FR12 — Audit modes remain distinct.** The shared prompt MUST follow the selected
  rubric mode. Night Watch retains its no-per-finding-issue and post-fix ledger
  procedure. Grading and promotion retain their existing per-BLOCK issue and
  recording requirements. This migration MUST NOT silently impose one mode's
  lifecycle on another.
- **FR13 — Ledger and sandbox remain decoupled.** The wiki JSON remains the stored
  score ledger. The sandbox derives its roster from FR1, fetches current scores at
  runtime, and shows every registered component without requiring a deployment for
  a score update.
- **FR14 — Test evidence proves contract claims.** Every promised behavior and
  reachable state MUST map to a verification layer capable of observing it.
  Deterministic behavior tests, browser visual regression, accessibility evidence,
  and consumer-doc checks are complementary. A coverage percentage or snapshot
  count alone MUST NOT satisfy a contract claim.

- **FR15 — Activation is atomic and separately approved.** While this record is
  `draft`, the audit prompt and wiki MUST label the evidence matrix and auto-merge
  path as proposed, and every audit PR remains manual-review-only. Promotion to
  `current` MUST land with a component template/schema version that validates the
  matrix, migration of active component records, updated prompt/wiki text, and the
  exact-head owner approval required by the knowledge contract. No partial rollout
  may make draft requirements behave as authority.

### Platform support

- Supported feature/engine floor: repository-supported Node, browsers, and CI.
- Unsupported behavior: a package with no valid registry shape or spec location
  fails validation rather than disappearing from the roster.
- Browser evidence: visible and interaction claims use the real-browser evidence
  required by the audit rubric and applicable current records.

## Current-state impact

- `scripts/component-packages.cjs` becomes the shared package/layout registry.
- `scripts/score-ledger.mjs` and sandbox generation consume that registry.
- Component knowledge path classification and validation accept every registered
  package layout.
- `docs/contributing/component-specs.md` becomes the maintained observational
  backfill and auto-merge guide.
- The public wiki records Night Watch procedure and mode-specific audit mechanics;
  product authority remains in repository records.

## Verification

| Contract | Verification                                                     | Representative states                                                               | Mutation or failure expectation                                                             |
| -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| FR1–FR3  | Registry, path-classifier, knowledge-discovery, and roster tests | Core/Lab directory packages; Charts/Rich Text/Vega flat packages; private helpers   | A public component disappears, an unsupported path validates, or queue and sandbox diverge. |
| FR4–FR8  | Component-spec guide review plus fixture specs and owner gate    | complete observation; missing evidence; local drift; shared-contract violation      | Proposed behavior is canonized, a current shared rule loses, or a draft clears review.      |
| FR9–FR12 | Prompt snapshot, audit-mode review, and PR eligibility fixtures  | safe objective fix; API/default/ownership/design change; grading versus Night Watch | An unsafe PR auto-merges or one mode receives another mode's issue/ledger lifecycle.        |
| FR13     | Sandbox generation and runtime-ledger tests                      | new package/component; unaudited row; new score without rebuild                     | A component needs a second roster edit or a score requires redeployment.                    |
| FR14     | Verification-map review and representative mutation tests        | behavior, visual, accessibility, and docs claims                                    | A claim passes from a layer that cannot observe it or from percentage alone.                |
| FR15     | Draft-state prompt/wiki tests plus schema-migration review        | draft proposal; approved atomic activation; missing migration                        | Draft rules authorize auto-merge or activation lands without enforceable matrix validation. |

## Decision log

### DEC-1 — Evidence-complete observational backfills may become current

**Reference:** `spec:AST-029/DEC-1`
**Decider:** `cixzhang`, `2026-09-06`

A backfill that only records verified shipped behavior and closes its evidence
matrix may become current after exact-head owner approval. This creates reusable
contract coverage without turning the audit into feature design.

Rejected: keeping every backfill permanently draft, because later audits could not
rely on it and the same behavior would be re-derived repeatedly.

### DEC-2 — Implementation wins local conflicts; current shared authority wins scope conflicts

**Reference:** `spec:AST-029/DEC-2`
**Decider:** `cixzhang`, `2026-09-06`

Verified implementation defines component-local observation when local tests or
docs drift. Current shared records and objective standards still govern their
scope, so violations are fixed rather than canonized.

### DEC-3 — Safe backfill and objective remediation travel in one PR

**Reference:** `spec:AST-029/DEC-3`
**Decider:** `cixzhang`, `2026-09-06`

One audit PR may backfill the contract and fix settled bugs, missing tests,
visual-regression gaps, and doc drift. Exact-head approval plus the fail-closed
auto-merge gate protects the boundary.

## Open questions

- **OQ1 — General component-test quality rubric.** (`human-design`) Define the
  repository-wide quality, completeness, consistency, mutation, and evidence-layer
  rubric beyond the closed matrix required here.
- **OQ2 — Automatic eligibility report.** (`checkable`) Decide whether the PR gate
  should emit a machine-readable auto-merge eligibility receipt and schema.
