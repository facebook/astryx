---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-021
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

# Component accessibility-test migration system spec

## Intent

People using existing Astryx components should gain the same standards-traceable
protection as new components without waiting for a repository-wide rewrite. Astryx
migrates accessibility assertions progressively into reusable spec-test contracts,
locks in behavior that already passes, and exposes each existing failure as owned
work instead of hiding it behind missing or skipped tests.

Migration separates shared pattern behavior from component-specific behavior. A
component binding says which pattern and states it implements. The reusable contract
owns the shared WCAG 2.2/APG outcome; the component suite keeps API, composition, and
implementation-specific regression coverage.

## Non-goals

- Defining how accessibility spec tests are authored; that is owned by
  [AST-020](../AST-020/spec.md).
- Fixing every accessibility defect in the same pull request that reveals it.
- Deleting component-specific tests merely because they mention ARIA or keyboard
  input.
- Treating a known failure, skipped expectation, or high coverage percentage as a
  passing accessibility result.
- Blocking all existing components on every historical gap before migration can
  begin.
- Migrating page-level, visual, or real-AT requirements into a component runtime
  contract that cannot prove them.

## Requirements

### Migration inventory and unit of work

- **FR1 — Migration depends on the authoring contract.** This spec MUST NOT become
  `current` before AST-020 is `current`. Every migrated pattern and binding MUST
  satisfy AST-020's traceability, applicability, evidence-layer, review, and
  readable-pull-request requirements.
- **FR2 — Inventory precedes deletion.** Before changing tests for a component, the
  migration MUST record each interactive part, its adopted pattern or patterns,
  representative states, existing shared-pattern assertions, component-specific
  assertions, assigned evidence layers, and known failures. A component with
  multiple interactive parts MUST map each part separately.
- **FR3 — Migration pull requests stay bounded.** A pull request SHOULD add or
  materially revise one reusable pattern contract and its first representative
  bindings, or migrate one bounded set of bindings to an already-current contract.
  It MUST NOT combine unrelated patterns, broad component remediation, or visual
  redesign merely to raise coverage.
- **FR4 — Representative states are explicit.** Each binding MUST cover every
  component state that can change the adopted pattern outcome. Depending on the
  component, that includes default and changed value, controlled and uncontrolled,
  enabled and disabled, focusable-disabled, required or invalid, open and closed,
  orientation, direction, loading, error, and relevant composed parts. The inventory
  records why omitted states cannot change the shared outcome.

### Moving and retaining coverage

- **FR5 — Move only equivalent assertions.** An existing test moves into the shared
  contract only when its user outcome, applicability, and evidence layer are the
  same for every binding. Tests for callback payloads, public props, form submission,
  component-owned composition, styling, or a deliberate component exception remain
  local even when they also inspect ARIA or keyboard events.
- **FR6 — Duplicate ownership ends in the migration pull request.** Once a contract
  and binding prove an existing shared outcome at the same or stronger layer, the
  exact local assertion MUST be removed or rewritten to cover only the remaining
  component-specific contract. Temporary duplication requires a named removal
  blocker; “extra coverage” is not a permanent reason to keep two owners.
- **FR7 — Existing behavior is preserved unless a separate change authorizes it.**
  A migration pull request records observed failures but does not silently change
  component API, interaction, focus, semantics, visuals, or compatibility. A small
  prerequisite fix may land first or in a separately reviewable commit and pull
  request under its owning current records.

### Known failures and regression gates

- **FR8 — Every known failure is exact and actionable.** A known-failure record MUST
  name the expectation id, component binding and state, observed user impact,
  standards reference, evidence layer, public tracking issue, and reason the
  migration does not fix it. Wildcards, whole-pattern suppression, and unowned text
  reasons are prohibited.
- **FR9 — A known failure suppresses only its recorded result.** A binding with a
  known failure still runs the expectation. A different error, another state, a new
  expectation, or a wider failure MUST fail. When the expectation starts passing,
  CI MUST report an unexpected pass and require removal of the stale record rather
  than continuing to count it as debt.
- **FR10 — Migration locks the baseline without calling debt conformance.** Required
  expectations that pass gate immediately for that binding. Recorded historical
  failures remain visibly failing debt but do not prevent the first migration.
  New components and newly supported states MUST NOT add a required known failure.
  Adding or widening a known failure after the baseline requires an explicit owner
  decision and linked defect; it is not a routine test update.
- **FR11 — Reports show facts, not one quality score.** Coverage output MUST report
  patterns, bindings, applicable expectations, passes, known failures, unrun layers,
  and exemptions separately. It MUST NOT collapse those states into one percentage
  or grade presented as component accessibility or conformance. A pattern with one
  required failure is not “mostly conformant.”

### Repository integration and review

- **FR12 — Current component records point to the new owner.** When a migrated
  component has a current component or module record, its `verified_by` metadata and
  verification map MUST name the binding and keep separate evidence for outcomes the
  shared contract does not own. Migration does not create a component record solely
  to satisfy this backlink.
- **FR13 — New work uses an existing contract first.** Once a pattern contract is
  current, a new component or newly added component part that adopts that pattern
  MUST bind to it from its first implementation. Authors MUST NOT create a parallel
  ad hoc copy of the shared assertions. If the contract is incomplete, extend and
  review the contract before relying on local tests.
- **FR14 — The migration pull request is a readable ledger.** Its description MUST
  name the affected users and pattern, component parts and states bound, assertions
  moved, local tests retained and why, exact known failures and linked issues,
  evidence layers run, and mutation or before/after evidence. The description MUST
  distinguish test migration from component remediation.
- **FR15 — Progress is ordered by user leverage.** The first binding remains the
  Switch reference proven by the prototype. Later work prioritizes widely reused
  interactive patterns, components with known keyboard/focus/semantic failures, and
  shared primitives whose correction protects multiple components. Repository order
  or ease of producing a high count MUST NOT override user impact.

### Platform support

- Supported feature/engine floor: each binding follows its component's current
  support contract and AST-020's assigned evidence layer.
- Unsupported behavior: an unrun browser, visual, manual, or real-AT layer remains
  explicitly unrun; jsdom success does not clear it.
- Browser evidence: component changes that can affect browser-owned pattern behavior
  run the relevant real-browser binding. Real-AT outcomes follow
  [AST-009](../AST-009/spec.md) and keep their durable receipts and release boundary.

## Current-state impact

Current component suites mix shared accessibility outcomes with public API,
implementation, visual, and regression tests. For example, Switch currently tests
role, accessible name and description, checked and disabled states, activation,
form participation, loading and error semantics, disabled-reason composition,
forced-color CSS, callback payloads, and layout details in one file. The shared
Switch pattern can own only the standards-derived role, name, state, focusability,
and activation outcomes. Form data, callback payloads, tooltip composition, and
component styling remain Switch-owned.

[Issue #4112](https://github.com/facebook/astryx/issues/4112) and the closed
[Switch prototype](https://github.com/facebook/astryx/pull/4113) prove that an
existing component can bind to one reusable contract in jsdom and Chromium. The
prototype's `expectedFailures` mechanism is retained only with FR8–FR10's exactness:
a known failure is visible debt, never a pass or a broad skip.

The accessibility program tracker
[#4475](https://github.com/facebook/astryx/issues/4475) remains the public place to
order pattern migrations and component defects. Migration pull requests add newly
found defects there or to focused public issues. They do not depend on a private
backlog or private review link.

### Progressive rollout

1. **Reference pattern.** Rebuild the Switch prototype under current AST-020 types,
   self-tests, evidence boundaries, and reporting. Bind the current Switch states
   without changing behavior.
2. **Simple controls.** Migrate other single-control patterns where role, name,
   state, disabled behavior, and keyboard activation can be isolated cleanly.
3. **Composite widgets.** Migrate selection, navigation, grid, tree, and menu parts
   with orientation, direction, roving focus, typeahead, and open/closed states.
4. **Overlays and async outcomes.** Add browser-owned focus, top-layer, inert, and
   dismissal checks, while routing announcement and virtual-cursor claims through
   AST-009.

The tracker may reorder components within these phases by user impact. A later phase
MUST NOT weaken the evidence boundaries or known-failure rules to increase throughput.

This draft changes no component test, behavior, package, public API, or CI gate.

## Verification

| Contract  | Verification                                                               | Representative states                                                                         | Mutation or failure expectation                                                                                                        |
| --------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4   | Migration inventory schema and review                                      | one control; component with trigger and popup; controlled/disabled/error/RTL states           | Migration starts without an applicable current contract, treats a whole component as one part, or omits a state that changes semantics |
| FR5–FR7   | Before/after assertion ownership review and unchanged component suites     | shared role/state check; callback payload; form data; style rule; discovered component defect | Shared assertion remains duplicated, component-specific proof is deleted, or migration silently changes behavior                       |
| FR8–FR10  | Runner tests for exact known failures, new failures, and unexpected passes | one historical gap; wrong error; second state; fixed expectation                              | A wildcard masks regression, a stale gap remains, or new work adds debt without decision                                               |
| FR11      | Coverage-report snapshot and assertions                                    | pass; known failure; exemption; unrun browser layer                                           | One percentage hides a required failure or reports an unrun layer as pass                                                              |
| FR12–FR14 | Knowledge validation, component verification map, and PR-template check    | current component record; component with no record; first new adopter                         | Backlink points to deleted local tests, parallel ad hoc assertions appear, or the PR hides migration/remediation scope                 |
| FR15      | Public tracker review                                                      | high-use control; known keyboard defect; easy low-impact component                            | Work is ordered only to maximize migrated counts                                                                                       |
| Platform  | Existing unit/axe/browser checks plus AST-009 classification               | jsdom behavior; real focus; tree exposure; spoken announcement                                | A lower layer clears browser pixels or real-AT output it cannot observe                                                                |

### Completion criteria

A pattern migration is complete only when:

- its contract is current under AST-020 and passes its positive and negative
  self-tests;
- every affected component part and relevant state has a binding or an explicit
  ownership reason for exclusion;
- equivalent shared assertions have one owner and component-specific tests remain;
- every historical failure has the exact public debt record required by FR8;
- required passing expectations gate regressions and unexpected passes remove stale
  debt;
- reporting separates passes, known failures, exemptions, and unrun layers;
- current component or module records point to the new binding when those records
  exist; and
- the pull request presents the readable migration ledger required by FR14.

The repository migration is complete only when every shipped interactive component
part is mapped to a current pattern contract or explicitly records why no reusable
pattern applies, and no duplicate ad hoc test remains for a shared expectation.

## Decision log

### DEC-1 — Migrate progressively with exact known failures

**Reference:** `spec:AST-021/DEC-1`
**Decider:** `cixzhang`, `2026-09-03`

Apply contracts one pattern and bounded binding set at a time. Preserve historical
failures as exact, runnable, public debt while immediately gating outcomes that
already pass. This adds protection now without pretending existing defects are
conformant or waiting for a repository-wide remediation.

Rejected: all-or-nothing migration, silent skips, and enabling one broad report-only
suite that cannot stop regressions.

### DEC-2 — Keep migration separate from remediation

**Reference:** `spec:AST-021/DEC-2`
**Decider:** `cixzhang`, `2026-09-03`

A migration identifies shared ownership, moves equivalent assertions, and records
what fails. Behavior fixes follow their component, family, browser, or AT contract in
separately reviewable work. This keeps each change understandable and revertible and
prevents test infrastructure from smuggling product decisions.

Rejected: changing component behavior until the new contract turns green inside the
same migration pull request.

### DEC-3 — Preserve component-specific tests

**Reference:** `spec:AST-021/DEC-3`
**Decider:** `cixzhang`, `2026-09-03`

Move only standards-derived outcomes that are identical across bindings. Keep public
API effects, callback payloads, composition, form behavior, styling, and deliberate
component exceptions with the component that owns them.

Rejected: replacing a component suite with only a pattern binding or keeping every
old assertion as duplicate “extra coverage.”

### DEC-4 — Coverage is a ledger, not an accessibility score

**Reference:** `spec:AST-021/DEC-4`
**Decider:** `cixzhang`, `2026-09-03`

Report what is applicable, passing, failing, exempt, or unrun. Do not average unlike
requirements into a number that can make one required failure look acceptable.
This keeps progress measurable without turning test count into a false product
quality claim.

Rejected: a 0–100 component conformance score as the primary rollout or quality
signal.

## Open questions

None.
