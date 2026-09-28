---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-046
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
Search leads into the same tree: a hit names the smallest part that answers, so
a reader never reads a whole guide to find one fact.

The tree is the backbone of one docs graph. Every provider's docs are its nodes,
each with one home in the tree; the links between docs (a command and its API
function, a token reference, a replacement) are its other edges, named by doc
identity. Phase 1 builds the backbone for the CLI's own docs and each
integration's, and `spec:AST-047` turns the edges into moves a reader can
follow.

This record owns how a doc gets its one home in the tree, how a route is formed,
how `astryx docs` reads the tree, and what `astryx doctor` checks. It rolls out
in phases: phase 1 places the CLI's own docs and the namespace docs and guides
each integration ships, and gives every other doc a home in a generated
Unorganized level; later phases move those docs into real sections and move
the docsite onto the tree.

## Non-goals

- The docsite's page layout. In phase 1 the docsite keeps its flat pages; a
  guide the tree places keeps a flat page named after its route. The docsite
  moves onto the tree in a later phase, as its own change.
- A top-level browse of every provider. It is a later phase.
- Aliases and audiences. `aliases` and `audience` stay reserved fields that a
  doc may not set.
- Rendering `collection` blocks. A topic that uses one fails to load.

## Requirements

- **FR1 — Identity is separate from the route.** A node with an authored doc
  MUST be identified by that doc's identity: its DocId, as the provider-identity
  contract defines it, built from its provider's ProviderId (which can differ from its
  package name), its kind, and its name. The identity MUST NOT change when the node
  moves. A generated level has no authored doc and no identity: its `id` is
  `null`. A node's route is its parent's route, `/`, and its own segment; a
  top-level namespace's route is its name, and a flat topic keeps its own name
  (FR12). A segment is the node's name as
  lowercase letters and digits joined by single hyphens. The route is the
  readable name; `docs.node` carries both.
- **FR2 — Each doc has one home, decided in a fixed order.** A doc's home MUST
  be decided once, in this order: its explicit `placement`; otherwise the one
  adoption rule in its own package that matches its discovery group and kind;
  otherwise, for a reference topic, the generated Unorganized level (FR12). A placement MUST name a namespace of the doc's own package
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
  grandchildren. When a child's title is not its route name
  (`assertResponse()`, `search()`), the text view MUST show the title before
  the summary. A typed doc MUST print its content. Both MUST end with the way
  back up. A guide the tree places MUST read like a topic, by
  its route (`spec:AST-047` FR3). `--json` MUST return `docs.node` for a
  namespace or typed doc: its identity, route, kind, package, title, summary,
  breadcrumb, and either its slots with their children or its content.
- **FR6 — A route has no sections.** A section argument on a namespace or typed
  doc MUST fail with `ERR_UNKNOWN_SECTION` and name its children. An unknown
  route MUST fail with `ERR_UNKNOWN_TOPIC` and suggest the children of the
  deepest namespace the route reaches.
- **FR7 — The topic list names the tree.** `astryx docs --json` MUST list each
  top-level namespace after the topics, marked `kind: 'namespace'`, so the first
  topic stays the first entry. The text view MUST show the namespaces first,
  under their own heading, because that is where the CLI's own docs start. A
  package whose docs did not load MUST be named, in `meta.notLoaded` and under
  its own heading in text, so its author knows why its docs are missing.
- **FR8 — Doctor proves the tree.** `astryx doctor` MUST warn when the tree has
  an error diagnostic, when a CLI typed doc whose group the tree reads has no
  route, and when a link between docs names no doc (`spec:AST-047` FR9). These
  checks are new, so they warn: a project that passed before keeps passing. The progressive-disclosure check MUST hold each guide the tree
  places to the same size budget as every topic.
- **FR9 — Phase 1 places the CLI's own docs.** The CLI MUST ship the `cli`
  namespace with the `integrations` guide and the `commands` and `api`
  namespaces under it. Every command doc MUST have a route under
  `cli/commands`, and every function, schema, and enum doc in the `cli/api`
  group a route under `cli/api/<kind>s`. The integration guide's route MUST be
  `cli/integrations`; its old flat name `cli-integrations` is gone. A CLI route
  or name MAY change like this when every reference changes with it: links name
  docs by identity (`spec:AST-047` FR9), and the graph walk fails on a reference
  left behind (`spec:AST-047` FR11, FR12).
- **FR10 — Search finds the smallest part that answers.** `astryx search` MUST
  index each section of each topic and placed guide, and each namespace and
  typed doc of the tree. A section result MUST carry `section`, and its command
  MUST read only that section. A tree result's command MUST read its route. A
  topic result's command MUST list the topic's sections when it has more than
  one. A typed doc MUST also match by its own name, and a doc part by each
  identifier it defines or names in code (`assertResponse`,
  `ERR_UNKNOWN_SECTION`). A docs-only search (`--type doc`) MUST NOT need
  `@astryxdesign/core`, because `astryx docs` does not.
- **FR11 — Integrations join the tree.** A configured integration MAY ship
  namespace docs, and guides with `placement`, in its docs directory. The tree
  MUST read them beside the CLI's own, identify each node by the integration's
  provider id (FR1) and name its `package` by the integration's npm name, and
  hold them to FR2–FR8. A placed guide MUST NOT also `replaces` or `extends` a
  topic. When two providers claim one route, the CLI's own docs MUST keep it,
  then integrations in configured order, and the claim that loses MUST be a
  `duplicate_route` diagnostic. `astryx doctor integration docs` MUST run the
  same tree and link checks on one integration's docs, so an author finds a
  broken placement or link before the package ships, and
  `astryx integration add doc <name> --parent <namespace>` MUST write a guide
  placed in that namespace, and the namespace doc the first time. On an older CLI,
  a package that ships a namespace doc loses every doc topic from `astryx docs`
  and Doctor, with nothing saying why, so a package that ships one MUST declare a `@astryxdesign/cli` peer range that
  admits only CLIs that read it: `integration add doc --parent` MUST declare it,
  and `astryx integration pack --check` MUST fail without it.
- **FR12 — Every doc has a home.** Every flat topic, the CLI's and each
  integration's, MUST sit in the generated Unorganized level (`unorganized`), in
  the order the topic list reads. The level has no authored doc, so its `id` is
  `null`, and it lists its topics one level down with the command that opens
  each. A topic keeps its own name as its route, so no name changes; a read of
  it offers Up to the level and Previous and Next among its topics, as any tree
  node does. Placing a topic in a real section takes it out of the level.

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
- `astryx search` finds sections and tree nodes, as FR10 states;
- an integration's namespace docs and placed guides join the tree, and
  `astryx doctor integration docs` checks them, as FR11 states;
- `cli-integrations` moves to `cli/integrations`, and every reference moves
  with it;
- every flat topic sits in the generated Unorganized level, as FR12 states;
- the docsite reads the placed guide through `docs()` and keeps
  `/docs/cli-integrations`.

`architecture:cli-surface` INV25 and INV26 carry this record into the code.

## Verification

| Contract      | Verification                                     | Representative states                                                                                                               | Mutation or failure expectation                                                                                     |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR1, FR3, FR4 | Tree builder fixture tests                       | three authored levels; adoption with and without `groupBy`; reversed input order; order and title sort                              | A route that ignores the parent, a folder that implies a parent, or a tree that depends on input order              |
| FR2           | Tree builder failure fixtures                    | no slot; unknown slot; a slot that refuses the kind; another package's parent; not a reference; two adopters; a cycle               | A failed placement that falls back to adoption, or a failure without a diagnostic                                   |
| FR5, FR6, FR7 | `docs()` dispatcher tests and CLI runs           | `cli`, `cli/api`, one function, the placed guide and its sections, the old name, a typo route                                       | A namespace that inlines grandchildren, a lost section read, or a wrong error code                                  |
| FR8           | Doctor tests                                     | this repo; a fixture tree with a broken placement                                                                                   | A broken tree or an unplaced CLI doc that passes                                                                    |
| FR9           | Real-tree tests and the route inventory          | every command, function, schema, and enum doc; every exported API function                                                          | A CLI typed doc without its route, or a route inventory row the tree contradicts                                    |
| FR10          | Search tests and CLI runs                        | a guide section; a typed doc by its own name; an error code; a topic hit; no core installed                                         | A section hit whose command reads the whole topic, or a docs-only search that needs core                            |
| FR11          | Integration tree tests                           | a namespace and two placed guides from a package whose provider id differs from its name; a broken link; a claim on the `cli` route | A node named by the package name, a broken link that passes either doctor, or an integration that takes a CLI route |
| FR12          | `docs()` tests, the graph walk, and search tests | the level and its children in list order; a topic's Up, Previous, and Next; a flat topic hit's parent; an integration's flat topic  | A flat topic without a home, a topic whose name changes, or a level that lists a placed guide                       |

## Decision log

### DEC-1 — Roll out the tree in phases, CLI first

**Reference:** `spec:AST-046/DEC-1`
**Decider:** `josephfarina`, `2026-09-22`

The compiler, the CLI reader, and Doctor come first; the docsite moves onto the
tree late, and current docsite pages stay up until then. Starting with the CLI's
own docs tests the contract on docs one team owns.

Rejected: one change that moves every doc and the docsite at once. It is too
large to review, and every route changes before the contract is proven.

### DEC-2 — A CLI typed doc's `namespace` is its adoption group

**Reference:** `spec:AST-046/DEC-2`
**Decider:** `josephfarina`, `2026-09-24`

Every CLI typed doc already declares the `namespace` that reads it, and Doctor
already enforces it. The tree adopts by that group, so a new command or
function appears in the tree with no other edit.

Rejected: a second field for the tree, and a list of children in each namespace.
Both repeat what the doc already says and drift from it.

### DEC-3 — Rename, and move every reference with it

**Reference:** `spec:AST-046/DEC-3`
**Decider:** `josephfarina`, `2026-09-28`

`cli-integrations` becomes `cli/integrations`, with no alias. A CLI name or
route may change when every reference changes with it: links name docs by
identity, so they follow the doc, and the graph walk fails on any reference
left behind. An alias would keep a second name for one doc.

Rejected: keeping `cli-integrations` as an alias, and removing it before typed
links and the graph walk could prove no reference was left.

### DEC-4 — Integrations join the tree in the first phase

**Reference:** `spec:AST-046/DEC-4`
**Decider:** `josephfarina`, `2026-09-28`

The tree, its moves, and its checks work the same for every provider. Holding
integrations back would leave their docs on a weaker path and delay the checks
their authors need, so an integration's namespace docs and placed guides join
the tree in the same change as the CLI's.

Rejected: a later phase for integration namespaces.

## Open questions

- The layout of the docsite's tree pages: children listed on the namespace page,
  or inlined on it. The data is the same either way; the docsite phase decides.
- Where the `authoring` group's docs live in the tree.
