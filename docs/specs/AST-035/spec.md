---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-035
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-09-29
phase: accepted
owners: [josephfarina, cixzhang]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:templates, contributing:api-conventions]
affects_consumer_docs: [cli/integrations]
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

- **FR1 — A template declares its own replacement.** An integration template MAY
  set `replaces` in its own metadata to an existing Core template id. No
  package-level map declares replacements (`spec:AST-039/FR11`). The field is part
  of the strict template metadata object, so CLIs before 0.7.0 reject it; an
  integration that uses it MUST declare `@astryxdesign/cli >=0.7.0`.
- **FR2 — A valid replacement owns default discovery.** When one valid declaration
  applies, unqualified template lookup and default template projections MUST use the
  integration template for the Core id. The integration template MUST remain
  addressable by its own id. List, search, build suggestions, Project discovery, and
  block-layout lookup MUST project the same winner.
- **FR3 — Explicit package selection preserves alternatives.** Selecting
  `@astryxdesign/core` MUST address the original Core template. Selecting an
  integration package MUST retain access to its shadowed or rejected template by its
  own id.
- **FR4 — Invalid declarations fail closed.** A missing Core target, template-kind
  mismatch, a declaration on a template that cannot be used, or more than one
  declaration for one target inside a package MUST be an error. An invalid set MUST NOT replace Core. Valid integration
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
  `replaces`, valid template selection and package-aware ambiguity remain
  unchanged. FR9 intentionally changes failure isolation with or without the field.
- **FR7 — Diagnostics preserve the released contract until support begins.**
  Existing same-id conflicts MUST keep the released warning-only response shape
  throughout 0.6.x. Replacement-specific diagnostics MAY be implemented for
  pre-publication validation, but their `relationship`, optional `replaces`, and
  `severity: 'info'` fields do not enter the stable conflict API until 0.7.0.
  Reaching 0.7.0 MUST NOT expand the schema by version alone: one deliberate
  projection change MUST update the response type, generated reference, terminal
  output, consumer documentation, and tests together. From that supported boundary,
  `astryx doctor integration templates` MUST report intentional replacements, missing targets, declarations on templates that cannot
  be used, kind mismatches, and same-package ambiguity. Error findings MUST produce
  exit code 1 and MUST NOT be followed by a false success message.
- **FR8 — Public schema projection is complete at its supported boundary.**
  Effective `template.list` entries MAY include optional `replaces`; adding that
  optional field is nonbreaking. At or after 0.7.0, an explicit projection update
  MUST change the response type, generated inventory, terminal projection, consumer
  documentation, and tests together; a package-version bump alone MUST leave the
  warning-only response unchanged.
- **FR9 — Failure isolation preserves valid contributions.** An error in one
  contribution kind MUST remain reportable without removing the integration's other
  valid contribution kinds. Within template and component discovery, one unusable file
  MUST NOT remove valid siblings. Other kinds keep their existing per-kind atomicity. A
  manifest load failure still withdraws the integration because no contribution roots
  are trustworthy. This rule applies whether or not any template declares `replaces`.

### Platform support

- Minimum supported CLI for an integration that declares `replaces`:
  `@astryxdesign/cli >=0.7.0`. Earlier stable CLIs parse template metadata strictly:
  they reject the field, print one warning, and withhold the package's templates and
  doc topics, while its components still load.
- The replacement implementation may ship for forward validation before 0.7.0, but
  remains pre-publication while no supported integration package may declare the
  field. Stable 0.6.x conflict responses retain their warning-only shape. The
  replacement-specific conflict schema becomes eligible for an explicit, complete
  projection update at 0.7.0; version alone does not activate it.
- Browser evidence: not applicable to catalog selection. A generated consumer app
  MUST still build or run when its selected template renders integration-owned
  navigation.

## Current-state impact

The template metadata type and parser gain one optional field, `replaces`. Shared template
resolution becomes the owner for replacement validation, precedence, aliases, and the
default discovery view. Template commands, search/build, Project, layout, Doctor,
response documentation, and the integration-authoring guide project that result.
Project reports invalid contributions while retaining other valid contribution kinds
and valid template or component siblings.

The field is optional, and valid templates keep their selection behavior when it is
absent. Replacement declarations remain pre-publication throughout 0.6.x because an
integration package that uses one MUST require `@astryxdesign/cli >=0.7.0`; no valid
latest-stable integration consumer can rely on that path yet. Replacement selection
and mutable catalog membership therefore do not create a released victim. The
optional `TemplateListEntry.replaces` field is additive.

The released `IntegrationTemplateConflict` response is different: existing same-id
conflicts are already stable. Final 0.6.x preserves their warning-only shape. The
required `relationship` field and `severity: 'info'` value remain staged for a
deliberate complete projection update at or after 0.7.0, when replacement packages
become supported. A package-version bump alone leaves the warning-only projection in
place. Under `spec:AST-017/FR1`, FR2, FR5, FR7, and FR9–FR13, this pre-publication
capability plus the compatibility gate is a `[feat]` patch, not a breaking minor.

## Verification

| Contract | Verification                                                            | Representative states                                                                                       | Mutation or failure expectation                                                                           |
| -------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| FR1, FR6 | Template parser and discovery tests plus a released-CLI consumer run    | field present, field absent, 0.6.3 CLI                                                                      | a replacement is honored from anywhere but the template's own metadata                                    |
| FR2, FR3 | Template API/CLI and real consumer-app tests                            | target id, own id, Core package, integration package                                                        | lookup becomes ambiguous or the Core original is unreachable                                              |
| FR4, FR7 | Doctor and discovery tests plus a 0.6.x response-shape fixture          | missing local/source, missing target, wrong kind, duplicate, same-id rejection, pre-publication replacement | invalid metadata activates a replacement, Doctor reports success, or a 0.6.x conflict gains staged fields |
| FR5      | Multi-integration and autolink tests                                    | configured order, explicit versus autolinked, invalid loser                                                 | file/display order chooses the winner or invalid autolinking disables explicit intent                     |
| FR2, FR8 | List, search/build, Project, layout, response, and generated-doc checks | alias plus undeclared exact-id collision, page and block, explicit 0.7 schema projection                    | two projections disagree, a public field is undocumented, or version alone expands the conflict schema    |
| FR9      | Project discovery and issue-order tests                                 | invalid component/template siblings, valid contribution kinds and siblings                                  | one bad contribution removes unrelated valid output                                                       |

## Decision log

### DEC-1 — Replacement declarations live on the integration manifest

**Reference:** `spec:AST-035/DEC-1`
**Proposed by:** `josephfarina`, `2026-09-11`
**Superseded by:** `spec:AST-035/DEC-3` and `spec:AST-039/DEC-4`, `2026-09-24`

Use `templateReplacements: Record<integrationTemplateId, coreTemplateId>` on the
integration manifest. This makes intent explicit. CLIs from 0.5.3 onward ignore the
field when it is unknown without rejecting understood contributions; integrations
that use it must not claim compatibility with 0.5.2 or earlier. Supported integration
use starts in 0.7.0; the implementation may ship earlier for forward validation.

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

### DEC-3 — A template declares its own replacement

**Reference:** `spec:AST-035/DEC-3`
**Proposed by:** `josephfarina`, `2026-09-24`

Put `replaces` in the integration template's own metadata. Every integration item
keeps its per-item metadata in its own descriptor (`spec:AST-039/FR11`), and doc
topics already declare replacement with the same field. The cost: a CLI older than
0.7.0 rejects the unknown field and withholds the package's templates and doc
topics, where the manifest map let it fall back to own-id access. Integration
themes in 0.7.0 already need a 0.7.0 CLI, so this adds no new kind of break;
integrations that use `replaces` declare `@astryxdesign/cli >=0.7.0`.

Rejected: `templateReplacements` in the manifest (DEC-1). It is a central catalog of
per-item data, which `spec:AST-039/FR11` forbids for every kind.

### DEC-4 — Pre-publication replacement support is patch-compatible

**Reference:** `spec:AST-035/DEC-4`
**Decider:** `josephfarina`, `2026-09-29`

Integration-template replacement is not a fully published API before the supported
0.7.0 integration-package boundary. Shipping its implementation in final 0.6.x is
therefore additive and patch-compatible: there is no valid latest-stable
integration consumer whose supported behavior changes. Template winners are mutable
catalog data, and the optional list field is additive.

This does not relax the stable CLI schema around the unpublished capability. Existing
same-id `IntegrationTemplateConflict` responses keep their warning-only shape through
0.6.x. At or after 0.7.0, replacement-specific `relationship`, `replaces`, and
`severity: 'info'` require one deliberate projection change across runtime, types,
generated reference, terminal output, documentation, and tests; version alone does
not activate them. Integration packages using `replaces` still require
`@astryxdesign/cli >=0.7.0`, protecting older strict metadata readers.

Rejected: calling the unpublished replacement behavior breaking merely because its
future schema differs; exposing the expanded conflict schema in 0.6.x; or gating all
replacement implementation when the supported package boundary and stable-schema
adapter already protect released consumers.

## Open questions

None. The CLI owner accepted the contract on 2026-09-23 and moved FR1 to
per-template `replaces` on 2026-09-24 (DEC-3).
