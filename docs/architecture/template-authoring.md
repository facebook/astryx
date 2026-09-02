---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:template-authoring
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [josephfarina, cixzhang]
applies_to:
  [
    packages/cli/assets/templates/,
    packages/cli/authoring/doctypes/template/,
    packages/cli/foundation/discovery/template-adapter.mjs,
    apps/docsite/src/components/templateComponents.ts,
  ]
verified_by:
  [
    packages/cli/authoring/doctypes/template/parse.test.mjs,
    packages/cli/foundation/discovery/template-adapter.test.mjs,
    packages/cli/api/template/template.test.mjs,
  ]
deciding_specs: []
---

# Template authoring architecture

> Draft: the governance rules below require exact-head owner approval before
> this record can become `current`.

## Purpose

Define the durable authoring, ownership, evidence, and compatibility contract
for page templates and blocks. This uses the existing `architecture` kind.

## System model

- A template unit is its [source and metadata](../../packages/cli/assets/templates/),
  [authoring type](../../packages/cli/authoring/doctypes/template/type.ts),
  [discovery](../../packages/cli/foundation/discovery/template-adapter.mjs), and
  required [docsite registration](../../apps/docsite/src/components/templateComponents.ts).
  Those parts ship together at one head.
- Design owns human visual and interaction intent. `josephfarina`, the existing
  `packages/cli` owner, owns authoring, runtime/generation, package correctness,
  discovery, and CLI integration. Changes crossing both boundaries need both
  approvals.
- Every page and block is evaluated against the current
  [Template Grading Rubric](https://github.com/facebook/astryx/wiki/Contributing-Templates#template-grading-rubric).
  Rubric revisions follow their own review/versioning process and do not require
  this record to change unless ownership or governance semantics change.
- Every scorecard or ledger row pins the exact template head and exact rubric
  commit or revision used. Scores and artifacts are evidence, not approval, and
  later rubric revisions do not silently change prior scores.

## Boundaries and invariants

- **INV1 — Complete unit.** Source, metadata, discovery, and required registration
  MUST agree at one head.
- **INV2 — Separate approvals.** Design and implementation approval are distinct;
  neither substitutes for the other.
- **INV3 — Local behavior.** Membership, states, interactions, and constraints
  stay local unless a separate shared contract is approved.
- **INV4 — No implicit wizard family.** [#5797](https://github.com/facebook/astryx/pull/5797)
  and [#5798](https://github.com/facebook/astryx/pull/5798) remain independent;
  `design:template-composition` supplies only shared composition intent.
- **INV5 — Compatible identity.** A template ID is a public lookup key. Rename or
  removal requires an explicit compatibility and migration plan.
- **INV6 — Exact-head evidence.** Validation, scorecards, artifacts, and approvals
  identify the exact template head; scorecards also identify the rubric revision.

## Change coupling

- Source or metadata changes require local behavior, current-rubric, package, and
  CLI validation; visual or interaction changes also require Design review.
- Authoring, discovery, registration, runtime, or CLI changes require focused
  implementation-owner review and tests.
- Shared behavior or membership requires a separately approved contract.
- Rubric changes follow rubric governance and preserve prior pinned scores.

## Owning code

- [Template source and metadata](../../packages/cli/assets/templates/)
- [`TemplateDoc` authoring contract](../../packages/cli/authoring/doctypes/template/type.ts)
- [Template discovery](../../packages/cli/foundation/discovery/template-adapter.mjs)
- [Template CLI](../../packages/cli/api/template/template.mjs)
- [Docsite registration](../../apps/docsite/src/components/templateComponents.ts)
- [Template Grading Rubric](https://github.com/facebook/astryx/wiki/Contributing-Templates#template-grading-rubric)
- [Design composition intent](../design/template-composition.md)

## Deciding specs

### Proposed owner-review direction — 2026-09-02

Proposed by `cixzhang`: require separate Design and `josephfarina` approvals when
both boundaries change; treat scores only as pinned evidence; keep #5797/#5798
behavior local. This draft does not record approval or create a schema kind.

## Verification

| Rule             | Evidence                                          | Failure signal                                   |
| ---------------- | ------------------------------------------------- | ------------------------------------------------ |
| INV1             | Metadata, discovery, CLI, and docsite checks      | A template is missing or registered only once    |
| INV2, INV3, INV4 | Exact-head owner review and template-local source | One approval is waived or a family is presumed   |
| Current rubric   | Scorecard pins template head and rubric revision  | Evidence cannot be reproduced or claims approval |
| INV5, INV6       | Lookup/migration tests and exact-head review      | An ID breaks or evidence points at another head  |
