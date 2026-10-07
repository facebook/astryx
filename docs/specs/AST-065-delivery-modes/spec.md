---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-065
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [ejhammond]
affects_architecture:
  [architecture:cli-surface, architecture:component-style-authoring]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli, agent-guidance]
---

# Coding-agent delivery modes system spec

## Intent

A coding agent choosing how to build with Astryx receives one default path from
the artifact's expected lifespan. A one-off artifact starts from build-less
vanilla HTML. An application that lives in a repository and evolves over time
starts from React and Next.js. The guidance remains explicit enough that the
agent can enter either path without inferring package, styling, or discovery
mechanics from the other.

This record owns the delivery-mode choice presented to coding agents, the
minimum onboarding contract for each mode, the readiness boundary for readable
CSS and web components, and the evidence required to compare delivery modes. It
projects the existing CLI contract in
[`architecture:cli-surface`](../../architecture/cli-surface.md) and does not
change that command surface by itself.

## Non-goals

- Choosing a framework for an existing repository whose own requirements
  already make that choice.
- Promising that every React component or supported browser has a build-less
  equivalent.
- Defining a stable public web-component API while that delivery mode remains
  experimental.
- Creating a new npm package or assigning its long-term ownership.
- Treating one prompt set, coding agent, browser, or evaluation run as proof for
  every consumer task.
- Replacing the browser, accessibility, compatibility, and component contracts
  that own the generated interface itself.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Lifespan selects the default.** Agent-facing guidance MUST recommend
  build-less vanilla HTML for a one-off page, prototype, or disposable artifact.
  It MUST recommend React and Next.js for a repository application expected to
  evolve over time.
- **FR2 — Explicit constraints override the default.** A caller's explicit
  request for React, Next.js, a framework build, vanilla HTML, or web components
  MUST take precedence over the lifespan default. An existing repository MUST
  retain its established framework unless the caller asks to change it.
- **FR3 — Onboarding branches before implementation.** The first agent-facing
  decision MUST identify the selected delivery mode before giving component or
  template instructions. Each branch MUST provide its complete setup, discovery
  commands, supported templates and components, styling rules, and validation
  steps without requiring the agent to read another branch.
- **FR4 — Build-less HTML uses a readable contract.** Vanilla HTML MUST use
  documented `ax-*` BEM classes, native elements and ARIA state where possible,
  semantic Astryx custom properties, and documented progressive-enhancement
  hooks. Generated examples MUST start from a complete page template and MUST
  NOT require React, JSX, a bundler, or a package installation in the generated
  project.
- **FR5 — Shared CSS starts from an explicit recipe.** A production path that
  shares component styling between React and readable CSS MUST introduce a
  serializable component-style recipe with separately maintained lowerings for
  StyleX and readable selectors. It MUST NOT derive the readable contract by
  renaming every compiled atomic rule or by enumerating an unbounded
  cross-product of runtime compositions. The first acceptance gate MUST compare
  generated readable output with independently React-rendered component DOM,
  attributes, states, and computed styles.
- **FR6 — Versions travel together.** A build-less recipe MUST pin compatible
  CLI, stylesheet, behavior, template, theme, and component-documentation
  versions as one tested set. An experimental branch snapshot MAY use an
  isolated canary channel and commit-pinned public assets. Stable consumer
  guidance MUST NOT depend on a mutable branch URL.
- **FR7 — Package admission is separate.** The initial implementation MUST NOT
  create a public `@astryxdesign/vanilla` package. A future package requires its
  own ownership, versioning, compatibility, and release-lifecycle decision.
  Experimental assets may remain private workspace material while public CLI
  canaries carry the consumer-facing commands and versioned docs.
- **FR8 — Web components remain opt-in and experimental.** Agent guidance MUST
  NOT select web components by default. It MAY offer documented light-DOM
  `ax-*` elements when the caller asks for them. Promotion requires complete
  component and template discovery, canonical attributes and slots, native
  semantics and events, state preservation across rerenders, browser evidence,
  and quality parity with the readable HTML path.
- **FR9 — Delivery comparisons isolate the variable.** A comparison MUST keep
  prompts, selected cases, runner versions, wall-clock budgets, evaluator,
  browser, viewport, and failure policy identical across delivery modes. Cells
  MUST run in isolated project, home, configuration, and temporary roots and
  MUST be unable to read sibling cells or host-only context. Only factual setup
  text, pinned delivery inputs, and required output filenames may differ.
- **FR10 — Evaluation covers observable states.** Evaluation MUST validate each
  mode's starter before running a coding agent, build or serve the authored
  result through the same evaluator boundary, capture the default state, and
  accept a bounded delivery-neutral declaration of additional same-page states.
  Each declared state MUST load independently rather than inheriting state from
  another capture.
- **FR11 — Metrics are versioned and failure-inclusive.** Reports MUST identify
  the metric contract, sample count, runner and delivery-input versions, primary
  failures, and secondary timing limits. Build failures, blank renders, page
  errors, runner failures, timeouts, and isolation-audit failures MUST remain in
  primary denominators. Interactive component adoption MUST remain distinct
  from coarse ancestor adoption; hard-coded values MUST remain distinct from
  token definitions and fallback literals.
- **FR12 — Results state their limits.** A delivery recommendation based on an
  evaluation MUST name the tested task distribution, coding-agent versions,
  browser, sample size, repetitions, step or time caps, and known product gaps.
  It MUST NOT generalize beyond those bounds. Screenshot judging does not prove
  interaction, accessibility, maintainability, or support across browsers;
  those claims require their own evidence.

### Platform support

- Supported feature/engine floor: each implementation inherits
  [`spec:AST-013`](../AST-013/spec.md); a POC may narrow its tested browser set
  when it labels that limit and makes no stable support promise.
- Unsupported behavior: a delivery path with incomplete component, template,
  browser, or accessibility coverage remains experimental and MUST NOT replace a
  stable default outside the states it proves.
- Browser evidence: starter validation, rendered-page checks, declared-state
  captures, console and page-error checks, accessibility scans, and
  component-specific real-browser evidence for browser-owned behavior.

## Current-state impact

Astryx's current stable package path remains React. Build-less readable HTML and
light-DOM web components remain experimental and do not create stable package or
compatibility promises.

The implementation work implied by this draft affects:

- agent guidance that selects a delivery mode;
- CLI component and template discovery for no-build consumers;
- readable CSS and progressive-enhancement assets;
- any future shared component-style recipe and its independent React parity
  gate;
- canary distribution and version pinning; and
- the delivery-mode evaluation harness and metric contract.

No current architecture record grants readable CSS permission to bypass
[`architecture:component-style-authoring`](../../architecture/component-style-authoring.md).
A shared recipe must preserve that record's maintained StyleX path for React.

## Verification

| Contract | Verification                                                                                           | Representative states                                                                                                         | Mutation or failure expectation                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3  | Agent-guidance branch tests and context-free generation smoke tests                                    | one-off artifact; evolving repository app; explicit React, vanilla, and web-component requests; existing framework repository | Guidance selects the wrong default, mixes branches before choosing, or omits setup needed to act                                        |
| FR4      | CLI snapshot tests plus browser rendering of generated vanilla templates and components                | static and interactive components; light/dark; shipped and custom themes; dynamically added behavior hooks                    | Output requires framework tooling, invents classes, uses raw visual values, or fails without source checkout                            |
| FR5      | Independent React-render parity fixture plus generated-output drift and size checks                    | variants, sizes, elevation, disabled/loading, relational state, dynamic values, themes, and modes                             | Both outputs agree only because they share a stale manifest, React output changes, or readable output grows by composition enumeration  |
| FR6, FR7 | Pack/canary plan tests and clean-consumer installation smoke tests                                     | branch canary; commit-pinned assets; CLI without local Core; private vanilla workspace package                                | Inputs resolve to incompatible versions, guidance uses a mutable asset URL, or a new public package appears without lifecycle authority |
| FR8      | Generated docs, API validation, rerender/state fixtures, template browser tests, and parity comparison | attributes, booleans, slots, native children/events, forms, overlays, themes, and all templates                               | Web components become the default, lose authored state/content, diverge from native semantics, or lack documented parity                |
| FR9      | Preflight isolation probes, prompt snapshots, manifest receipts, and transcript audits                 | sequential and concurrent cells; runner and judge roots; sibling and host-only paths                                          | A cell observes another cell or private host context, or a mode receives non-factual coaching unavailable to another                    |
| FR10     | Starter self-checks and fresh-context browser captures                                                 | default plus declared loading, success, progress, menu, and hover states                                                      | A run starts from a broken reference recipe, or state evidence depends on a previous capture                                            |
| FR11     | Metric fixtures, mutation tests, report-schema tests, and failure-path tests                           | adopted and hand-authored controls; token, fallback, and raw literals; build, render, timeout, and audit failures             | A raw control receives adoption credit, a fallback inflates hard-coded counts, failed rows disappear, or sample counts are hidden       |
| FR12     | Result-boundary review against the manifest and report                                                 | different runners, browsers, task samples, caps, and incomplete delivery modes                                                | A recommendation claims untested agents, tasks, browsers, maintainability, or accessibility                                             |

## Decision log

### DEC-1 — Expected lifespan is the first routing question

**Reference:** `spec:AST-065/DEC-1`
**Decider:** pending

One-off artifacts default to build-less vanilla HTML; evolving repository apps
default to React and Next.js. The split minimizes setup and lookup cost for
short-lived work without trading away the ecosystem and maintainability of a
framework application.

Rejected: one universal default for both artifact lifetimes, because setup cost
and long-term maintenance pull in different directions.

### DEC-2 — Readable HTML is the build-less default

**Reference:** `spec:AST-065/DEC-2`
**Decider:** pending

The build-less default uses copyable native HTML with documented readable
classes and small progressive-enhancement hooks. The contract stays inspectable
in generated source and does not require a component runtime.

Rejected: build-less React as the default, because its runtime and lookup cost
remain unnecessary for a one-off artifact that does not request React.

### DEC-3 — Shared styles require a recipe layer and an independent baseline

**Reference:** `spec:AST-065/DEC-3`
**Decider:** pending

React and readable CSS may share a serializable component-style recipe, but each
lowering remains independently testable. React-rendered output is the first
parity baseline so an incorrect shared manifest cannot validate itself.

Rejected: direct compiled-class renaming and exhaustive composition expansion,
because they do not preserve runtime composition at a sustainable output size.

### DEC-4 — Web components remain an experiment

**Reference:** `spec:AST-065/DEC-4`
**Decider:** pending

Light-DOM web components remain an explicit opt-in until their public API,
rerender behavior, native semantics, discovery coverage, and measured quality
meet the readable HTML path.

Rejected: promoting custom elements from compact syntax alone, because syntax
does not establish behavior or quality parity.

### DEC-5 — Experimental distribution stays isolated

**Reference:** `spec:AST-065/DEC-5`
**Decider:** pending

Experimental delivery assets use an isolated canary channel and immutable public
pins. They do not create a new stable package, overwrite stable tags, or imply a
compatibility promise.

Rejected: publishing a new stable vanilla package before ownership and lifecycle
are approved.

### DEC-6 — Evaluation is paired, isolated, multi-state, and versioned

**Reference:** `spec:AST-065/DEC-6`
**Decider:** pending

Delivery recommendations come from paired cells that differ only in delivery,
run inside proven isolation, retain failures in the denominator, capture
observable states from fresh loads, and report a versioned metric contract with
explicit limits.

Rejected: headline screenshot scores without isolation, failure accounting,
metric versions, or tested-scope limits.

## Open questions

- **OQ1 — Should one executor-neutral harness own both routine coding-agent
  quality checks and delivery-mode comparisons?** The owner must decide whether
  a single pipeline can preserve the specialized evidence of existing checks
  while removing duplicated runners, prompts, evaluators, and reports.
  (`human-design`)
- **OQ2 — What stable package boundary owns build-less assets?** The options are
  version-matched assets carried by the existing CLI and packages, or a new
  public package with an explicit owner, compatibility policy, and release
  lifecycle. (`human-api`)
- **OQ3 — What parity and size thresholds admit shared readable CSS?** React
  render parity is mandatory; the owner must set the allowed output-size and
  supported-state boundaries before implementation scales beyond a prototype.
  (`human-design`)
