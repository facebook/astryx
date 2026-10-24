---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-100
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-24
phase: accepted
owners: [cixzhang]
affects_architecture: [architecture:interaction-modality]
affects_families: []
affects_contributing: []
affects_consumer_docs: []
---

# Release velocity system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": [
    "packages/core/src/BottomSheet/**",
    "packages/core/src/Item/**",
    "packages/core/src/Toast/**"
  ]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

When a person flicks a sheet, a toast, a row, a page, or a wheel and lifts
their finger, every Astryx component reads the same speed from that motion, so
a flick of the same speed does the same thing everywhere, and a finger that
stopped before lifting never counts as a flick. One velocity source in Core
owns the samples and the release filter; components decide only what a given
velocity means for them.

## Non-goals

- What a component does with the velocity: its flick threshold, its commit
  point, its projection, and its settle curve stay with the component and its
  record.
- Pinch scale velocity and scroll physics the browser owns.
- Public API: the velocity source, its filter values, and every threshold stay
  internal (`spec:AST-002` FR3).
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One velocity for every gesture.** Every Core and Lab component that
  reads the velocity of a pointer gesture, including a sheet's drag, a toast's
  swipe, a row swipe, paging, a wheel picker, a navigation pop, and interactive
  dismiss, reports the same velocity, in CSS pixels per second on each physical
  axis, for the same contact motion. `architecture:interaction-modality` INV10
  owns the single source of that velocity.
- **FR2 — A still finger never flicks.** The velocity a component reads when
  the contact lifts reflects only the motion just before the lift: it is 0
  when the contact stayed still for longer than a fixed stillness interval
  before lifting, and motion older than a fixed window before the lift does not
  change it. Every component reads the same release velocity and none reads
  another estimate. The window and the stillness interval are internal tuning
  values.
- **FR3 — Thresholds sit on top of the one velocity.** A component's flick,
  fling, or commit threshold compares the FR2 velocity, possibly with travel
  or projection the component owns. Thresholds are per-component tuning that
  stays internal (`spec:AST-002` FR3); a component never derives a second
  velocity to compare against.
- **FR4 — Event time for every pointer.** The velocity follows the input
  events' own timestamps, so a handler that runs late does not change it, and
  the same motion gives the same velocity for touch, pen, and mouse pointers.
- **FR5 — Direction follows the rendered direction.** A flick toward the
  logical end moves toward the logical end in both directions
  (`design:bidirectionality` DR13); a component maps the physical velocity onto
  its logical axis from the rendered direction
  (`architecture:internationalization` INV11).

### Platform support

- Supported feature/engine floor: the package's supported browsers
  (`spec:AST-013` FR1, FR3); pointer events with event timestamps.
- Unsupported behavior: a gesture with fewer than two samples in the window
  has a release velocity of 0.
- Browser evidence: none required by this record; the unit, source-boundary,
  and component tests in Verification prove FR1–FR5, and real-device feel for
  each component remains that component's evidence.

## Current-state impact

- No single velocity source exists in Core on `main`. Its first landing meets
  FR1–FR5 and `architecture:interaction-modality` INV10: one release filter
  with the FR2 stillness reset, with no selectable alternative filters.
- BottomSheet's drag estimates velocity from a two-point window over its
  recent samples with event timestamps. Under FR1 and FR2 it reads the tracker.
- Item's row swipe compares a speed in pixels per millisecond timed with the
  handler's clock. Under FR1, FR2, and FR4 it reads the tracker in pixels per
  second with event timestamps, and keeps its own threshold (FR3).
- Toast's swipe averages travel over the whole drag timed with the wall clock.
  Under FR1, FR2, and FR4 it reads the tracker, and keeps its own threshold
  (FR3).
- A component that later reads gesture velocity, such as paging, a wheel
  picker, a navigation pop, or interactive dismiss, reads it from the tracker.

## Verification

| Contract | Verification                                                    | Representative states                                                                                                                  | Mutation or failure expectation                                                                                   |
| -------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| FR1      | Source boundary check over Core and Lab plus tracker unit tests | each gesture component; a new gesture component; steady motion in x and y                                                              | A component with its own sample buffer or velocity math; a unit other than pixels per second                      |
| FR2      | Release filter unit tests                                       | steady flick; acceleration before lift; a pause longer than the stillness interval before lift; one sample; samples outside the window | A non-zero release after a still pause; samples outside the window changing the result; a second filter reachable |
| FR3      | Component tests at each threshold                               | a flick just under and just over a component's threshold; the same velocity across two components                                      | A component comparing a velocity it computed itself, or a threshold reachable from public API                     |
| FR4      | Unit tests with handler delay and per-pointer streams           | delayed handlers with fixed event timestamps; touch, pen, and mouse streams                                                            | Velocity that changes with handler delay or pointer type                                                          |
| FR5      | Component tests in both directions                              | a flick toward the inline end in left-to-right and right-to-left                                                                       | A flick toward the inline end treated as the opposite action in right-to-left                                     |

## Decision log

### DEC-1 — One tracker and one release filter; thresholds stay per component

**Reference:** `spec:AST-100/DEC-1`
**Decider:** `cixzhang`, `2026-10-24`

Each component estimating velocity its own way makes the same flick dismiss a
toast but not a sheet, and a finger that paused before lifting count as a
flick in one place and not another. One tracker with one release filter gives
every component the same speed for the same motion, and the stillness reset
stops a resting finger from flinging. What a speed means stays with each
component as internal tuning, so components keep their feel without a second
estimator.

Rejected: several selectable estimators or per-component release filters,
which reintroduce the disagreement this record removes.

## Open questions

None.
