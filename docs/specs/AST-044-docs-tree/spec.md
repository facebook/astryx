---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-044
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: implementing
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli/integrations, authoring]
---

# Documentation tree system spec

## Intent

A reader who opens the Astryx docs should find every doc in one tree and move
through it one level at a time: `astryx docs cli` lists the CLI's guides and
reference, `astryx docs cli/api` lists the API's functions, schemas, and enums,
and `astryx docs cli/api/functions/search` prints one function. Each doc keeps
its own file and becomes one node with one route. The compiler builds the tree
from the typed docs that already exist; no one keeps a list of children by hand.

This record owns how a doc gets its one home in the tree, how a route is formed,
how `astryx docs` reads the tree, and what `astryx doctor` checks. It rolls out
in phases: phase 1 places the CLI's own docs; later phases give every other doc
a home and move the docsite onto the tree.

## Non-goals

- The docsite's page layout. In phase 1 the docsite keeps its flat pages; a
  guide the tree places keeps a flat page named after its route. The docsite
  moves onto the tree in a later phase, as its own change.
- A home for docs that no namespace places or adopts (the generated
  Unorganized level) and a top-level browse of every provider. Both are later
  phases; until then such a doc keeps its flat route.
- Namespaces and placement for integration packages. In phase 1 the tree reads
  only the CLI's own namespace docs, and a topic from an integration that sets
  `placement` still fails to load.
- Aliases and audiences. `aliases` and `audience` stay reserved fields that a
  topic may not set.
- Rendering `workflow` and `reference` blocks.

## Requirements

- **FR1 — Identity is separate from the route.** Every node MUST have a stable
  identity, `<provider>/<kind>/<name>`, that does not change when the node
  moves. A node's route is its parent's route, `/`, and its own segment; a
  top-level namespace's route is its name. A segment is the node's name as
  lowercase letters and digits joined by single hyphens.
- **FR2 — Each doc has one home, decided in a fixed order.** A doc's home MUST
  be decided once, in this order: its explicit `placement`; otherwise the one
  adoption rule in its own package that matches its discovery group and kind;
  otherwise no home. A placement MUST name a namespace of the doc's own package
  (`namespace:<name>`), a slot that namespace declares, and a slot that accepts
  the doc's kind. A placement that fails MUST withdraw the doc with a
  diagnostic; it MUST NOT fall back to adoption. A doc that two rules adopt MUST
  be withdrawn with a diagnostic that names both namespaces.
- **FR3 — Namespaces never list or scan their children.** A namespace doc
  declares its slots and its adoption rules. It MUST NOT enumerate its
  children, and the compiler MUST NOT infer a parent from a folder. A child
  names its parent with `placement`, or a namespace adopts a discovery group: a
  CLI typed doc's group is the `namespace` it declares (`cli/commands`,
  `cli/api`). An adoption rule with `groupBy: 'kind'` MUST add one generated
  namespace per kind (`functions`, `schemas`, `enums`), in the order the rule
  lists the kinds.
- **FR4 — Routes are unique.** Two nodes MUST NOT share a route. When they
  would, the compiler MUST keep one by a deterministic order and withdraw the
  other with a diagnostic that names both. The same inputs MUST build the same
  tree, whatever order they arrive in. Children sort by `placement.order`, then
  title, then identity.
- **FR5 — `astryx docs` reads the tree one level at a time.** `astryx docs
<route>` MUST resolve a flat topic first, then a tree route. A namespace MUST
  print its title, its summary, and each slot's children one level down, each
  with its summary and the command to open it; it MUST NOT inline its
  grandchildren. A typed doc MUST print its content. Both MUST end with the way
  back up. A guide the tree places MUST read like any topic, by its route,
  including `--index` and section reads. `--json` MUST return `docs.node` for a
  namespace or typed doc: its identity, route, kind, package, title, summary,
  breadcrumb, and either its slots with their children or its content.
- **FR6 — A route has no sections.** A section argument on a namespace or typed
  doc MUST fail with `ERR_UNKNOWN_SECTION` and name its children. An unknown
  route MUST fail with `ERR_UNKNOWN_TOPIC` and suggest the children of the
  deepest namespace the route reaches.
- **FR7 — The topic list names the tree.** `astryx docs` MUST list each
  top-level namespace after the topics, marked `kind: 'namespace'`, so the first
  topic stays the first entry.
- **FR8 — Doctor proves the tree.** `astryx doctor` MUST fail when the tree has
  an error diagnostic, and when a CLI typed doc whose group the tree reads has
  no route. The progressive-disclosure check MUST hold each guide the tree
  places to the same size budget as every topic.
- **FR9 — Phase 1 places the CLI's own docs.** The CLI MUST ship the `cli`
  namespace with the `integrations` guide and the `commands` and `api`
  namespaces under it. Every command doc MUST have a route under
  `cli/commands`, and every function, schema, and enum doc in the `cli/api`
  group a route under `cli/api/<kind>s`. The integration guide's only CLI route
  MUST be `cli/integrations`: its flat name `cli-integrations` is removed as a
  breaking change, with no alias.

### Platform support

- Supported feature/engine floor: every supported CLI runtime.
- Unsupported behavior: none.
- Browser evidence: not applicable; the docsite is unchanged in phase 1.

## Current-state impact

Before this record, `astryx docs` read only flat topics. The CLI's typed docs
were sections of one generated `cli` topic, and the NamespaceDoc type and the
`placement` field existed but nothing read them.

Phase 1 changes:

- the CLI ships its namespace docs and the guides they place in
  `assets/docs/tree/`, each named after its doc; the flat topic list does not
  read that directory;
- the compiler builds the tree from those files and the CLI's typed docs, and
  `collectDocInputs` lists the tree files as a `tree` root;
- the four tree diagnostics (`invalid_namespace`, `invalid_placement`,
  `overlapping_adoption`, `duplicate_route`) join the compiler's codes;
- `astryx docs`, `docs()`, and `astryx doctor` read the tree as FR5–FR8 state;
- `cli-integrations` moves to `cli/integrations` (breaking);
- the docsite reads the placed guide through `docs()` and keeps
  `/docs/cli-integrations`.

`architecture:cli-surface` INV25 and INV26 carry this record into the code.

## Verification

| Contract      | Verification                            | Representative states                                                                                                 | Mutation or failure expectation                                                                        |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| FR1, FR3, FR4 | Tree builder fixture tests              | three authored levels; adoption with and without `groupBy`; reversed input order; order and title sort                | A route that ignores the parent, a folder that implies a parent, or a tree that depends on input order |
| FR2           | Tree builder failure fixtures           | no slot; unknown slot; a slot that refuses the kind; another package's parent; not a reference; two adopters; a cycle | A failed placement that falls back to adoption, or a failure without a diagnostic                      |
| FR5, FR6, FR7 | `docs()` dispatcher tests and CLI runs  | `cli`, `cli/api`, one function, the placed guide and its sections, the old name, a typo route                         | A namespace that inlines grandchildren, a lost section read, or a wrong error code                     |
| FR8           | Doctor tests                            | this repo; a fixture tree with a broken placement                                                                     | A broken tree or an unplaced CLI doc that passes                                                       |
| FR9           | Real-tree tests and the route inventory | every command, function, schema, and enum doc; every exported API function                                            | A CLI typed doc without its route, or a route inventory row the tree contradicts                       |

## Decision log

### DEC-1 — Roll out the tree in phases, CLI first

**Reference:** `spec:AST-044/DEC-1`
**Decider:** `josephfarina`, `2026-09-22`

The compiler, the CLI reader, and Doctor come first; the docsite moves onto the
tree late, and current docsite pages stay up until then. Starting with the CLI's
own docs tests the contract on docs one team owns.

Rejected: one change that moves every doc and the docsite at once. It is too
large to review, and every route changes before the contract is proven.

### DEC-2 — A CLI typed doc's `namespace` is its adoption group

**Reference:** `spec:AST-044/DEC-2`
**Decider:** `josephfarina`, `2026-09-24`

Every CLI typed doc already declares the `namespace` that reads it, and Doctor
already enforces it. The tree adopts by that group, so a new command or
function appears in the tree with no other edit.

Rejected: a second field for the tree, and a list of children in each namespace.
Both repeat what the doc already says and drift from it.

### DEC-3 — Remove the old guide name instead of aliasing it

**Reference:** `spec:AST-044/DEC-3`
**Decider:** `josephfarina`, `2026-09-24`

`cli-integrations` becomes `cli/integrations` as a breaking change. Aliases are
not built yet, and one route per doc keeps the topic list clean.

Rejected: keeping `cli-integrations` as a second flat topic, which gives one doc
two homes.

## Open questions

- The layout of the docsite's tree pages: children listed on the namespace page,
  or inlined on it. The data is the same either way; the docsite phase decides.
- Where the `authoring` group's docs live in the tree.
