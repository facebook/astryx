---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-107
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-26
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:public-component-api]
affects_families: []
affects_contributing: []
affects_consumer_docs: [usePanGesture, useDragToSnapPoints, useAnimator]
---

# Public gesture hooks system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": ["packages/core/src/hooks/**"]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A product can follow a drag, settle an element on snap points, and animate one
element with the same motion Core uses, through three public factories and the
three React hooks over them. The hooks
hand out values, never the gesture machinery behind them, which stays
internal.

## Non-goals

- Recognizers, the gesture arena, the internal animator module, and the
  snap-point resolver as public API; they stay internal (`spec:AST-017` FR21).
- Presses and long presses, which `useLongPress` owns.
- Animating the layout of an area, which `spec:AST-105` owns.
- Choosing a spring or curve beyond the theme's motion knobs
  (`spec:AST-108`).

## Public contract

```tsx
import {
  createPanGesture,
  createDragToSnapPoints,
  createAnimator,
} from '@astryxdesign/core';
import {
  usePanGesture,
  useDragToSnapPoints,
  useAnimator,
} from '@astryxdesign/core/hooks';

usePanGesture(ref, {
  axis: 'x',
  onPan: ({state, translation, velocity}) => {},
});

const {settleTo} = useDragToSnapPoints(ref, {
  axis: 'y',
  snapPoints: [0, 240, 480],
  flickThreshold: 1008,
  onSettle: index => {},
});

const {ref: animatedRef, animator} = useAnimator();
animator.animate({x: 120});

// Without React:
const pan = createPanGesture(element, {axis: 'x', onPan: () => {}});
const snap = createDragToSnapPoints(element, {
  axis: 'y',
  snapPoints: [0, 240, 480],
  onSettle: index => {},
});
const animator2 = createAnimator(element);
pan.destroy();
snap.destroy();
animator2.destroy();
```

## Requirements

- **FR1 — `usePanGesture` reports a drag as values.**
  `usePanGesture(ref, {axis?, onPan})` calls `onPan` with
  `{state, translation, velocity}` as a drag on the element begins, changes,
  ends, or is cancelled. `axis` limits the drag to `'x'` or `'y'`. It never
  hands out a recognizer object, and it recognizes no press or long press.
- **FR2 — `useDragToSnapPoints` settles an element on snap points.**
  `useDragToSnapPoints(ref, {axis, snapPoints, flickThreshold?, onSettle})`
  lets a drag move the element along `axis`. `snapPoints` are offsets in
  pixels along `axis` from the element's resting position, in ascending order;
  unlike BottomSheet's `snapPoints`, they are not viewport fractions. At the
  release the element settles on the nearest snap point to where it is,
  except that a release faster than `flickThreshold`, in pixels per second
  (default 1008, the sheet's measured flick speed), carries to the next snap point in its direction, and a
  release whose velocity points back toward where the drag started returns to
  the snap point it started from (`spec:AST-094` FR37). It
  calls `onSettle(index)` once the element settles. It returns
  `{settleTo(index)}`, which settles the element on a snap point without a
  drag and is the keyboard path.
- **FR3 — `useAnimator` animates one element.** `useAnimator()` returns
  `{ref, animator}` for the one element `ref` attaches to. `animator` is a
  public handle, `AnimatorHandle`, over the channels `x`, `y`, `scale`,
  `rotate`, and `opacity`, distinct from the internal animator module:
  `animate(target, {velocity?}) → Promise<void>` springs the given channels to
  `target`; `decay(velocity) → Promise<void>` coasts them from a velocity;
  `set(values)` jumps them; `get()` and `getVelocity()` read them; and
  `stop()` halts them where they are. Reduce Motion is planned for every
  animation (`design:reduced-motion` DR1–DR3). Every `animate` plays on the
  `springs.stateChange` motion role (`spec:AST-094` FR4), which follows the
  theme's tempo and character (`spec:AST-108` FR3), and `decay` on the fixed
  momentum decay (`spec:AST-108` FR4); choosing any other spring or curve is
  not offered.
- **FR4 — One hook per job.** `usePanGesture` does not do presses or long
  presses, which `useLongPress` owns. `useAnimator` animates one element, and
  `useAnimatedLayout` animates an area (`spec:AST-105`). A component's own
  props, such as BottomSheet's `snapPoints` or Carousel's `hasSnap`, stay the
  component path to the same behavior. Everything else in the gesture and
  motion modules stays internal (`architecture:public-component-api` INV21).

- **FR6 — Each hook is a thin wrapper over a factory.** Each hook has a
  non-React factory in the same `create…` family as `createReorderable`:
  `createPanGesture(element, {axis?, onPan}) → {destroy}`,
  `createDragToSnapPoints(element, {axis, snapPoints, flickThreshold?,
onSettle}) → {settleTo(index), destroy}`, and `createAnimator(element) →
{animate, decay, set, get, getVelocity, stop, destroy}`, with FR1–FR3's
  behavior. A hook and its factory are one job at two layers
  (`architecture:public-component-api` INV21): the hook delegates entirely to
  its factory and has no behavior of its own. `destroy` removes every
  listener the factory added, and importing a factory does no DOM work, so it
  is safe on the server. The public `createAnimator` is Core's one
  animator factory: Core's internal animator either is this factory or takes
  another name, and no internal factory shares a public factory's name.
- **FR7 — Core and Lab use the public layer.** Wherever a public gesture or
  motion API covers a component's job (the factories and hooks here,
  `createReorderable`, and `useAnimatedLayout`), Core and Lab components MUST
  use it rather than the internals beneath it. A component reaches internals
  only for a job the public layer does not expose, and each such job is a
  known public-API gap. `createReorderable`'s plain-element attach path covers
  collections that are not List, such as Lab's TransferList and ListInput.

  | Public-API gap                                                       | Used internally by                 |
  | -------------------------------------------------------------------- | ---------------------------------- |
  | Press feedback timing                                                | controls and cells                 |
  | Reduced Motion cross-fade constants                                  | every Reduce Motion fade           |
  | Press tracking across a group of actions (`actionGroupTracker`)      | `family:action-groups` members     |
  | Selection lock during a gesture (`selectionLock`)                    | gestures that block text selection |
  | Keeping a layer's chosen presentation (the presentation hold)        | layers                             |
  | Absorbing input while a layer enters (the input hold)                | layers                             |
  | Growing a layer out of its trigger (`liftFromTrigger`, `rectMorph`)  | lift-from-trigger presentations    |
  | Which of two gestures wins a touch (custom recognizer relationships) | nested gestures                    |
  | Gesture host, velocity tracking, rubber band, and haptics            | the gesture foundations            |
  | Long press, which has no public factory yet                          | long-press surfaces                |
  | Spring and curve helpers and UIKit's measured tables                 | motion foundations                 |
  | The touch presentation query                                         | touch presentations                |
  | Layout-change reporting, internal by `spec:AST-105` FR1              | animated layout                    |
  | Touch hit-area expansion (`utils/hitArea`)                           | coarse-pointer targets             |

- **FR5 — Each hook ships with docs and a playing-cards example.** Each public
  API here, factory and hook alike, and `createReorderable`'s `positions` (`spec:AST-103`), ships with
  docsite documentation: its usage, its options, its keyboard and
  assistive-technology path, its Reduce Motion behavior, a note saying when to
  use a component's own prop instead (FR4), and a live example. The flagship
  example is a playing-cards demo built only on the public layer, once in
  plain JavaScript with the factories and once in React with the hooks: a card that
  flicks and snaps back, cards that reorder by drag and by keyboard reorder
  mode, a swipe that discards a card, and a fanned hand that uses custom
  `positions`.

## Current-state impact

- Core gains the three factories and the three hooks over them, their docsite
  pages, and a playing-cards example in plain JavaScript and in React.

## Verification

| Contract | Verification                                                                                                  | Representative states                                                                                                   | Mutation or failure expectation                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | Unit and browser tests of `usePanGesture`                                                                     | a drag on each axis, a cancel, a press, a long press                                                                    | a recognizer in the result, a missing state, a drag off its axis, or a press or long press reported as a pan fails                                               |
| FR2      | Unit and browser tests of `useDragToSnapPoints`                                                               | a slow release, a flick past `flickThreshold` and the default flick speed, a release moving back, `settleTo` from a key | a settle on the wrong snap point, a reversed drag that settles elsewhere, or a missing `onSettle` fails                                                          |
| FR3      | Unit and browser tests of `useAnimator`                                                                       | each method, Reduce Motion, an unattached ref                                                                           | a missing method or channel, an `animate` off `springs.stateChange`, or motion that ignores Reduce Motion fails                                                  |
| FR4      | Export check of `@astryxdesign/core` and its hooks                                                            | the public exports                                                                                                      | a recognizer, the arena, the internal animator module, or the resolver reachable from a public export fails                                                      |
| FR6      | Unit tests of each factory and its hook, server-render and import checks, and listener counts after `destroy` | each factory without React; each hook; a server import; `destroy` mid-drag                                              | a hook with behavior its factory lacks, a listener left after `destroy`, or DOM work at import fails                                                             |
| FR7      | Source boundary check over Core and Lab against the gap table                                                 | every Core and Lab component that drags, snaps, animates one element, reorders, or animates layout                      | a component reaching internals for a job the public layer covers, or an internal use whose job is not in the gap table, fails                                    |
| FR5      | Docsite review of each hook's page and the playing-cards example                                              | each hook's page; the playing-cards demo                                                                                | a hook without usage, options, a keyboard path, Reduce Motion, a component-prop note, or a live example, or a demo that imports anything but public hooks, fails |

## Decision log

### DEC-1 — Products get a public hook layer, not the gesture machinery

**Reference:** `spec:AST-107/DEC-1`
**Decider:** `cixzhang`, `2026-10-26`

Products need to follow drags, snap, and animate with the same motion Core
uses. Three hooks give them values and one method each to drive, while the
recognizers, the arena, and the animator stay internal, so Core can change
them without breaking products.

Rejected: exporting the recognizers and the animator.

### DEC-2 — Factories under the hooks, and Core uses the public layer

**Reference:** `spec:AST-107/DEC-2`
**Decider:** `cixzhang`, `2026-10-26`

A product without React, or one that manages its own elements, needs the same
gestures, so each hook is a thin wrapper over a `create…` factory, the family
`createReorderable` already uses. Core and Lab build on the same public layer
wherever it covers their job, so its gaps are visible and listed rather than
hidden behind internals.

Rejected: hooks only, and components that bypass the public layer.

## Open questions

None.
