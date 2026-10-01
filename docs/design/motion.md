---
schema_version: 1
template_version: 1
kind: design
id: design:motion
authority: current
archive_reason: null
superseded_by: null
approved_by: ernestt
approved_at: 2026-10-01
owners: [ernestt, cixzhang]
review_triggers: [visual, interaction, accessibility, motion]
verified_by:
  [
    .github/scripts/story-play-guard.js,
    packages/core/src/hooks/useContainerReveal.test.tsx,
    scripts/build-css.test.mjs,
  ]
architecture: [architecture:interaction-modality]
components: []
families: []
deciding_specs: []
---

# Motion design specification

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "motion": ["DR1", "DR2", "DR3"]
  }
}
```

## User intent

People should be able to scan, point, focus, and repeat common actions without
replaying a visual transition on every state change. Feedback that occurs many
times during ordinary traversal should feel direct rather than accumulate into
motion, distraction, or perceived latency.

## Design principles

- **DR1 — Frequent triggers do not animate.** A visual state change expected to
  recur repeatedly during ordinary traversal or repeated operation MUST update
  without animated interpolation, fading, travel, scaling, or exit sequencing.
- **DR2 — Intent gates remain timing, not motion.** An explicit dwell or intent
  gate MAY postpone pointer activation when a caller requests it. Once the gate
  accepts the interaction, the visual state MUST update without animation.
- **DR3 — Returning to rest is immediate too.** A frequent trigger's exit or
  cancellation MUST NOT add an animation or an exit-only delay. Leaving the
  trigger returns the surface to its resting state immediately.

## Anatomy and hierarchy

| Role                 | Purpose                                                 | Required relationship                                           |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| frequent trigger     | Repeats during normal traversal or high-cadence action  | Does not start an animation                                     |
| optional intent gate | Filters accidental pointer entry before accepting state | Delays acceptance only; does not animate the accepted state     |
| accepted state       | Communicates the current result                         | Appears immediately once accepted                               |
| resting state        | Restores the surface after exit or cancellation         | Returns immediately, without exit sequencing or residual motion |

## State representation

| State                | Required representation                                  | Allowed variation                                                  |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| resting              | Stable content with no transition still running          | Component-owned color, opacity, visibility, position, and anatomy  |
| frequent trigger     | Destination state appears immediately                    | The destination treatment itself remains component-owned           |
| explicit intent gate | Resting state remains until the gate accepts the pointer | Caller-owned dwell duration; no animated interpolation afterward   |
| exit or cancellation | Resting state returns immediately                        | No exit-only delay, fade, travel, scale, or position sequencing    |
| reduced-motion mode  | Same immediate result as the default path                | No separate substitute is needed because the default has no motion |

## Responsive and input behavior

Frequency follows the user task rather than a viewport. The rule applies to
pointer, keyboard, and touch-driven states when the same state is expected to
repeat during ordinary traversal or operation. An input modality MAY omit an
unsupported trigger entirely; it MUST NOT add animation to the equivalent
frequent state.

## Accessibility intent

Repeated feedback should not continually pull attention away from reading or
input. Motion is never required to perceive the accepted state, and people who
prefer reduced motion receive the same immediate default rather than a separate,
less expressive fallback.

## Representative examples

- Row actions revealed while a pointer moves through a list appear and disappear
  immediately instead of fading on every row.
- `useContainerReveal({hoverDelay: 250})` may wait for the requested dwell, then
  reveals immediately; leaving the row restores the resting state immediately.
- Pressed feedback on a repeatedly used control paints and clears with the
  interaction instead of animating between the two states.

## Visual references

No normative image is required for this bounded decision. The absence of motion
is verified in real Chromium by exercising entry, accepted state, and exit while
reading the resolved duration, delay, opacity, and position.

## Component contract links

`useContainerReveal` is the first implementation of DR1–DR3. Its focused unit,
generated-CSS, and Chromium timing checks are listed in `verified_by`. Future
component and family records cite these requirement IDs rather than copying the
frequency rationale.

## Decision log

### DEC-1 — Frequent triggers have no animation

**Reference:** `design:motion/DEC-1`
**Decider:** `ernestt`, 2026-10-01

Animation compounds when a state fires across many rows or throughout a repeated
task. Even a short fade replays continuously, makes direct feedback feel latent,
and can require exit sequencing that outlives the interaction. Frequent triggers
therefore update immediately by default. A caller-requested intent gate remains
allowed because it filters accidental activation before the state is accepted;
it does not animate the accepted result.

Rejected: retaining a system "fast" fade, because shorter animation is still
repeated animation; and limiting the immediate path to reduced-motion mode,
because high-cadence feedback should be direct for everyone.

## Open questions

- **OQ1 — Infrequent and spatial motion.** Entrances, exits, spatial continuity,
  gesture tracking, duration hierarchy, easing, and expressive motion remain
  outside this bounded decision and require separately approved intent.

## Content boundary

This file defines only the no-animation rule for frequent triggers and the
allowed timing-only intent gate. It does not define prop syntax, CSS structure,
motion-token values, infrequent transition design, gesture behavior, current
audit scores, or consumer examples. Those remain with their canonical owners.
