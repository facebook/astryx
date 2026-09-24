---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-039
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: implementing
owners: [joeyfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [cli-integrations]
---

# Integration contribution descriptor system spec

## Intent

Every discoverable item that an Astryx integration contributes has one local,
strongly typed description beside the item it describes. A contributor can
understand, author, validate, move, and package one item without editing a
second catalog elsewhere in the package.

The canonical descriptor is `<source-stem>.doc.mjs`. It is the only source of
per-item metadata. The integration manifest locates contribution roots and
holds integration-level capabilities; it does not catalog the items below a
root.

## Non-goals

- Remove a released compatibility reader before the normal breaking-change and
  migration process permits it.
- Make runtime integration features such as `debug` or `gapReport` into item
  contributions. Their typed named-export contract remains owned by
  `spec:AST-031`.
- Put build receipts, generated output manifests, or consumer runtime data into
  authoring descriptors.
- Require a separate executable source file for a reference doc whose
  `.doc.mjs` is itself the complete payload.
- Execute contributed source during discovery to learn its metadata.

## Requirements

- **FR1 — Every discoverable item owns one canonical descriptor.** A new or
  newly authored component, template, theme, doc topic, codemod, or future item
  contribution MUST have exactly one `<source-stem>.doc.mjs` descriptor. When
  the item has a primary source or payload file, the descriptor MUST be beside
  it and MUST use the same stem. A reference doc is both descriptor and payload.
- **FR2 — Descriptors are strongly typed authoring modules.** Every descriptor
  kind MUST export a public TypeScript type from
  `@astryxdesign/cli/authoring`, use that type in a JSDoc annotation, and
  expose its value through the kind's canonical export (the stamped default
  export for a new descriptor kind). Discovery MUST parse the loaded value through the kind's public authoring parser at the load
  boundary. A new kind is incomplete without its type, parser, self-doc, and
  parser tests.
- **FR3 — The descriptor is the sole item-metadata authority.** Per-item names,
  labels, descriptions, readiness or maintenance state, source relationship,
  and copy metadata MUST NOT be duplicated in a root JSON catalog, an array in
  `astryx.integration.*`, or another package-level registry. The integration
  manifest MAY locate roots and declare integration-level metadata or runtime
  capabilities. It MUST NOT enumerate the items under a root.
- **FR4 — Pair identity is structural.** Discovery MUST derive the primary
  source path and any source-bound runtime export identity from the shared
  descriptor/source stem when that relationship is structural. The descriptor
  owns the stable public item identity. Discovery MUST reject a missing source,
  more than one eligible same-stem source, an invalid inferred export name, or
  a descriptor whose authored identity conflicts with its required directory
  identity.
- **FR5 — Multi-file items have one confined ownership boundary.** A kind whose
  item needs nested source, token, palette, asset, or receipt files MUST define
  one item-local copy and pack boundary. Discovery and authoring MUST enumerate
  that boundary without a second catalog, keep every path inside it, and copy
  the complete owned set. A missing local dependency, an escaped path, and an
  unexpected symlink target MUST fail before consumer writes.
- **FR6 — Discovery does not execute contributed payload source.** Loading a
  descriptor follows the established doc-module boundary. Executable component,
  theme, template, and codemod payloads MUST be inspected or resolved without
  running them during discovery. Static validation MUST reject type-only or
  missing runtime exports where a runtime binding is part of the contract.
- **FR7 — One discovery seam serves every downstream surface.** Listing,
  package ownership, ambiguity handling, authoring verification, Doctor,
  package inventory, packed-consumer verification, and materialization MUST
  consume the same normalized discovered record. A writer MUST verify its output
  through that seam rather than reimplementing the format.
- **FR8 — Authoring emits only the canonical form.** `astryx integration add`
  and its typed APIs MUST write `.doc.mjs`, the public JSDoc type annotation,
  and the conventional export. They MUST NOT create a new legacy alias, central
  item catalog, untyped object, or duplicated metadata source.
- **FR9 — Released aliases are compatibility inputs, not authoring precedent.**
  Readers MAY retain a released alternate suffix or combined module while the
  compatibility policy requires it. New writers and examples MUST use the
  canonical descriptor. Each retained alias MUST be isolated, tested as a
  compatibility path, and excluded from the design of new contribution kinds.
  Canary-only formats have no compatibility claim.
- **FR10 — Theme registration is the first clean application.** A theme root
  contains one directory per lower-kebab slug. That directory contains a theme
  source and mandatory same-stem `.doc.mjs`. `ThemeDoc` owns `name`,
  `displayName`, `description`, and `maintained`; the source entry and named
  runtime export come from the shared stem. The directory is the recursive copy
  and pack boundary. `themes/manifest.json` is deleted and MUST NOT remain as a
  fallback because theme integrations did not ship in stable `0.6.0`.

### Compatibility transition

The final rule applies to every kind. Existing released inputs move to it
without pretending they were never released:

- components and reference docs already use `.doc.*`; new authoring narrows to
  strongly typed `.doc.mjs` while released suffixes remain readable;
- templates keep their released `.template.*` reader, but new authoring and
  examples use the already-supported `.doc.mjs` pair;
- themes replace the canary-only JSON catalog directly, with no dual reader;
- combined codemod modules and inline `agentDocs` remain released compatibility
  inputs until their paired-descriptor migrations ship; they do not permit
  another contribution kind to omit a descriptor.

## Current-state impact

This specification owns a distinct boundary that no current system spec covered.
`spec:AST-031` explicitly excludes default-manifest item contributions, while
`architecture:cli-surface` describes the implementation but cannot authorize a
new cross-kind authoring rule.

This specification replaces the catalog claim in
`architecture:cli-surface/INV19` with one mandatory per-theme descriptor. It
adds a general descriptor invariant to the CLI architecture and contributor
checklist. The theme change updates public authoring types, discovery, bundled
assets, integration authoring, package inventory, pack verification, consumer
docs, and real provider-to-consumer tests.

The contract does not change `DefineThemeInput` or `DefinedTheme`. Theme package
metadata stays outside Core runtime authoring, consistent with
`architecture:theme-authoring-contract/INV11`.

## Verification

| Contract | Verification                                                                          | Representative states                                                                 | Mutation or failure expectation                                                                            |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FR1–FR4  | authoring parser, discovery, and writer tests                                         | valid pair; missing/duplicate source; bad identity; malformed/missing doc             | a source without its typed same-stem descriptor becomes visible, or duplicated metadata can win            |
| FR5–FR7  | contribution inventory, pack-check, materialization, and real-world integration tests | nested files; symlink/escape; missing import; local vs packed; duplicate package slug | a nested file is omitted, an escaped file is copied, or two surfaces disagree on ownership                 |
| FR6      | static source-graph and runtime-export tests                                          | direct export; re-export; type-only export; source side effect                        | discovery executes source or accepts no runtime binding                                                    |
| FR8–FR9  | integration-add snapshots and compatibility fixtures                                  | new writer output; released template/codemod/agent guidance input                     | a writer emits an untyped or non-`.doc.mjs` item, or a compatibility reader becomes the new canonical form |
| FR10     | bundled-theme, integration-theme, and provider-to-consumer tests                      | all bundled themes; multi-theme package; list/add/build; no JSON catalog              | removing a theme doc still passes, or restoring `manifest.json` becomes necessary                          |

## Decision log

### DEC-1 — Use one typed same-stem descriptor per contribution item

**Reference:** `spec:AST-039/DEC-1`
**Decider:** `joeyfarina`, `2026-09-12`

A contribution's description belongs beside the source or payload it describes.
One typed module gives editors and the CLI the same contract, makes the item
movable as a unit, and prevents a root catalog from drifting away from source.
The integration manifest remains a root locator and integration-capability
boundary.

Rejected: a central JSON catalog. It creates a theme-only authoring language,
duplicates source identity, and allowed the CLI to accept a format that does not
follow the repository's `.doc.mjs` convention.

Rejected: an optional descriptor layered over the JSON catalog. Two metadata
sources need precedence and drift rules and preserve the design defect.

### DEC-2 — Infer theme source identity and own the whole theme directory

**Reference:** `spec:AST-039/DEC-2`
**Decider:** `joeyfarina`, `2026-09-12`

A theme source and descriptor share one stem. That stem identifies the entry and
required named runtime export. The lower-kebab parent directory and `ThemeDoc.name`
agree on the CLI slug. The complete theme directory, including its descriptor, is
the copy and pack boundary, so nested files do not require an authored
allowlist.

Rejected: carrying `entry`, `exportName`, and `files` forward into `ThemeDoc`.
Those fields restate structure that discovery can prove directly and recreate
the catalog inside each file.

### DEC-3 — Preserve released readers without weakening new authoring

**Reference:** `spec:AST-039/DEC-3`
**Decider:** `joeyfarina`, `2026-09-12`

Stable `0.6.0` already reads template, codemod, and inline agent-guidance forms
that predate this rule. Compatibility readers remain until their normal
migration path permits removal. All new writers and new contribution kinds use
the canonical descriptor immediately. The canary-only theme catalog receives no
compatibility bridge.

Rejected: treating every historical form as a permanent equal convention. A
reader kept for compatibility does not define what the authoring system should
create next.

## Open questions

None.
