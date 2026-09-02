# Astryx knowledge map

This directory holds maintainer knowledge that must be reviewable with the code
it governs. Consumer documentation remains in component `.doc.mjs` files and
`packages/cli/assets/docs/`.

## Placement

- `architecture/`: the shipped system, its boundaries, and invariants.
- `contributing/`: practical contributor workflows that project current owner records without replacing them.
- `design/`: human-owned visual and interaction specifications.
- `themes/`: guidance and index for package-local theme specifications.
- `families/`: contracts shared by sibling components.
- `specs/`: consequential proposed or shipped system changes and their decisions.
- `templates/knowledge/`: authoring templates. Templates never live among records.
- `schemas/knowledge/`: versioned structural requirements for templates and records.

Component contracts are direct children of their Core or Lab component root and
use `<PublicName>.spec.md`. `<PublicName>` normally matches the root directory;
a public member such as `NavMenu/NavHeadingMenu.spec.md` is valid only when an
exact top-level or full inline consumer-doc entry in that root declares the same
public name. A flat filename and matching `component:` id alone are not enough.

Independently contractible public hooks, plugins, utilities, and subsystems use
`kind: module` records named `<PublicName>.spec.md` at least one directory below
the same component root. Their canonical id is
`module:<ParentComponent>/<PublicName>`; the module's `parent_component` and the
parent component's `modules` list must agree. Private transform helpers do not
require records.

Component-local discovery and PR routing ignore hidden path segments,
`*.generated.spec.md`, and fixture, test, generated, build-output, coverage, and
`node_modules` directories. Those files are not knowledge records or spec-only
changes. Theme contracts live beside the package as
`packages/themes/<theme>/<theme>.spec.md`.

## Authority

Every knowledge record declares `authority: draft | current | archived`.

- `draft` documents are not policy; unresolved evidence and owner decisions are
  recorded as blockers inside the document.
- Initial promotion to `current` requires explicit owner approval recorded in
  the document metadata. `cixzhang` and `imdreamrunner` may approve every record
  kind; current design records and normative design assets also accept current
  `.github/DESIGNOWNERS`; current theme records accept the committed union of
  `.github/ENGOWNERS` and `.github/DESIGNOWNERS`. Legacy v1 `owners` metadata is
  descriptive and does not grant approval rights.
- Pull requests that create, change, or archive a `current` record wait on the
  `spec-owner-approval` status for their exact current head. Draft-only records
  pass that status after validation without an owner review.
- `cixzhang` or `imdreamrunner` can approve another author's current-record PR
  through GitHub review. When an approver is also the PR author, they comment
  `/approve-spec <full-head-sha>`. Any new commit invalidates that approval.
- Only `current` documents guide implementation and review.
- Current records rely only on other current records. `modules` and
  `parent_component` are structural ownership links, so they may connect active
  draft/current records without making draft behavior authoritative. Other draft
  relationships are listed on the candidate record; promotion updates affected
  backlinks under owner review.
- `archived` documents declare `archive_reason` (`superseded`, `withdrawn`, or
  `historical`) and link `superseded_by` when a replacement exists.

## Templates and schemas

Templates create documents; schemas keep existing documents structurally
aligned. They are intentionally separate:

- `template_version` records the authoring form used to create a document.
- `schema_version` records the contract the document must satisfy.
- Editorial template changes may increment only `template_version`.
- Adding or changing required metadata or sections creates a new
  `schema_version`; published schema files are immutable.
- Every active record (`draft` or `current`) must use the latest schema that
  defines its kind. Adding a new kind does not migrate unrelated records;
  structurally changing an existing kind migrates only active records of that
  kind. Archived records may retain an older schema that remains checked in.

Published schema versions may extend an earlier schema. The checker composes the
chain and tracks the latest version that defines each record kind. A new kind is
therefore additive; changing an existing kind migrates only that kind.

New record kinds should prefer one typed relationship list over parallel fields.
If `system-spec` receives a future schema revision, replace its legacy
`affects_*` fields with one typed `affects` list containing ids such as
`architecture:*`, `family:*`, `theme:*`, and `contributing:*`; this PR does not
change the v1 system-spec shape.

Run `pnpm check:knowledge` to validate templates and records. Pure spec-record
pull requests do not add Changesets because they do not publish package changes.

## Visibility

This repository and its wiki are public. Internal operations, credentials,
services, routing, schedules, and private recovery procedures stay in an
access-controlled private home and must not be named or linked here.
