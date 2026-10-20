---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-083
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli]
---

# Answer-picking areas system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

Some CLI commands answer by picking among candidates: a ranked list of
matches, a recommended starting template, a suggestion for a name the project
does not have. Each such command is an **area**. An area answers through a
small tree of nodes that share one typed shape, so any node can be read,
tested, measured, and improved on its own while the area's answer keeps its
published shape.

A node is either a **dispatcher**, which decides which nodes should answer a
request, or a **searcher**, which produces the answer. Every node declares what
it handles and what it does not, with examples, beside its code. The same
declarations are what a reader sees in `astryx docs`, what the tests run, and
what a measurement harness tunes.

This record owns how an area is structured, how its nodes are called and
combined, what a node may depend on, how a caller tunes and traces a node, and
how a node is documented and checked. Each area's own spec owns what its answer
contains and how good it must be (`spec:AST-048` for `astryx build`).
`spec:AST-017` owns compatibility, response fields, and CLI controls, and
`spec:AST-042` owns command admission.

## Non-goals

- Which algorithm, matcher, or weighting wins in an area. That is measured per
  area against its own goals, and any node may change while the contract holds.
- Training. Weights are computed outside the repository; the CLI ships only
  reviewed static weights (FR7).
- What an area's answer contains, its fields, or its quality bar.
- Commands that do not pick among candidates, such as reading a doc or
  scaffolding a named template.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — A picking command is an area.** A command whose result picks among
  candidates MUST compute that result in an area: a named tree of nodes with one
  root. The area's entry function MUST only gather the area's inputs through its
  adapter and run the tree; it holds no matching, scoring, or ranking of its
  own.
- **FR2 — Two node kinds, one descriptor.** A node MUST be exactly one of two
  kinds, `dispatcher` or `searcher`, discriminated by its `kind`. Both kinds
  MUST share one descriptor: an `id` unique in its area, its `kind`, its
  `area`, a one-line `summary`, at least one handled example (an input and the
  output it gives), at least one not-handled example (an input and why it is
  declined), its weights file or none, and its tests file. The descriptor types
  MUST be published and checked under the CLI's strict type check, with no
  third kind and no untyped escape.
- **FR3 — A dispatcher routes and never ranks.** A dispatcher MUST take the
  request and the node context and, possibly asynchronously, return the ids of the nodes that should
  answer, best first, with a confidence from 0 to 1. It MUST name only ids from
  its declared children, which may be searchers or dispatchers. It MUST declare
  a confidence floor and a fallback: the area's main searcher. It MUST NOT
  score, rank, filter, or merge answers.
- **FR4 — A searcher answers in the area's shape, or declines.** A searcher
  MUST return, possibly asynchronously, either an answer in the area's existing answer shape, with no
  field beyond what the area's own spec allows, or nothing, which declines the
  request.
- **FR5 — The first answer wins.** Running an area MUST start at its root. For
  a dispatcher, a confidence below its floor MUST run its fallback. Otherwise
  the routed ids MUST be tried in order, and the first node that answers gives
  the area's answer; when none answers, the fallback runs. A routed dispatcher
  is run the same way, at any depth. Answers are never combined across nodes.
- **FR6 — Local, deterministic, and free.** A node MUST NOT open a network
  connection, call a remote model or service, start a subprocess, read or write
  files, or call another command's function that does. The area's adapter MUST
  gather everything the nodes read, including the catalog, the weights, and any
  model asset the CLI ships, before the tree runs, and every node MUST receive
  it through the same node context at every depth. An area MAY declare one
  per-request preparation step, run once before the root under the same rules.
  The same request, catalog, and weights MUST give the same answer, byte for
  byte, on every supported platform: ties break in a fixed order, and no answer
  depends on floating-point evaluation order. A node that runs a shipped model
  asset MUST have a test that pins its output across the supported platforms.
- **FR7 — Weights are static, reviewed, and public-safe.** A node MAY declare
  one weights file beside it. The file MUST hold only numbers and public
  vocabulary: no request text, identifiers of people or sessions, training
  code, lineage, or scores. The area's adapter MUST load it. A declared file
  that is missing MUST fail the structure check (FR12).
- **FR8 — Examples are executable.** Every handled example MUST give its stated
  output (a partial match: it pins what it states), and every not-handled
  example MUST be declined, when run through the area as it ships. The node's
  tests MUST run them.
- **FR9 — One shared kit.** The node types, the definition helpers, the area
  registry, the runner, weights loading, and the test helpers (offline
  assertion, output-size pinning, example checking) MUST live in one shared
  module that every area uses and none copies. Each node MUST be one module
  with its tests and weights beside it, and an area's registry MUST list each
  node in one line, so adding a node is one module and one registry line.
- **FR10 — Any node can be tuned and traced.** Each area's API function MUST
  accept a documented `tuning` option that MAY carry, per node id, weights that
  replace that node's shipped weights for the call, and a trace callback that
  receives every node step in order (the node, its kind, its depth, its route
  or whether it answered, and whether the step was a fallback). Running a
  single node's slice MUST be possible through the same runner. Without
  `tuning`, the answer MUST be the shipped answer, byte for byte. The trace
  MUST NOT appear in JSON or text output. There MUST be no CLI option,
  environment variable, or configuration key for tuning (`spec:AST-017`
  FR14–FR20).
- **FR11 — Every node is documented.** Each node's descriptor MUST be readable
  through `astryx docs` at `cli/areas/<area>/<node-id>`: its summary, kind,
  children, floor and fallback for a dispatcher, its examples, and whether it
  ships weights. The descriptor in the node's module is that doc's only source.
- **FR12 — The structure is checked.** The CLI's structure check MUST fail on
  an area entry function with logic beyond gathering and running the tree; a
  node without a complete descriptor, examples, or tests; a declared weights
  file that does not exist; a dispatcher that imports a searcher or scoring
  code; a network or model import in a node; and file, subprocess, or project
  access in a node.
- **FR13 — Nodes do not grow answers.** An area's tests MUST pin the serialized
  size of representative answers, so a node that adds output fails until the
  area's spec allows it.
- **FR14 — Moving an area into nodes keeps its contract.** Restructuring an
  existing command into an area MUST keep its JSON shape and exit statuses.
  Changes to the values it returns follow `spec:AST-017`.

## Current-state impact

- `architecture:cli-surface`: INV36 points here for the area layout and the
  structure check; INV25 gains the `cli/areas` namespace.
- `astryx build`, `astryx search`, and the suggestions the CLI gives for an
  unknown name are areas.
- `astryx docs cli` lists the `cli/areas` namespace.

## Verification

| Contract  | Verification                                                                                                             | Representative states                                                                          | Mutation or failure expectation                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| FR1, FR12 | The CLI structure check                                                                                                  | an entry with a scoring loop; a node missing tests; a declared weights file absent             | Each state fails the check; removing the check lets them pass                           |
| FR2       | The CLI strict type check over the kit and every area                                                                    | a third `kind`; a descriptor without examples; an untyped node                                 | Each fails to type-check                                                                |
| FR3, FR5  | Kit runner tests                                                                                                         | a route above and below the floor; a routed child that declines; nested dispatchers            | Taking a routed answer below the floor, or skipping the fallback, fails                 |
| FR4, FR13 | Per-area output-size tests                                                                                               | a node that adds a field                                                                       | The pinned size fails                                                                   |
| FR6       | Offline assertion around every node test; for a node with a model asset, a pinned-output test on each supported platform | a node that calls the network, a subprocess, or the file system; a model node on two platforms | The call fails the test; output that differs across platforms fails                     |
| FR7       | Structure check and review                                                                                               | a missing weights file; a weights file with free text                                          | The missing file fails the check                                                        |
| FR8       | Example checks in each node's tests                                                                                      | a handled example whose output changed; a declined example that now answers                    | Each fails                                                                              |
| FR10      | Kit tests and per-area tests                                                                                             | a weights override; a trace; no `tuning`                                                       | Output without `tuning` that differs from the shipped answer fails; trace in JSON fails |
| FR11      | Docs tests and `astryx doctor`'s CLI docs check                                                                          | a node in every area                                                                           | A node with no readable doc fails                                                       |
| FR14      | Each area's existing JSON-shape tests                                                                                    | the area before and after restructuring                                                        | A changed shape fails                                                                   |

## Decision log

### DEC-1 — Two node kinds

**Reference:** `spec:AST-083/DEC-1`
**Decider:** `josephfarina (proposed)`, `2026-10-20`

Every area is built from dispatchers and searchers only. Two kinds keep each
node's job readable from its descriptor and let one runner, one doc shape, and
one check serve every area. Nesting comes from dispatchers routing to
dispatchers, not from new kinds.

Rejected: per-area node kinds — each area would grow its own runner and checks.

### DEC-2 — The first answer wins; nothing merges

**Reference:** `spec:AST-083/DEC-2`
**Decider:** `josephfarina (proposed)`, `2026-10-20`

A dispatcher orders who answers, and the first node that answers gives the
area's answer. Merging answers from several nodes would mean comparing them,
which is ranking, and ranking belongs in a searcher. A searcher that needs
several sources reads them all from the catalog.

### DEC-3 — Context is per node; weights resolve override, then shipped, then none

**Reference:** `spec:AST-083/DEC-3`
**Decider:** `josephfarina (proposed)`, `2026-10-20`

Every node receives the same context shape: the area, its own id, its depth,
the catalog, and its own weights. A tuning override for that node wins over its
shipped weights, and a node with neither gets none. One shape at every depth is
what lets a harness score any node in place.

### DEC-4 — Tuning is a typed API option

**Reference:** `spec:AST-083/DEC-4`
**Decider:** `josephfarina (proposed)`, `2026-10-20`

Tuning and tracing go through the area function's documented `tuning` option.
They are for programmatic callers measuring an area, so they need no command
line, environment, or configuration surface, and they never change output when
absent.

Rejected: an environment variable or hidden flag — `spec:AST-017` forbids both.

### DEC-5 — The descriptor is the doc

**Reference:** `spec:AST-083/DEC-5`
**Decider:** `josephfarina (proposed)`, `2026-10-20`

A node's descriptor is read by the runner, the tests, and `astryx docs` alike,
so what a node claims to handle is what it is tested to handle and what readers
see.

## Open questions

- **OQ1 — Is there a size cap for what an area ships?** (`human-design`) The
  cap would count weights and model assets together with any runtime
  dependency they need, such as an inference library added to the CLI's
  dependencies. A cap bounds the install size areas add; no cap leaves it to
  review.
