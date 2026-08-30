# Astryx knowledge map

This directory holds maintainer knowledge that must be reviewable with the code
it governs. Consumer documentation remains in component `.doc.mjs` files and
`packages/cli/assets/docs/`.

## Placement

- `architecture/`: the shipped system, its boundaries, and invariants.
- `design/`: human-owned visual and interaction specifications.
- `families/`: contracts shared by sibling components.
- `specs/`: consequential proposed or shipped system changes and their decisions.
- `templates/knowledge/`: authoring templates. Templates never live among records.
- `schemas/knowledge/`: versioned structural requirements for templates and records.

Component-local contracts and audits live beside the component as
`<Name>.spec.md` and `<Name>.audit.json`.

## Authority

Every knowledge record declares `authority: draft | current | archived`.

- `draft` documents are not policy; unresolved evidence and owner decisions are
  recorded as blockers inside the document.
- Initial promotion to `current` requires explicit owner approval recorded in
  the document metadata. `cixzhang` and `imdreamrunner` may approve every record
  kind; current design records and normative design assets also accept current
  `.github/DESIGNOWNERS`.
- Pull requests that create, change, or archive a `current` record wait on the
  `spec-owner-approval` status for their exact current head. Draft-only records
  pass that status after validation without an owner review.
- `cixzhang` or `imdreamrunner` can approve another author's current-record PR
  through GitHub review. When an approver is also the PR author, they comment
  `/approve-spec <full-head-sha>`. Any new commit invalidates that approval.
- Only `current` documents guide implementation and review.
- Current records link only other current records. Draft relationships are listed
  on the candidate record; promotion updates affected backlinks under owner
  review.
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
- Every active record (`draft` or `current`) must use the latest schema. A
  schema change therefore includes an active-record migration. Archived records
  may retain an older schema that remains checked in.

Run `pnpm check:knowledge` to validate templates and records.

## Visibility

This repository and its wiki are public. Internal operations, credentials,
services, routing, schedules, and private recovery procedures stay in an
access-controlled private home and must not be named or linked here.
