---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-026
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: implementing
owners: [cixzhang, josephfarina]
affects_architecture: [architecture:public-component-api]
affects_families: []
affects_contributing: [contributing:templates]
affects_consumer_docs: [shadcn-compatibility, templates, components]
---

# shadcn Registry compatibility system spec

## Intent

Let builders install Astryx components, component showcases, example blocks, and
page templates through the standard shadcn Registry protocol without making
Astryx a shadcn-based library or copying Astryx component implementations into
consumer repositories.

The compatibility layer meets builders inside an existing shadcn workflow. The
Astryx CLI remains the primary, richer interface for discovery, composition,
integrations, themes, validation, and upgrades.

This record governs an experiment. It is not an approved compatibility promise
and does not authorize publishing a production registry.

## Non-goals

- Replacing the Astryx CLI with the shadcn CLI.
- Defining a second, Astryx-only registry format.
- Copying Core or Lab component implementation source during a normal install.
- Treating generated examples, blocks, or pages as byte-stable public API.
- Publishing a production endpoint, announcement, or support commitment during
  this experiment.
- Changing the explicit `astryx swizzle` escape hatch for deep customization.

## Requirements

- **FR1 — Standard protocol.** Every experimental item MUST validate against the
  standard shadcn Registry schema and use a standard registry item type. A
  standard shadcn client MUST NOT need Astryx-specific code to read or install
  the item.
- **FR2 — Preserve the package boundary.** A component install MUST add the
  published Astryx package dependency and create only consumer-facing import or
  re-export source. It MUST NOT copy the component implementation, private
  helpers, or uncompiled StyleX source.
- **FR3 — Complete requested catalog.** The experiment MUST cover every public
  component or hook, every component showcase and example block, every other
  block, and every ready page template available from the same catalog the CLI
  and docsite use.
- **FR4 — Editable compositions.** Showcase, example, block, and page items MAY
  copy application-level composition source. That source MUST import Astryx
  through published package paths, declare all non-React package dependencies,
  and contain no relative import that escapes the copied item.
- **FR5 — Deterministic, stable identity.** Item names, organized URL paths,
  target paths, dependency lists, and JSON output MUST be deterministic and
  collision-free. Identity MUST derive from stable doc/catalog fields, not
  display labels or source filenames. Display-name changes MUST NOT change
  install URLs. Published renames MUST preserve prior routes as aliases.
- **FR6 — One catalog, two clients.** The shadcn client consumes standard fields.
  The Astryx CLI MAY read optional `astryx` metadata from the raw JSON for
  integration, provenance, and upgrade guidance. Standard clients may discard
  that metadata without changing the install.
- **FR7 — Discoverable compatibility.** The public docsite MUST describe the
  compatibility boundary and show a secondary copyable install command at the
  end of each applicable component, example, block, and page surface. The
  normal Astryx documentation remains the human browse experience; raw `/r/`
  paths remain machine endpoints.
- **FR8 — Experimental boundary.** Every implementation and content change MUST
  remain draft-only until the owners explicitly approve the public URL, naming,
  support level, and publication plan.
- **IR1 — Generated from current sources.** Registry output MUST come from the
  existing docsite and CLI catalogs, never a parallel handwritten item list.
- **IR2 — Build-time static output.** The docsite build MUST generate static JSON
  under one registry root. Generated JSON MUST NOT be committed when a clean
  build can reproduce it.
- **IR3 — Failure is loud.** Missing source, duplicate names, invalid schemas,
  unresolved package versions, escaping relative imports, and stale generated
  output MUST fail generation or verification.
- **IR4 — End-to-end evidence.** Verification MUST install representative
  component, showcase, block, and page items into a clean shadcn-style app and
  build that app. The full catalog MUST receive schema, uniqueness, dependency,
  and source-boundary checks.
- **IR5 — Stable route contract.** Generated item names and canonical paths MUST
  match the reviewed route lock. Display-name edits MUST NOT change them. An
  intentional rename MUST retain old paths through `registry.aliases` unless a
  separately reviewed breaking change approves removal.

### Platform support

- Supported feature/engine floor: the current Astryx Node floor and the pinned
  shadcn version used by the experiment.
- Unsupported behavior: copying Astryx implementation source without an
  explicit `astryx swizzle` action; installing hidden, incomplete, or
  non-resolvable catalog entries.
- Browser evidence: a representative installed page MUST render in real Chrome
  in both light and dark modes before publication is proposed.

## Current-state impact

The CLI already ships components, 161 blocks, and 47 ready page templates. The
docsite generator already discovers components, individual showcases and
examples, blocks, pages, package versions, and source. The experiment adds a
serializer over that existing catalog rather than a second discovery system.

Prior evidence installed all 921 generated entries through shadcn 4.19.0 into
a clean Vite application, wrote every component, hook, block, and page file with
zero install failures, and compiled all 6,620 imported modules in one build.
Fourteen compositions that author local StyleX are precompiled to compiler-free
JSX during generation; all other composition source stays typed TSX. Component
implementation copying failed because private imports and uncompiled StyleX
crossed the package boundary; FR2 avoids that path by installing the package and
creating a public re-export only.

## Verification

| Contract | Verification                                                        | Representative states                           | Mutation or failure expectation                            |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| FR1, FR5 | shadcn schema validation and deterministic snapshot                 | component, showcase, example, block, page       | Unknown type, duplicate name, or unstable output fails     |
| FR2      | clean consumer install plus source inspection                       | Core component, hook, non-Core package          | Implementation source or private import fails              |
| FR3, IR1 | reconcile registry counts and names with generated docsite catalogs | visible and hidden entries, grouped families    | Missing or extra catalog entry fails                       |
| FR4, IR3 | dependency extraction and relative-import audit                     | heroicons, recharts, StyleX import, page source | Escaping import or undeclared package fails                |
| FR6      | raw JSON and shadcn parse tests                                     | optional `astryx` metadata present              | shadcn install changes or Astryx metadata becomes required |
| FR7      | docsite tests and copy-button interaction                           | component, block, page, compatibility guide     | Command is absent, stale, or misstates copy behavior       |
| FR8      | draft PR and no production endpoint                                 | local build and draft preview only              | Live publication occurs without a separate approval        |
| IR4      | clean shadcn-style fixture install, build, and Chrome screenshot    | one of each item kind; light and dark           | Install, build, or render fails                            |

## Decision log

### DEC-1 — Use shadcn as a compatibility protocol, not an Astryx foundation

**Reference:** `spec:AST-026/DEC-1`
**Decider:** `josephfarina`, `2026-09-02`

Generate standard registry JSON so an existing shadcn user can install Astryx
without changing tools. Keep the Astryx CLI as the primary product and the
source of richer knowledge and maintenance behavior.

Rejected: a custom Astryx registry format. It gives third-party clients no
interoperability and requires Astryx adoption before Astryx can be discovered.

### DEC-2 — Copy composition, not component implementation

**Reference:** `spec:AST-026/DEC-2`
**Decider:** `josephfarina`, `2026-09-02`

A normal install keeps `@astryxdesign/core` or the owning Astryx package as a
real dependency. Component items create a public re-export; showcases, blocks,
and pages copy editable composition code that imports the package.

Rejected: copying Core implementation source. It breaks package-controlled
upgrades and crosses private-import and uncompiled-StyleX boundaries.

### DEC-3 — Keep the first implementation experimental and draft-only

**Reference:** `spec:AST-026/DEC-3`
**Decider:** `josephfarina`, `2026-09-02`

Build and test the complete shape in a draft before making a public support
promise. The experiment may use local or draft-preview URLs but does not publish
a stable production registry.

### DEC-4 — Derive stable IDs from docs and organize URLs by item kind

**Reference:** `spec:AST-026/DEC-4`
**Decider:** `josephfarina`, `2026-09-03`

Treat registry names and paths as public API before publication. Derive them
from stable component/hook names, block `name` plus `exampleFor`, and the
existing template slug. Keep `displayName` editorial. Use these path families:
`components`, `hooks`, `showcases/<component>`, `examples/<component>`,
`blocks`, and `templates`. A block without `exampleFor` is standalone under
`blocks`; a block with component ownership is an example or showcase.

Allow a doc to override its leaf with `registry.slug` and retain old relative
paths with `registry.aliases`. Check all names and paths against a reviewed lock
so a rename cannot silently break existing install commands.

## Open questions

- **OQ1 — Stable registry URL.** (`human-api`) Should publication use the
  branded docsite `/r/` path, the static preview host, or both?
- **OQ2 — Public support level.** (`human-api`) Is this a supported install
  protocol or an experimental compatibility path after the draft proves out?
- **OQ3 — Package version policy.** (`human-api`) Should generated item
  dependencies pin an exact Astryx version, use a compatible range, or follow a
  release-specific registry path?
- **OQ4 — Catalog visibility.** (`human-design`) Should hidden or not-ready
  catalog entries stay addressable by URL, or be omitted entirely?
