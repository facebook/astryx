---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-103
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Reorderable collections system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": ["packages/core/src/**", "packages/lab/src/**"]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

**Proposed; pending owner decision.** Every requirement below awaits the
owner's decision (OQ1, OQ2), except DEC-1, which is decided.

## Intent

A person can change the order of items in a collection by dragging a row's
handle, by keyboard, or with a screen reader, and every collection that allows
it behaves the same way. A caller turns reordering on by passing one
behavior object, made once by `createReorderable`, to the collection's
`reorderable` prop, and applies the change it reports. A collection that does
not reorder loads none of it.

## Non-goals

- Moving items between collections, freeform canvas placement, and file drops.
- Reorder motion values, thresholds, and timing: these stay internal
  (`spec:AST-002` FR3) and come from the theme's motion roles and
  `spec:AST-094`'s measured values.
- The visual treatment of a moving row and the insertion cue, which
  `design:ordered-collection-reordering` owns.

## Public contract

```tsx
import {createReorderable} from '@astryx/core/reorderable';

const reorderable = createReorderable({
  onReorder: (from, to) => setItems(items => move(items, from, to)),
});

<List reorderable={reorderable}>
  {items.map(item => (
    <ListItem key={item.id} label={item.name} />
  ))}
</List>;
```

A second collection uses the same object and options, wired to its own
internals. A tree reports positions as a parent and an index:

```tsx
const reorderable = createReorderable({
  onReorder: (from, to) => setTree(tree => moveNode(tree, from, to)),
});

<TreeList reorderable={reorderable} items={tree} />;
```

Here `from` and `to` are `{ parent, index }`; the handle, keys, actions, and
announcements are those of FR3 and FR4, and the tree adds no option.

## Requirements

- **FR1 — One factory makes the behavior.** `createReorderable(options)`
  returns a reorderable object. `options` carries only the change callback,
  `onReorder(from, to)`, where `from` and `to` are positions in the
  collection's own position model; a flat collection's positions are indices
  (OQ1). It carries no gesture, animation, or timing settings. Optional
  `canMove(from)` is OQ2.
- **FR2 — Present means enabled.** A collection that accepts reordering takes
  the object through one `reorderable` prop; there is no separate boolean.
  With the prop absent the collection renders no handle, registers no reorder
  listener, and loads no reorder code: the machinery ships in the factory's
  own module, and a collection imports only its type
  (`architecture:public-component-api` INV19).
- **FR3 — Every collection behaves the same.** Each adopting collection wires
  the object to its own internal drag, keyboard, and assistive-technology
  paths, and the behavior is the same in every one:
  - a drag starts from a row's handle (`design:ordered-collection-reordering`
    DR1); under a finger, a hold on the handle picks the row up at
    `spec:AST-094`'s values, and a flick still scrolls;
  - the arrow keys, Home, and End move the focused row while it is picked up,
    Space or Enter picks it up and drops it, and Escape cancels;
  - the order commits once, at the drop (DR4), and `onReorder` is called once
    per committed move; a cancel calls nothing;
  - under Reduce Motion nothing travels (`design:reduced-motion` DR2).
- **FR4 — Assistive technology can reorder.** Each reorderable row's handle
  exposes "Move up" and "Move down" actions with their keyboard equivalents,
  and a pick-up, each move, a drop, and a cancel are announced once, after
  they render, through the shared announcement channel. Focus stays on the
  handle throughout.
- **FR5 — Reordering adds no elements to a row.** The handle is drawn in an
  element the row already renders, with its glyph from a theme role, and the
  moving row is the row itself, moved in place, not a copy
  (`architecture:component-style-authoring` INV7).
- **FR6 — Stable from the start.** `createReorderable`, its options, and a
  collection's `reorderable` prop are stable public Core API: no
  `_experimental` name and no experimental subpath (DEC-1). `spec:AST-017`
  FR21 and DEC-28 apply only to an API chosen as experimental.
- **FR7 — Admitted and documented as public API.** `reorderable` is caller
  intent no collection can derive (`spec:AST-002` FR1, DEC-1), and its
  thresholds stay internal (`spec:AST-002` FR3). `createReorderable` has its
  own canonical descriptor and each adopting collection's descriptor documents
  `reorderable` (`spec:AST-039` FR1, FR3).
- **FR8 — One public shape for the job.** A collection that reorders uses
  this object and no other public reorder API (`architecture:public-component-api`
  INV21).

## Current-state impact

- `component:List` gains `reorderable` as the first adopter.
- No collection in Core reorders today, and no Core component has a public
  reorder API. A Lab collection that reorders adopts this object.

## Verification

| Contract     | Verification                                                           | Representative states                                                                              | Mutation or failure expectation                                                                                                                    |
| ------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR6–FR8 | Public-API review, type tests, and descriptor checks                   | the factory's options; a collection's `reorderable` type; the factory's and List's descriptors     | an extra gesture, timing, or animation option, an experimental name or subpath, a missing descriptor, or a second public reorder API, fails        |
| FR2          | Bundle and runtime check of a collection with and without the prop     | without the prop; with the prop                                                                    | reorder code in the bundle, a handle, or a listener without the prop fails; the measured cost is recorded in the pull request                      |
| FR3          | Browser tests with real touch input and keyboard (`spec:AST-013` FR10) | a hold and drag; a flick; arrows, Home, End, Space, Enter, Escape; a drop; a cancel; Reduce Motion | a drag that starts off the handle, a commit before the drop, two callbacks for one move, a callback on cancel, or travel under Reduce Motion fails |
| FR4          | Screen-reader and announcement tests                                   | "Move up" and "Move down"; pick-up, move, drop, cancel                                             | a missing action, an announcement before render or repeated, or focus leaving the handle fails                                                     |
| FR5          | Element counts of a row with and without the prop                      | a row at rest; a row picked up                                                                     | an added element per row, or a copy of the moving row, fails                                                                                       |

## Decision log

### DEC-1 — Reorderable is stable public API

**Reference:** `spec:AST-103/DEC-1`
**Decider:** `cixzhang`, `2026-10-25`

Reordering is a capability callers build on, so `createReorderable` and a
collection's `reorderable` prop are stable public API from the start, with no
experimental name or subpath.

Rejected: shipping it as experimental first.

## Open questions

- **OQ1 — The move's shape.** (`human-design`) Options: (a, recommended)
  `onReorder(from, to)` with positions in the collection's own model (an index
  for a flat collection), because a collection knows its rows by position and
  a caller applies the move with one array operation; or (b)
  `onReorder({ key, to })`, naming the moved item by its key, which survives
  filtering but requires every collection to know item keys.
- **OQ2 — Rows that do not move.** (`human-design`) Options: (a, recommended)
  an optional `canMove(from)` in the options, so a pinned row shows no handle
  and cannot be picked up, as a UIKit table's `canMoveRow` does; or (b) no
  per-row control, and a caller ignores a move it does not want, which the
  collection announces as kept.
