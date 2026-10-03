---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-056
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: [family:input-fields]
affects_contributing: [contributing:api-conventions]
affects_consumer_docs:
  [Selector, MultiSelector, Tokenizer, Typeahead, BaseTypeahead, CommandPalette]
review_triggers: [public-api, accessibility, compatibility]
---

# Search prop shape system spec

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "public-api": [
      "FR1",
      "FR2",
      "FR3",
      "FR4",
      "FR5",
      "FR6",
      "FR7",
      "FR8",
      "FR10",
      "DEC-1",
      "DEC-2",
      "DEC-3",
      "DEC-4"
    ],
    "accessibility": ["AR1", "AR2"],
    "compatibility": ["FR9", "DEC-5"]
  }
}
```

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One shape for every component that lets a person narrow its choices by typing: a single object-valued prop named `search`, with a closed key set — `source`, `placeholder`, `emptyText`, `onChange`, `onCreate` — none of which repeats the word `search` (DEC-2, DEC-3). The object's type is exported. The prop's presence is the only switch (FR3).                                                                                                                                                          |
| Behavior                | `search` absent means no query exists at all. `search.source` chooses who resolves the query, not whether a query exists: absent, the component filters the choices it was already given; present, the caller resolves it (FR4, DEC-1). A capability that cannot work without a query is only representable inside the object, never beside it (FR6, FR7).                                                                                                                                                      |
| End-user impact         | Unchanged today — this record contracts shape, not behavior. What changes is downstream: a person meets one placeholder convention, one "nothing matched" message, and one create affordance across pickers instead of six spellings, and a half-configured create row stops silently rendering nothing (FR7).                                                                                                                                                                                                  |
| Builder impact          | A builder sets one prop and discovers every search option through its type instead of scanning a flat prop list for the word `search`. New caller burden: one nested object literal, and — on components whose choices are the query's result — `search.source` becomes required where `searchSource` was. Every shipped prop keeps working during the cycle.                                                                                                                                                   |
| Compatibility/readiness | Not additive. Nine shipped public props across seven components are replaced by keys, four of them on a required prop (`searchSource`). The replacement-first deprecation cycle and its cost are stated in `Migration and compatibility`; FR9 is the only requirement that constrains it. Authority: `draft`; nobody has approved this. Five owner questions remain open, and OQ1, OQ2, and OQ4 change FR3, FR4, and FR9.                                                                                       |
| Review checks           | Reject a new top-level prop whose name contains `search`; a key inside the object that repeats the prefix; a boolean that gates a handler key; a capability that renders inert when its sibling prop is missing; an `emptyText` whose value cannot reach assistive technology (AR1); a query input named only by its placeholder (AR2).                                                                                                                                                                         |
| Governing rules         | [`spec:AST-002`](../AST-002/spec.md) FR1, FR4, FR15, FR16 and `spec:AST-002/DEC-1`, `DEC-6` for admission and one responsibility per input; [`architecture:public-component-api`](../../architecture/public-component-api.md) INV1, INV2, INV3, INV9 for the shared naming grammar and released-API lifecycle; [`spec:AST-017`](../AST-017/spec.md) FR28–FR31 for deprecation and cleanup; [`family:input-fields`](../../families/input-fields.md) for the field chrome around the query input, unchanged here. |

This table is a review projection; the body below is authoritative.

## Intent

Typing to narrow a list is one thing a person does, and Astryx spells it seven
ways. A builder who has used `hasSearch` on `Selector` finds no `hasSearch` on
`Tokenizer`; a builder who has set `emptySearchResultsText` on `Typeahead`
finds `emptySearchText` on `CommandPalette`, taking a different type. Nothing
is broken for the person using the product, but every new search-adjacent
capability lands as another flat prop on one component, with its own name, and
the next component copies whichever neighbour it happened to read.

This record owns one answer: **everything a caller says about the typed query
goes in one object-valued prop named `search`.** It states the key set, which
keys are required and when, what happens when the prop is absent, and how a
capability that depends on the query is kept from existing without one.

The trigger is [#6829](https://github.com/facebook/astryx/pull/6829), which
proposes `hasCreate` + `onCreate` on `MultiSelector` — a sixth and seventh
search-adjacent prop on a component that already carries three, under a name
`Tokenizer` already ships with a different contract. That pull request is
blocked on this ruling, and the shape it adopts is the shape every later
component copies.

## Ownership boundary

**Owns**

- The shape a component uses for every caller-owned aspect of a typed query
  over the choices it presents: one object-valued prop, its name, and its
  closed key set.
- What the prop's absence means, and when it is required rather than optional.
- Which key governs who resolves the query, and that this choice does not
  govern whether a query exists.
- That a capability which cannot function without a query has no
  representation outside the object.
- The accessibility floor the arrangement must keep for the empty-result
  message and the query input's name.

**Why no existing record can hold it**

- [`spec:AST-002`](../AST-002/spec.md) is `current` and approved, and a record
  carries one `authority` value, so adding unapproved claims to it would
  present them as approved (`architecture:knowledge-contracts` INV1, INV14).
  It also owns a different fact — whether a public API is admitted at all —
  and both its FR17 and its DEC-7 say in their own words that **component prop
  and event naming remains separate**. A rule about the shape and name of a
  component prop is structurally outside what AST-002 claims. This record sits
  downstream of AST-002 FR1 and FR4: admission still decides whether a search
  capability exists, and this record decides only where it is spelled.
- [`architecture:public-component-api`](../../architecture/public-component-api.md)
  is `current` and approved, with the same authority problem. It holds the
  shared naming grammar (INV2) and links its human rulings through
  `deciding_specs` — `spec:AST-002/DEC-1`, `spec:AST-005/DEC-1`,
  `spec:AST-012/DEC-1`. A new cross-component ruling belongs in a spec it
  links, not inside it; its own INV18 boundary keeps observable caller-visible
  behavior in a product contract.
- [`family:input-fields`](../../families/input-fields.md) is `current` and owns
  the field chrome — label, status, size, theming — shared by its members. Two
  of the six adopters here, `BaseTypeahead` and `CommandPalette`, are not
  members and are not input fields; `CommandPalette` is a dialog. The adopters
  are not one sibling family.
- `contributing:api-conventions` and the wiki's `Prop Naming` section document
  conventions for booleans, callbacks, enums, direction, and HTML collisions.
  They say nothing about object-valued configuration props, and guidance is not
  an authority record. Both owe an amendment once this record is `current`.
- The six component records would each hold a private copy of the same
  decision, which `architecture:knowledge-contracts` INV2 forbids.
  `component:MultiSelector` is already drafting one as its FR10 / DEC-3.

## Non-goals

- **Matching quality.** Fuzzy matching, ranking, highlighting, tokenization,
  and diacritic folding are not settled here. FR4 fixes only the floor for the
  mode where the component does the filtering.
- **Whether any particular component should gain search, or a create row.**
  That is `spec:AST-002` admission, case by case.
- **`PowerSearch`.** Its query is a structured field/operator/value expression,
  not a typed string narrowing a list. Its `maxSearchResults` and its per-field
  `searchSource` are cited as evidence of spread, not governed (OQ4).
- **`emptyBootstrapText` on `CommandPalette`.** "No query yet, and the default
  set is empty" is a different observable state from "the query matched
  nothing"; it stays a top-level prop.
- **The trigger-menu configuration on `ChatComposerInput`.** Its per-trigger
  object is cited as the repository's existing precedent for this shape, and
  whether it adopts the key set is OQ4.
- **Internal filtering implementation.** Equivalent internal implementations
  remain valid when they satisfy this contract. Internal modules, files,
  function names, algorithms, data structures, storage layouts, manifests,
  journals, locks, transaction protocols, and CI job/workflow topology belong in
  architecture or implementation unless callers or interoperating systems
  intentionally depend on that exact mechanism as a public protocol.

## Evidence: every search-shaped prop in core today

Read from `packages/core/src` at this record's base commit. This table is the
evidence for FR1–FR5; it is not a migration plan.

| Component           | Query input exists because                        | Who resolves the query                                 | Placeholder                                       | "Nothing matched"                                        | Query observable by the caller                       | Create affordance                                         | Other search-shaped props                                      |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `Selector`          | `hasSearch?: boolean` — default `false`           | the component, over its own `options`                  | `searchPlaceholder?: string` — `'Search…'`        | `emptySearchText?: ReactNode` — `'No results found'`     | **no** — `searchQuery` is internal `useState`        | —                                                         | `emptyText?: ReactNode` (`'No options'`, a different state)    |
| `MultiSelector`     | `hasSearch?: boolean` — default `false`           | the component, over its own `options`                  | `searchPlaceholder?: string` — `'Search…'`        | `emptySearchText?: ReactNode` — `'No results found'`     | **no** — `searchQuery` is internal `useState`        | `hasCreate` + `onCreate` **proposed** in #6829            | `emptyText?: ReactNode` (`'No options'`)                       |
| `Tokenizer`         | `searchSource: SearchSource<T>` — **required**    | the caller's source                                    | `placeholder?: string` — the input is the control | `emptySearchResultsText?: string` — `'No results found'` | `onChangeQuery?: (query: string) => void`            | `hasCreate?: boolean` — **the component mints the token** | `minQueryLength?: number` (`1`), `debounceMs?: number` (`150`) |
| `Typeahead`         | `searchSource: SearchSource<T>` — **required**    | the caller's source                                    | `placeholder?: string`                            | `emptySearchResultsText?: string`                        | `onChangeQuery?: (query: string) => void`            | —                                                         | `minQueryLength?: number`, `debounceMs?: number`               |
| `BaseTypeahead`     | `searchSource: SearchSource<T>` — **required**    | the caller's source                                    | `placeholder?: string`                            | `emptySearchResultsText?: string`                        | `onChangeQuery?: (query: string) => void`            | `__queryEntries` — underscored, `@internal`               | `minQueryLength?: number`, `debounceMs?: number`               |
| `CommandPalette`    | `searchSource: SearchSource<T>` — **required**    | the caller's source                                    | `CommandPaletteInput.placeholder` — `'Search…'`   | `emptySearchText?: ReactNode` — `'No results'`           | through the `input` slot's `value` / `onValueChange` | —                                                         | `emptyBootstrapText?: ReactNode` (`'Type to search'`)          |
| `ChatComposerInput` | one `searchSource` per entry in `triggers[]`      | the caller's source, per trigger                       | — (the composer's own `placeholder`)              | `triggers[].emptySearchResultsText?: string`             | —                                                    | —                                                         | `triggers[].loadingText`, `triggers[].menuLabel`, `debounceMs` |
| `PowerSearch`       | a structured filter expression, not a typed query | the caller's per-field `searchSource?` (value pickers) | internal (`@astryx.powersearch.placeholder`)      | —                                                        | —                                                    | —                                                         | `maxSearchResults?: number`                                    |

Four drift axes are visible in that table, and each one is a separate decision
somebody made alone:

1. **Two names for "nothing matched":** `emptySearchText` on `Selector`,
   `MultiSelector`, and `CommandPalette`; `emptySearchResultsText` on
   `Typeahead`, `BaseTypeahead`, `Tokenizer`, and each `ChatComposerTrigger`.
2. **Two types for the same message:** `ReactNode` on the first group, `string`
   on the second. A builder who can pass an element to one component cannot to
   its neighbour.
3. **Three defaults for it:** `'No results found'`, `'No results'`, and —
   because `Selector` and `MultiSelector` also carry a top-level `emptyText` —
   `'No options'` for the adjacent state.
4. **The prefix only appears where search is optional.** `Selector` and
   `MultiSelector` write `searchPlaceholder` because they also have a trigger
   placeholder; `Typeahead` and `Tokenizer` write `placeholder` because the
   query input _is_ the control. Both are locally right, which is exactly why
   no component will fix this on its own.

Beyond core, `packages/lab` has already copied the drift and added a fifth
name: `MobileTokenizer` takes `searchSource` + `emptySearchResultsText`,
`TransferList` takes `hasSearch` + `searchPlaceholder` + `searchLabel`, and
`ChatEmojiPicker` takes `searchLabel`. Lab is not a stable public promise, so
this record does not govern it; it is evidence that the pattern spreads by
copying.

### Two prior claims about prior art, corrected

- **`searchConfig` is not a component prop and is not prior art for this
  shape.** It is a parameter and plugin-config field in
  `Table/plugins/filtering/useTableFiltering.tsx`, holding a
  `PowerSearchConfig` — the structured field/operator/value configuration of
  the filter builder. It configures a different concept.
- **The repository's real precedent for this shape is `ChatComposerTrigger`.**
  Each entry in `ChatComposerInput`'s `triggers[]` is an object carrying
  `searchSource`, `renderItem`, `onSelect`, `emptySearchResultsText`,
  `loadingText`, and `menuLabel` — the whole configuration of one trigger's
  query in one value, with keys that mostly drop the prefix the surrounding
  name already supplies. It works, it is shipped, and nobody has asked for it
  to be flattened.

## Public API and concepts

| Concept              | Closed values or states                      | Meaning                                                                                                     | Default                                   | Owner          | Stability |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- | --------- |
| the `search` prop    | absent, present                              | Absent: no query input, no query state, no key reachable. Present: the component offers a typed query       | absent, where the component may omit it   | `spec:AST-056` | proposed  |
| `search.source`      | absent, a `SearchSource<T>`                  | Who resolves the query. Absent: the component filters the choices it holds. Present: the caller resolves it | absent, where the component holds choices | `spec:AST-056` | proposed  |
| `search.placeholder` | `string`                                     | Placeholder text in the query input                                                                         | the component's localized `'Search…'`     | `spec:AST-056` | proposed  |
| `search.emptyText`   | `ReactNode`                                  | What the panel shows when the query matched nothing                                                         | the component's localized default         | `spec:AST-056` | proposed  |
| `search.onChange`    | `(query: string) => void`                    | Reports the query after every change; never replaces the component's own resolution                         | —                                         | `spec:AST-056` | proposed  |
| `search.onCreate`    | `(query: string) => void`                    | Offers a create affordance for a query that matched nothing; presence is the switch                         | —                                         | `spec:AST-056` | proposed  |
| "no choices at all"  | the component's own top-level `emptyText`    | A different observable state from "the query matched nothing"; unchanged by this record                     | the component's localized default         | the component  | stable    |
| fetch tuning         | `minQueryLength`, `debounceMs`, loading text | Not placed by this record; they belong to whoever fetches, and OQ5 asks whether they move inside            | per component                             | the component  | stable    |

## Requirements

### Behavioral contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                            | Verification state                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| FR1  | A component that offers a person a typed query over the choices it presents MUST take every caller-owned aspect of that query in exactly one object-valued public prop named `search`. No sibling top-level prop may configure the same query. A component that offers no typed query MUST NOT declare the prop.                                                                                                                                                     | DEC-2; `architecture:public-component-api` INV2, INV3                            | Proposed; no evidence on `main`         |
| FR2  | The object's keys are exactly `source`, `placeholder`, `emptyText`, `onChange`, and `onCreate`. A key's name MUST NOT repeat the `search` prefix the prop already supplies. The object's type MUST be exported from the package entry point, named for the component that takes it, so a caller can hold and pass one configuration by type.                                                                                                                         | DEC-3; `architecture:public-component-api` INV1, INV2                            | Proposed; no evidence on `main`         |
| FR3  | The prop's presence is the only switch. With `search` absent, no query input renders, no query state exists, and no key's behavior is reachable. A component whose presented choices **are** the query's result MUST declare `search` required; a component that holds a choice set of its own MUST declare it optional, defaulting to absent, and MUST remain fully usable without it.                                                                              | DEC-1; `spec:AST-002` FR15                                                       | Proposed; no evidence on `main`         |
| FR4  | `search.source` governs who resolves the query, not whether a query exists. Absent, the component resolves the query against the choices it already holds, matching case-insensitively on each choice's displayed label at minimum. Present, the caller resolves it and the component renders what comes back without re-filtering. Both modes MUST reach the same observable states: a narrowed result list, an empty result, and `emptyText`.                      | DEC-1; `spec:AST-002` FR16                                                       | Proposed; shipped behavior, unspecified |
| FR5  | One observable state has one key across every component. "The query matched nothing" is `search.emptyText` and accepts `ReactNode` everywhere; no component may name or type it differently. "The component was given no choices at all" keeps its own top-level `emptyText` and is not merged into the object.                                                                                                                                                      | DEC-3; `architecture:public-component-api` INV2                                  | Proposed; no evidence on `main`         |
| FR6  | A capability that cannot function without a typed query MUST be represented only as a key of `search`. It MUST NOT be reachable through a top-level prop, so that configuring it without search is unrepresentable rather than silently inert. `onCreate` is such a capability: a create row is offered for a query, and there is no query to offer it for when `search` is absent.                                                                                  | DEC-4; `spec:AST-002` FR15 (never silently render a broken state)                | Proposed; no evidence on `main`         |
| FR7  | A key whose value is a handler MUST NOT be paired with a boolean that also gates it. Presence of the handler is the switch. A caller MUST NOT be able to reach a configuration that renders nothing and reports nothing, which `hasCreate && hasSearch && onCreate != null` permits when any one piece is missing.                                                                                                                                                   | DEC-4; `spec:AST-002` FR15, FR16                                                 | Proposed; no evidence on `main`         |
| FR8  | Observing the query is `search.onChange`, the primary change callback for the query concept, reporting the query after every change. It is a report, not a control: it MUST NOT suppress, defer, or replace the component's own resolution of that query, and a component MUST NOT require it. Whether each adopter gains it is OQ3.                                                                                                                                 | `contributing:api-conventions` primary-change-callback rule; `spec:AST-002` FR16 | Proposed; shipped as `onChangeQuery`    |
| FR9  | Every prop this record replaces is a released public surface with a victim, so it MUST follow `spec:AST-017` FR28–FR31: the replacement ships first, old usage stays equivalent through the overlap, each old prop gets a `DEP-*` id and a distinct `CLN-*` id, and removal happens only in a minor whose frozen manifest carries both. While both exist, a component given a key and its replaced prop MUST resolve to the key and MUST fire a development warning. | `architecture:public-component-api` INV9; `spec:AST-017` FR1, FR3, FR28–FR31     | Proposed; cycle not started             |
| FR10 | A new search-related capability is admitted as a key of `search` under `spec:AST-002`, or not at all. It MUST NOT be added as a new top-level prop whose name carries the word `search`, and adding a key is itself a public API addition subject to the same admission argument.                                                                                                                                                                                    | DEC-2; `spec:AST-002` FR1, FR5, DEC-1                                            | Proposed; no evidence on `main`         |

### Accessibility contract

- **AR1 — The empty-result message reaches assistive technology as written.**
  Whatever `search.emptyText` renders on screen MUST be what a screen reader
  receives when the panel becomes empty. Today it is not: `Selector` and
  `MultiSelector` announce `typeof emptySearchText === 'string' ? emptySearchText
: t('@astryx.selector.emptySearchResults')`, so a caller who passes an element
  — which the `ReactNode` type invites — is silently announced the default
  string instead of their own message. Accepting `ReactNode` (FR5) obliges the
  component to derive an announceable string from it, or to document and
  require a separate announceable form; it may not announce something the
  person on screen is not reading.
- **AR2 — The query input has an accessible name that is not its placeholder.**
  `search.placeholder` is placeholder text and MUST NOT be the input's only
  accessible name. The component supplies the name — `Selector` and
  `MultiSelector` use a localized "Search options" today — and a component
  that falls back to the placeholder, as `CommandPaletteInput` does and its own
  comment flags, MUST gain a real name as part of adopting this record.

### Platform support

- Supported feature/engine floor: every supported renderer and every supported
  browser. Nothing here is behind a capability check.
- Unsupported behavior: none. A component that cannot satisfy FR3's
  required/optional rule does not partially adopt the prop; it keeps its
  current API until the rule is settled for it.
- Browser evidence: this record contracts prop shape and announcement, not
  layout or paint, so every requirement here is provable in jsdom. AR1's
  announcement is a live-region assertion, not a pixel claim. Adopting
  components keep whatever real-browser evidence their own records already
  require.

## Migration and compatibility

This is not additive, and the cost is concentrated in one place.

**What is shipped and has a released victim.** Nine public props across seven
core components: `hasSearch`, `searchPlaceholder`, and `emptySearchText` on
`Selector` and `MultiSelector`; `searchSource` and `emptySearchResultsText` on
`Tokenizer`, `Typeahead`, and `BaseTypeahead`; `searchSource` and
`emptySearchText` on `CommandPalette`; `onChangeQuery` on the three typeaheads;
`hasCreate` on `Tokenizer`; `emptySearchResultsText` on every
`ChatComposerTrigger`. Under `spec:AST-017` FR1 and FR3, and
`architecture:public-component-api` INV9, removing or retyping any of them is a
breaking change.

**The expensive one is `searchSource`.** It is **required** on `Tokenizer`,
`Typeahead`, `BaseTypeahead`, and `CommandPalette`. The cut that removes it does
not degrade a long tail of callsites — it fails every existing callsite of those
four components at type-check. Nothing else here is close to that.

**This record's recommendation: deprecate with a replacement-first cycle.** Not
coexist indefinitely, not replace.

- A patch ships `search` on each adopter while every old prop keeps working,
  carries `@deprecated` naming its replacement, and behaves exactly as before
  (`spec:AST-017` FR28, FR29). During the overlap a component reads both and
  the key wins, with one development warning on conflict (FR9).
- Each old prop gets a `DEP-*` id and a distinct `CLN-*` id. Removal happens in
  a later minor only when both ids are in that minor's frozen manifest
  (`spec:AST-017` FR31). This record sets no clock; FR30 forbids reading
  release cadence as one.
- Until that cleanup minor, FR3's "MUST declare `search` required" cannot be
  true on the four components where `searchSource` is required, because
  `searchSource` still satisfies them. FR3's required clause becomes
  enforceable at cleanup, not at adoption.

**What each option actually costs.**

- **Deprecate with a cycle (recommended).** The search surface roughly doubles
  for the length of the overlap: two ways to set the placeholder, two ways to
  set the empty text, both in the types, both in `.doc.mjs`, both in the
  consumer docs a builder reads. Nine `DEP-*` records and nine `CLN-*` ids to
  write and track. The flat-to-nested rename is mechanically codemoddable where
  callers pass literals — `searchPlaceholder={x}` becomes `search={{placeholder:
x}}` — and is **not** codemoddable where a caller spreads props or builds them
  conditionally. `Tokenizer.hasCreate` is not codemoddable at all, because its
  contract differs from `onCreate` (below). Then one minor that breaks every
  unmigrated callsite of four components.
- **Coexist indefinitely.** Nothing breaks, ever. The drift the record exists to
  end survives permanently in the type signature; a builder still meets
  `searchPlaceholder` and `search.placeholder` side by side, and the standard
  governs only components built after it. That is a real option — it answers
  "so when we add it later on other components we match the pattern" — but it
  leaves today's seven inconsistent forever and makes the record a convention
  for newcomers rather than a system contract.
- **Replace outright.** A major version, or a minor that breaks four
  components' entire callsite base at once with no overlap. Rejected: no user
  problem here justifies it.

**`Tokenizer.hasCreate` is the one genuine collision, and it is not mechanical.**
Tokenizer's shipped `hasCreate` is a boolean with no callback: the component
mints the token from the typed text itself, because a token _is_ a string.
#6829's `onCreate` exists precisely because `MultiSelector` cannot do that — an
option needs a value the caller defines. Under FR7 the boolean cannot survive as
a boolean, but mapping it to `onCreate` moves work onto every existing Tokenizer
caller. OQ5 puts that to the owner; until it is answered, this record does not
require `Tokenizer` to change `hasCreate`.

## Current-state impact

- `architecture:public-component-api` gains `spec:AST-056` in its
  `deciding_specs` and a line in its `Deciding specs` list when this record
  becomes `current`. No invariant of that record changes: FR1–FR10 sit inside
  its INV2, INV3, and INV9 grammar rather than amending it.
- `contributing:api-conventions` and the wiki's `Prop Naming` section gain the
  object-valued configuration-prop rule: when several props configure one
  caller-owned concept, they become keys of one object named for the concept,
  and the keys drop the prefix the prop name supplies. Neither surface rules on
  this today.
- `component:Selector`, `component:MultiSelector`, `component:Tokenizer`,
  `component:Typeahead`, `component:BaseTypeahead`, and
  `component:CommandPalette` cite this record instead of each recording a
  private copy. `component:MultiSelector` is `authority: draft` and is drafting
  exactly such a copy as its FR10 / DEC-3; that claim is withdrawn in favour of
  FR6 and FR7 here.
- [#6829](https://github.com/facebook/astryx/pull/6829) is blocked on this
  ruling. Its `hasCreate` + `onCreate` pair is rejected by FR7 as written, and
  its capability is admitted by FR6 as `search.onCreate` — the same user need,
  a shape that cannot be half-configured.
- `family:input-fields`, `spec:AST-002`, and `spec:AST-017` are read, not
  changed: field chrome, admission, and the deprecation lifecycle keep their
  owners.
- No shipped public API changes on this record's own merge. Every component
  keeps every prop and every default until an adoption change lands.
- While this record is `draft` its `review-applicability:v1` block routes
  nothing: global routing loads `current` claims only
  (`architecture:knowledge-contracts` INV20). It becomes live on approval.

## Verification

| Contract  | Verification                                                                                      | Representative states                                                                                     | Mutation or failure expectation                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2  | Per-adopter prop-surface suites plus the repository's exported-surface and `.doc.mjs` prop checks | Each adopter's declared props; the exported object type imported from the package entry point             | A top-level prop whose name carries `search`, a key repeating the prefix, or an unexported object type fails.                                                       |
| FR3       | Per-adopter rendering suites                                                                      | `search` absent; `search={{}}`; `search` omitted on a component that requires it                          | A query input rendering with the prop absent, residual query state, or a required/optional declaration that contradicts whether the component holds choices, fails. |
| FR4       | Per-adopter suites in both modes                                                                  | No `source`, with choices the component holds; a `source` supplied; a query matching nothing in each mode | Divergent observable states between the two modes, or a component re-filtering what a `source` returned, fails.                                                     |
| FR5, AR1  | Per-adopter suites plus their live-region assertions                                              | A string `emptyText`; an element `emptyText`; the adjacent "no choices at all" state                      | A differently named or typed key, or an announcement that does not carry what the element rendered, fails. This is the gap AR1 names on `main` today.               |
| FR6, FR7  | Type-level checks plus per-adopter suites                                                         | `onCreate` given with `search` present; `onCreate` given with `search` absent                             | A create affordance reachable without search, a boolean gating a handler, or a silently inert configuration, fails.                                                 |
| FR8       | Per-adopter suites                                                                                | Typing; clearing; programmatic change                                                                     | A callback that suppresses the component's own resolution, or a component requiring it, fails.                                                                      |
| FR9       | Overlap suites on each adopter plus the release lifecycle's manifest checks                       | Old prop alone; key alone; both given; neither                                                            | Old usage changing behavior, a silent win for the old prop, a missing `DEP-*`/`CLN-*` pair, or a removal absent from the frozen minor manifest, fails.              |
| FR10, AR2 | Public-API review against this record; per-adopter accessible-name assertions                     | A proposed new search capability; each adopter's query input, named and unnamed                           | A new top-level `search*` prop admitted, or a query input whose only name is its placeholder, fails.                                                                |

Known verification gap: none of the suites above exist on `main`, and no
component implements `search`. This record is `draft`, does not govern review,
and names no implementation. AR1 additionally records a defect in current
shipped behavior rather than a passing contract.

## Decision log

Every decision below is **proposed**. None has been ruled on; `approved_by` is
`null` and the record is `draft`.

### DEC-1 — Filtering in place and calling a source are one concept with two fulfillment modes

**Reference:** `spec:AST-056/DEC-1`
**Decider:** proposed for `cixzhang`; not yet ruled (OQ1)

"Filter the options I gave you" and "call my async source" are the same
caller-owned concept — a typed query narrows what the panel offers — fulfilled
two ways. The evidence is in the repository, not in the abstraction:

- `createStaticSource` ships in `packages/core/src/Typeahead`. It converts a
  static array into a `SearchSource`, which is the system already saying in code
  that filtering in place is a degenerate case of resolving a query.
- The matching rule is the same one twice. `Selector` and `MultiSelector` use a
  case-insensitive substring match on `label ?? value`; `createStaticSource`
  uses a case-insensitive substring match on the trimmed `label`, plus optional
  keywords. Nobody coordinated that; it is what the concept is.
- The person using the product cannot tell them apart. They type, fewer rows
  remain, and an empty result reads the same sentence.

So the standard covers both, and `search.source` names the fulfillment mode
inside the one prop rather than splitting the concept across two props.

What is genuinely different, and is why FR3 has a required/optional clause
rather than one answer: **who owns the candidate set.** `Selector` and
`MultiSelector` hold `options` — a tree with groups, dividers, select-all, and
selected state — and remain completely usable with no query at all. `Tokenizer`,
`Typeahead`, `BaseTypeahead`, and `CommandPalette` hold nothing; their presented
choices _are_ the query's result, which is why `searchSource` is required on all
four and why only they carry `debounceMs`, `minQueryLength`, and `cancel()`.
That difference changes whether the prop may be omitted. It does not change what
the prop is.

Rejected: two separate standards, one per mode. It would put `placeholder` and
"nothing matched" — observably identical to the person using the product — under
two different contracts, and would leave `createStaticSource` straddling both
with no owner.

### DEC-2 — One object-valued prop named `search`

**Reference:** `spec:AST-056/DEC-2`
**Decider:** proposed for `cixzhang`; not yet ruled

Everything a caller says about the typed query goes in one prop. The next
capability becomes a key, not a tenth flat prop, and a builder discovers the
whole surface from one type instead of scanning a prop list for a substring.

The repository already does this where the configuration got complex enough to
force the issue: `ChatComposerTrigger` carries `searchSource`, `renderItem`,
`onSelect`, `emptySearchResultsText`, `loadingText`, and `menuLabel` as one
value, and nobody has asked for it to be flattened.

Rejected: continuing flat, and naming each new prop carefully. That is what
produced two names and two types for one message across seven components, and
it has no stopping condition — Cindy's own prediction is that once a create row
exists, callers will want to change its label, which under the flat shape is
another top-level prop on every adopter.

Rejected: `searchConfig`, the name an earlier reading suggested as prior art.
The `-Config` suffix names the mechanism rather than the concept
(`spec:AST-002` FR7), and the actual `searchConfig` in the repository is a
`PowerSearchConfig` variable for the structured filter builder, not evidence for
this shape at all.

### DEC-3 — Keys drop the prefix the prop already supplies

**Reference:** `spec:AST-056/DEC-3`
**Decider:** proposed for `cixzhang`; not yet ruled

Inside `search`, the word `search` is already said. The keys are `source`,
`placeholder`, `emptyText`, `onChange`, and `onCreate` — not `searchSource`,
`searchPlaceholder`, `emptySearchText`. `spec:AST-055/DEC-5` already observed
that a bare noun holding a value is the normal shape inside a config object a
caller passes, as against a public component prop.

This also settles the two-names problem by construction: `search.emptyText` is
the one spelling of "the query matched nothing", typed `ReactNode` everywhere,
so `emptySearchText` and `emptySearchResultsText` both resolve to one key rather
than one of them winning.

Rejected: `noResultsText` instead of `emptyText`. It is unambiguous, and it
avoids `emptyText` meaning "the query matched nothing" inside the object while
the top-level `emptyText` on `Selector` and `MultiSelector` means "there were no
choices to begin with". The two are disambiguated by scope at every callsite —
`emptyText` versus `search.emptyText` — and `empty*` is the vocabulary those
components already use, so this record follows the owner's indicated shape. The
alternative is recorded because the collision is real and the owner may prefer
to spend one extra word on it.

### DEC-4 — A capability that needs the query lives inside the object, and its handler is its switch

**Reference:** `spec:AST-056/DEC-4`
**Decider:** proposed for `cixzhang`; not yet ruled

Putting `onCreate` inside `search` makes the dependency structural: there is
nowhere to put a create row when there is no search, so the invalid combination
cannot be expressed. And because the handler's presence is the switch, there is
no boolean to set without a handler, or handler to supply without a boolean.

The shape #6829 proposes needs three things to line up —
`hasCreate && hasSearch && onCreate != null` — and failing any one of them
renders nothing and reports nothing. `spec:AST-002` FR15 forbids exactly that:
make statically knowable invalid combinations unrepresentable where practical,
and never silently render a broken state. Here it is entirely practical.

Rejected: `onCreateFromSearch` as a flat prop. It encodes the dependency in a
name, which a type checker cannot read and a caller can ignore; it still
silently does nothing when search is off; and it leaves the next
search-dependent capability to invent its own `...FromSearch` suffix.

Rejected: `create?: boolean | ((query: string) => void)`, which would let
`Tokenizer`'s self-minting create and `MultiSelector`'s caller-minting create
share a key. The value's _shape_ would decide which axis it controls, which
`spec:AST-002` FR16 and DEC-6 reject.

### DEC-5 — Shipped props deprecate with a replacement-first cycle

**Reference:** `spec:AST-056/DEC-5`
**Decider:** proposed for `cixzhang`; not yet ruled (OQ2)

Nine shipped props have released victims, four of them required. The
replacement ships first and old usage keeps working until a cleanup minor whose
frozen manifest carries the matching `DEP-*` and `CLN-*` ids, per
`spec:AST-017` FR28–FR31. The overlap is the cost: the search surface roughly
doubles while it lasts.

Rejected: removing `searchSource` in the same change that adds `search.source`.
It is required on four components, so that is not a long tail of broken
callsites — it is all of them, at once, with no overlap in which to migrate.

Rejected: coexisting indefinitely. It is genuinely safe and it does answer the
original ask for new components, but it leaves today's seven inconsistent
permanently and makes this a convention rather than a contract. The owner may
still prefer it (OQ2); the record would then drop FR9's cleanup clause and say
so plainly.

## Open questions

- **OQ1 — Is filter-in-place the same concept as calling a source?** (`human-api`)

  DEC-1 says yes: one concept, two fulfillment modes, with `createStaticSource`
  and the identical matching rule as the evidence, and with "who owns the
  candidate set" as the real difference that FR3 encodes as required-versus-
  optional. If the owner reads them as two concepts instead, this record scopes
  to the component-filters-its-own-choices mode — `Selector`, `MultiSelector` —
  FR4 drops `source`, and the source-driven components need their own record,
  which would leave `placeholder` and "nothing matched" split across two
  contracts.

- **OQ2 — Deprecate with a cycle, coexist indefinitely, or replace?** (`human-api`)

  DEC-5 recommends the cycle. The honest trade is in `Migration and
compatibility`: the cycle costs nine `DEP-*`/`CLN-*` pairs, a doubled surface
  during the overlap, and one later minor that breaks every unmigrated callsite
  of four components; coexisting costs nothing and fixes nothing that already
  shipped. This answer changes FR9.

- **OQ3 — Does the query become observable on `Selector` and `MultiSelector` as part of this record?** (`human-api`)

  Today it is not: `searchQuery` is internal `useState` on both, with no
  callback out. That is precisely why #6829 needed a create callback at all —
  a caller who cannot see the query cannot render their own create row outside
  the component, so the only route is a hook inside it. FR8 defines
  `search.onChange` as the key; it does not require either component to adopt
  it. Adopting it is a public API addition in its own right under
  `spec:AST-002` FR1, and it may be a cleaner answer to #6829's need than
  `onCreate` is — or a second answer the system does not want.

- **OQ4 — Which components are adopters, and which are only cited?** (`human-api`)

  This record proposes six adopters: `Selector`, `MultiSelector`, `Tokenizer`,
  `Typeahead`, `BaseTypeahead`, `CommandPalette`. `ChatComposerInput` is cited
  as the precedent for the shape but not required to adopt, because its query
  belongs to a trigger menu rather than to the component's own value, and its
  per-trigger object already follows the pattern under different key names.
  `PowerSearch` is cited and excluded, because a structured field/operator/value
  expression is not a typed query over a list. The owner may pull either in —
  which for `ChatComposerInput` means renaming keys inside a shipped object
  type — or push `BaseTypeahead` out as an implementation seam.

- **OQ5 — Which neighbouring props move inside the object, and what happens to `Tokenizer.hasCreate`?** (`human-api`)

  `minQueryLength`, `debounceMs`, and the trigger-menu `loadingText` are
  search-shaped and are placed inconsistently today. They are deliberately left
  outside: they describe fetching, which only exists in one fulfillment mode,
  and folding them in widens the migration without settling the question that
  prompted this record. Separately, `Tokenizer.hasCreate` is a shipped boolean
  whose contract — the component mints the token — differs from `onCreate`'s.
  FR7 forbids the boolean form, but mapping it to `onCreate` moves real work to
  every existing Tokenizer caller, so this record does not require that change
  until the owner rules.

## Content boundary

This record does not duplicate any component's anatomy, prop table, theming
targets, or consumer examples; the admission argument in `spec:AST-002`; the
deprecation, cleanup, and release-manifest mechanics in `spec:AST-017`; the
shared naming grammar in `architecture:public-component-api`; the field chrome
in `family:input-fields`; or the matching, debouncing, and cancellation
behavior each component's own record owns. It links their canonical owners.
