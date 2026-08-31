---
schema_version: 1
template_version: 1
kind: component
id: component:<Name>
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [<owner>]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by: [<test-or-check>]
families: [family:<family-name>]
design_specs: [design:<surface>]
architecture: [architecture:<surface>]
contributing: [contributing:<surface>]
system_specs: [spec:AST-000/DEC-0]
---

# <Name> component contract

## Intent

<!-- Why this component exists and the system-level job it owns. Consumer usage belongs in <Name>.doc.mjs. -->

## Compatibility and migration

- Released default preserved: `<yes, no, or not yet released>`
- Compatibility class: `<state the compatibility effect>`
- Controlled/uncontrolled behavior: `<unchanged or stated transition>`
- Migration decision: `<component DEC or system spec link>`

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- `<responsibility>`

**Does not own / non-goals**

- `<responsibility>` — owned by `family:<family>` / `component:<Other>` / product callsite.

## Public concepts

<!-- Concepts, not a prop table. Consumer syntax/defaults remain in <Name>.doc.mjs. -->

| Concept     | Closed values or states | Meaning     | Availability by variant/orientation/state | Default     | Owner              | Stability                  | Invalid-value behavior          |
| ----------- | ----------------------- | ----------- | ----------------------------------------- | ----------- | ------------------ | -------------------------- | ------------------------------- |
| `<concept>` | `<values>`              | `<meaning>` | `<where emitted>`                         | `<default>` | `component:<Name>` | `<stable or experimental>` | `<reject, ignore, or fallback>` |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant      | Basis                                                                         | Draft review state                     |
| --- | ------------------------ | ----------------------------------------------------------------------------- | -------------------------------------- |
| FR1 | `<The component MUST …>` | `<existing DEC, documented promise, standard, current behavior, or proposal>` | `<settled, verify, or human decision>` |

### Allowed variation

- **AV1 — `<dimension>`.** `<What may vary without becoming a regression.>`

### Representative states

| State     | Required invariant | Allowed variation |
| --------- | ------------------ | ----------------- |
| `<state>` | `<invariant>`      | `<variation>`     |

### Transformation and precedence order

- **ORD1 — `<pipeline>`.** `<The final invariant and the required order, such as snap → round → clamp.>`

### Performance and resources

- **PR1 — `<constraint>`.** `<Measurement, render, listener, observer, or initialization behavior that MUST remain true.>`

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — `<obligation>`.** `<The component MUST …>`

## Design relationships

| Anatomy or state | Design requirement     | Representation authority                     | Hierarchy role              | Component contract  |
| ---------------- | ---------------------- | -------------------------------------------- | --------------------------- | ------------------- |
| `<role/state>`   | `design:<surface>/DR1` | `<prescribed, human-selected, or unsettled>` | `<prominent or supporting>` | `<FR/AR reference>` |

The component implements design requirements without copying their rationale.
An `unsettled` representation remains a human decision; principles do not let an
agent invent the answer.

## Family and system relationships

Frontmatter lists only `current` family, design, architecture, and system
relationships. Candidate records list proposed members on the candidate itself;
do not edit an existing component contract merely to backlink to a draft.

- `family:<family-name>` owns `<shared concept>`; this component `<adopts or deliberately differs>`.

## Verification map

| Contract | Verification                 | Representative states | Mutation or failure expectation                 | Audit section            |
| -------- | ---------------------------- | --------------------- | ----------------------------------------------- | ------------------------ |
| FR1      | `<test or browser evidence>` | `<states>`            | `<removing behavior makes this fail because …>` | `audit:<Name>/<section>` |

## Decision log

### DEC-1 — `<component-local decision>`

**Reference:** `component:<Name>/DEC-1`
**Decider:** `<person>`, `<YYYY-MM-DD>`

`<Reason and user impact.>`

Rejected: `<alternative — why>`.

## Open questions

- **OQ1 — `<question>`** (`checkable | human-design | human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
