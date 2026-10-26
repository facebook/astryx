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
element with the same motion Core uses, through three public hooks. The hooks
hand out values, never the gesture machinery behind them, which stays
internal.

## Non-goals

- Recognizers, the gesture arena, the animator object, and the snap-point
  resolver as public API; they stay internal (`spec:AST-017` FR21).
- Presses and long presses, which `useLongPress` owns.
- Animating the layout of an area, which `spec:AST-105` owns.
- Choosing a spring or curve, which lands with the public motion-token set
  (`spec:AST-094` DEC-11).

## Public contract

```tsx
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
  flickThreshold: 500,
  onSettle: index => {},
});

const {ref: animatedRef, animator} = useAnimator();
animator.animate({x: 120});
```

## Requirements

- **FR1 — `usePanGesture` reports a drag as values.**
  `usePanGesture(ref, {axis?, onPan})` calls `onPan` with
  `{state, translation, velocity}` as a drag on the element begins, changes,
  ends, or is cancelled. `axis` limits the drag to `'x'` or `'y'`. It never
  hands out a recognizer object, and it recognizes no press or long press.
- **FR2 — `useDragToSnapPoints` settles an element on snap points.**
  `useDragToSnapPoints(ref, {axis, snapPoints, flickThreshold?, onSettle})`
  lets a drag move the element along `axis`, and at the release settles it on
  the snap point the release resolves to (`resolveSnapPoint`): a release faster
  than `flickThreshold` carries to the next snap point in its direction, and a
  drag that reverses before it ends is cancelled back to where it started. It
  calls `onSettle(index)` once the element settles. It returns
  `{settleTo(index)}`, which settles the element on a snap point without a
  drag and is the keyboard path.
- **FR3 — `useAnimator` animates one element.** `useAnimator()` returns
  `{ref, animator}`, where `animator` has `animate`, `decay`, `set`, `get`,
  `getVelocity`, and `stop` for the one element `ref` attaches to. Reduce
  Motion is planned for every animation (`design:reduced-motion` DR1–DR3).
  Every animation plays on the default motion role; choosing a spring or curve
  lands with the public motion-token set.
- **FR4 — One hook per job.** `usePanGesture` does not do presses or long
  presses, which `useLongPress` owns. `useAnimator` animates one element, and
  `useAnimatedLayout` animates an area (`spec:AST-105`). A component's own
  props, such as BottomSheet's `snapPoints` or Carousel's `hasSnap`, stay the
  component path to the same behavior. Everything else in the gesture and
  motion modules stays internal (`architecture:public-component-api` INV21).

- **FR5 — Each hook ships with docs and a playing-cards example.** Each public
  API here, and `createReorderable`'s `positions` (`spec:AST-103`), ships with
  docsite documentation: its usage, its options, its keyboard and
  assistive-technology path, its Reduce Motion behavior, a note saying when to
  use a component's own prop instead (FR4), and a live example. The flagship
  example is a playing-cards demo built only on the public hooks: a card that
  flicks and snaps back, cards that reorder by drag and by keyboard reorder
  mode, a swipe that discards a card, and a fanned hand that uses custom
  `positions`.

## Current-state impact

- Core gains the three hooks from `@astryxdesign/core/hooks`, their docsite
  pages, and a playing-cards example.

## Verification

| Contract | Verification                                                     | Representative states                                                                 | Mutation or failure expectation                                                                                                                                  |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | Unit and browser tests of `usePanGesture`                        | a drag on each axis, a cancel, a press, a long press                                  | a recognizer in the result, a missing state, a drag off its axis, or a press or long press reported as a pan fails                                               |
| FR2      | Unit and browser tests of `useDragToSnapPoints`                  | a slow release, a flick past `flickThreshold`, a reversed drag, `settleTo` from a key | a settle on the wrong snap point, a reversed drag that settles elsewhere, or a missing `onSettle` fails                                                          |
| FR3      | Unit and browser tests of `useAnimator`                          | each method, Reduce Motion, an unattached ref                                         | a missing method, a spring other than the default role, or motion that ignores Reduce Motion fails                                                               |
| FR4      | Export check of `@astryxdesign/core` and its hooks               | the public exports                                                                    | a recognizer, arena, animator object, or resolver reachable from a public export fails                                                                           |
| FR5      | Docsite review of each hook's page and the playing-cards example | each hook's page; the playing-cards demo                                              | a hook without usage, options, a keyboard path, Reduce Motion, a component-prop note, or a live example, or a demo that imports anything but public hooks, fails |

## Decision log

### DEC-1 — Products get a public hook layer, not the gesture machinery

**Reference:** `spec:AST-107/DEC-1`
**Decider:** `cixzhang`, `2026-10-26`

Products need to follow drags, snap, and animate with the same motion Core
uses. Three hooks give them values and one method each to drive, while the
recognizers, the arena, and the animator stay internal, so Core can change
them without breaking products.

Rejected: exporting the recognizers and the animator.

## Open questions

None.
