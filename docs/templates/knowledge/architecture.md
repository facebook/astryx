---
schema_version: 1
template_version: 2
kind: architecture
id: architecture:<surface>
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [<owner>]
applies_to: [<path-prefix>]
verified_by: [<test-or-check>]
deciding_specs: [spec:AST-000/DEC-0]
---

# <Surface> architecture

<!--
Follow architecture:knowledge-contracts/DEC-3. Keep one durable system boundary:
model, owners, invariants, decisions, and evidence links. Omit review history,
implementation narration, repeated lower-level rules, and copied audit evidence.
-->

## Purpose

## System model

## Boundaries and invariants

- **INV1 — `<invariant>`.** `<What MUST remain true in the shipped system.>`

## Change coupling

<!-- State how code changes trigger review of this architecture and which checks prove it remains current. -->

## Owning code

- `<path or public module>` — `<responsibility>`

## Deciding specs

- `spec:AST-000/DEC-0` — `<decision>`

## Verification

| Invariant | Evidence                        | Failure signal                           |
| --------- | ------------------------------- | ---------------------------------------- |
| INV1      | `<test or observable evidence>` | `<what fails when the invariant breaks>` |
