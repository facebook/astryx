---
schema_version: 3
template_version: 1
kind: module
id: module:<ParentComponent>/<PublicName>
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [<owner>]
review_triggers: [public-api, behavior, theming, accessibility]
verified_by: [<test-or-check>]
parent_component: component:<ParentComponent>
references: [architecture:<surface>, design:<surface>, spec:AST-000/DEC-0]
---

# <PublicName> module contract

## Intent

<!-- Why this public semantic module exists and the component-local job it owns. Private implementation helpers do not need records. Consumer usage belongs in the module's .doc.mjs. -->

## Compatibility and migration

- Released default preserved: `<yes, no, or not yet released>`
- Compatibility class: `<state the compatibility effect>`
- Migration decision: `<module DEC or system spec link>`

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- `<the module's public API, generated anatomy, accessibility, precedence, or evidence obligation>`

**Does not own / non-goals**

- Aggregate module protocol, ordering, and composition — owned by `component:<ParentComponent>`.
- `<other responsibility>` — owned by `<record or product callsite>`.

## Public API and concepts

<!-- Concepts, not a duplicated parameter table. Consumer signatures/defaults remain in the module's .doc.mjs. -->

| Concept     | Closed values or states | Meaning     | Default     | Owner                                   | Stability                  |
| ----------- | ----------------------- | ----------- | ----------- | --------------------------------------- | -------------------------- |
| `<concept>` | `<values>`              | `<meaning>` | `<default>` | `module:<ParentComponent>/<PublicName>` | `<stable or experimental>` |

## Behavioral contract

| ID  | Candidate invariant   | Basis                                                                         | Draft review state                     |
| --- | --------------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| FR1 | `<The module MUST …>` | `<existing DEC, documented promise, standard, current behavior, or proposal>` | `<settled, verify, or human decision>` |

### Transformation and precedence order

- **ORD1 — `<pipeline>`.** `<The required order and which explicit input wins.>`

### Performance and resources

- **PR1 — `<constraint>`.** `<Durable render, listener, observer, or initialization behavior.>`

## Accessibility contract

- **AR1 — `<obligation>`.** `<The module MUST …>`

## Design relationships

| Anatomy or state | Design requirement     | Representation authority                     | Module contract     |
| ---------------- | ---------------------- | -------------------------------------------- | ------------------- |
| `<role/state>`   | `design:<surface>/DR1` | `<prescribed, human-selected, or unsettled>` | `<FR/AR reference>` |

### Theming anatomy

<!--
Optional during migration. When present, this block maps the exact public anatomy
and targets from this module's own consumer-doc entry. It never falls back to the
parent component's aggregate anatomy or target inventory. Use the same
anatomy-theming:v1 format documented by the component template.
-->

<!-- anatomy-theming:v1 -->

```json
{
  "<module part>": {"target": "<target>"}
}
```

## Parent and system relationships

- `component:<ParentComponent>` owns aggregate module protocol, ordering, and composition.
- This record owns only the independent public module contract stated above; link shared rules instead of copying them.

## Verification map

| Contract | Verification                 | Representative states | Mutation or failure expectation                 |
| -------- | ---------------------------- | --------------------- | ----------------------------------------------- |
| FR1      | `<test or browser evidence>` | `<states>`            | `<removing behavior makes this fail because …>` |

## Decision log

### DEC-1 — `<module-local decision>`

**Reference:** `module:<ParentComponent>/<PublicName>/DEC-1`
**Decider:** `<person>`, `<YYYY-MM-DD>`

`<Reason and user impact.>`

## Open questions

- **OQ1 — `<question>`** (`checkable | human-design | human-api`)

## Content boundary

This record does not duplicate consumer signatures/examples, parent aggregate
protocol or ordering, current audit results, implementation steps, or
family/design/system rules. It links to their canonical owners.
