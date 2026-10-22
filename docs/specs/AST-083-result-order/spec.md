---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-083
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-10-20
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli]
---

# Search and build result order system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

`astryx search` and `astryx build` pick among candidates. What each answer
holds is a contract: which entries match, their scores, their reasons, and
their counts. The order of matches that are equally strong is not. That order
is a measured quality, and it may change whenever a measurement shows the new
order is at least as good as the old one.

This record owns that split: the facts every answer must keep, and the rule
for changing the order inside them. Search owns its own matching.
`spec:AST-048` owns what build recommends and delegates the order of its
blocks here, because the same rule governs both commands' order. `spec:AST-017`
owns response fields and compatibility.

## Non-goals

- Which ordering method or weights win. They are measured, and they change
  under FR6.
- How search matches or scores an entry.
- Build's start template, alternatives, and page call (`spec:AST-048`).
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — search answers with the lexical matches.** Every result is an entry
  the lexical ranker matched, with that ranker's score and reason, and
  `matchCount` equals its match count. Search never returns more results than
  the lexical ranker does for the same query and limit.
- **FR2 — bands do not cross.** Search orders matches only inside a run of one
  score band and one kind (doc or not); a band is a range of lexical scores,
  so inside one a lower score can lead a higher one. A match never moves past a
  match of another band or kind; between runs, the lexical order holds,
  including its domain priority.
- **FR3 — a whole name keeps today's answer.** A query that is an entry's
  whole name or title, read with dashes and spaces alike, gets the lexical
  ranker's answer unchanged.
- **FR4 — build re-orders only its own blocks.** `spec:AST-048` owns which
  blocks build lists and delegates their order here. Build's `blocks` are the
  blocks build itself lists, each with its own score and reason. Build never
  adds one and never lists more than before. A block the request names, a
  block the weights do not know, and a block from an integration package
  keep the place build gave them.
- **FR5 — the order is local, deterministic, and static.** The order inside a
  run comes from plain code and fixed values shipped with the CLI. No model
  runtime runs, no network is used, and the same inputs give the same order.
- **FR6 — the order changes only when measured.** A change to the order
  inside runs, whether new weights, a new searcher, or a new rule, ships only
  when measured against the held-out, fresh, and synthetic evaluation sets
  shows no row worse than the previous order. A row is worse when the paired
  95% confidence interval of its change lies entirely below zero. FR1–FR5
  hold for every change.

## Current-state impact

- `architecture:cli-surface`: none to its rules; search and build keep their
  JSON shapes.
- Consumer docs: `search()`'s doc and the `score` field describe the order
  that ships.

## Verification

| Contract | Verification                                                                                          | Representative states                                    | Mutation or failure expectation                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FR1, FR2 | `api/search/_order.test.mjs` against the lexical ranker; a replay over every real and synthetic query | multi-word queries, doc sections, domain-priority merges | a non-lexical result, a changed score, reason, or count, a cross-band move, or extra results fail |
| FR3      | `api/search/_main-searcher.test.mjs` whole-name cases                                                 | exact names, names typed with spaces for dashes          | an answer that differs from the lexical ranker's fails                                            |
| FR4      | `api/build/blocks/blocks.test.mjs`, `api/build/tree.test.mjs`                                         | named blocks, integration blocks, unknown blocks         | an added block, a changed entry, a moved named block, or more blocks fail                         |
| FR5      | `_main-searcher.test.mjs` and `tree.test.mjs` offline and repeat checks                               | network stubbed to throw; repeated runs                  | a network call or a differing repeat fails                                                        |
| FR6      | measured comparison on the evaluation sets, reported in the change's description                      | held-out, fresh, synthetic                               | a row whose paired CI lies below zero blocks the change                                           |

## Decision log

### DEC-1 — matches inside a score band are ordered by measured, static weights

**Reference:** `spec:AST-083/DEC-1`
**Decider:** `josephfarina`, `2026-10-20`

The CLI owner chose to keep improving the order with plain, typed branches
tuned where answers are weak: "add tree branches out for weaknesses and tune
it there", "strongly typed and uniform... Then we can hill climb and keep
boosting the numbers", using plain algorithms with no model runtime. The order
inside a match band is therefore the part that improves.

Rejected: a model runtime in the CLI, which adds install size and gives
answers that cannot be traced to code.

### DEC-2 — the answer's facts are the contract; the order is measured

**Reference:** `spec:AST-083/DEC-2`
**Decider:** `josephfarina`, `2026-10-20`

In the CLI owner's words, "search order is mostly only important as long as
it is tested against our data and is better or same as before". The order is
held to measurement (FR6). The facts a reader or caller relies on hold
unconditionally (FR1–FR4).

## Open questions

None.
