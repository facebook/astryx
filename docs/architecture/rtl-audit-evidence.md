---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:rtl-audit-evidence
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
applies_to:
  [
    apps/storybook/rtl-audit/,
    .github/scripts/rtl-audit-coverage.test.mjs,
    .github/scripts/weekly-rtl-summary.js,
    .github/scripts/check-rtl-applicability-registries.mjs,
    .github/workflows/,
  ]
verified_by:
  [
    .github/scripts/rtl-audit-coverage.test.mjs,
    .github/scripts/weekly-rtl-summary.test.mjs,
    apps/storybook/rtl-audit/rtl-audit-coverage.mjs,
  ]
deciding_specs: []
---

# RTL audit evidence architecture

## Purpose

The RTL audit (`pr-rtl`, the weekly full sweep, and their shared classifier)
answers one question per component: is its RTL behavior actually known, or
merely untested? Two failures on either side are equally unacceptable — a
newly introduced RTL bug reaching `main` unnoticed, and a full-registry sweep
that is permanently red for reasons nobody can act on in the PR that trips it.

This record specifies the target design that closes both failures: a
closed-evidence `verified N/A` declaration, and a bounded, shrink-only
baseline for the pre-existing gap the registry started with. It is `draft`
because the pieces below are implemented across open, still-changing pull
requests rather than fully landed and reviewed; it exists so those pull
requests build toward one agreed shape instead of each improvising its own.

## System model

### Per-component states

The classifier (`buildComponentCoverage` in `rtl-audit-coverage.mjs`) assigns
exactly one status to every component in the audited roster:

| Status                                  | Meaning                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `measured`                              | At least one of D1 (icon-mirror), D5 (positional-mirror), D6 (contextual-decoration), or a curated target produced an applicable pass/fail verdict. The component's RTL behavior is exercised, not merely asserted. |
| `verified-na`                           | No detector found applicable behavior, and a human recorded a reason in `verified-not-applicable.json` explaining why none applies.                                                                                 |
| `stale-verified-na`                     | A component carries a `verified-na` declaration, but a detector now reports applicable behavior. The declaration and the measured reality disagree; the declaration does not win.                                   |
| `coverage-gap`                          | No detector found applicable behavior, and no `verified-na` reason is recorded. Unexplained silence, not evidence.                                                                                                  |
| `known-coverage-gap` _(proposed)_       | A `coverage-gap` present in the checked-in debt baseline (see below). Reported, but does not fail the audit on its own.                                                                                             |
| `stale-known-coverage-gap` _(proposed)_ | A baseline entry whose component is now `measured`. The baseline says "still unexplained"; the detectors disagree. Must fail — an unremoved baseline row can silently hide the component's real coverage forever.   |

`measured` and `verified-na` are both closure: the component's RTL story is
known. `coverage-gap` (baseline or not) and `stale-*` are both open questions.
Nothing about a status is authoritative on its own — it is a live
recomputation from the current built Storybook, not a value anyone edits by
hand except the two source registries below.

### Evidence closure for `verified-na`

A `verified-na` reason is a claim that a human read the code and found nothing
direction-sensitive. That claim rots exactly like the code it describes.
Today the registry stores only `{component, reason}`, so a reason survives
unchanged no matter how the component changes underneath it. The proposed
closure adds evidence pinning: each declaration also stores a SHA-256 digest
for

- the canonical component source (the file the record's `applies_to`-style
  root resolves to for that component);
- helpers and styles it directly imports from the same top-level component
  directory;
- the Storybook story files that story maps to.

A changed, added, removed, or renamed evidence file invalidates the digest.
An invalidated, missing, empty, malformed, duplicate, or otherwise
undiscoverable declaration is not an error to fix later — it fails closed:
the component reverts to `coverage-gap` until a human re-reviews it and
refreshes the evidence for that one component. Refreshing is scoped
per-component by design; there is no bulk-refresh path, because a bulk
refresh is exactly the operation that would let a real regression re-pin
itself as "reviewed" without a human looking at it.

### The pre-existing debt baseline

The registry did not start empty because every component was RTL-clean; it
started empty because nobody had reviewed any of them yet. The first
unfiltered sweep against that empty registry classified every already-shipped
component with no applicable detector finding as a `coverage-gap` — 204 of
them — indistinguishable from a gap a single new PR had just introduced.

The proposed baseline separates the two:

- The 204 components are snapshotted once, by name, as known debt —
  `known-coverage-gap`, not `coverage-gap`.
- Known debt is visible in every report but does not fail `pr-rtl` or the
  weekly sweep by itself.
- A gap that is **not** in the snapshot is new, and fails like any other
  finding.
- The baseline is **removal-only**: a pull request may remove an entry
  (because the component became `measured` or `verified-na`, or the component
  itself was deleted or renamed), but may never add one. A PR whose merge
  base already carries a larger known-debt set than the PR's own head is the
  signal a component was quietly re-added to the snapshot instead of actually
  fixed.
- Because the baseline and the `verified-na` registry are both griefable in
  the same way — a change to either can silently launder a real gap into
  "already known" or "already reviewed" — any pull request that touches
  either file runs a separate, blocking semantic audit, even while the
  general `pr-rtl` check stays soft-gated for everything else. Soft-gating
  the general check is what makes the auto-discovery detectors (D1/D5/D6)
  safe to keep tightening without freezing unrelated PRs; blocking on the
  two debt-and-evidence files is what keeps the escape hatch from becoming
  the actual gap.

### Relationships

```text
apps/storybook/rtl-audit/rtl-audit.mjs         orchestrates D1/D5/D6 + curated
  ├─ rtl-audit-coverage.mjs                    pure classifier (states above)
  ├─ verified-not-applicable.json              verified-na registry + evidence
  ├─ targets.json                              curated (D2-class) measured targets
  └─ colocated `rtlAudit.D1` story parameters  per-story D1 applicability + rationale

.github/scripts/check-rtl-applicability-registries.mjs   structural/order-independence checks on the two registries
.github/scripts/weekly-rtl-summary.js                    full-sweep report; separates known debt from new findings
.github/workflows (pr-rtl, weekly)                       soft-gated general run + blocking debt/evidence-file audit
```

D1 applicability exceptions (a story that is fixture data, not a directional
control) live **beside the story**, as typed parameters with a required
rationale — not in `targets.json`, which is reserved for curated
relationship targets (D2-class checks a detector cannot discover on its
own). Keeping the two apart matters: an applicability exception says "this
story is not a directional control, don't ask D1 about it"; a curated target
says "here is a specific cross-element relationship, go measure it." Merging
them would make an exclusion and a positive claim indistinguishable in the
same file.

Component identity for both registries is resolved from real source and
story roots. A name with no matching source directory or story component
(recorded as `unknown/<Name>`, e.g. a shared fixture referenced by name only)
has no canonical directory to resolve — see the open question below.

## Boundaries and invariants

- **INV1 — A status is always live, never hand-set.** `measured`,
  `verified-na`, `coverage-gap`, and their stale/known variants are computed
  from the current built Storybook and the two registries on every run.
  Nobody edits a component's status directly; they edit the registries the
  computation reads.
- **INV2 — `verified-na` requires current evidence, not a persisted claim.**
  A `verified-na` reason is only as good as the digest that pins it. Evidence
  that no longer matches the reviewed files means the reason no longer
  describes the code; the status must fail closed to `coverage-gap`, never
  silently keep the old reason.
- **INV3 — The debt baseline shrinks or holds; it never grows.** Once a
  component is snapshotted as known debt, no later pull request may add
  another component to that snapshot. New silence is a new gap and fails.
- **INV4 — A stale baseline entry is a failure, not a pass.** A
  `known-coverage-gap` whose component has become `measured` must be removed
  from the snapshot in the same change; leaving it in must fail as
  `stale-known-coverage-gap`, the same way `stale-verified-na` already does
  for the evidence registry.
- **INV5 — The two registries are the only blocking surface.** General
  `pr-rtl` stays soft-gated so the auto-discovery detectors can keep
  tightening without freezing unrelated work. Every change to
  `verified-not-applicable.json` or the debt baseline runs the blocking
  semantic audit regardless.
- **INV6 — Applicability exceptions and curated targets are recorded
  separately.** A D1 "this is not a directional control" rationale lives
  colocated with its story. A curated cross-element relationship lives in
  `targets.json`. Neither file may carry the other's kind of entry.

## Change coupling

A pull request that changes `apps/storybook/rtl-audit/verified-not-applicable.json`,
the debt-baseline file, `apps/storybook/rtl-audit/rtl-audit-coverage.mjs`, or
`.github/scripts/check-rtl-applicability-registries.mjs` triggers the blocking
semantic audit described above, independent of `pr-rtl`'s own soft-gated
scope. Storybook's existing required `build` step runs the evidence check
after producing `dist/index.json`, so a component-, story-, or registry-only
PR cannot bypass evidence closure by never touching the audit script itself.

A pull request that changes a component's canonical source, its directly
imported helpers/styles, or its owned stories invalidates that component's
`verified-na` evidence automatically (INV2) — no separate trigger is needed;
the digest comparison IS the trigger.

## Owning code

- `apps/storybook/rtl-audit/rtl-audit.mjs` — Playwright orchestration: loads
  each story LTR and RTL, runs D1/D5/D6 auto-discovery plus curated targets,
  and calls the shared classifier.
- `apps/storybook/rtl-audit/rtl-audit-coverage.mjs` — pure per-component
  classification (the states in System model); no I/O, unit-tested directly.
- `apps/storybook/rtl-audit/verified-not-applicable.json` — the reviewed
  `verified-na` registry; proposed to carry evidence digests per declaration.
- `apps/storybook/rtl-audit/targets.json` — curated D2-class measured
  targets.
- `.github/scripts/rtl-audit-coverage.test.mjs` — regression coverage for the
  classifier, including the debt-baseline and evidence-invalidation controls.
- `.github/scripts/check-rtl-applicability-registries.mjs` _(proposed)_ —
  structural checks: registry shape, duplicate declarations, and D1
  representative-story selection independent of Storybook's generated index
  order.
- `.github/scripts/weekly-rtl-summary.js` — full-sweep report; separates
  known debt from new findings so a maintainer reading the weekly summary
  sees what changed, not the same 204-line list every week.
- `.github/workflows/` (`pr-rtl`, the weekly sweep) — CI wiring for the
  soft-gated general run and the blocking debt/evidence audit.

Debt-baseline ownership — which component owner is responsible for turning a
`known-coverage-gap` into `measured` or a properly evidenced `verified-na`,
and on what cadence, if any — is explicitly out of scope for this record; see
the open question below.

## Deciding specs

None yet. This record is itself the pending decision; promoting it to
`current` is what would create the first one.

## Open owner decision

`verified-not-applicable.json` already contains at least one `unknown/*`
declaration (`unknown/ChartTooltip`): a name with no matching source
directory or story component, so nothing resolves it to a canonical
component root. The proposed evidence-closure model (System model, above)
defines its digests in terms of "the canonical component source" and
"the same top-level component directory" — both undefined for an `unknown/*`
entry.

This was surfaced directly on the open evidence-hashing PR and is not yet
resolved: **should `unknown/*` components be eligible for `verified-na` at
all, and if so, what stands in for canonical source/story evidence when
there is no owning directory to hash?** Candidate shapes — excluding
`unknown/*` from `verified-na` entirely (it can only ever be a
`known-coverage-gap`, decided-away rather than reviewed-away); hashing
whatever file actually defines the fixture, wherever it lives; or requiring
every such fixture to be re-homed under a real component directory before it
can be declared N/A — are evidence for this decision, not the decision
itself. Until an owner picks one, evidence closure (INV2) does not fully
cover the registry it governs.

## Verification

| Invariant | Evidence                                                                                                                                                                          | Failure signal                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| INV1      | `rtl-audit-coverage.test.mjs` classifier tests                                                                                                                                    | A status is asserted from a hand-edited field instead of recomputed from detector + registry inputs                            |
| INV2      | `rtl-audit-coverage.test.mjs` evidence-invalidation controls (changed source / helper / story reverts a declaration to `coverage-gap`; restoring the file restores `verified-na`) | A changed, missing, or malformed evidence digest still reports `verified-na`                                                   |
| INV3      | Blocking semantic audit on baseline-file changes                                                                                                                                  | A pull request adds a component to the known-debt snapshot and CI passes                                                       |
| INV4      | `rtl-audit-coverage.test.mjs` stale-baseline controls                                                                                                                             | A component the detectors report `measured` remains in the known-debt snapshot with no failure                                 |
| INV5      | `.github/workflows` job configuration for `pr-rtl` vs. the blocking audit                                                                                                         | A change to either registry file passes without the blocking audit running                                                     |
| INV6      | `check-rtl-applicability-registries.mjs` structural checks                                                                                                                        | A D1 applicability exception is accepted inside `targets.json`, or a curated target is accepted as a colocated story parameter |
