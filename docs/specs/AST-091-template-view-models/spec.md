---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-091
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

# Native template view models system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A person using a native app built from an Astryx template gets the same
template behavior they get from the web template: the same words, values,
validation, and states after the same steps. Each native platform still draws
the template with its own controls and conventions.

A native template keeps that behavior in one view model, written once in
portable TypeScript and shared by every native platform: its state, its sample
data, its logic, and everything it shows. Each native drawing renders that view
model and sends the template's actions back; no drawing decides anything. The
web template in the catalog keeps its own state, and one scripted scenario keeps
the two in step (DEC-1). Like a catalog template, a native template is source a
person clones into their app, never a library they import (DEC-2).

## Non-goals

- Which templates gain a native version, and in what order.
- Component contracts and how a component is drawn on a platform
  (`spec:AST-082`).
- Copying a native template into an app through the CLI.
- Saving or syncing a template's data, sign-in, and product backends.
- A screen built from a generic component tree rather than a template.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — A native template mirrors one catalog template.** A native template
  is kept in the `@astryxdesign/native` source tree and names the catalog page
  template it mirrors by its id. It has one **model**, shared by every native platform,
  and one **drawing** per native platform that draws it, in that platform
  package's versioned templates directory, such as `swift-ios-<n>/templates/`.
  A platform without a drawing reports that it has none rather than
  substituting another platform's.
- **FR2 — The model decides; drawings draw.** Every word, number, sort, filter,
  validation message, open or closed state, selection, and enabled state a
  native template shows comes from its view model. A drawing adds only what its
  platform supplies by convention, such as a system back label, and chooses only
  presentation its platform owns, such as a sheet or an inline region
  (`spec:AST-082/FR11`).
- **FR3 — A model is three pure functions.** `initial(context)` returns the
  first state; `reduce(state, action, context)` returns the next state, and the
  same state when nothing changes; `view(state, context)` returns the view model.
  `context` carries what a model may not produce itself: the current time and
  the person's time zone offset, and a seed for new identifiers.
- **FR4 — A model is portable.** It runs with ECMAScript built-ins only: no DOM
  or host APIs, no `Intl`, no clock, and no randomness of its own. It imports
  only core contract types and non-visual logic (`spec:AST-082/DEC-9`).
- **FR5 — View models and actions are portable data with generated bindings.**
  A native template declares its view model and its actions in the portable
  vocabulary of `spec:AST-082/FR4`: strings, numbers, booleans, closed sets,
  arrays, records, and optional values. An action is a named intent with
  portable arguments, such as `next` or `setQuantity(itemId, quantity)`. Each
  native platform's types for the view model and actions are generated from
  that declaration, never written by hand, and a drawing sends only declared
  actions.
- **FR6 — One scenario keeps the web and native templates in step.** A native
  template has one scripted scenario: each step a gesture located by role and
  accessible name, and the words, values, validation, and states the person
  sees after it. The scenario replays unchanged on the catalog web template and
  on every native drawing, and each shows the expected result after every step.
  It is that template's scenario under `spec:AST-082/FR12`. The scenario and
  its check live with the native template's source and run with
  `@astryxdesign/native`'s tests: a catalog change that breaks it fails the
  native template, which is updated to match, and never blocks the catalog
  change.
- **FR7 — The catalog is unchanged by native templates.** A catalog template's
  source, metadata, and `astryx template` output are the same whether or not a
  native template mirrors it. Nothing in `@astryxdesign/core` or
  `@astryxdesign/cli` imports a native template or its model
  (`spec:AST-082/FR14`).
- **FR8 — Native templates are clone-only.** A native template's model,
  drawings, and scenario are source a person clones into their app together,
  as catalog templates are (`architecture:template-authoring/INV8`). No package
  export, entry point, Swift product, or other package API exposes a native
  template or its view model, and an app never depends on one at run time.
  Generic runtime that is not specific to one template, such as a logic core
  and its bridge, is not template logic and may be exported.

### Platform support

- Supported feature/engine floor: a model runs in any engine with ECMAScript
  2022 built-ins, including Hermes. The web floor is unchanged.
- Unsupported behavior: a native template on a platform without its drawing
  reports the platforms that draw it; nothing renders a substitute.
- Browser evidence: FR6 replays the scenario on the catalog web template in a
  browser; native claims are proven by the same replay on devices.

## Current-state impact

- `@astryxdesign/native` gains native templates: a model and a scenario per
  template, and drawings in each platform package's templates directory.
- No catalog template, CLI command, or architecture record changes.
- No native template has a view model yet.

## Verification

| Contract | Verification                                                                                                       | Representative states                                               | Mutation or failure expectation                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| FR1      | Native package check that every native template names an existing catalog template, plus a lookup on each platform | a template drawn on iOS; a request for a platform without a drawing | A native template names a missing catalog id, or a missing drawing renders a substitute                                              |
| FR2      | Static check of drawings, plus scenario comparison of each drawing's text against the view model                   | a word, a number, a validation message, a disabled action           | A drawing computes or hard-codes text or state the view model owns                                                                   |
| FR3, FR4 | Model tests in a context with no host globals and a fixed context                                                  | first state; an action that changes nothing; a time-dependent value | A model reads a clock, randomness, `Intl`, or a host API, or changes state on a no-op                                                |
| FR5      | Generation and compilation of each platform's types                                                                | every portable kind; an undeclared action                           | A native type is hand-written, drifts from the declaration, or a drawing sends an undeclared action                                  |
| FR6      | Scenario replay on the catalog web template and on each native drawing                                             | every step of each template's scenario                              | Any drawing or the web template shows a different result after a step, or a catalog change is blocked by the check                   |
| FR7      | Catalog and CLI output comparison with and without native templates, plus a dependency check                       | each catalog template a native template mirrors                     | Catalog source, metadata, or copy output differs, or core or the CLI imports a native template                                       |
| FR8      | Package check over `@astryxdesign/native`'s exports map and every Swift package's products                         | each native template; a cloned template built in a fresh app        | A package export, entry point, or Swift product exposes a native template or its view model, or a cloned template needs one to build |

## Decision log

### DEC-1 — Native templates keep their own view model; the catalog keeps its own state

**Reference:** `spec:AST-091/DEC-1`
**Decider:** cixzhang, 2026-10-23

Native support is experimental, so the catalog web template stays exactly as
it is and native templates carry the shared view model on their own. A parity
scenario, not a shared implementation, keeps web and native behavior the same,
and web callers take on no change or risk from native work.

Deferred: the catalog web template drawing the same view model, considered when
native support leaves the canary channel (`spec:AST-082/FR15`).

### DEC-2 — Native templates are cloned, never imported

**Reference:** `spec:AST-091/DEC-2`
**Decider:** cixzhang, 2026-10-23

Templates are starting points a person owns once they clone them, so the logic
that comes with a native template is cloned with it. Distributing template
logic as a package resource would make it an API callers depend on and Astryx
must keep stable.

Rejected: exporting native templates or their view models from a package,
because it turns clone-only starting points into a maintained library.

## Open questions

- **OQ2 — How does a native template declare its view model and actions?**
  (`human-api`) Options: TypeScript types that the generator reads; or a
  declaration in the portable vocabulary written as data beside the model.
  Recommendation: TypeScript types limited to the portable vocabulary, checked
  by the generator, because authors already write those types and the
  generator already reads documented types.
