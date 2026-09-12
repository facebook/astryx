---
schema_version: 1
template_version: 1
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

## Purpose

## System model

## Boundaries and invariants

<!-- Architecture records own internal responsibility, seams, and mechanisms needed to satisfy deciding specs. They MUST NOT broaden the observable product contract beyond those current decisions. -->

- **INV1 — `<invariant>`.** `<What MUST remain true in the shipped system.>`

## Change coupling

<!-- State how code changes trigger review of this architecture and which checks prove it remains current. -->

## Owning code

- `<path or public module>` — `<responsibility>`

## Deciding specs

- `spec:AST-000/DEC-0` — `<observable behavior decision; architecture records never treat implementation evidence as product authority>`

## Verification

| Invariant | Evidence                        | Failure signal                           |
| --------- | ------------------------------- | ---------------------------------------- |
| INV1      | `<test or observable evidence>` | `<what fails when the invariant breaks>` |
