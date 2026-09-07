---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:cli-response-schema
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-06
owners: [cixzhang]
applies_to:
  [
    packages/cli/api/,
    packages/cli/authoring/,
    packages/cli/clients/cli/formatters/,
    packages/cli/clients/cli/commands/,
  ]
verified_by:
  [
    packages/cli/clients/cli/commands/json-contract.test.mjs,
    packages/cli/api/template/template-integration.test.mjs,
    scripts/check-knowledge.mjs,
  ]
deciding_specs: [spec:AST-017/DEC-4]
---

# CLI response schema architecture

## Purpose

Agents depend on Astryx CLI JSON as a machine contract. This record defines the
complete stable schema boundary and the projections that must stay aligned when a
response changes.

It does not decide which catalog entries exist, their human-facing metadata, or
which canary components another surface may recommend.

## System model

A CLI result has one discriminated envelope and a typed `data` payload. The stable
schema includes nested fields inside response entries, not only the outer
`apiVersion`, `type`, and `data` keys.

One public field has four synchronized projections:

1. the canonical response type;
2. API contract tests for presence, type, optionality, and meaning;
3. text output when the command provides a human projection; and
4. complete consumer-facing schema documentation.

An optional field may be a compatible addition, but it is still a public schema
change. Compatibility classification and documentation completeness are separate
questions.

## Boundaries and invariants

- **INV1 — Nested fields are schema.** Every field inside a discriminated response
  entry is part of the stable machine contract when its containing operation is
  stable.
- **INV2 — One field has one meaning.** A field name, type, optionality, and
  semantics agree across every response producer and supported integration source.
- **INV3 — Projections move together.** Adding, removing, renaming, retyping, or
  reinterpreting a field updates its canonical type, contract tests, applicable
  text projection, and complete consumer schema in the same change.
- **INV4 — Compatibility and authority are independent gates.** An optional field
  addition can be nonbreaking under AST-017 while still requiring current public
  authority and full projection. Nonbreaking does not mean private.
- **INV5 — Catalog data stays distinct.** A template slug, name, description,
  category, keyword, or starter source remains mutable catalog data under AST-017.
  The response field that carries that data and its declared shape remain schema.

## Change coupling

- Every response change inventories the exact before → after for the envelope and
  nested entries.
- The generated or reviewed schema diff identifies all producers, types,
  formatters, docs, and tests affected by each field.
- A field does not ship when any required projection is missing or contradictory.
- The schema inventory is evidence. Acceptance still follows current authority
  and review routing; tooling does not decide semantics.

## Owning code

- `packages/cli/api/**` and colocated `*.type.mjs` files — own response
  producers, discriminators, and canonical public shapes.
- `packages/cli/authoring/**` — owns authored metadata schemas that feed public
  responses.
- `packages/cli/clients/cli/formatters/**` — owns human projections of response
  values.
- Command docs and generated consumer references — own complete public schema
  documentation.

## Deciding specs

- `spec:AST-017/DEC-4` — every stable CLI response field receives a complete,
  synchronized projection; compatible optional additions remain public schema.

## Verification

| Invariant  | Evidence                                                                                      | Failure signal                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| INV1, INV2 | Response type snapshots and API contract fixtures across built-in and integration sources     | A nested field is omitted from inventory or changes meaning by source                             |
| INV3       | Required type/test/text/doc projection review; automated bijection is a named enforcement gap | A field exists in code but not docs, or documentation names a field the response does not provide |
| INV4       | AST-017 compatibility fixture plus current-authority receipt                                  | A compatible addition bypasses authority review or an incompatible change is called optional      |
| INV5       | Template catalog-vs-schema mutation tests                                                     | Catalog values are frozen as API, or a schema field is dismissed as mutable catalog data          |

Current enforcement gap: no checked-in generator or guard yet proves the complete
field-to-type/test/text/doc bijection. Reviews must inspect all four projections
until that guard exists; the focused tests in `verified_by` prove representative
response behavior, not complete documentation coverage.
