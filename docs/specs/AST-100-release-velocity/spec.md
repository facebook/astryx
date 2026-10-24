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
affects_architecture: []
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
stopped before lifting never counts as a flick. One velocity tracker in Core
owns the samples and the release filter; components decide only what a given
velocity means for them.

## Non-goals

- What a component does with the velocity: its flick threshold, its commit
  point, its projection, and its settle curve stay with the component and its
  record.
- Pinch scale velocity and scroll physics the browser owns.
- Public API: the tracker, its filter values, and every threshold stay
  internal (`spec:AST-002` FR3).
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — One tracker owns the samples.** Core has one velocity tracker. A
  gesture feeds it the contact's positions with their event timestamps, and it
  reports velocity in CSS pixels per second on each physical axis. Every Core
  and Lab component that reads the velocity of a pointer gesture uses it,
  including a sheet's drag, a toast's swipe, a row swipe, paging, a wheel
  picker, a navigation pop, and interactive dismiss. No component keeps its own
  sample buffer or velocity math.
- **FR2 — One release filter.** The velocity a component reads when the
  contact lifts comes only from the tracker's release filter: it uses the
  samples within a fixed window before the newest sample, and reports 0 when
  the contact stayed still for longer than a fixed stillness interval before
  lifting. A component reads no other estimate and selects no alternative
  filter. The window and the stillness interval are internal tuning values.
- **FR3 — Thresholds sit on top of the one velocity.** A component's flick,
  fling, or commit threshold compares the FR2 velocity, possibly with travel
  or projection the component owns. Thresholds are per-component tuning that
  stays internal (`spec:AST-002` FR3); a component never derives a second
  velocity to compare against.
- **FR4 — Event-clock timestamps for every pointer.** Samples carry the input
  event's own timestamp, never the time the handler ran or the wall clock, and
  the tracker and filter behave the same for touch, pen, and mouse pointers.
- **FR5 — Direction comes from the caller's axis.** The tracker reports
  physical x and y. A caller that acts along a logical axis maps the velocity
  onto that axis after resolving the element's direction with the shared
  right-to-left check, so a flick toward the inline end means the same in both
  directions.

### Platform support

- Supported feature/engine floor: the package's supported browsers
  (`spec:AST-013` FR3); pointer events with event timestamps.
- Unsupported behavior: a gesture with fewer than two samples in the window
  has a release velocity of 0.
- Browser evidence: unit tests over recorded and synthetic sample streams
  prove FR1–FR5; real-device feel for each component remains that component's
  evidence.

## Current-state impact

- No velocity tracker exists in Core on `main`. Its first landing meets FR1–FR5:
  one release filter with the FR2 stillness reset, with no selectable
  alternative filters.
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
