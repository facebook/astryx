---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-030
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-07
phase: accepted
owners: [cixzhang]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Positive CI surface routing system spec

## Intent

Route pull-request checks from the repository surfaces a change can affect rather
than from an expanding list of work the change appears not to affect. Contributors
should get the checks that can observe their change, while a narrow operational
Node-tooling change should not wait for unrelated component, browser, Storybook,
or application builds.

The classifier produces a set of touched surfaces. A lane may skip work only when
every changed path is classified from trusted base-branch policy and the selected
checks cover every surface in that set. Mixed, incomplete, or unknown scope uses
the broad lane.

## Non-goals

- Rewrite every CI job or specialize every package lane in one change.
- Remove required check names, branch protection, merge-queue coverage, or
  exact-head owner approval.
- Infer safety from file extensions, directory names, or the absence of a known
  risky path.
- Treat tests, specifications, generated files, or changesets as proof that the
  public or operational surface beside them is untouched.

## Requirements

- **FR1 — Classification is positive and set-based.** Every changed path MUST map
  to one or more named surfaces. Lane selection MUST use the union of those
  surfaces, not exclusion predicates over unrelated paths. A path with no exact
  rule MUST add `shared-or-unknown`.
- **FR2 — The taxonomy follows check ownership.** The classifier MAY name only a
  surface with a concrete check owner and dependency boundary. The initial
  taxonomy and current owners are:

  | Surface             | Positive path ownership                                                                                                            | Current check owners                                                                                                      |
  | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
  | `knowledge`         | canonical system, family, design, theme, component, and module records                                                             | knowledge validation and exact-head spec-owner approval                                                                   |
  | `docsite`           | the docsite application                                                                                                            | docsite generation and tests                                                                                              |
  | `node-tooling`      | individually admitted operational Node programs and their tests whose consumers are covered by Node contract tests                 | Node Vitest, repository guardrails, and ESLint                                                                            |
  | `runtime:<package>` | public source and package contract for Core, Lab, Charts, Rich Text, Vega, CLI, and Build                                          | the package's unit/type checks plus current broad build and downstream consumer checks                                    |
  | `theme-build`       | shipped theme packages, theme compilation, and theme-layer behavior                                                                | theme tests, package build, theme-layer browser guard, and stable visual evidence where applicable                        |
  | `storybook-visual`  | Storybook stories/configuration and visual, accessibility, or RTL audit infrastructure                                             | Storybook build, preview/visual-acceptance publication, and the applicable browser, visual, accessibility, and RTL checks |
  | `shared-or-unknown` | shared configuration, dependency graphs, workflows, classifiers, generated ownership, ambiguous paths, and every unclassified path | all applicable pull-request CI checks                                                                                     |

  A category does not earn a specialized lane merely by existing in this table.
  Until its dependency graph has executable tests, it routes through
  `shared-or-unknown`'s broad check set.

- **FR3 — Classification uses trusted base policy.** Pull-request code MUST NOT
  choose its own lane. The workflow MUST load the classifier and every classifier
  dependency from the trusted base ref, then apply that policy to the merge-base
  three-dot path set. Workflow, classifier, classifier-dependency, and routing-test
  changes therefore use the broad lane.
- **FR4 — Uncertainty fails closed.** A missing merge base, missing trusted
  classifier dependency, failed classifier, empty or incomplete file list,
  ambiguous rename, unknown path, or merge-group event without a trusted PR path
  set MUST select the broad lane. No fallback may grant a specialized lane.
- **FR5 — Mixed scope keeps every owner.** A change touching multiple surfaces
  MUST run the union of their checks. The first implementation MAY specialize
  only the exact singleton sets `{knowledge}`, `{docsite}`, and `{node-tooling}`;
  every other set uses the broad lane. A specification beside runtime code does
  not hide the runtime surface.
- **FR6 — Node-tooling admission is explicit.** A Node program may enter
  `node-tooling` only when dependency analysis proves that package runtime,
  component UI, theme/build output, Storybook/visual evidence, and browser
  behavior are not changed directly, and every operational consumer has a Node
  contract test. Directory-wide or extension-wide admission is prohibited.
- **FR7 — Required check names remain stable.** `test`, `build`, `docsite-test`,
  and `lint` MUST continue to report on every pull request through their existing
  jobs or join jobs. A specialized lane skips owned steps inside those jobs; it
  does not remove historical required contexts. Any owned lane failure MUST fail
  its join.
- **FR8 — The first implementation is one tooling slice.** The first
  `node-tooling` admission covers only `scripts/score-ledger.mjs` and
  `scripts/score-ledger.test.mjs`. It runs the Node project and the required lint
  workflow, including repository guardrails. It skips the UI Vitest project,
  component analysis, docsite generation, production package, Storybook and
  Sandbox builds, preview/visual-acceptance publication, and browser/theme/visual/
  a11y/RTL jobs. The trusted post-CI workflow MUST settle the visual status
  explicitly and remove stale preview links without enqueueing the preview
  publisher. The Sandbox score-ledger projection MUST have a Node contract test
  for the exports it consumes before this lane can be enabled.
- **FR9 — Routing tests are mutation-sensitive.** Tests MUST prove both the
  intended fast path and the unsafe near misses. At minimum they cover pure
  tooling; pure spec; component spec plus component code; module spec plus Table
  plugin code; tooling plus component code; workflow or classifier self-change;
  unknown paths; shared infrastructure; rename history; incomplete input; and
  public source in every component-bearing package. Removing any fail-closed edge
  MUST make a test fail.
- **FR10 — Migration is incremental.** Each additional specialized surface MUST
  land independently with its positive path rules, dependency evidence, check
  ownership, mixed-scope tests, and required-check projection. Broad routing
  remains the default between slices; the migration MUST NOT require one
  repository-wide classifier rewrite.

### Platform support

- Supported feature/engine floor: GitHub pull-request and merge-group workflows
  on the repository's supported Node and runner versions.
- Unsupported behavior: incomplete or unavailable classification receives no fast
  path and runs broad CI.
- Browser evidence: routing itself has no visual claim; browser checks remain
  mandatory whenever their owning surface is present or scope is uncertain.

## Current-state impact

Current CI has singleton fast paths for canonical specification records and the
docsite, expressed as exclusion predicates. All other changes run broad Node/UI,
build, browser, and application checks. This accepted record changes no workflow
by itself.

Implementation begins by expressing those existing paths as positive singleton
surface sets and adding the narrow `node-tooling` singleton from FR8. Package,
theme/build, and Storybook/visual surfaces stay on broad CI until separately
proven and tested.

## Verification

| Contract | Verification                                                             | Representative states                                                                                    | Mutation or failure expectation                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR2  | classifier unit tests expose the surface set                             | knowledge; docsite; admitted tool; Core/Lab/Charts/Rich Text/Vega source; shared config; unknown         | an unclassified path receives a specialized lane or a category has no check owner                                                                                                  |
| FR3–FR4  | workflow contract tests execute an isolated trusted-base classifier      | valid base; missing merge base; missing matcher/registry; classifier self-change; merge group            | PR-controlled policy grants a lane, or missing trust data skips checks                                                                                                             |
| FR5      | mixed-surface table tests                                                | spec+component; module spec+Table plugin; tooling+component; docsite+shared                              | one surface hides another surface's checks                                                                                                                                         |
| FR6–FR8  | Node-tooling dependency, CI workflow, and trusted post-CI workflow tests | both admitted score-ledger paths; Sandbox projection imports; test/build joins; preview/visual publisher | UI/browser/build work or preview publication runs for the singleton tool set, an operational consumer is untested, a visual status stays pending, or a required context disappears |
| FR9      | mutation-sensitive classifier and workflow fixtures                      | unknown path; rename from unknown; truncated list; package-specific public paths                         | weakening a fail-closed rule leaves the suite green                                                                                                                                |
| FR10     | one atomic PR and matrix review per added lane                           | tooling first; later package/theme/visual slices                                                         | a big-bang rewrite changes several ownership boundaries without isolated proof                                                                                                     |

## Decision log

### DEC-1 — Surfaces form a union; lanes are projections

**Reference:** `spec:AST-030/DEC-1`
**Decider:** `cixzhang`, `2026-09-07`

A mixed change retains every touched surface and therefore every check owner. A
specialized lane is safe only for an exact surface set whose checks are complete.

Rejected: mutually exclusive labels where `spec-only`, `docs`, or `tooling` can
win over runtime code elsewhere in the same pull request.

### DEC-2 — Unknown and self-modifying scope uses broad CI

**Reference:** `spec:AST-030/DEC-2`
**Decider:** `cixzhang`, `2026-09-07`

Classification policy comes from the base branch, and every inability to prove a
specialized set selects broad CI. This keeps a pull request from weakening the
classifier or its dependencies to skip its own checks.

Rejected: head-branch classification, two-dot fallback, directory heuristics, or
a bootstrap fallback that grants a fast path.

### DEC-3 — Start with one explicit Node-tooling ownership group

**Reference:** `spec:AST-030/DEC-3`
**Decider:** `cixzhang`, `2026-09-07`

The score-ledger program and tests form the first narrow operational tool group.
Its implementation is validated by Node tests, repository guardrails, ESLint, and
a Node contract for the Sandbox projection; unrelated UI, browser, and production
build work does not observe that change.

Rejected: admitting all of `scripts/`, all JavaScript files, or every Node test by
pattern. Those sets contain generators and build/release inputs with different
owners.

## Open questions

None.
