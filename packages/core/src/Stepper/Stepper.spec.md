---
schema_version: 3
template_version: 3
kind: component
id: component:Stepper
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, theming, layout]
verified_by:
  [packages/core/src/Stepper/Stepper.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: [spec:AST-002/DEC-1]
---

# Stepper component contract

## Intent

Stepper presents an ordered flow of steps and the progress made through it. This
draft records the anatomy-to-target map for the existing targets and owns the one
public semantic custom property the component exposes,
`--step-connector-gap`.

## Compatibility and migration

- Released default preserved: `yes` — `--step-connector-gap` defaults to `0px`,
  which renders the shipped track unchanged
- Compatibility class: additive; one new public custom property, no change to
  existing targets, DOM, props, or default pixels
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `stepper`, `step`, `step-bar`, `step-connector`, and `step-indicator`
  targets.
- The two paint layers of a connector — the unfilled track (the element's own
  background) and the accent fill (an absolutely placed `::before`) — and the
  single clip that holds both off the indicator.
- Which pieces an on-track connector is drawn from, and how many.

**Does not own / non-goals**

- Indicator artwork supplied through `indicator` — owned by the caller.
- The step content slot and any `endContent` — owned by the caller.
- Whether a step is complete: derived from `activeStep`, not from a caller-owned
  per-step lifecycle.

## Public concepts

| Concept                | Closed values or states       | Meaning                                                               | Availability by variant/orientation/state                                                                     | Default | Owner               | Stability | Invalid-value behavior                                                                                    |
| ---------------------- | ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- | ------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `--step-connector-gap` | Any CSS `<length-percentage>` | How far the track stops short of the indicator, on the side facing it | `indicatorPosition="on-track"`, both orientations and both directions, only on steps that render an indicator | `0px`   | `component:Stepper` | stable    | Clamped, never rejected: values below `0` resolve to `0`, values above `--spacing-2` cap at `--spacing-2` |

Consumer syntax and description remain in `Stepper.doc.mjs` `theming.vars`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                            | Basis                            | Draft review state |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------ |
| FR1 | The default for `--step-connector-gap` is declared once, on the `stepper` root, so a theme's `stepper` override is inherited by every connector.               | Reviewed defect (PR #5495)       | Settled            |
| FR2 | The gap is applied to the ONE edge each segment faces the indicator from, mirrored per axis, so the pair leaves a hole centred on the node.                    | Current source and browser probe | Settled            |
| FR3 | One declaration covers both connector paint layers. A clip on the segment clips its `::before` with it, against one reference box, so the two cannot disagree. | Current source and browser probe | Settled            |
| FR4 | The resolved value is clamped to `max(0px, min(value, --spacing-2))` before use.                                                                               | Reviewed defect (PR #5495)       | Settled            |
| FR5 | A step rendering no indicator (`indicator="none"`) applies no clip, leaving its track continuous.                                                              | Current source and browser probe | Settled            |
| FR6 | No accepted value changes the Stepper's outer size, in either orientation. A clip cannot affect layout.                                                        | Current source and browser probe | Settled            |
| FR7 | The horizontal clip mirrors under `dir="rtl"`, so the hole stays at the indicator rather than moving to the join between steps.                                | Reviewed defect (PR #5495)       | Settled            |
| FR8 | The pieces an on-track connector is drawn from are not public: no `data-segment`, and no bare `lead`/`rail`/`content` class is emitted.                        | `component:Stepper/DEC-1`        | Settled            |

### Allowed variation

- **AV1 — Segment count.** How many elements draw one connector span may change
  with orientation and with the presence of a content slot, without becoming a
  regression. It is not public.
- **AV2 — Percentage resolution.** A percentage resolves against each segment's
  own box, so the hole may differ slightly between a fixed and a flexible
  segment. Both layers of any one segment still agree exactly (FR3).

### Representative states

| State                            | Required invariant | Allowed variation |
| -------------------------------- | ------------------ | ----------------- |
| vertical, on-track, indicator    | FR2, FR3, FR6      | AV1, AV2          |
| horizontal, on-track, indicator  | FR2, FR3, FR6, FR7 | AV1, AV2          |
| `dir="rtl"`, horizontal          | FR7                | AV1               |
| `indicator="none"`               | FR5                | —                 |
| value below `0` or above the cap | FR4, FR6           | —                 |

### Transformation and precedence order

- **ORD1 — Gap resolution.** Read the inherited custom property → clamp to
  `max(0px, min(value, --spacing-2))` → apply as one `clip-path: inset()` on the
  segment. Both halves of the clamp are load-bearing, and neither for padding's
  reasons: `inset()` **accepts** a negative length rather than clamping it the
  way padding does, so the floor has to be written; the cap bounds an oversized
  gap to a short track.

### Performance and resources

- No new performance or resource rule is introduced. The gap is a static CSS
  declaration; it adds no measurement, listener, or observer.

## Accessibility contract

This draft does not change Stepper's existing roles, `aria-current` handling, or
reduced-motion behavior. The connector is `aria-hidden`, so the gap is a purely
visual change.

## Design relationships

| Anatomy or state | Design requirement                                                     | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Stepper          | Lays the flow out on one orientation and indicator placement.          | Current source and public docs | Supporting     | FR1                |
| Step             | Carries one step's status.                                             | Current source and public docs | Supporting     | —                  |
| Progress bar     | Presents progress as a segmented bar per step.                         | Current source and public docs | Prominent      | —                  |
| Connector        | Presents the track between indicators, and the progress made along it. | Current source and public docs | Prominent      | FR2–FR7            |
| Indicator        | Presents the step's position or completion.                            | Current source and public docs | Prominent      | FR5                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Stepper": {"target": "stepper"},
  "Step": {"target": "step"},
  "Progress bar": {"target": "step-bar"},
  "Connector": {"target": "step-connector"},
  "Indicator": {"target": "step-indicator"},
  "Label": {"inherits": "step"},
  "Description": {"inherits": "step"}
}
```

Connector is one anatomy part with one target, even though the on-track layouts
draw it from up to three elements. Those pieces are layout implementation, not
semantic parts, so they get no targets of their own — see `DEC-1`, which is also
why the caller-owned gap is a custom property rather than a per-piece vocabulary.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, the
  guaranteed-property catalog, and the admission rule for public semantic
  variables.
- `architecture:public-component-api` owns the API admission bar those variables
  must also pass.

## Verification map

| Contract            | Verification                                | Representative states                          | Mutation or failure expectation                                                          | Audit section           |
| ------------------- | ------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | `Stepper.test.tsx` root-ownership assertion | vertical on-track                              | Moving the declaration back onto the connector makes a `stepper` theme override a no-op. | `audit:Stepper/theming` |
| FR2, FR3            | `Stepper.test.tsx` clip assertions          | vertical and horizontal on-track               | Clipping the wrong edge, or per-layer copies of the value, fails the suite.              | `audit:Stepper/theming` |
| FR4, FR6            | `Stepper.test.tsx` clamp assertion          | values below `0` and above the cap             | Removing the floor lets a negative inset through; removing the cap unbounds the hole.    | `audit:Stepper/theming` |
| FR5                 | `Stepper.test.tsx` no-indicator assertion   | `indicator="none"`                             | Applying the clip unconditionally puts holes in a track with no node in them.            | `audit:Stepper/theming` |
| FR7                 | `Stepper.test.tsx` RTL assertion            | `dir="rtl"`, horizontal                        | Dropping the mirror moves the hole to the join between steps; caught by the assertion.   | `audit:Stepper/theming` |
| FR8                 | `Stepper.test.tsx` vocabulary guard         | vertical on-track                              | Re-adding `data-segment` or a bare role class fails the guard.                           | `audit:Stepper/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`               | Canonical anatomy and the five current targets | A target with no anatomy owner, or a stale/extra part, fails repository validation.      | `audit:Stepper/theming` |

## Decision log

### DEC-1 — The connector gap is a public custom property, not a theme target per piece

**Reference:** `component:Stepper/DEC-1`
**Decider:** `cixzhang`, pending

A theme may want the track to stop short of the indicator rather than run
through it. Two otherwise identical Steppers need different resolved outcomes
and only the theme knows which, so the need is caller-owned
(`spec:AST-002/DEC-1` FR1). Astryx cannot derive it: nothing in the component's
state, content, or layout says whether this design wants a broken or a
continuous track.

No guaranteed CSS property on the owning target can express it. A connector
paints in two layers — the element's own background (the unfilled track) and a
`::before` at `inset: 0` (the accent fill) — and a theme target reaches the
element only. Measured in Chromium against a built theme override on
`step-connector`, three steps, vertical:

- `paddingBlock: 6px` produces **no hole at all**. The element's background
  paints to its border box, and the fill is a pseudo-element the theme cannot
  reach, so the only observable effect is the Stepper growing 108px → 120px.
- `paddingBlockEnd: 6px` produces no hole either, and would in any case address
  only one of the two edges: the leading segment faces the node with its far
  edge, the trailing segment with its near one.

Only the component can put one clip on the segment that takes its pseudo-element
with it, mirror it per axis and per direction, and clamp the value first.

Rejected: exposing `lead` / `rail` / `content` as a public segment vocabulary
(the earlier form of this change). The words never reached generated docs, they
emitted bare `lead` / `content` classes a consumer stylesheet can collide with,
and `lead` denotes different geometry per orientation, so a theme selecting it
could not know what it would get.

## Open questions

- **OQ1 — Is per-segment percentage variation acceptable?** (`human-api`) A
  percentage resolves against each segment's own box, so a fixed 8px segment and
  a flexible 12px one clip by different amounts from the same declared value.
  Both layers of any one segment agree exactly, and the cap bounds the spread,
  so this is a cosmetic inconsistency rather than the track/fill disagreement it
  replaced. Documented as accepted (`AV2`) rather than fixed.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
