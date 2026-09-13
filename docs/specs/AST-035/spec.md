---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-035
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina, cixzhang]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:templates, contributing:api-conventions]
affects_consumer_docs: [cli-integrations]
---

# Integration template replacement system spec

## Intent

Let an installed integration provide the project-specific implementation of a Core
template without making the common lookup ambiguous or removing access to the Core
original.

## Non-goals

- Replacing integration components or reference-doc topics. Those surfaces own their
  own contracts.
- Rewriting template source that a consumer already copied into an app.
- Making an integration template available when its source or metadata is invalid.
- Selecting an integration that the project neither configures nor autolinks.

## Requirements

- **FR1 — Integrations declare replacement intent in the manifest.** An integration
  MAY provide `templateReplacements` as a map from one of its template ids to an
  existing Core template id. The declaration is separate from the strict template
  metadata object. CLIs from 0.5.3 onward can ignore an unknown manifest field
  while retaining contributions they understand. Versions 0.5.2 and earlier reject
  unknown manifest keys and therefore require the integration to declare a
  compatible CLI floor.
- **FR2 — A valid replacement owns default discovery.** When one valid declaration
  applies, unqualified template lookup and default template projections MUST use the
  integration template for the Core id. The integration template MUST remain
  addressable by its own id. List, search, build suggestions, Project discovery, and
  block-layout lookup MUST project the same winner.
- **FR3 — Explicit package selection preserves alternatives.** Selecting
  `@astryxdesign/core` MUST address the original Core template. Selecting an
  integration package MUST retain access to its shadowed or rejected template by its
  own id.
- **FR4 — Invalid declarations fail closed.** A missing local template, missing Core
  target, template-kind mismatch, or more than one declaration for one target inside
  a package MUST be an error. An invalid set MUST NOT replace Core. Valid integration
  templates remain available by their own ids when replacement metadata alone is
  invalid.
- **FR5 — Precedence is deterministic.** When multiple explicitly configured
  integrations validly replace one target, the integration configured later wins and
  the CLI reports a warning. An explicitly configured replacement MUST win over an
  autolinked replacement. When only autolinked integrations validly replace one
  target, the dependency listed later in package.json wins with a warning; naming
  the intended package in `astryx.config` makes precedence explicit. Invalid
  autolinked declarations remain reportable but MUST NOT disable a valid explicit
  replacement.
- **FR6 — Omission preserves selection behavior for valid integrations.** Without
  `templateReplacements`, valid template selection and package-aware ambiguity remain
  unchanged. FR9 intentionally changes failure isolation with or without the field.
- **FR7 — Diagnostics are complete and stable.** `astryx doctor integration templates`
  MUST report intentional replacements, missing targets, missing local templates,
  kind mismatches, and same-package ambiguity. Error findings MUST produce exit code
  1 and MUST NOT be followed by a false success message.
- **FR8 — Public schema projection is complete.** Effective `template.list` entries
  MAY include optional `replaces`. The response type, generated inventory, terminal
  projection, consumer documentation, and tests MUST describe that field and the
  expanded integration-template diagnostic behavior together.
- **FR9 — Failure isolation preserves valid contributions.** An error in one
  contribution kind MUST remain reportable without removing the integration's other
  valid contribution kinds. Within template and component discovery, one unusable file
  MUST NOT remove valid siblings. Other kinds keep their existing per-kind atomicity. A
  manifest load failure still withdraws the integration because no contribution roots
  are trustworthy. This rule applies whether or not `templateReplacements` is present.

### Platform support

- Compatibility floor for preserving understood contributions when this field is
  unknown: `@astryxdesign/cli >=0.5.3`. Versions 0.5.3 onward ignore the unknown
  manifest key. Versions 0.5.2 and earlier use strict manifest parsing, reject the
  unknown key, and drop the integration.
- Replacement selection itself starts in `@astryxdesign/cli 0.7.0`, the release
  produced by this breaking minor changeset.
- Browser evidence: not applicable to catalog selection. A generated consumer app
  MUST still build or run when its selected template renders integration-owned
  navigation.

## Current-state impact

The integration manifest type and parser gain one optional map. Shared template
resolution becomes the owner for replacement validation, precedence, aliases, and the
default discovery view. Template commands, search/build, Project, layout, Doctor,
response documentation, and the integration-authoring guide project that result.
Project reports invalid contributions while retaining other valid contribution kinds
and valid template or component siblings.

The manifest field is optional, and valid manifests keep their selection behavior
when it is absent. The overall release is breaking: a winning replacement removes its
Core target from the default `template.list` response, every
`IntegrationTemplateConflict` gains required `relationship`, and its `severity` can
now be `info`. The changeset uses a minor bump under 0.x and includes migration
instructions as required by `spec:AST-017/FR8`. Optional `replaces` is projected
across every public response surface under `spec:AST-017/FR13`.

## Verification

| Contract | Verification                                                            | Representative states                                                          | Mutation or failure expectation                                                       |
| -------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| FR1, FR6 | Manifest parser tests plus an unmodified-base CLI consumer run          | field present, field absent, old CLI                                           | a new field makes an older CLI drop the integration                                   |
| FR2, FR3 | Template API/CLI and real consumer-app tests                            | target id, own id, Core package, integration package                           | lookup becomes ambiguous or the Core original is unreachable                          |
| FR4, FR7 | Doctor and discovery tests                                              | missing local/source, missing target, wrong kind, duplicate, same-id rejection | invalid metadata activates a replacement or Doctor reports success                    |
| FR5      | Multi-integration and autolink tests                                    | configured order, explicit versus autolinked, invalid loser                    | file/display order chooses the winner or invalid autolinking disables explicit intent |
| FR2, FR8 | List, search/build, Project, layout, response, and generated-doc checks | alias plus undeclared exact-id collision, page and block                       | two projections disagree or a public field is undocumented                            |
| FR9      | Project discovery and issue-order tests                                 | invalid component/template siblings, valid contribution kinds and siblings     | one bad contribution removes unrelated valid output                                   |

## Decision log

### DEC-1 — Replacement declarations live on the integration manifest

**Reference:** `spec:AST-035/DEC-1`
**Proposed by:** `josephfarina`, `2026-09-11`

Use `templateReplacements: Record<integrationTemplateId, coreTemplateId>` on the
integration manifest. This makes intent explicit. CLIs from 0.5.3 onward ignore the
field when it is unknown without rejecting understood contributions; integrations
that use it must not claim compatibility with 0.5.2 or earlier. Replacement selection
starts in 0.7.0.

Rejected: adding `replaces` directly to `TemplateDoc`. A CLI released before that
field would reject the strict metadata object and make the integration template
unavailable instead of degrading cleanly.

### DEC-2 — Explicit project configuration owns replacement precedence

**Reference:** `spec:AST-035/DEC-2`
**Proposed by:** `josephfarina`, `2026-09-11`

Use configuration order when more than one explicitly configured package replaces a
target, and prefer any explicit replacement over autolinking. This keeps the
consumer-authored config authoritative while making valid conflicts deterministic and
visible.

Rejected: making every cross-package replacement ambiguous. That would prevent a
consumer from intentionally composing integrations in a declared order. Also
rejected: letting autolinking override explicit config merely because it is appended
to discovery later.

## Open questions

- **OQ1 — Should the current CLI/system owner accept the replacement/default/fallback/precedence and failure-isolation contract above?** (`human-api`)
