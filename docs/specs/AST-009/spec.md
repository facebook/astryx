---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-009
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
phase: accepted
owners: [cixzhang, imdreamrunner]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Assistive-technology verification system spec

## Intent

People who depend on assistive technology should receive the focus and
announcement outcome Astryx claims, not merely markup that appears plausible in
a test DOM. Astryx therefore uses real assistive-technology and browser checks
when that user outcome depends on focus, announcement behavior, virtual-cursor
entry, or a known AT/browser divergence.

Those checks are targeted, not universal. Semantic changes may merge to `main`
with the strongest other evidence that proves their claims. A stable release
containing the change waits only when a trigger in this spec requires named real
AT/browser evidence and that evidence is still pending, failed, or expired.

## Non-goals

- Requiring every accessibility change to run every assistive technology or every
  browser.
- Treating real AT as a substitute for unit, DOM, accessibility-tree, axe, or
  browser tests that prove different claims more precisely.
- Defining consumer accessibility requirements or claiming conformance with an
  entire accessibility standard from one tool or matrix.
- Requiring a stable announcement transcript when an AT intentionally varies
  harmless phrasing while preserving the required information and order.
- Implementing release automation, contribution forms, labels, bots, fixtures,
  or test infrastructure in this specification pull request.
- Copying this policy into contributor or release guidance before those
  separately owned records exist.

## Requirements

### Verification triggers

- **FR1 — The gate follows the claimed user outcome.** Real AT/browser evidence
  is required when the intended user outcome depends on what focus or assistive
  technology does. A semantic code change alone is not the trigger; the trigger
  is a claim that cannot be proved below the real-AT layer in the evidence model.
- **FR2 — Focus-destination changes trigger when focus is the outcome.** A change
  requires real AT/browser verification when it changes or newly relies on the
  element that receives programmatic focus, initial focus, restored focus,
  composite focus, or focus after dismissal, and the person's ability to
  identify or continue the task depends on that destination. Focus-ring styling,
  a refactor that preserves the same browser focus target, or a static
  `tabIndex` correction does not trigger by itself.
- **FR3 — Role, name, and description changes trigger when announcement or mode
  is the outcome.** A computed role, accessible name, or description may be
  proved by accessibility-tree evidence when the claim ends at browser exposure.
  Real AT/browser verification is additionally required when the change relies
  on that semantic being announced during entry or a state transition, changing
  interaction/browse mode, or resolving a known AT/browser divergence.
- **FR4 — Announcement content and timing trigger directly.** A change to a live
  region, status message, alert, validation announcement, loading/completion
  transition, or other spoken/braille update requires real AT/browser evidence
  when success depends on what is announced, its order, when it occurs, whether
  it repeats, or whether it is skipped.
- **FR5 — Virtual-cursor entry triggers directly.** Opening, navigation, or focus
  behavior requires real AT/browser evidence when success depends on where a
  screen-reader browse or virtual cursor enters, whether content is discoverable
  from that entry point, or whether the user can move between browse and
  interaction modes. Ordinary keyboard Tab order with no browse-mode claim does
  not trigger this requirement.
- **FR6 — Known divergence keeps the gate active.** A changed pattern with a
  recorded AT/browser divergence requires checks for every named side of that
  divergence until an owner records that the divergence no longer applies. A
  passing result from one side does not stand in for another known to differ.
- **FR7 — Untriggered changes use proportionate evidence.** Static semantics,
  keyboard behavior, color/contrast, target size, source order, and similar
  accessibility changes use the least expensive evidence layer that directly
  proves the claim. They do not acquire a real-AT gate merely because they are
  accessibility work.
- **FR8 — Classification is explicit.** The change record states which trigger
  applies, or states why none applies and names the evidence layer that proves
  the intended outcome. Silence is not a classification.

### What each evidence layer proves

Each layer is bounded. Passing one layer MUST NOT be described as proving a
claim assigned to a later layer.

| Evidence           | It proves                                                                                                                                                          | It does not prove                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Unit               | State derivation, branch selection, callback effects, ordering owned by application code, and deterministic regressions                                            | Browser focus navigation, accessibility API exposure, or AT output                                                              |
| DOM                | Rendered elements, attributes, ownership markers, source order, and author-supplied ARIA relationships in the tested state                                         | Computed accessible name/description, platform accessibility mapping, speech, browse mode, or real browser event behavior       |
| Accessibility tree | The browser's computed role, name, description, state, relationships, and focused accessible node for the tested engine                                            | What an AT announces, announcement timing/order, virtual-cursor placement, or behavior in another engine/platform stack         |
| axe                | Rules the configured axe version can mechanically detect in the rendered states it was given                                                                       | Absence of all accessibility defects, task usability, correct focus destination, complete announcements, or AT interoperability |
| Real browser       | Actual focus destination/order/return, keyboard and pointer behavior, browser event timing, native semantics, and engine-specific state transitions                | Speech/braille output, browse or virtual-cursor entry, or AT-specific divergence                                                |
| Real AT/browser    | Observed speech/braille content and order, announcement timing/repetition, browse or virtual-cursor entry, mode transitions, and named AT/browser interoperability | Untested pairings, future versions, or claims outside the recorded scenario                                                     |

- **FR9 — Evidence composes by claim.** A triggered change normally keeps its
  lower-layer evidence and adds real AT/browser checks for only the claims those
  checks can prove. Real AT observation MUST NOT replace deterministic regression
  coverage for behavior the lower layers own.
- **FR10 — The tested state is the claimed state.** Evidence exercises the
  transition or state that carries the user outcome, such as opening the surface,
  moving focus, producing the status update, dismissing and restoring focus, or
  entering with the virtual cursor. A static baseline that merely contains the
  component is insufficient.
- **FR11 — Real means the shipping pairing.** A real-AT check runs the named
  assistive technology against the named shipping browser on its supported
  operating system. A virtual machine, remote machine, or simulator is acceptable
  only when it runs that actual pairing and preserves the input/mode under test.
  A DOM emulator, accessibility snapshot, synthetic speech stub, or browser
  engine standing in for a branded browser is not real-AT evidence.

### Representative matrix

The matrix is selected from the outcome and supported platform, not copied in
full onto every change.

| Representative pairing       | Use when the outcome includes                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| NVDA + Chrome on Windows     | Browser-neutral desktop focus or announcement behavior on the Chromium/Windows stack          |
| VoiceOver + Safari on macOS  | Browser-neutral desktop focus or announcement behavior on the Safari/macOS platform stack     |
| NVDA + Firefox on Windows    | Gecko-specific behavior or a named NVDA Chrome/Firefox divergence                             |
| VoiceOver + Safari on iOS    | Touch-driven iOS behavior, mobile Safari, rotor/browse navigation, or iOS-specific divergence |
| TalkBack + Chrome on Android | Touch-driven Android behavior, Android virtual navigation, or Android-specific divergence     |

- **FR12 — Desktop-neutral claims use two independent stacks.** A focus or
  announcement outcome claimed across supported desktop browsers uses at least
  NVDA + Chrome on Windows and VoiceOver + Safari on macOS. A platform-specific
  claim uses its matching pairing only unless FR14 expands it.
- **FR13 — Mobile claims use a matching mobile stack.** A mobile or touch/virtual-
  cursor outcome uses at least one matching mobile pairing. Both iOS and Android
  are required only when the claim covers both and platform-specific code,
  behavior, or recorded evidence gives reason to expect different outcomes.
- **FR14 — Divergence expands rather than replaces.** Every side named in a known
  divergence is included even when that adds a pairing beyond FR12 or FR13.
- **FR15 — Versions and modes are part of the matrix.** The receipt names OS, AT,
  browser, input mode, and material settings or verbosity that affect the result.
  “Screen reader checked” or a browser name without its AT is not a matrix.
- **FR16 — Representative does not mean exhaustive.** Passing the selected matrix
  supports only the recorded outcome and pairings. It does not claim every AT,
  browser, verbosity setting, locale, or input method behaves identically.

### Stable-release lifecycle

- **FR17 — Merge and stable release are separate gates.** When intended user
  impact depends on focus, announcement or virtual-cursor behavior, or a known
  AT/browser divergence under FR2–FR6, the implementation may merge to `main`
  once its required automated and real-browser evidence passes, its real-AT
  matrix and scenario are named, and a durable release-block record exists.
  Preview and prerelease builds may carry the pending change. The first stable
  release containing it MUST NOT publish while the block is pending, failed, or
  expired.
- **FR18 — The block follows the shipped change.** The block identifies the
  source pull request and commit, the first affected stable release or release
  line when known, each required matrix row, and the state of each row:
  `pending`, `pass`, `fail`, `excepted`, or `invalidated`.
- **FR19 — Only passes or a current exception clear the block.** Every required
  row must have a passing receipt bound to an applicable build, or be covered by
  an unexpired owner-recorded exception. Missing, failed, and invalidated rows
  continue to block the stable release.
- **FR20 — Failures remain findings.** A failed observation records the user
  impact and linked fix. The affected row is retested against the fixed build;
  unrelated passing rows remain usable unless the fix could affect them. Editing
  an expected result to match an undesirable observation does not turn failure
  into pass.
- **FR21 — Receipts remain valid until invalidated.** A passing receipt may be
  reused for later stable releases while the tested semantic, focus,
  announcement, virtual-cursor, or divergence-sensitive path and relevant
  support claim remain unchanged. Revalidation is required after a material
  change to that path or fixture, a fix for the observed behavior, a newly
  recorded divergence that affects the matrix, or an explicit receipt/exception
  expiry. Unrelated commits do not invalidate evidence.
- **FR22 — Revalidation decisions are recorded.** When a later build differs from
  the tested commit, the release record either links the material revalidation
  receipt or records why the difference cannot affect the tested path. The
  latter is applicability review, not a new AT pass.

### Exceptions and expiry

- **FR23 — Exceptions are explicit owner decisions.** Only a listed owner of this
  spec may authorize release without a required pass. Absence of equipment,
  schedule pressure, a green axe run, or prior behavior does not imply an
  exception.
- **FR24 — Exceptions are narrow and finite.** An exception names the exact
  change, stable release or release line, omitted or failed matrix rows, accepted
  user risk, compensating evidence or mitigation, owner, decision date, and an
  expiry date or release boundary. A release-scoped exception authorizes only
  that named release; it does not become a standing waiver.
- **FR25 — Expiry restores the block.** At the earliest recorded expiry,
  invalidating behavior change, newly applicable divergence, or end of the named
  release scope, the row returns to `pending` or `invalidated`. A later stable
  release needs a pass or a new owner decision with current risk information.
- **FR26 — Exceptions do not rewrite evidence.** An excepted row remains visibly
  excepted rather than pass. The follow-up check or fix remains linked until it
  produces a passing receipt or the affected behavior is removed.

### Durable receipts and evidence storage

- **FR27 — The textual receipt is durable and public.** The canonical receipt
  lives in the merged pull request, a linked public tracking issue, or a
  repository-owned record. It MUST remain readable without access to expiring CI
  artifacts, private systems, or an unversioned local file.
- **FR28 — Every receipt is reproducible.** It records:
  - source pull request and commit or tested build identifier;
  - stable story, fixture, route, or exact reproduction steps;
  - trigger and contract claim under test;
  - expected focus destination, semantics, announcement, timing, or virtual-
    cursor outcome;
  - OS, AT, browser, and relevant settings/versions;
  - input sequence and starting state;
  - observed result, including announcement transcript or focus/cursor
    destination when applicable;
  - `pass` or `fail`, tester, and date; and
  - linked defect, follow-up, exception, and attachments when applicable.
- **FR29 — Text carries the decision-critical facts.** Screenshots, recordings,
  speech logs, and CI artifacts may supplement the receipt. They MUST NOT be the
  only place that records the matrix, expected outcome, observation, result, or
  exception. Evidence must contain no private user data or internal-only links.
- **FR30 — Reusable scenarios live with the code.** When a scenario will be used
  for release revalidation or represents a component contract, its stable story
  or fixture is checked into the repository. A one-off external test page is not
  the sole reproduction path.
- **FR31 — Guidance projects this spec.** Future contributor accessibility
  guidance must link to this spec for trigger classification, evidence bounds,
  and receipt requirements. Future release guidance must link to this spec for
  block, exception, expiry, and revalidation rules. Those guides may explain the
  current workflow but MUST NOT duplicate or redefine this policy.

### Platform support

- Supported feature/engine floor: the matrix follows the browser and platform
  support of the affected Astryx component or package.
- Unsupported behavior: no passing claim is made for an untested unsupported
  pairing; a known supported-pairing divergence follows FR6 and FR14.
- Browser evidence: Playwright or another real-browser runner may prove browser
  behavior and accessibility-tree exposure. It does not satisfy the real-AT rows
  unless the actual named assistive technology is operating against the named
  browser.

## Current-state impact

- Pull request #5373 changed read-only Popover initial focus so the labeled dialog
  container receives focus when no content control is available. Its merge-time
  unit, DOM, axe, and browser evidence can support merging the semantic change. Because the intended outcome depends on what is announced at
  that focus destination, the first stable release containing it waits for
  NVDA + Chrome on Windows and VoiceOver + Safari on macOS receipts, or an
  explicit current exception.
- Existing axe and browser checks remain required where they prove their assigned
  claims. Neither one clears an AT-triggered release block by itself.

### Initial release block — pull request #5373

- **Source change:** pull request
  [#5373](https://github.com/facebook/astryx/pull/5373), merged as
  `1917581938200c3e56527bf4cda6d5de78b492a5`.
- **Affected release:** the first stable release containing that commit; the
  version is not yet known.
- **Trigger:** FR2 and FR3. Read-only Popover initial focus moved to its labeled
  dialog container, and the intended result depends on the focused role and name
  being announced on entry.
- **Scenario:** open the `Read-only dialog focus` story, confirm the dialog name
  and role are announced at the focused container, then confirm the first Tab
  enters the dialog's control cycle rather than moving to unrelated content.

| Required pairing            | State     |
| --------------------------- | --------- |
| NVDA + Chrome on Windows    | `pending` |
| VoiceOver + Safari on macOS | `pending` |

Both rows block that stable release until they have passing durable receipts or
are covered by a current owner-recorded exception.

- This accepted spec creates no runtime or process implementation. A later
  atomic change may add contributor workflow or release mechanics that project
  this contract without changing it.
- No current contributing record owns assistive-technology verification or the
  release hold. When those records are authored, they must link back to
  `spec:AST-009` rather than copying its policy; only then should their current
  identifiers be added to `affects_contributing`.

## Verification

| Contract  | Verification                                                    | Representative states                                                                                       | Mutation or failure expectation                                                                                                       |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR8   | Classification review against the change's claimed user outcome | static semantic fix; container autofocus; focus return; live update; virtual-cursor entry; known divergence | A change with an AT-dependent outcome ships without a gate, or an unrelated accessibility fix is forced through a universal AT matrix |
| FR9–FR11  | Evidence-map review plus the focused tests/observations         | unit state; DOM attributes; computed tree; axe state; browser focus; spoken/braille result                  | A lower layer is credited with speech, timing, cursor, or interoperability it cannot observe                                          |
| FR12–FR16 | Named matrix in the durable release-block record                | desktop-neutral; platform-specific; mobile; known divergent stacks                                          | A generic “screen reader checked” result substitutes for the required independent or divergent pairing                                |
| FR17–FR22 | Release-record review against source commit and candidate build | merged pending change; passing rows; failed row and fix; later unrelated build                              | A stable release publishes with a pending/failed/invalid row, or unrelated commits force needless retesting                           |
| FR23–FR26 | Owner and expiry review                                         | release-scoped exception; dated exception; expired or invalidated exception                                 | A waiver is inferred, recorded as pass, loses its user-risk statement, or silently becomes permanent                                  |
| FR27–FR31 | Receipt completeness and link-durability review                 | PR receipt; linked issue; reusable checked-in fixture; supplementary recording                              | Critical evidence exists only in an expired/private artifact, cannot be reproduced, or guidance forks this policy                     |

### Completion criteria

This accepted policy is satisfied for an affected stable release only when:

- every included change has an explicit trigger classification;
- each claim has evidence from the layer that can observe it;
- every triggered real-AT row has a complete applicable passing receipt or a
  current owner-recorded exception;
- pending, failed, invalidated, and expired rows still block the stable release;
  and
- the canonical receipts and any exceptions remain durably linked from the
  change or release record.

## Decision log

### DEC-1 — Real AT verification is outcome-triggered, not category-wide

**Reference:** `spec:AST-009/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

Real AT/browser verification is required when the intended user outcome depends
on focus, announcement behavior, virtual-cursor entry, or known divergence. Other
accessibility changes use the evidence layer that directly observes their claim.

Rejected: requiring every accessibility change to run every AT. That creates
cost without improving proof and encourages shallow checkbox testing.

### DEC-2 — Evidence layers keep distinct proof boundaries

**Reference:** `spec:AST-009/DEC-2`
**Decider:** `cixzhang`, `2026-08-31`

Unit, DOM, accessibility-tree, axe, browser, and real-AT evidence each prove a
different boundary. A change composes the necessary layers instead of treating
one tool as accessibility proof in general.

Rejected: accepting a green axe run, plausible ARIA, or an accessibility snapshot
as proof of what a person hears or where their virtual cursor enters.

### DEC-3 — The real-AT matrix is representative and claim-specific

**Reference:** `spec:AST-009/DEC-3`
**Decider:** `cixzhang`, `2026-08-31`

Desktop-neutral focus and announcement claims use NVDA + Chrome on Windows and
VoiceOver + Safari on macOS. Mobile, platform-specific, and known-divergent claims
select or expand that matrix according to the affected outcome. Passing results
make no universal compatibility claim.

Rejected: one fixed exhaustive matrix for every change, or one convenient
pairing standing in for a stack already known to behave differently.

### DEC-4 — Pending AT evidence blocks stable release, not merge to main

**Reference:** `spec:AST-009/DEC-4`
**Decider:** `cixzhang`, `2026-08-31`

When intended user impact depends on focus, announcement or virtual-cursor
behavior, or a known AT/browser divergence under FR2–FR6, the implementation may
merge with the required automated and real-browser evidence plus a durable named
follow-up. The first stable release containing it remains blocked until the named
real AT/browser matrix passes or a spec owner records a narrow, expiring
exception.

Rejected: holding every such change out of `main`, which delays integration and
other evidence, or releasing it stably on an unowned promise to test later.

### DEC-5 — Evidence and exceptions remain durable at the change boundary

**Reference:** `spec:AST-009/DEC-5`
**Decider:** `cixzhang`, `2026-08-31`

The change or linked release record carries reproducible textual receipts,
applicable build identity, results, and finite exceptions. Expiring artifacts may
supplement but cannot own the facts that clear the release block.

Rejected: private notes, local files, or transient CI artifacts as the only
release evidence. Future contributors and maintainers must be able to audit why a
release was allowed.

## Open questions

None.
