---
schema_version: 1
template_version: 1
kind: implementation-plan
id: plan:AST-067
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
spec: spec:AST-067
owners: [ejhammond]
---

# Delivery-agnostic vibe evaluation implementation plan

## Phases

Each phase is one independently reviewable pull request. The existing command
remains operational until the final cutover.

### PR 0 — Restore preview build reliability

- [ ] Land [#7035](https://github.com/facebook/astryx/pull/7035) so the vibe-tests
      package owns its preview-build dependencies, all requested targets are covered,
      and a missing output fails the command.

### PR 1 — Add the artifact contract and a static evaluator fixture

- [ ] Add the `VibeArtifactV2` schema, parser, digest/path validation, and
      producer-neutral receipt types.
- [ ] Prove one static artifact and negative missing-entry, digest, traversal,
      and build-failure fixtures without changing the existing command.

### PR 2 — Extract the delivery-mode project producer

- [ ] Reshape the project scaffolds, runner, process lifecycle, baseline/source
      capture, and artifact emission from
      [#7006](https://github.com/facebook/astryx/pull/7006).
- [ ] Remove evaluator, metric, judge, aggregate, and report ownership from the
      producer.

### PR 3 — Add runner portability behind its first consumer

- [ ] Reshape [#7014](https://github.com/facebook/astryx/pull/7014) into
      capability, browser-helper, transcript, usage, and version adapters consumed by
      the project producer.
- [ ] Keep runner-specific commands and schemas out of the public artifact and
      evaluator contracts.

### PR 4 — Adapt the legacy TSX component flow

- [ ] Move TSX canonicalization, wrapper generation, typechecking, and repair
      receipts behind the component producer adapter.
- [ ] Add the evaluator-owned theme hook and dual-emit the existing preview plus
      `VibeArtifactV2` until cutover.

### PR 5 — Consolidate materialization, isolation, and network ownership

- [ ] Reshape shared evaluator and failure-classification work from
      [#7006](https://github.com/facebook/astryx/pull/7006) with the sandbox,
      lifecycle, read-only input, ephemeral-port, and crash-safety work from
      [#7016](https://github.com/facebook/astryx/pull/7016).
- [ ] Add fail-closed build/static/serve/url materialization and controlled
      browser record/replay without giving producers network access.

### PR 6 — Consolidate rendered and source metrics

- [ ] Reshape [#7012](https://github.com/facebook/astryx/pull/7012) around
      evaluator-derived files and rendered DOM roots.
- [ ] Dual-write coarse and precise adoption plus original and
      fallback-adjusted literal series under explicit metric versions.
- [ ] Preserve compatibility for experiments that import the existing pure
      scoring API.

### PR 7 — Consolidate states, capture, and the canonical judge

- [ ] Reshape [#7015](https://github.com/facebook/astryx/pull/7015) into the
      delivery-neutral state declaration and fresh-context capture policy.
- [ ] Apply the desktop/mobile and light/dark matrix, one blind canonical judge,
      and per-state evidence and failure receipts.

### PR 8 — Move aggregation, reports, and CI to artifacts

- [ ] Group dynamically by producer identity and preserve complete version tuples
      in aggregates and reports.
- [ ] Pass artifact bundles between automation stages and retain existing
      independent setup and fixture checks.
- [ ] Cover TSX, build, static, and CDN-replay fixtures through the same evaluator.

### PR 9 — Calibrate and cut over commands

- [ ] Rebuild a stratified historical sample through the compatibility producer,
      capture each cell once, and run incumbent test-retest plus candidate calibration
      against the identical screenshots.
- [ ] Dual-write one transition iteration, publish per-producer and per-category
      deltas, and start a new headline series only if `spec:AST-067/FR21–FR23` pass.
- [ ] Cut interactive, nightly, degradation, history, and report commands to the
      artifact track; remove duplicate orchestration only after compatibility evidence
      passes.

## Open draft mapping

| Open draft                                            | Destination in this plan                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [#7006](https://github.com/facebook/astryx/pull/7006) | project producer in PR 2; evaluator/failure logic in PR 5; aggregate/report pieces in PR 8 |
| [#7012](https://github.com/facebook/astryx/pull/7012) | rendered-DOM and source-bundle metrics in PR 6                                             |
| [#7014](https://github.com/facebook/astryx/pull/7014) | runner adapters in PR 3, after the project producer exists                                 |
| [#7015](https://github.com/facebook/astryx/pull/7015) | states, capture matrix, and judge evidence in PR 7                                         |
| [#7016](https://github.com/facebook/astryx/pull/7016) | evaluator isolation and lifecycle in PR 5                                                  |
| [#7035](https://github.com/facebook/astryx/pull/7035) | prerequisite build fix in PR 0                                                             |
| [#7076](https://github.com/facebook/astryx/pull/7076) | separate delivery-mode guidance; its evaluation claims delegate to AST-067 when approved   |

## Verification

| Phase | Contract                 | Evidence                                                                                    |
| ----- | ------------------------ | ------------------------------------------------------------------------------------------- |
| 0     | prerequisite             | clean install builds every requested legacy target and fails on any missing output          |
| 1     | `spec:AST-067/FR1–FR7`   | schema, parser, digest, path, static, and negative materialization fixtures                 |
| 2–4   | `spec:AST-067/FR8–FR11`  | project and component producers emit equivalent artifacts without scoring                   |
| 5     | `spec:AST-067/FR12–FR14` | isolated build/serve, negative entry/404 controls, and browser record/replay fixtures       |
| 6–8   | `spec:AST-067/FR15–FR19` | fixed capture matrix, metric/judge fixtures, dynamic aggregates, and complete receipts      |
| 9     | `spec:AST-067/FR20–FR23` | historical rematerialization, test-retest calibration, dual-written series, command cutover |

## Status

- Current phase: specification review; implementation has not started.
- Blockers: AST-067 owner decisions and approval; PR 0 must land before
  historical calibration.
