---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-067
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [ejhammond]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Delivery-agnostic vibe evaluation system spec

## Intent

Astryx has one vibe-test track for coding-agent output, regardless of whether a
producer writes one React component, a buildable project, static files, a served
application, or a hosted page. Every producer emits the same versioned artifact
record. One evaluator materializes that record, derives the files to score,
captures browser evidence, applies accessibility and quality measurements, and
writes a producer-neutral receipt.

The artifact boundary lets the existing component workflow and delivery-mode
experiments share scoring without forcing either producer to imitate the
other's project shape. It also makes historical results comparable without
rewriting them when a producer, evaluator, metric, or judge changes.

## Non-goals

- Choosing which delivery mode a coding agent should use. That decision belongs
  to separate delivery-mode guidance.
- Replacing specialized setup, prompt-purity, CLI-discovery, or component-audit
  experiments whose questions and baselines differ from general interface
  generation.
- Making every source-language metric available for every artifact. Unsupported
  analyzers report unavailable coverage rather than a synthetic zero.
- Treating screenshot judging as proof of interaction correctness,
  accessibility, maintainability, or browser support.
- Defining pull-request workflow topology or creating a second visual-regression
  owner. Vibe evidence remains distinct from the visual-regression ownership in
  [`spec:AST-030`](../AST-030/spec.md).
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

### Artifact contract

- **FR1 — Every scored run crosses one artifact boundary.** A producer MUST emit
  one `VibeArtifactV2` record and an immutable bundle before evaluation starts.
  Evaluation MUST accept the record rather than a producer-specific project,
  component, preview process, or result directory.
- **FR2 — Identity and versions travel with the artifact.** The record MUST carry
  the artifact identity; prompt identity and digest; producer kind, runner, and
  delivery mode; and a version tuple containing the producer contract,
  evaluator, metric set, and judge prompt. A receipt MUST repeat the complete
  tuple used for that result.
- **FR3 — Source points to a verifiable authored tree.** The record MUST identify
  a source root and a digest-pinned baseline whose kind is `empty`,
  `bundle-tree`, or `git-tree`. Entry hints MAY help a reviewer navigate, but
  MUST NOT define the scored file set. The evaluator MUST derive added, changed,
  and deleted authored files by comparing the verified source and baseline.
- **FR4 — Bundle paths and bytes are portable.** Every path in the record MUST be
  POSIX-relative to the immutable bundle root. Absolute paths, backslashes,
  traversal segments, escaped symlinks, and references outside the bundle MUST
  fail validation. The record MUST include digests for the source tree and view
  input; the evaluator MUST record a digest for the materialized view.
- **FR5 — One view union covers delivery modes.** The record MUST select exactly
  one view:

  | View     | Required contract                                                                                               |
  | -------- | --------------------------------------------------------------------------------------------------------------- |
  | `static` | a relative root and entry file that can be served without a build                                               |
  | `build`  | a relative working directory, argv build command, output directory, entry, and optional frozen-lockfile install |
  | `serve`  | a relative working directory, argv command, and optional readiness path                                         |
  | `url`    | an HTTPS URL evaluated under the same browser-network policy                                                    |

  Commands MUST be argv arrays rather than shell strings. An install, when
  present, MUST name a bundled lockfile and require frozen resolution.

- **FR6 — States are bounded and delivery-neutral.** A record MAY declare up to
  four named same-page states using query or fragment navigation. Each state
  MUST load in a fresh browser context. Producer-specific state drivers MAY
  translate into this form, but the evaluator contract MUST NOT depend on a
  framework component, test runner, or prior state.
- **FR7 — Provenance remains additive.** The record MUST carry execution
  provenance and MAY reference transcript or usage receipts by relative path.
  It MUST NOT embed credentials, raw private paths, host-specific context, or
  full prompts when stable identities and digests suffice.

The logical `VibeArtifactV2` fields are:

| Group      | Required contents                                                                          |
| ---------- | ------------------------------------------------------------------------------------------ |
| identity   | schema name and version, artifact ID, prompt ID and digest                                 |
| producer   | producer kind (`component-adapter`, `project`, or `hosted`), runner, delivery mode         |
| versions   | producer-contract, evaluator, metric-set, and judge-prompt versions                        |
| source     | root, baseline kind/root/digest, optional entry hints                                      |
| view       | one `static`, `build`, `serve`, or `url` recipe                                            |
| integrity  | source-tree and view-input digests                                                         |
| network    | `deny`, `record`, or `replay`, with exact allowed origins and an optional receipt          |
| states     | zero to four named query- or fragment-addressed states                                     |
| provenance | executor-neutral execution provenance and optional relative transcript or usage references |

### Producers

- **FR8 — Producers prepare evidence but do not score it.** A producer MAY
  scaffold, run a coding agent, validate or repair output, and assemble an
  artifact. It MUST NOT choose scored files, browser cells, evaluator failures,
  accessibility findings, metric totals, or headline judge scores.
- **FR9 — The legacy component flow is an adapter.** The single-TSX workflow
  MUST remain supported through a producer adapter that owns TSX
  canonicalization, framework wrapping, typechecking, and any repair receipt.
  It MUST emit the same artifact contract as project and static producers.
- **FR10 — Delivery-mode projects are ordinary producers.** A project producer
  MAY emit build, static, serve, or hosted views and runner provenance. It MUST
  NOT introduce a second evaluator, metric definition, judge, aggregate, or
  report format.
- **FR11 — Raw and transformed bytes remain distinguishable.** Evaluation MUST
  never mutate producer output. A validation or repair step MUST preserve the
  raw artifact and identify any transformed artifact with its own digest and
  relationship so reports cannot present repaired bytes as the original run.

### Shared evaluator

- **FR12 — The evaluator owns materialization.** The evaluator MUST validate the
  schema, paths, and digests; derive scored files; perform any declared install;
  build or launch the view; choose an ephemeral local endpoint when needed; and
  verify the expected entry before opening a scoring browser. These operations
  run after the producer exits and in a fresh isolated sandbox.
- **FR13 — Materialization fails closed.** A missing entry, digest mismatch,
  escaped path, nonzero command, timeout, readiness failure, or unexpected
  response MUST produce `materialization_failed`. Browser, accessibility,
  source, and judge measurements that depend on materialization MUST be
  `not-run`, not zero and not measurements of an error page.
- **FR14 — Browser egress is evaluator-controlled.** Build and serve phases MUST
  run without producer network access. Browser requests default to denied. A
  controlled refresh MAY record responses from exact HTTPS origins, including
  status, redirects, content type, body digest, and byte count. Automated runs
  of CDN-backed pages MUST replay a pinned response set; an unrecorded origin,
  replay miss, digest mismatch, credentialed URL, or unapproved redirect MUST
  fail as infrastructure rather than change the score.
- **FR15 — Capture uses one pinned matrix.** The initial capture policy MUST use
  desktop `1280×800` and mobile `375×812`, each in light and dark mode, at device
  pixel ratio 1, for the default state and every declared state. Every cell MUST
  use a fresh context, fixed locale and timezone, reduced motion, evaluator-owned
  fonts and network policy, and one versioned readiness rule. A standard theme
  hook MUST let producer adapters honor the evaluator-selected mode.
- **FR16 — Evidence is shared across producers.** For every successful cell, the
  evaluator MUST record render status, console/page/request failures, rendered
  DOM, an accessibility scan, and a screenshot. Multi-state failures remain
  attached to their state and remain in aggregate denominators.
- **FR17 — One blind judge owns the headline visual series.** A metric version
  MUST name exactly one canonical judge tuple: transport, model, API version,
  prompt digest, rubric, weights, pass count, and response schema. The judge MUST
  receive anonymized evidence without producer or delivery labels. Missing judge
  credentials or service availability MUST yield `unavailable`, never zero.
- **FR18 — Metrics name their evidence and versions.** Common measurements MUST
  consume rendered DOM and evaluator-derived source files. Rendered adoption,
  accessibility, render correctness, source-bundle literals, and producer
  typechecking MUST remain separate fields. Every metric family MUST have an
  independent version. Unsupported source languages MUST report parser coverage
  and `unavailable` rather than receive a score inferred from another language.
- **FR19 — Receipts are producer-neutral and failure-inclusive.** One score
  receipt MUST identify the artifact, version tuple, materialization and capture
  policy, scored-file set, evidence digests, per-cell statuses, metric coverage,
  judge status, primary failure, and aggregate denominator. Reports MUST group
  dynamically by producer identity rather than a fixed target list.

### Continuity and calibration

- **FR20 — Historical source is rematerialized honestly.** Calibration MAY
  rebuild source from versioned nightly history through the compatibility
  producer. It MUST label the result as a new materialization and MUST NOT claim
  that newly captured screenshots are original historical bytes.
- **FR21 — Judge stability is measured before replacement.** A calibration set
  MUST contain at least 30 prompt-and-producer cells across the supported
  producer kinds, prompt categories, capture states, and at least three nightly
  dates. The incumbent judge MUST run twice over the exact same anonymized
  screenshot bytes before a candidate judge is compared.
- **FR22 — Headline changes pass fixed gates.** Incumbent self-agreement MUST
  reach Spearman `ρ ≥ 0.85` with absolute mean bias `≤ 5` on the 0–100 scale. A
  candidate compared with the incumbent median MUST also reach `ρ ≥ 0.85`,
  absolute mean bias `≤ 5`, and no more than a `0.05` Spearman drop relative to
  incumbent self-agreement. If the incumbent fails its own gate, the headline
  judge MUST NOT change.
- **FR23 — Version changes start new series.** Producer-contract, evaluator,
  capture-policy, metric, or judge changes MUST preserve old receipts and start
  or dual-write a new named series. Reports MUST NOT rewrite historical rows to
  make them appear as though they used a later contract. A command cutover may
  occur only after compatibility artifacts, aggregates, reports, and calibration
  pass together.

### Platform support

- Supported feature/engine floor: the evaluator uses the repository's supported
  Node and browser versions; each materialized interface inherits its own public
  support contract.
- Unsupported behavior: a view, source language, state driver, or network input
  outside the declared contract fails or reports unavailable; it never receives
  an inferred success or zero.
- Browser evidence: the complete pinned matrix, including render, console,
  request, DOM, accessibility, screenshot, and declared-state receipts.

## Current-state impact

The current vibe track assumes a single `.tsx` component that is wrapped and
built through shared preview infrastructure. Delivery-mode work uses project and
static outputs and therefore needs a different producer shape. Without a shared
artifact boundary, the two paths duplicate evaluator, metric, judge, aggregate,
and report behavior.

This record owns that missing producer-to-evaluator seam and the single shared
evaluation contract. The existing execution-provenance sidecar remains valid
and becomes artifact provenance. The component flow remains available through
an adapter. Delivery-mode work becomes a producer rather than a parallel
harness. Specialized experiments remain independent unless they later adopt the
artifact boundary without changing their own question.

Delivery-mode guidance owns which delivery mode agent-facing instructions
recommend and the limits of delivery-mode evidence. `spec:AST-030` owns
pull-request CI routing and the single visual-regression owner. Neither boundary
defines the artifact schema, materialization owner, shared judge, or metric
continuity rules owned here.

## Verification

| Contract  | Verification                                                                  | Representative states                                                                      | Mutation or failure expectation                                                                                   |
| --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| FR1–FR7   | schema/parser fixtures, digest tests, and portable-bundle tests               | empty/bundle/git baseline; static/build/serve/url; valid/escaped paths; zero/four states   | a producer-specific path bypasses the record, an escaped file is read, or a changed byte retains the same receipt |
| FR8–FR11  | component-adapter and project-producer contract tests                         | raw TSX; repaired TSX; multi-file project; static page; hosted page                        | a producer writes scores, hides authored files, or repaired bytes replace raw output                              |
| FR12–FR14 | isolated materialization and network-replay tests                             | successful build; missing entry; timeout; 404; denied origin; record/replay hit/miss       | an error page is scored, producer output mutates, or unrecorded browser bytes affect a result                     |
| FR15–FR19 | capture-matrix, axe, console, screenshot, judge, metric, and receipt fixtures | desktop/mobile; light/dark; default/four states; judge available/unavailable               | producers receive different scoring, failed states disappear, or an unavailable metric becomes zero               |
| FR20–FR23 | historical rebuild and judge test-retest calibration                          | old/new adapter; stable/unstable incumbent; passing/failing candidate; dual-written series | rebuilt pixels are called original, an unstable judge switches, or history is rewritten under a new version       |

## Risks

- **Contract overreach:** specialized experiments could lose useful evidence if
  forced into the shared track. Adoption is limited to general interface
  generation; other experiments integrate only when their own contracts remain
  intact.
- **Producer-controlled scoring:** hints or generated manifests could hide bad
  files. The evaluator derives the scored set from a verified baseline diff.
- **Network nondeterminism:** CDN-backed pages could change without source
  changes. Automated evaluation replays response bodies by digest and fails on
  misses.
- **False theme parity:** an adapter could ignore the requested mode. The theme
  hook and rendered evidence are part of capture validation.
- **Judge drift:** a model or prompt update could move the headline without a
  product change. Judge identity is versioned and changes require test-retest
  calibration.
- **Silent continuity loss:** a new metric could overwrite earlier rows. The
  receipt tuple starts a new series and preserves every prior version.

## Decision log

### DEC-1 — Use one versioned artifact as the producer-to-evaluator seam

**Reference:** `spec:AST-067/DEC-1`
**Decider:** pending

Every supported producer emits the same immutable, digest-pinned artifact. This
keeps delivery mechanics outside scoring while preserving enough source and view
information for one evaluator to reproduce the result.

Rejected: make every producer write a single TSX file, because project, static,
served, and hosted outputs do not share that source shape.

### DEC-2 — The evaluator owns materialization, evidence, and scoring

**Reference:** `spec:AST-067/DEC-2`
**Decider:** pending

The evaluator derives authored files, builds or serves the view, controls browser
networking, captures the fixed matrix, runs the canonical judge and versioned
metrics, and writes the receipt. Producers cannot specialize those decisions.

Rejected: let each producer carry its own evaluator, because scoring and failure
semantics would drift with delivery mode.

### DEC-3 — Historical continuity is versioned, never rewritten

**Reference:** `spec:AST-067/DEC-3`
**Decider:** pending

Historical source may be rebuilt through a named compatibility adapter, but every
new materialization, evaluator, metric, capture policy, and judge remains visible
in the receipt. Calibration compares identical screenshot bytes and gates a new
headline series against incumbent self-agreement.

Rejected: rescore historical rows in place, because the new bytes and contracts
would be indistinguishable from the originals they replaced.

### DEC-4 — Existing component evaluation survives as a producer adapter

**Reference:** `spec:AST-067/DEC-4`
**Decider:** pending

The component workflow keeps its canonicalization, wrapper, typecheck, and repair
behavior behind an adapter while adopting the same artifact and evaluator as
other producers.

Rejected: maintain a legacy scoring path beside the shared evaluator, because it
would preserve the duplication this contract removes.

## Open questions

- **OQ1 — Are hosted URL views enabled in the initial implementation?** The
  schema can represent them, but the owner must decide whether initial support is
  disabled until an approved replay bundle exists. (`human-design`)
- **OQ2 — Which series is headline during transition?** The owner must choose
  whether the incumbent remains headline through one dual-written calibrated
  iteration or both series remain co-equal for a longer window. (`human-design`)
- **OQ3 — How do raw and repaired artifacts appear in aggregates?** Both remain
  separately identified; the owner must choose whether headline aggregates use
  raw only, repaired only, or paired rows with one designated primary.
  (`human-design`)
- **OQ4 — Which judge tuple becomes the first canonical version?** The choice
  must name the public transport, model, prompt, rubric, pass count, and API
  version and then satisfy FR21–FR22. (`human-design`)
