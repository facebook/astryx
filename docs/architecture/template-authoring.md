---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:template-authoring
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [josephfarina, cixzhang]
applies_to:
  [
    packages/cli/assets/templates/,
    packages/cli/authoring/doctypes/template/,
    packages/cli/foundation/discovery/template-adapter.mjs,
    packages/cli/api/template/,
    apps/docsite/src/components/templateComponents.ts,
  ]
verified_by:
  [
    packages/cli/authoring/doctypes/template/parse.test.mjs,
    packages/cli/foundation/discovery/template-adapter.test.mjs,
    packages/cli/foundation/config/project.test.mjs,
    packages/cli/api/init/init.test.mjs,
    packages/cli/api/template/template.test.mjs,
    packages/cli/api/template/template-integration.test.mjs,
    packages/cli/api/template/template-suffix.test.mjs,
    packages/cli/clients/cli/e2e-smoke.test.mjs,
  ]
deciding_specs: [spec:AST-017/DEC-2]
---

# Template authoring architecture

## Purpose

Astryx templates are copyable starting points. Page templates scaffold complete
content surfaces; block templates provide focused patterns and component examples.
This record describes how their source, metadata, discovery, previews, and CLI
operations form one shipped system.

It does not repeat the contributor guide or grading rubric. Those documents teach
how to author and evaluate a template; this record identifies the system boundaries
and invariants that must remain true while that guidance evolves.

## System model

Built-in templates live under `packages/cli/assets/templates/`, but each source
class enters discovery differently:

- Every directory under `pages/` is treated as a page. Its source path is
  `page.tsx`; metadata is loaded when a supported metadata module exists, and
  missing metadata values fall back to the directory name or defaults.
- A built-in or external block is discovered from its metadata module and enters
  the catalog only when a same-basename `.tsx` source exists.
- An integration template is discovered from its metadata module, must pass the
  strict integration-template parser, and must have a same-basename `.tsx` source.

The `TemplateDoc` authoring type defines the richer first-party metadata shape.
Shared discovery normalizes all accepted sources into `DiscoveredTemplate` values,
but the shipped system has three projections rather than one catalog call:

- `discoverAll()` builds the comprehensive page-and-block set used by the template
  API, search, and layout.
- `Project.templates()` re-collects integration templates so project-level callers
  can apply per-integration issue handling and deduplication.
- `listTemplates()` returns built-in page directory names only; `init` uses this
  smaller set when applying an explicitly named starter page.

The template API projects the comprehensive set into list, show, skeleton, and copy
operations. Copying emits source into the adopting project. It does not retain a
live relationship with the catalog and later template releases do not rewrite
previously copied projects.

The public docsite renders a curated subset of built-in page templates from their
real `page.tsx` modules. Those previews have manual lazy-import entries in
`apps/docsite/src/components/templateComponents.ts`. This is a separate projection
of the CLI catalog: an unregistered page can remain available through the CLI.
Blocks are discovered from their paired metadata and source instead of that page
registry.

The public [Contributing Templates](https://github.com/facebook/astryx/wiki/Contributing-Templates)
guide owns authoring instructions and the versioned Template Grading Rubric. Its
ledger records the exact template commit and rubric version used for an audit.
Rubric results are evidence about a revision, not a replacement for Design or
implementation review.

## Boundaries and invariants

- **INV1 — Discovery rules are source-specific.** Built-in pages are
  directory-discovered with optional metadata; built-in and external blocks require
  metadata plus a same-basename source; integration templates additionally require
  strict metadata parsing. A caller does not assume every source crossed the same
  validation boundary.
- **INV2 — Catalog projections have explicit scopes.** `discoverAll()` is the
  comprehensive command/search/layout projection, `Project.templates()` adds
  project issue handling, and `listTemplates()` is the built-in-page-only starter
  projection used by `init`. A caller chooses the projection for its contract
  rather than treating these sets as interchangeable.
- **INV3 — Registered page previews use the shipped page source.** Every docsite
  registry entry imports the same `page.tsx` that the CLI serves. The registry may
  expose a curated subset, but it does not create a second page implementation or
  define CLI catalog membership.
- **INV4 — Copying is a snapshot.** The emitted source belongs to the adopting
  project. A later catalog update does not mutate projects that already copied a
  template.
- **INV5 — Catalog values may evolve.** Template slugs, names, descriptions,
  categories, keywords, example data, and starter source describe the current
  catalog. They are not independently stable API identifiers and may change in a
  patch release under `spec:AST-017/DEC-2`.
- **INV6 — The operation surrounding the catalog remains contractual.** The
  `template` command, supported options, exit behavior, and machine-readable
  response schema remain governed by the CLI contract even though individual
  catalog values are mutable.
- **INV7 — Shared behavior requires a shared contract.** Similar templates do not
  implicitly form a family. Membership, states, interactions, responsive behavior,
  and constraints remain local unless an approved family, design, or system record
  makes them shared.
- **INV8 — Evidence is revision-specific.** A rubric score identifies the exact
  template commit and rubric version it measured. It can support review but cannot
  grant Design approval, implementation approval, or current-record authority.

## Change coupling

- A built-in template source or metadata change re-runs metadata loading,
  discovery, and template API tests. A page addition, removal, or rename also
  reviews whether the curated docsite page registry must change; any retained
  registry entry continues to import that page's real source.
- A change to the authoring type, source-specific discovery rules, a catalog
  projection, or the template API re-reads this record and updates its verification
  evidence when the shipped model changes.
- A visual or interaction change checks the authority of applicable design records
  and reads the public contributor guide. `design:template-composition` is the
  candidate shared design record but does not govern while it remains `draft`.
  An implementation, discovery, or CLI change likewise checks applicable current
  CLI records; `architecture:cli-surface` is the candidate surface record but does
  not govern while it remains `draft`. One review does not substitute for the
  other.
- A rubric scoring change increments the rubric version and updates the ledger
  contract described by the contributor guide. It changes this architecture only
  when it moves an ownership, provenance, or system boundary.
- A proposal to share behavior across several templates adds or updates the relevant
  family, design, or system record rather than inferring a contract from similarity.

## Owning code

- `packages/cli/assets/templates/` — built-in page and block source plus metadata.
- `packages/cli/authoring/doctypes/template/` — the authored metadata types and
  parser.
- `packages/cli/foundation/discovery/template-adapter.mjs` — source discovery,
  normalization, and shared template IO.
- `packages/cli/foundation/config/project.mjs` — project-scoped assembly of built-in
  and integration templates.
- `packages/cli/api/template/` — list, show, skeleton, and copy operations.
- `apps/docsite/src/components/templateComponents.ts` — built-in page preview
  registration.
- `docs/design/template-composition.md` — shared human visual and interaction intent.
- [Contributing Templates](https://github.com/facebook/astryx/wiki/Contributing-Templates)
  — authoring guidance, grading rubric, and score-ledger workflow.

## Deciding specs

- `spec:AST-017/DEC-2` — template slugs, metadata, and starter source are mutable
  catalog data; the surrounding CLI operation remains contractual.

## Verification

| Invariant | Evidence                                                                                                     | Failure signal                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| INV1      | `foundation/discovery/template-adapter.test.mjs`, `authoring/doctypes/template/parse.test.mjs`               | A caller assumes first-party defaults, block pairing, and strict integration validation are one boundary                            |
| INV2      | `api/template/template-integration.test.mjs`, `foundation/config/project.test.mjs`, `api/init/init.test.mjs` | A caller uses a projection whose membership or error contract does not match its job                                                |
| INV3      | `apps/docsite/src/components/templateComponents.ts`, exact-head preview review                               | A registered preview points at different source, or docsite curation incorrectly changes CLI membership                             |
| INV4–INV6 | `api/template/template.test.mjs`, `api/template/template-suffix.test.mjs`, CLI contract tests                | Copy mutates an existing project later, catalog data is frozen as API, or the operation/schema changes without compatibility review |
| INV7      | Template-local source plus applicable current family/design records                                          | Review invents a shared family or behavior from visual similarity                                                                   |
| INV8      | Versioned rubric scorecard with `commit` and `rubricVersion`                                                 | A score cannot be reproduced or is treated as approval                                                                              |

## Decision log

### Recovered draft — 2026-09-02

This record recovers the architecture half of [#5915](https://github.com/facebook/astryx/pull/5915)
without copying the rubric or changing `design:template-composition`. It replaces
that draft's proposed stable-slug invariant with the accepted
`spec:AST-017/DEC-2` boundary: catalog identity and source may evolve; the CLI
operation and response schema remain contractual.

## Open questions

- **OQ1 — Page registration.** Should the docsite keep a manually curated subset
  of built-in pages, or should one generated registry project the intended subset
  from catalog metadata?
- **OQ2 — Approval routing.** Which repository owners must approve a change that
  crosses both template visual intent and authoring/runtime behavior before this
  record can become `current`?
- **OQ3 — Catalog convergence.** Should `discoverAll()`, `Project.templates()`,
  and the built-in-page starter list become explicit projections of one catalog,
  or should their separate discovery implementations remain part of the contract?
- **OQ4 — Built-in validation.** Should built-in and external template metadata
  gain a first-party repository validation schema, or remain normalized from
  trusted package source with only type checking and focused tests?
