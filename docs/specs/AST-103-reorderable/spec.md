---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-103
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-25
phase: accepted
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

## Intent

A person can change the order of items in a collection by dragging a row's
handle, by keyboard, or with a screen reader, and every collection that allows
it behaves the same way. A caller turns reordering on by passing one
behavior object, made once by `createReorderable`, to the collection's
`reorderable` prop, and applies the change it reports. A collection that does
not reorder loads none of it.

## Non-goals

- Moving several items in one drag, a destination predicate, moves between
  collection instances, and keyboard reparenting in a tree; each can be added
  later without changing this contract.
- Moving items between collections, freeform canvas placement, and file drops.
- Reorder motion values, thresholds, and timing: these stay internal
  (`spec:AST-002` FR3) and come from the theme's motion roles and
  `spec:AST-094`'s measured values.
- The visual treatment of a moving row and the insertion cue, which
  `design:ordered-collection-reordering` owns.

## Public contract

```tsx
import {createReorderable} from '@astryxdesign/core';

const moveTo = (items, key, to) => {
  const moved = items.find(item => item.id === key);
  const rest = items.filter(item => item.id !== key);
  return [...rest.slice(0, to), moved, ...rest.slice(to)];
};

const reorderable = createReorderable({
  onReorder: ({key, to}) => setItems(items => moveTo(items, key, to)),
});

<List reorderable={reorderable}>
  {items.map(item => (
    <ListItem key={item.id} itemKey={item.id} label={item.name} />
  ))}
</List>;
```

A second collection uses the same object and options, wired to its own
internals. A tree reports positions as a parent and an index:

```tsx
const reorderable = createReorderable({
  onReorder: ({key, to}) => setTree(tree => moveNode(tree, key, to)),
});

<TreeList reorderable={reorderable} items={tree} />;
```

Here `to` is `{ parent, index }` and keys are the nodes' existing `id`s; the handle, keys, actions, and
announcements are those of FR3 and FR4, and the tree adds no option.

## Requirements

- **FR1 — One factory makes the behavior.** `createReorderable(options)`
  returns a reorderable object. `options` carries only the change callback,
  `onReorder({ key, to })`, where `key` names the moved item by its key and
  `to` is the index the item has after the move, counted in the
  collection's full item order (every item it was given, mounted or not). In a
  tree, `to` is `{ parent, index }`: `parent` is the new parent's key (`null`
  at the root) and `index` is the item's position among that parent's children
  after the move (DEC-3). It carries no gesture, animation, or timing settings. An optional
  `isReorderable(key)` predicate keeps a row in place: a row it rejects shows no
  handle and cannot be picked up (DEC-2). A row it rejects at either end of the
  collection also bounds the drop range: nothing drops beyond it, and a
  keyboard or assistive-technology move past it is not offered.
  Each item's key comes from the data,
  never from React's `key`: List reads each `ListItem`'s `itemKey`, a string;
  a collection whose items already carry an identity, such as TreeList's `id`
  or Table's `idKey`, uses it; and a data collection without one takes
  `getKey(item)` (DEC-4). A row without a key shows no handle and cannot be
  picked up. The
  object may be created again on each render: the collection uses the latest
  callbacks when a move commits, and a new object during a drag does not
  cancel the drag. One object passed to two collections reorders each on its
  own and moves nothing between them.
- **FR2 — Present means enabled.** A collection that accepts reordering takes
  the object through one `reorderable` prop; there is no separate boolean.
  With the prop absent the collection renders no handle, registers no reorder
  listener, and loads no reorder code: the machinery ships in the factory's
  own module, and a collection imports only its type.
- **FR3 — Every collection behaves the same.** Each adopting collection wires
  the object to its own internal drag, keyboard, and assistive-technology
  paths, and the behavior is the same in every one:
  - a drag starts from a row's handle (`design:ordered-collection-reordering`
    DR1); under a finger, a hold on the handle picks the row up at
    `spec:AST-094`'s values, and a flick still scrolls;
  - the arrow keys along the collection's layout axis, Home, and End move the
    focused item while it is picked up,
    Space or Enter picks it up and drops it, and Escape cancels;
  - the order commits once, at the drop (DR4), and `onReorder` is called once
    per committed move; a cancel calls nothing;
  - under Reduce Motion the dragged row still follows the finger or pointer,
    and the other rows and the drop take their places without travel
    (`design:reduced-motion` DR2).
- **FR4 — Every input can reorder without a drag.** Each reorderable row's
  handle is a button named "Reorder" and the row's label. It exposes "Move
  before" and "Move after" actions with their keyboard equivalents, and a
  mouse reaches the same actions without dragging (`spec:AST-094` FR39; OQ1),
  and a pick-up, each move, a drop, and a cancel are announced once, after
  they render, through the shared announcement channel. Focus stays on the
  handle throughout.
- **FR5 — Reordering adds at most one element to a row.** The one added
  element is the handle, the interactive drag target, with its role. Its grip
  is decoration, drawn by a pseudo-element or a theme-role glyph, not by
  elements. The moving row is the row itself, moved in place, not a copy
  (`architecture:component-style-authoring` INV7). Reorder listeners are per
  collection or on the document, never per row (`spec:AST-094` FR24).
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
  this object and no other public reorder API.

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
| FR4          | Screen-reader and announcement tests                                   | "Move before" and "Move after"; a horizontal collection's arrow keys; pick-up, move, drop, cancel  | a missing action, an announcement before render or repeated, or focus leaving the handle fails                                                     |
| FR5          | Element and listener counts of a list with and without the prop        | a row at rest; a row picked up                                                                     | more than one added element per row, a grip drawn with elements, a per-row listener, or a copy of the moving row, fails                            |

## Decision log

### DEC-1 — Reorderable is stable public API

**Reference:** `spec:AST-103/DEC-1`
**Decider:** `cixzhang`, `2026-10-25`

Reordering is a capability callers build on, so `createReorderable` and a
collection's `reorderable` prop are stable public API from the start, with no
experimental name or subpath.

Rejected: shipping it as experimental first.

### DEC-2 — A predicate keeps a row in place

**Reference:** `spec:AST-103/DEC-2`
**Decider:** `cixzhang`, `2026-10-25`

Some rows must not move, such as a pinned first row, and a person should see
that before trying. An optional `isReorderable(key)` predicate marks them: the row
shows no handle and cannot be picked up, as a UIKit table's `canMoveRow` does.
The name follows Astryx's `is…` predicate convention.

Rejected: no per-row control, with unwanted moves ignored after the drop.

### DEC-3 — A move names the item by its key

**Reference:** `spec:AST-103/DEC-3`
**Decider:** `cixzhang`, `2026-10-25`

`onReorder` receives the moved item's key and its new position, and
`isReorderable` receives a key, so the contract names items by key everywhere. A
key stays correct when a list is virtualized and when a tree moves an item
between parents, where a pair of indices would not. A caller that filters the
items it passes maps `to` back to its full list.

Rejected: `onReorder(from, to)` with a pair of positions.

### DEC-4 — The reorder key comes from the data

**Reference:** `spec:AST-103/DEC-4`
**Decider:** `cixzhang`, `2026-10-25`

React does not pass `key` to a component, so a collection cannot rely on it.
A `ListItem` names its item with one `itemKey` prop, and a data collection
without an identity of its own takes `getKey(item)`. `itemKey` is a new name because no row prop
carries item identity today: `value` on option-like rows is the selected value
a form reads, a different job. A collection whose items already carry an
identity, such as TreeList's `id` or Table's `idKey`, uses it rather than a
second one, since no new API shares a job with an existing one
(`architecture:public-component-api` INV21).

Rejected: reading each direct child's React `key`.

## Open questions

- **OQ1 — Reordering with a mouse without dragging.** (`human-design`)
  `spec:AST-094` FR39 requires a path without a drag. Options: (a,
  recommended) a click on the handle opens a small menu with "Move before"
  and "Move after"; or (b) a click on the handle picks the row up as Space
  does, and the next click on a row drops it there.
