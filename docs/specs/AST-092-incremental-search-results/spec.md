---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-092
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-22
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs: [Typeahead, Tokenizer, BaseTypeahead]
---

# Incremental search results system spec

## Intent

A person typing into a typeahead sees matches for what they typed right away,
from results the page already holds, and sees results from the server join the
same list for the same query when they arrive. The list grows without the
highlighted row jumping under them, and a screen-reader user hears the result
count once per query, not once per arrival.

A search source answers one query with one or more lists. Each list is the
source's complete answer at that moment; the source owns how its local and
remote results merge, dedupe, and order. The typeahead shows the latest list
for the current query and owns stale-query rejection, highlight, loading
feedback, and announcements.

## Non-goals

- How a source finds local matches, caches earlier queries, merges, dedupes, or
  orders results. The source owns all of it (DEC-1).
- `bootstrap()`. It answers with one list.
- When a source sends its remote request. A source that shows local results
  first and wants the remote request delayed delays it itself.
- Components that call `search(query)` without a context: `CommandPalette`,
  `ChatComposerInput` trigger menus, and `PowerSearch` value lists. They show
  the settled list (FR9).
- Escape while a query is pending. `component:BaseTypeahead` FR3 owns it; a
  partial list follows the same rule as a settled one.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Every list is the source's complete answer.** `search(query,
context)` receives an optional `SearchContext` whose `update(items)` replaces
  the results shown for that query. Each list a source gives, through `update` or
  as its return value, is complete, ordered, and free of duplicate `id`s for
  that query at that moment. The typeahead shows each list as given, capped at
  its result cap. It never merges, reorders, or dedupes lists.
- **FR2 — The return value settles the query.** The array a source returns, or
  the value its promise resolves to, is the final list for the query. It
  replaces any earlier list, ends the query's busy state, and is the last list
  shown for it. An `update` call after the query settles has no effect.
- **FR3 — Only the current query is shown.** A list for a query that is no
  longer current is dropped, whether it comes from `update` or from the return
  value. A query stops being current when the person types a newer query,
  selects a result, clears the field, or when the source is replaced or the
  typeahead unmounts.
- **FR4 — A pending query shows its partial lists.** While a query is pending,
  a non-empty `update` replaces the shown rows and opens the popup. An empty
  `update` leaves the shown rows in place. The control stays busy, with its
  loading indicator, until the query settles. The empty-result row appears only
  when the query settles with an empty final list.
- **FR5 — The highlight follows the item.** The first list shown for a new query
  highlights its first row. When a later list for the same query arrives, the
  highlighted item stays highlighted wherever it now sits; when that item is no
  longer in the list, the first row is highlighted. When a later list moves the
  highlighted item, the list scrolls only as far as needed to keep it visible.
  Enter selects the highlighted item.
- **FR6 — An option keeps its identity while its item stays.** While an item
  remains in the lists of one query, its option element and its id stay the
  same. The active descendant keeps referencing the same option, so assistive
  technology does not re-read the highlighted row when rows are added around
  it.
- **FR7 — One result announcement per query.** The typeahead announces the
  result count once per query, when the query settles. A partial list announces
  nothing. Busy start is announced once per query as `spec:AST-086` FR6 and
  FR8 require.
- **FR8 — A failed remote answer keeps what was shown.** When a source's promise
  rejects after an `update` for the current query, the last updated list stays,
  the query settles, and its count is announced. When it rejects with no
  `update`, the results clear.
- **FR9 — A single answer is still a complete answer.** A source that never
  calls `update` is shown one list per query, when the query settles. A caller that does not pass a
  context calls `search(query)` and shows only the settled list, which FR1
  makes complete.

### Platform support

- Supported feature/engine floor: the package's supported browsers. The
  contract uses no platform feature beyond those `search()` already uses.
- Unsupported behavior: none.
- Browser evidence: DOM and accessibility-tree checks of rows, highlight, the
  active descendant, busy state, and the announcement channel across a partial
  list and its settled list.

## Current-state impact

- `SearchSource.search` gains an optional second parameter, a context with
  `update(items)`. `createStaticSource` and every existing source keep working
  unchanged.
- `component:BaseTypeahead`: FR3 and PR1 cover partial lists through FR3 here;
  AR4 announces once per query through FR7 here; option ids follow item
  identity within a query (FR6). Typeahead and Tokenizer inherit this through
  BaseTypeahead and add no props.
- `family:input-fields`: busy feedback is unchanged; a pending query stays busy
  while partial lists show.
- Consumer docs: the `SearchSource` reference and the Typeahead docs describe
  `update`, and that a source showing local results first pairs with
  `debounceMs={0}` and delays its own remote request.

## Verification

| Contract | Verification                                         | Representative states                                                                                               | Mutation or failure expectation                                                                                                                   |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2 | BaseTypeahead source-contract tests                  | synchronous update then promise, several updates, cap smaller than list                                             | rows that merge lists, reorder a list, exceed the cap, or change after settle fail                                                                |
| FR3      | stale-query tests with a deferred source             | newer query, selection, clear, source replacement, unmount                                                          | a list for a superseded query appearing fails                                                                                                     |
| FR4      | pending-state tests                                  | first partial list, empty partial list, settled empty list                                                          | busy ending early, an empty row while pending, or rows cleared by an empty update fail                                                            |
| FR5, FR6 | keyboard tests plus real-browser accessibility tree  | highlight on first row, highlight moved by arrows, highlighted item removed, rows added above it in a scrolled list | highlight moving to a different item, the highlighted row leaving the visible list, or the active descendant id changing for the same item, fails |
| FR7      | announcement-channel tests                           | partial then settled, settled only                                                                                  | a second count announcement for one query, or none at settle, fails                                                                               |
| FR8      | rejection tests                                      | reject after update, reject without update                                                                          | shown rows cleared after an update, or a missing announcement, fails                                                                              |
| FR9      | existing Typeahead, Tokenizer, CommandPalette suites | single-answer sources, context-free callers                                                                         | any behavior change for a source that never calls `update` fails                                                                                  |

## Decision log

### DEC-1 — The search source merges its own results

**Reference:** `spec:AST-092/DEC-1`
**Decider:** cixzhang, 2026-10-22

"I think merging server results should be the work of the search source." The
source knows which results are local, which are remote, how they dedupe, and
in what order a person should see them, so each list it gives is its whole
answer. The typeahead stays a renderer of the current query's latest list.

Rejected: the typeahead merging a separate local answer and remote answer,
which would make one merge and ordering rule part of every typeahead.

### DEC-2 — Partial lists arrive through `update`; the return value stays final

**Reference:** `spec:AST-092/DEC-2`
**Decider:** cixzhang, 2026-10-22

The return value of `search()` keeps its meaning, the final list, and the
optional context adds partial lists. Every caller that awaits an array keeps
getting one, a source can show local matches synchronously before it returns,
and settling is the end of the returned promise.

Rejected: `search()` returning an async iterable, which breaks every caller
that awaits an array and cannot deliver its first list synchronously.

## Open questions

None.
