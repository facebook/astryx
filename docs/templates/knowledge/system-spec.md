---
schema_version: 1
template_version: 2
kind: system-spec
id: spec:AST-000
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed | accepted | implementing | shipped | withdrawn
owners: [<owner>]
affects_architecture: [architecture:<surface>]
affects_families: [family:<family-name>]
affects_contributing: [contributing:<surface>]
affects_consumer_docs: [<doc-id>]
---

# <Change> system spec

<!--
Follow architecture:knowledge-contracts/DEC-3. Keep one consequential system
boundary: intent, normative requirements, compatibility, decisions, relationships,
and evidence links. Extra length must serve one coherent behavior matrix, not a
review dossier or implementation plan.
-->

## Intent

## Non-goals

- `<non-goal>`

## Requirements

- **FR1 — `<behavior>`.** `<The system MUST …>`
- **IR1 — `<constraint>`.** `<The implementation MUST …>`

### Platform support

- Supported feature/engine floor: `<matrix or canonical consumer-doc link>`
- Unsupported behavior: `<required fallback, graceful degradation, or prohibition>`
- Browser evidence: `<real browser requirement; do not substitute Playwright WebKit for Safari>`

## Current-state impact

<!-- Name every architecture, family, contributing, and consumer-doc surface changed when this ships. -->

## Verification

| Contract | Verification         | Representative states | Mutation or failure expectation       |
| -------- | -------------------- | --------------------- | ------------------------------------- |
| FR1      | `<test or evidence>` | `<states>`            | `<removing behavior makes this fail>` |

## Decision log

### DEC-1 — `<decision>`

**Reference:** `spec:AST-000/DEC-1`
**Decider:** `<person>`, `<YYYY-MM-DD>`

`<Reason and user impact.>`

Rejected: `<alternative — why>`.

## Open questions

- **OQ1 — `<question>`** (`checkable | human-design | human-api`)
