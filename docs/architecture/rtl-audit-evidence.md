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
owners: [cixzhang, imdreamrunner, nynexman4464]
applies_to:
  [
    apps/storybook/rtl-audit/,
    .github/workflows/ci.yml,
    .github/workflows/rtl-weekly.yml,
    .github/scripts/rtl-audit-coverage.test.mjs,
    .github/scripts/weekly-rtl-summary.js,
    internal/eslint-plugin-astryx/no-physical-properties.js,
  ]
verified_by:
  [
    .github/scripts/rtl-audit-coverage.test.mjs,
    .github/scripts/weekly-rtl-summary.test.mjs,
    internal/eslint-plugin-astryx/no-physical-properties.test.mjs,
  ]
deciding_specs: []
---

# RTL audit evidence architecture

## Purpose

Astryx needs review evidence that distinguishes three claims:

1. a component's direction-sensitive behavior was actually measured;
2. RTL genuinely does not apply to the component; or
3. RTL applicability remains unmeasured debt.

A green lint rule, an all-N/A browser report, or a checked-in exception must not be
credited with proving more than it observed. This draft records the current audit
system and the policy choices still requiring owner approval.

## System model

```text
changed component or full-library sweep
  → discover the live Core/Lab component roster
  → render relevant stories LTR and RTL
  → run automatic relationship checks
  → run curated component checks
  → combine results per component
       measured
       verified N/A
       unexplained coverage gap
       optional known debt (unresolved proposal)
  → report behavior failures, stale evidence, and applicability state
```

Lint and rendered audit are complementary:

- lint rejects source patterns whose directional failure can be proved from the
  declarations alone;
- browser checks prove computed geometry, visibility, ordering, hit targets,
  scroll/drag behavior, and composed transforms;
- verified-N/A evidence, if admitted, proves only that reviewed source and stories
  currently expose no direction-sensitive relationship.

## Boundaries and invariants

- **INV1 — Evidence follows the claim.** Source lint MUST NOT stand in for
  computed geometry or interaction. Rendered screenshots MUST NOT stand in for
  keyboard, drag, scroll, or hit-test behavior. A browser relationship check MUST
  NOT claim that every component state was exercised when its stories did not
  render those states.
- **INV2 — RTL is graded as a relationship.** Directional evidence compares LTR
  and RTL outcomes from the same built source. Pixel identity is not the contract;
  semantic mirroring, order, side, geometry, and behavior are.
- **INV3 — Behavior failures have no allowlist.** When an applicable automatic or
  curated dimension shows incorrect mirroring, ordering, placement, geometry, or
  behavior, the result is a finding. Known history does not turn incorrect RTL
  behavior into pass or N/A.
- **INV4 — All-N/A is not measured.** A component for which every dimension is N/A
  has no positive RTL evidence. It is either verified not applicable under an
  admitted evidence policy or remains a coverage gap/debt.
- **INV5 — The live source roster owns coverage.** A component cannot disappear
  from review merely because it has no story or because its story title changed.
  Missing renderability is itself a coverage gap when the component is in scope.
- **INV6 — Automatic and curated coverage compose.** Generic checks cover broadly
  discoverable icon, decoration, and positional relationships. Component-specific
  selectors are used only for semantics generic discovery cannot infer, such as
  order, scroll direction, overlay side, or touch-target ownership.
- **INV7 — CI scope and weekly scope answer different questions.** PR CI checks
  components affected by the change. The scheduled unfiltered audit checks the
  full live roster and shared regressions. Neither silently replaces the other.
- **INV8 — Applicable evidence invalidates N/A.** A new applicable automatic or
  curated dimension MUST make an existing verified-N/A declaration stale. Source-
  and story-byte invalidation is a proposed additional closure requirement, not a
  capability of the current reason-only registry.
- **INV9 — Evidence mutations prove the gate.** A new audit rule or dimension MUST
  demonstrate that the relevant defect passes unnoticed without the rule and is
  detected after the rule. A passing happy path alone does not prove enforcement.
- **INV10 — Touch-target evidence includes size and alignment.** For a coarse-
  pointer target, proving that the target center matches the visible control is
  insufficient. Browser evidence MUST also measure the effective/native target
  against the owning component's stated minimum size. Current D7 enforcement
  checks centering and hit-testing only; size enforcement is an open gap.
- **INV11 — Audit state is not product intent.** This architecture owns evidence
  admission and freshness. The human meaning of correct bidirectional behavior
  belongs in `design:bidirectionality`; component contracts own local adoption and
  exceptions.

## Change coupling

Changes to audit dimensions, component discovery, curated targets, applicability
registries, proposed evidence hashes, workflow scope, summaries, or RTL lint must
review this record.

A new direction-sensitive component contract must map its requirement to executable
evidence or remain an explicit gap. If owners admit verified N/A or known debt with
byte-bound closure, the implementation MUST bind that evidence to the canonical
source, directly owned helpers/styles, and owned stories so relevant changes fail
stale rather than silently retaining their old classification.

Promoting this record to `current` requires owner decisions on verified-N/A
admission and pre-existing debt. Until then, implementation PRs may improve
mechanics but cannot claim the unresolved policy as settled.

## Owning code

- `apps/storybook/rtl-audit/rtl-audit.mjs` — renders and compares LTR/RTL behavior.
- `apps/storybook/rtl-audit/rtl-audit-coverage.mjs` — discovers the live roster and
  combines measured, N/A, and gap states.
- `apps/storybook/rtl-audit/targets.json` — curated D2/D3/D4/D7 behavior targets.
- `apps/storybook/rtl-audit/verified-not-applicable.json` — candidate verified-N/A
  registry; its admission policy is unresolved in this draft.
- `apps/storybook/rtl-audit/known-coverage-gaps.json` — proposed by PR #5988
  for pre-existing debt; this file is not present on current `main`, and its
  admission policy is unresolved in this draft.
- `.github/workflows/ci.yml` — affected-component PR audit.
- `.github/workflows/rtl-weekly.yml` — full-roster scheduled audit.
- `internal/eslint-plugin-astryx/no-physical-properties.js` — source-provable
  physical/logical declaration constraints.
- `design:bidirectionality` — candidate human product intent, owned separately.

The shipped RTL mechanics themselves still lack one canonical architecture owner.
A follow-up `architecture:bidirectional-layout` record should own CSS logical
properties, `rtlStyles`, lazy DOM direction reads, centering helpers, and
first-paint/hydration invariants. This evidence record MUST NOT be treated as that
missing implementation contract.

## Deciding specs

No current system spec settles verified-N/A or known-debt admission. The current
knowledge architecture requires evidence freshness and explicit human decisions;
this draft narrows the remaining decision to the options below.

## Verification

| Invariant        | Evidence                                                    | Failure signal                                                                              |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| INV1, INV2, INV6 | focused audit fixtures plus real built Storybook mutations  | A source-only rule claims rendered correctness, or a relationship defect stays green        |
| INV3             | automatic/curated failure tests and summary tests           | A known bad RTL outcome is suppressed as expected or N/A                                    |
| INV4, INV5       | coverage fixtures with missing/no-applicable stories        | A component disappears or all-N/A reports as RTL-ready                                      |
| INV7             | PR workflow scope tests and weekly-summary tests            | A changed component is skipped or full-roster debt is mistaken for PR-only evidence         |
| INV8             | automatic/curated applicability tests                       | A newly applicable dimension leaves a verified-N/A declaration current                      |
| INV9             | red/green mutation receipts for each new dimension          | A new dimension has only passing self-confirming tests                                      |
| INV10            | none for size today; D7 covers center/hit in LTR/RTL, sm/md | Removing the component's minimum native hit area remains green because D7 never checks size |

### Candidate evidence states

| State                   | Minimum evidence                                                                                   | May clear a new/changed component? | Current decision state            |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------- |
| Measured                | At least one applicable relationship or behavior check passes; every applicable check passes       | yes                                | settled by current audit behavior |
| Verified N/A            | Today: human-reviewed reason; proposed: source/helper/story evidence with fail-closed invalidation | unresolved                         | owner decision required           |
| Coverage gap            | No applicable measurement and no admitted current N/A evidence                                     | no                                 | settled                           |
| Known pre-existing debt | Proposed removal-only baseline entry that remains visible and non-failing while unchanged          | unresolved                         | owner decision required           |
| Behavior failure        | An applicable dimension fails                                                                      | no                                 | settled; no suppression           |
| Stale evidence          | Today: an applicable dimension appears; proposed: recorded evidence bytes change                   | no                                 | partially implemented             |

### Current enforcement gaps

- D7 currently measures hit-testing and center alignment in LTR/RTL at sm/md under
  a coarse pointer, but does not fail when the native target falls below the owning
  component's minimum size. The #5177 review demonstrated this false-green by
  removing the coarse native-input expansion. Add the size assertion and report
  the native input box before crediting INV10 as enforced.
- The reason-only verified-N/A registry becomes stale when an automatic/curated
  dimension becomes applicable, but does not yet bind evidence to source/helper/
  story bytes.
- CI summary code still contains an unused `knownNotRtl` label path even though the
  report emits no such allowlist. Remove it so the implementation cannot be read as
  permitting known behavior failures.
- Checkbox, Radio, and Switch currently implement a 24×24 coarse native target,
  but their component contracts do not yet own that number. Record target-size
  requirements under the relevant component/composition contract and AST-020.

## Open decisions

### OQ1 — Is verified N/A an admitted closure state?

- **Option A:** Admit verified N/A when one declaration carries a specific reason.
  Before this option can become current, add evidence over the canonical source,
  directly owned helpers/styles and owned stories, plus fail-closed invalidation.
  This recognizes truly direction-neutral components without manufacturing
  meaningless browser tests.
- **Option B:** Require every component to have executable rendered measurement.
  This removes judgment-based N/A but forces artificial checks for components with
  no directional relationship.

### OQ2 — May pre-existing unexplained all-N/A enter removal-only known debt?

- **Option A:** Snapshot existing gaps as visible, non-failing debt while new gaps,
  stale entries, behavior failures, and removals that do not become measured/N/A
  continue to fail. This allows gradual rollout without hiding the inventory.
- **Option B:** Keep every unexplained gap failing. This is simpler and stricter,
  but leaves the audit permanently red until the full historical roster is
  measured or reviewed.

### OQ3 — When does RTL become a required merge check?

The current PR audit is soft-gated. Owners must choose the prerequisite clean
states and stability window before making it required. Regardless of gate status,
reports must remain truthful and behavior failures must not be relabeled.
