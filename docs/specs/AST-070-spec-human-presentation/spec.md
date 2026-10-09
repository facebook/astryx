---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-070
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Spec human presentation system spec

## Intent

Specs are written to deliver accurate contracts to LLMs, and that precision
makes them poor reading for humans. This spec defines the human presentation
of a spec: a generated view with a fixed shape that translates the contract
into something a person can assess in minutes. The machine format stays
canonical; the human view is derived, never the source of truth.

## Non-goals

- Changing the machine-readable spec format. Frontmatter, FR-numbered
  requirements, decision logs, and verification tables are owned by the spec
  system and stay as they are.
- Hand-authoring human views. Every human view is generated from the spec
  record; there is no second document to maintain.
- The renderer's implementation or hosting. Owned by architecture and
  implementation once this contract is accepted.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Fixed six-part shape.** Every spec MUST render a human view with
  exactly these sections, in order:
  1. **Summary** — at most three sentences: what the spec seeks to
     accomplish, the proposed mechanism or architecture, and any other
     considerations or impact to users.
  2. **Public-facing changes, demonstrated** — every publicly visible change
     (APIs, component behaviors, visuals) shown with live rendered output,
     animated where the behavior is temporal, rather than described in words.
  3. **Related and reference specs** — each with its authority, resolved from
     spec frontmatter.
  4. **Architecture diagram and explanation** — a diagram of the mechanism
     plus prose explaining it.
  5. **Other relevant concerns** — performance, accessibility, and any
     spec-specific concerns; always present, even when the answer is none
     identified.
  6. **Maintenance impact** — every architectural decision that adds ongoing
     maintenance burden (a duplicate or parallel implementation,
     hand-maintained output that should be generated, new packages, files, or
     release channels, new public surface), each with its recurring cost and
     the cheaper alternative considered; always present, even when the answer
     is none identified.

- **FR2 — Demos are live renders, not descriptions.** Section 2 MUST render
  the changed surface (component demos, API demos) from the repository's own
  demo sources, not screenshots or prose. API changes MUST be presented as
  diffs in component usage examples: removed props and values marked `-`,
  added ones marked `+`, unchanged lines shown for context, so the change
  reads at a glance. Where the shipped component is unavailable, an
  illustrative render MUST be labeled as such. Temporal behavior —
  animations, transitions, multi-step flows — MUST be shown in motion.

- **FR3 — Related specs carry authority.** Section 3 MUST list every spec the
  record references plus its `affects_*` targets, each labeled with its
  frontmatter `authority` and `phase`. A superseded, withdrawn, or draft
  reference MUST be labeled as such, never silently.

- **FR4 — Generated, never hand-maintained.** The human view MUST be produced
  by a renderer from the spec record (markdown plus frontmatter). No human
  view may be edited by hand; corrections happen in the spec and re-render.

- **FR5 — Machine surfaces unchanged.** This spec MUST NOT alter the spec
  format's LLM-facing surfaces. Where the human view and the spec disagree,
  the spec wins.

- **FR6 — PR description.** A pull request that presents a spec MUST use the
  human view as its PR description, so reviewers meet the translation where
  they already read. The description MUST link back to the spec record as
  source of truth.

- **FR7 — Harness artifact.** In harnesses that support rich artifacts, the
  rendered human view MUST be attached as an artifact when a spec is
  presented, so reviewers and agents share one visual reference. Where the
  harness has no artifact support, FR6's PR description is sufficient.

### Platform support

- Supported feature floor: spec records at schema version 4; the frontmatter
  graph is required for section 3.
- Degradation: a spec with no declared demo sources still renders sections 1
  and 3–6, with section 2 labeled illustrative per FR2.
- Browser evidence: not applicable (documentation surface).

## Current-state impact

This specification-only change alters no runtime behavior or published package
and needs no Changeset. No existing spec is modified. The spec template gains
no new required authoring fields in v1 (see OQ1).

## Verification

| Contract | Verification | Representative states | Mutation or failure expectation |
| -------- | ------------ | --------------------- | ------------------------------- |
| FR1 | Render the human view for three specs of different kinds | system-spec, component-spec, family-contract | A section missing, out of order, or a summary over three sentences |
| FR1 section 6 | Render section 6 for a spec that adds a parallel implementation and for a spec that adds no maintenance burden | new package or duplicate implementation; no new burden | Section 6 missing, a burden-adding decision omitted, a listed decision without its recurring cost or cheaper alternative, or the section dropped instead of stating none identified |
| FR2 | Render section 2 for a spec with public visual and API changes | shipped component available; unavailable; prop added/removed | Prose-only description, static screenshot of motion, unlabeled illustration, or an API change without an added/removed diff |
| FR3 | Render section 3 for a spec referencing a superseded spec | current, superseded, draft references | Missing authority label, or a superseded reference unlabeled |
| FR4 | Edit a spec and re-render | before/after render | Hand edit to the view persists, or the view diverges from the spec |
| FR5 | Diff LLM surfaces before/after | frontmatter, FRs, decision log, verification | Any normative machine surface altered |
| FR6 | Open the spec's PR | PR description | Description is raw spec markdown instead of the human view, or lacks a source-of-truth link |
| FR7 | Present a spec in an artifact-capable harness | harness with/without artifact support | No artifact attached where supported |

## Decision log

### DEC-1 — Generated, not hand-maintained

**Reference:** `spec:AST-070/DEC-1`
**Decider:** `cixzhang`, `2026-10-08`

A separately maintained human version diverges from the spec within weeks;
the translation must be a build artifact of the record. Corrections happen
in the spec and re-render.

Rejected: hand-authored human summaries maintained per spec.

### DEC-2 — Demos over descriptions for public changes

**Reference:** `spec:AST-070/DEC-2`
**Decider:** `cixzhang`, `2026-10-08`

Humans assess visual and behavioral changes by seeing them. Prose tables of
surfaces (as in `spec:AST-043` FR1) are precise but unreadable; the human
view shows the change in motion instead.

Rejected: words-only change descriptions, static screenshots of temporal
behavior.

### DEC-3 — PR description and harness artifact

**Reference:** `spec:AST-070/DEC-3`
**Decider:** `cixzhang`, `2026-10-08`

Reviewers read PRs, not spec directories; agents in rich harnesses can share
a visual artifact. The spec record stays normative in both cases.

Rejected: requiring reviewers to read raw spec markdown; making the artifact
mandatory where the harness cannot render it.

### DEC-4 — Maintenance impact is a required section

**Reference:** `spec:AST-070/DEC-4`
**Decider:** `cixzhang`, `2026-10-09`

Architectural decisions with major maintenance impact must be visible when a
spec is assessed, so the human view always names each recurring cost and the
cheaper alternative considered.

Rejected: leaving maintenance cost implicit.

## Open questions

- **OQ1 — Summary authorship** (`human-api`): required frontmatter field
  (e.g. `tl_dr`, capped at three sentences) vs. renderer-generated from
  Intent?
- **OQ2 — Renderer home** (`human-design`): docs-site pipeline, an
  `astryx spec --human` command, or both?
- **OQ3 — Demo source contract** (`checkable`): what must a spec declare so
  the renderer can locate its demo sources (e.g. Storybook stories)?
