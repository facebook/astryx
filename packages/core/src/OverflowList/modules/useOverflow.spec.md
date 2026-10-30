---
schema_version: 3
template_version: 4
kind: module
id: module:OverflowList/useOverflow
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior]
verified_by: [packages/core/src/hooks/useOverflow.test.ts]
parent_component: component:OverflowList
references: [architecture:public-component-api, component:OverflowList/DEC-1]
---

# useOverflow module contract

## Contract at a glance

| Area                    | Contract                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes; `useOverflow` keeps its parameters and its `visibleCount`, `hasOverflow`, `rows`, and `rowHeight` results.                    |
| Behavior                | The hook measures after the commit that mounts or changes its container, with every list in that commit, and its results land before paint. |
| End-user impact         | Pages that mount many overflow containers pay for one layout instead of one per container; the first painted frame is unchanged.            |
| Builder impact          | Code that reads the results in the same task as a synchronous render awaits one microtask; nothing else changes.                            |
| Compatibility/readiness | Timing only; not breaking under `spec:AST-017` FR1. Draft, decided, not yet implemented.                                                    |
| Review checks           | Reject a measurement inside the commit, results that land after the next task, or a hook that measures apart from the lists in its commit.  |
| Governing rules         | `component:OverflowList` FR4 and DEC-1; `architecture:public-component-api`.                                                                |

This table is a review projection; the body below is authoritative.

## Intent

useOverflow is the public measuring core behind OverflowList: it measures a
container's children and reports how many fit. This record contracts one
semantic slice, when those results land. Collapse order, count limits, and the
measurement arithmetic stay uncontracted here.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: timing only. Under `spec:AST-017` FR1 this is not
  breaking: no documented scenario reads the hook's results in the same task as
  a synchronous render, and its consumer docs promise no such timing. Test code
  that asserted in that task awaits one microtask
  (`await act(async () => {})`)
- Migration decision: `component:OverflowList/DEC-1`

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- When `visibleCount`, `hasOverflow`, `rows`, and `rowHeight` land after a
  commit that mounts or changes the container.

**Does not own / non-goals**

- Aggregate module protocol, ordering, and composition — owned by
  `component:OverflowList`.
- Collapse order, count limits, and the indicator — owned by
  `component:OverflowList`.
- Measuring after a resize, which follows the shared resize observer's own
  notifications.

## Public API and concepts

| Concept | Closed values or states                                | Meaning                              | Default            | Owner                             | Stability |
| ------- | ------------------------------------------------------ | ------------------------------------ | ------------------ | --------------------------------- | --------- |
| results | `visibleCount`, `hasOverflow`, `rows`, and `rowHeight` | what fits in the container, measured | all items, one row | `module:OverflowList/useOverflow` | stable    |

## Behavioral contract

| ID  | Candidate invariant                                                                                                                                                                                                      | Basis                          | Draft review state           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------- |
| FR1 | After a commit that mounts or changes the container, the hook MUST measure with every overflow list in that commit, after the commit, and its results MUST land one microtask after the commit, before the frame paints. | `component:OverflowList` DEC-1 | Decided; not yet implemented |

### Transformation and precedence order

- **ORD1 — Measure, then apply.** Every container in the commit reads its sizes
  → one render applies every result → the frame paints.

### Performance and resources

- **PR1 — One layout per commit.** Containers mounted or changed in one commit
  share one style and layout pass.

## Accessibility contract

No accessibility semantics are owned by this hook.

## Design relationships

No visual representation is owned by this hook.

## Parent and system relationships

- `component:OverflowList` owns aggregate module protocol, ordering, and
  composition, and FR4 there owns the matching timing of the collapse and
  `onOverflowChange`.
- This record owns only the timing of the hook's results stated above.

## Verification map

| Contract | Verification                                                        | Representative states                          | Mutation or failure expectation                                                                                                                                     |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | `useOverflow.test.ts`, which awaits one microtask after each render | Mount; children change; two containers at once | Results set inside the commit, results that land after the next task, or a render between two containers' size reads in one commit fails. Gap: not yet implemented. |

## Decision log

None recorded. The timing decision is `component:OverflowList/DEC-1`.

## Open questions

None.

## Content boundary

This record does not duplicate consumer signatures/examples, parent aggregate
protocol or ordering, current audit results, implementation steps, or
family/design/system rules. It links to their canonical owners.
