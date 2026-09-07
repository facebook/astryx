---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-030
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

# Wiki authority extraction system spec

## Intent

Move durable Astryx product requirements and decisions out of the public wiki and
into reviewable repository records. Keep the wiki for process, practical guidance,
research, history, runbooks, and entrypoints that link to current repository
authority.

## Non-goals

- Delete useful procedures, examples, research, or history.
- Promote a wiki statement to current policy without evidence and owner approval.
- Resolve semantic conflicts by choosing the newest, narrowest, or most familiar
  wording.
- Copy one shared requirement into every component spec.
- Block the component-audit migration while every historical wiki page is cleaned.

## Requirements

- **FR1 — Every wiki section is classified.** The migration inventory MUST classify
  each Markdown section as process/how-to, consumer guidance, research/history,
  operations, or normative product content. Classification is section-level; one
  page may contain several classes.
- **FR2 — Every normative fact has one canonical owner.** Each product requirement
  or durable decision MUST map to the narrowest repository component/module,
  family, design, theme, architecture, or system record. Missing owners become
  explicit draft records or tracked gaps.
- **FR3 — Migration preserves semantics.** A mechanical extraction MUST preserve
  normative verbs, conditions, defaults, cardinality, exceptions, compatibility,
  ownership, and evidence state. It MUST NOT strengthen an observed behavior into
  policy or weaken an existing promise.
- **FR4 — Current authority exists before de-authorization.** Wiki text MUST NOT be
  removed as the practical bar until its canonical owner exists and is current.
  Afterward, retained wiki guidance links that owner and removes duplicate
  normative text.
- **FR5 — Conflicts stop migration.** Conflicting current records, conflicting wiki
  claims, or uncertainty about API, compatibility, ownership, accessibility, or
  design become human-decision work. The migration MUST NOT resolve them through
  editorial wording.
- **FR6 — The audit rubric becomes procedural.** Scoring, evidence recipes, modes,
  issue routing, and ledger mechanics may remain in the wiki. Each product check
  cites a current repository requirement or objective external standard rather
  than carrying an independent product rule.
- **FR7 — Contributor and Night Watch pages remain procedural.** Build, hardening,
  contribution, doc-review, release, and Night Watch pages MAY retain ordered
  workflows and examples. Product guarantees and ownership claims become links to
  canonical records.
- **FR8 — Research remains visibly non-authoritative.** Explorations and rejected
  alternatives MAY remain for context when labeled as research/history and linked
  to any resulting accepted record. They MUST NOT be cited as settled policy.
- **FR9 — Backlinks update last.** Home, sidebar, contributor entrypoints, CLI doc
  routing, audit pages, and role pages update after canonical owners are available,
  so no migration interval leaves readers without an authoritative destination.
- **FR10 — Extraction is staged by confidence.** High-confidence duplicates of a
  current record move first. New owner records and disputed semantics require
  separate reviewed changes. Each stage keeps the wiki and repository legible.
- **FR11 — Wiki authority regressions are detectable.** The migration SHOULD add a
  checked inventory or review that flags wiki claims such as “source of truth”,
  “must”, or “the contract” when they are not clearly procedural, quotations, or
  links to repository authority.

### Migration waves

#### Wave 0 — Existing owners, mechanical extraction

- Container Padding → `architecture:container-padding`.
- Template Assets ownership → `spec:AST-028`.
- Resizable/SideNav arbitration history → `spec:AST-010`, component contracts,
  and `architecture:knowledge-contracts`.
- Compatibility and release classification → `spec:AST-017`; package topology
  waits for package-distribution architecture.

#### Wave 1 — Architecture and contributor projections

- Architecture Cheat Sheet → existing architecture and family records.
- Component Build and Authoring guides → component-spec guide plus current public
  API, theme, padding, and future testing owners.
- Theming Infrastructure → current theme architecture and AST-006/012/017.
- System Architecture and Why StyleX → existing theme/API owners plus proposed
  StyleX-authoring and package-distribution records.
- Distribution → proposed package-distribution architecture and AST-017.
- Docsite Architecture and Doc Reviewer embedded contracts → proposed
  docsite-content-pipeline architecture and checked schemas.
- Contributing Templates asset rules → AST-028 and template consumer guidance.
- Astryx Philosophy → non-authoritative narrative linking factual owners.

#### Wave 2 — Human decisions and missing owners

- Accessibility Checklist → proposed accessibility baseline, AST-009 evidence
  boundaries, family/component owners.
- Design Conventions → review and promote the draft design record set rather than
  treating the wiki as bridge authority.
- Component Audit Rubric product assertions → accessibility, design, API, theme,
  family, component, and lifecycle owners; scoring remains in the wiki.
- Component Lifecycle → proposed lifecycle system spec plus AST-017.
- API Conventions → public API architecture, AST-002, families, and component
  contracts after resolving contradictions.
- RSC Compatibility → proposed RSC-boundaries architecture and AST-013.
- Charts → proposed chart-runtime architecture, data-visualization design record,
  and component contracts in the Charts package.
- Animation, Swizzle, and Required Props → remain research until their open product
  decisions are reviewed.

### Known conflicts requiring owner review

1. Global elevation bands versus browser top-layer/local paint-order architecture.
2. Pointer-specific 20 px guidance versus WCAG 2.5.8's 24 px rule and exceptions.
3. Universal styling-prop admission versus explicit public-surface admission.
4. “All inputs controlled” versus component-owned uncontrolled concepts.
5. Universal visual extensibility versus eligible-axis-only architecture.
6. Wiki RSC assumptions versus shipped server-safe boundaries.
7. Template slug renames as breaking versus AST-017 mutable catalog identity.
8. Lab canary distribution versus `private: true` policy descriptions.
9. UMD/version/lockstep distribution claims versus current manifests and builds.
10. Stable `astryx-*` targets versus opaque StyleX atomic classes.
11. Button's exact variants without a current Button component owner.
12. Resizable/SideNav historical resolution versus AST-010's retained decision
    boundary.

### Platform support

- Supported feature/engine floor: repository and wiki Markdown, current knowledge
  validation, and GitHub review.
- Unsupported behavior: automatic authority promotion or conflict resolution from
  text similarity alone.
- Browser evidence: only required by the canonical product requirement being
  migrated, not by migration mechanics themselves.

## Current-state impact

This migration affects the public wiki, `docs/`, component packages, contributor
entrypoints, CLI docs routing, and audit citations. It creates follow-up owner
records for accessibility, lifecycle, package distribution, StyleX authoring,
docsite content, RSC boundaries, chart runtime, data visualization, and testing
quality where current ownership is missing.

## Verification

| Contract | Verification                                                          | Representative states                                     | Mutation or failure expectation                                                              |
| -------- | --------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| FR1–FR2  | Complete page/section inventory with canonical target and disposition | mixed page; duplicate; missing owner                      | A normative section is unclassified or maps to two owners.                                   |
| FR3–FR5  | Semantic source/target comparison plus owner review                   | mechanical duplicate; conflict; observed behavior         | A qualifier disappears, draft becomes current silently, or conflict is editorially resolved. |
| FR6–FR9  | Link and authority audit after each wave                              | rubric check; contributor guide; history page; entrypoint | A wiki page still claims reusable product authority or a link points to no current owner.    |
| FR10     | Ordered migration tracker and independent review                      | Wave 0 duplicate; Wave 2 design decision                  | Human judgment is hidden inside a mechanical batch.                                          |
| FR11     | Wiki authority-language scan with reviewed exemptions                 | procedure “must”; quoted history; “source of truth” claim | A new wiki-only product contract lands unnoticed.                                            |

## Decision log

### DEC-1 — The wiki retains process, not reusable product authority

**Reference:** `spec:AST-030/DEC-1`
**Decider:** `cixzhang`, `2026-09-06`

The wiki remains the practical home for audit mechanics, runbooks, tutorials,
research, and history. Durable product requirements and decisions live with code
in repository records.

Rejected: deleting the wiki or moving every procedural sentence into specs, because
that would make repository contracts unreadable and remove useful operational
context.

### DEC-2 — Extract by canonical owner, not by source page

**Reference:** `spec:AST-030/DEC-2`
**Decider:** `cixzhang`, `2026-09-06`

A single wiki page may split across component, family, design, architecture, and
system owners. Migration follows fact ownership rather than reproducing wiki page
boundaries in the repository.

## Open questions

- **OQ1 — Accessibility owner shape.** (`human-design`) Decide the shared baseline
  record and which component-specific contrast/state rules move to families or
  components.
- **OQ2 — Design promotion.** (`human-design`) Review the draft design records and
  known elevation/target-size conflicts before any becomes current.
- **OQ3 — Lifecycle and distribution.** (`human-api`) Settle Lab distribution,
  stable promotion, package topology, and template identity in canonical records.
- **OQ4 — Testing quality owner.** (`human-design`) Define a current testing
  architecture record for test quality, contract coverage, visual regression,
  mutation expectations, and evidence-layer boundaries.
- **OQ5 — Charts, RSC, and Swizzle.** (`human-api`) Confirm owner boundaries before
  extracting their wiki blueprints.
