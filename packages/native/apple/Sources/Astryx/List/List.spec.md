---
schema_version: 5
template_version: 8
kind: component
id: component:swift/List
platform_of: component:List
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, accessibility]
verified_by:
  [
    packages/native/apple/Tests/AstryxTests/ListTests.swift,
    packages/native/src/contract/contracts.test.ts,
  ]
modules: []
families: []
design_specs: []
architecture: []
contributing: []
system_specs: [spec:AST-082, spec:AST-093]
---

# List (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `List(density:, hasDividers:, edge:, listStyle:, start:, content:, header:)` and `List(_ props: ListProps, content:, header:)`, a generic SwiftUI `View`.                                                                   |
| Behavior                | Stacks its rows top to bottom with core's gap or a divider between rows, and tells each `ListItem` the list's density, marker, dividers, and edge; numbers the `ListItem`s of a decimal list in order from `start`.         |
| End-user impact         | A person sees settings lists, bulleted and numbered lists, and divided lists on iPhone spaced and numbered as on the web, and VoiceOver reads the header and then each row.                                                 |
| Builder impact          | An app puts `ListItem`s in a `List` inside any container, as on the web. It is not `SwiftUI.List`: it does not scroll or reuse rows. `outset` and `bleed` edges and `edgeCompensation` have no Swift form.                  |
| Compatibility/readiness | Additive: a new view and generated `ListProps`, and a generator fix that keeps a closed-word `…Style` prop in the core. Draft; built and tested on macOS and the iOS Simulator; device captures are attached to the change. |
| Review checks           | Reject a gap or divider that differs from core's, a divider after the last row, a number off by one or counted across nested lists, or rows built with `SwiftUI.List`.                                                      |
| Governing rules         | `spec:AST-082` FR3, FR4, FR7; `spec:AST-093` FR1–FR5; `component:swift/ListItem`; the Swift component API, slots, and accessibility records under `packages/native/specs/swift/library/`.                                   |

This table is a review projection; the body below is authoritative.

## Intent

List on Apple platforms is core's list: a stack of rows that sets their look
and numbering, placed in whatever container the app has.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The order, gap, and dividers between rows, and the header above them.
- What each row reads from its list: density, marker, dividers, and edge.
- Numbering the `ListItem` rows of a decimal list.

**Does not own / non-goals**

- Each row's drawing and marker — owned by `component:swift/ListItem`.
- Scrolling, row reuse, and swipe actions — owned by the app's container;
  `SwiftUI.List` is a different control.
- `outset` and `bleed` edges, which reach a container's padding that Swift
  containers do not publish yet.

## Public concepts

| Concept    | Closed values or states             | Meaning                                    | Availability by variant/orientation/state | Default    | Owner                  | Stability    | Invalid-value behavior                                 |
| ---------- | ----------------------------------- | ------------------------------------------ | ----------------------------------------- | ---------- | ---------------------- | ------------ | ------------------------------------------------------ |
| density    | `compact`, `balanced`, `spacious`   | the rows' padding                          | always                                    | `balanced` | `component:List`       | experimental | none                                                   |
| dividers   | on, off                             | a line between rows and square row corners | always                                    | off        | `component:List`       | experimental | none                                                   |
| edge       | `padded`, `flush`                   | whether rows keep their inline inset       | always                                    | `padded`   | `component:swift/List` | experimental | none                                                   |
| list style | `none`, `disc`, `decimal`, `circle` | each row's marker                          | always                                    | `none`     | `component:List`       | experimental | none                                                   |
| start      | a whole number                      | the first number of a decimal list         | `decimal`                                 | 1          | `component:List`       | experimental | rounded down; not a number is 1; kept within a billion |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                           | Basis                                   | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------ |
| FR1 | The list MUST stack its rows top to bottom at full width with `space.s0_5` between them; with `hasDividers` it MUST put a `color.border` line of the theme's `size.borderWidth` between rows, none after the last, and no gap. It is a plain stack, not `SwiftUI.List`.                                                                                       | core `List` `list`, `withDividers`      | verify             |
| FR2 | The list MUST tell each `ListItem` its density, its marker from `listStyle`, whether it has dividers, and whether its edge is `flush`. `edge` takes `padded` and `flush`.                                                                                                                                                                                     | core `ListContext`                      | verify             |
| FR3 | In a `decimal` list the `ListItem` rows MUST be numbered in the order they appear from `start` rounded down, or 1, and renumbered when `start` changes; a `start` that is not a number counts from 1 and any `start` is kept within a billion; a row inside `ForEach` counts once per row; a list counts only its own rows, not those of a list nested in it. | core `List` counter                     | verify             |
| FR4 | A `header` MUST sit above the rows with `space.s2` below it.                                                                                                                                                                                                                                                                                                  | core `List` `header`                    | verify             |
| FR5 | Rows MUST be reached through `Group(subviews:)` on iOS 18 and macOS 15 and later, and through `_VariadicView` on iOS 17 and macOS 14; both lay rows out the same way.                                                                                                                                                                                         | Cindy's List decision (option A)        | verify             |
| FR6 | Both initializers MUST build the same `ListProps`. The trailing closure holds the rows and `header:` comes after it. Base props come through `ListProps`: with `isHidden` the list draws nothing; `id` becomes its accessibility identifier.                                                                                                                  | Swift component API A2–A4, A7; slots S3 | verify             |

### Allowed variation

- **AV1 — Numbering.** Rows are numbered from what they report, not with a
  CSS counter; the numbers are the same.

### Representative states

| State                                 | Required invariant                              | Allowed variation |
| ------------------------------------- | ----------------------------------------------- | ----------------- |
| spaced and divided                    | core's gap; a divider between rows only         | none              |
| decimal from 1 and from 3; nested     | numbered in order; nested lists count apart     | AV1               |
| disc, circle                          | each row's marker                               | none              |
| padded and flush                      | rows keep or drop their inline inset            | none              |
| with a header                         | the header above, `space.s2` below              | none              |
| light and dark, the largest text size | each theme's colors; rows grow with their words | none              |

### Transformation and precedence order

- **ORD1 — First number.** `start` → 1.

### Performance and resources

- **PR1 — Every row drawn.** The list draws every row; long lists belong in a
  lazy container the app owns.

## Accessibility contract

- **AR1 — Rows stay separate; the header leads.** The list contains its rows
  as separate elements, with the header read first, and dividers are hidden
  (Swift accessibility X5). Core names the list by its header
  (`aria-labelledby`); SwiftUI cannot name a container from one of its views,
  so the header, read as the list's first element, carries that name.
- **AR2 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree is not measured until an app-hosted target
  exists.

## Design relationships

| Anatomy or state  | Design requirement                                 | Representation authority | Hierarchy role | Component contract |
| ----------------- | -------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Rows and dividers | Apple Human Interface Guidelines, Lists and tables | prescribed by core       | supporting     | FR1–FR4            |

The component implements design requirements without copying their rationale.

Platform control: none fits. `SwiftUI.List` is a scrolling, reusing table with
its own row styles, while core's list sits inside any container
(`spec:AST-093` FR2). Guideline pages: Lists and tables, and Accessibility in
the Apple Human Interface Guidelines.

Theme values read: `space.s0_5`, `space.s2`, `color.border`, `size.borderWidth`, and through
`ListItem` its tokens.

## Family and system relationships

- `component:swift/ListItem` draws each row and its marker.
- `component:List` owns the props.

## Verification map

| Contract | Verification                                                                                 | Representative states                                              | Mutation or failure expectation                                                                         | Audit section                |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, AR1 | `ListTests.swift` spacing, divider, two-theme, and largest-text renders; hidden-divider test | spaced; divided; neutral and butter; the largest text size         | a wrong gap or divider color, a divider after the last row, a read divider, or a fixed row height fails | `audit:swift/List/layout`    |
| FR2      | `ListTests.swift` context and flush tests                                                    | each prop; plain                                                   | a row that misses the list's look fails                                                                 | `audit:swift/List/context`   |
| FR3      | `ListTests.swift` numbering, `ForEach`, nested-list, restart, and `start` range tests        | from 1 and 3; `ForEach`; nested; a new `start`; NaN, infinity, 2.9 | a number off by one, counted across lists, stale after a new `start`, or a trap fails                   | `audit:swift/List/numbering` |
| FR4      | `ListTests.swift` header render                                                              | with a header                                                      | a missing gap fails                                                                                     | `audit:swift/List/header`    |
| FR5      | `ListTests.swift` `_VariadicView` render                                                     | the iOS 17 path                                                    | a path that lays rows out differently fails                                                             | `audit:swift/List/paths`     |
| FR6      | `ListTests.swift` initializer test; `contracts.test.ts`                                      | both initializers                                                  | differing props fail                                                                                    | `audit:swift/List/api`       |

## Decision log

- Swift List is a plain stack reached through `Group(subviews:)` on iOS 18 and
  later and `_VariadicView` on iOS 17, with `padded` and `flush` edges only
  (Cindy, option A).

## Open questions

- **OQ1 — Outset and bleed edges.** (`human-api`) `outset` and `bleed` reach
  the padding of the container around the list. They stay on the web until
  Swift containers publish their insets.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
