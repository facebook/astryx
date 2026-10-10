---
schema_version: 1
template_version: 1
kind: design
id: design:motion
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [ernestt, cixzhang]
review_triggers: [visual, interaction, accessibility, motion]
verified_by: []
architecture: [architecture:theme-tokens]
components: []
families: []
deciding_specs: []
---

# Motion design specification

## User intent

Movement should clarify what changed and where content came from without making a
surface feel theatrical or sluggish. Every state change should remain understandable
when motion is reduced.

## Design principles

- **DR1 — Motion carries meaning.** Animation MUST explain response, continuity,
  entry, exit, or spatial change rather than decorate otherwise static content.
- **DR2 — Weight determines timing.** Small local feedback SHOULD feel faster
  than large entrances, exits, or continuous movement.
- **DR3 — Movement settles naturally.** Easing SHOULD communicate controlled
  deceleration rather than ornamental bounce or elasticity.
- **DR4 — Stable content stays stable.** Motion SHOULD avoid unnecessary layout
  disruption and preserve reading and interaction context.
- **DR5 — Reduced motion preserves meaning.** Every animated transition MUST have
  an immediate or minimally moving form that communicates the same state change.

## Anatomy and hierarchy

| Role                | Purpose                                     | Required relationship                               |
| ------------------- | ------------------------------------------- | --------------------------------------------------- |
| origin state        | Establishes what is changing                | Remains identifiable until continuity is clear      |
| transition cue      | Connects origin and destination             | Uses only the movement needed to explain the change |
| destination state   | Shows the completed result                  | Settles without residual decorative activity        |
| reduced-motion path | Communicates the same result without travel | Preserves timing and status meaning where needed    |

## State representation

Hover and press use the lightest useful response; entrances and exits may use a
more visible transition; large or continuous movement requires stronger user
justification. Loading and status MUST remain understandable without animation.

## Responsive and input behavior

The source wiki does not establish responsive-path, interruption, or
input-specific motion rules beyond the principles above. Those concerns remain
open for separately evidenced decisions.

## Accessibility intent

Motion must not be required to perceive status, hierarchy, or completion. Reduced
motion should suppress unnecessary travel while preserving feedback. Animated
content should not repeatedly steal attention from reading or input.

## Representative examples

- A pressed control responds immediately without launching decorative movement.
- A surface entrance explains where new content belongs, then settles quietly.
- Reduced-motion mode shows the same completed state without spatial travel.

## Visual references

No normative assets are included. Micro-interaction, entrance/exit, and
reduced-motion pairs should be added under `docs/design/assets/motion/` before
promotion.

## Component contract links

No component links are asserted in this seed draft.

## Decision log

No repository design decision has approved this record yet. It distills motion
intent from the public Design Conventions wiki without copying duration values,
CSS properties, or audit mechanics.

## Deprecation and cleanup records

### DEP-0008 — Deprecate the default reveal motion of `useContainerReveal`

| Field            | Value                                                                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id               | `DEP-0008`                                                                                                                                                                             |
| cleanup          | `CLN-0017`                                                                                                                                                                             |
| package          | `@astryxdesign/core`                                                                                                                                                                   |
| surface          | Default timing of `useContainerReveal`: a tokenized opacity fade on reveal, conceal, and layout-preserved variants, and a deferred `position` reset on the non-layout-preserved reveal |
| old contract     | Every variant fades with token duration and easing; the non-layout-preserved reveal resets `position` after the fade                                                                   |
| replacement      | Callers that want motion compose their own transition on the revealed content. `hoverDelay` remains the explicit pointer-intent gate                                                   |
| direct authority | No contract record owns `useContainerReveal`; this record owns the motion rule it applies. Owners: `ernestt`, `cixzhang`                                                               |
| warning          | Consumer docs and the release notes name `DEP-0008`. No runtime warning (`spec:AST-017` FR29)                                                                                          |
| migration        | Non-mechanical: a caller that wants the fade adds its own transition                                                                                                                   |
| codemod          | None: the fade has no prop to pin, and its tokenized timing is not caller source                                                                                                       |
| downstream       | Hook docs and stories show the immediate default and `hoverDelay`                                                                                                                      |
| transition       | waived by owner for 0.7.0 (2026-10-10)                                                                                                                                                 |
| state            | `proposed`                                                                                                                                                                             |
| open decision    | The motion rule that makes frequent triggers immediate is draft here; it needs an approved decision and a direct owner for the hook                                                    |
| target plan      | `CLN-0017` in the next minor release                                                                                                                                                   |

### CLN-0017 — `useContainerReveal` changes state immediately by default

| Field     | Value                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0017`                                                                                                                                              |
| lifecycle | `DEP-0008`                                                                                                                                              |
| delta     | All four variants change state with zero duration; the exit `position` delay is removed. `hoverDelay`, focus, and coarse-pointer behavior are unchanged |
| rollback  | Restore the tokenized duration, easing, and exit delay from the final-patch baseline                                                                    |
| state     | `pending` — lands only in a minor release whose frozen manifest lists `CLN-0017`                                                                        |

## Open questions

- **OQ1 — Reference transitions.** Which component interactions should be the
  normative examples for local, entrance/exit, and large movement?
- **OQ2 — Interruption and reflow.** What requirements should govern reversing,
  cancelling, replacing, or responsively reflowing an active transition?
- **OQ3 — Allowed expressive motion.** Which product contexts, if any, justify a
  deliberately expressive treatment beyond functional continuity?

## Content boundary

This file defines motion intent. It does not define duration or easing tokens,
CSS properties, animation APIs, component behavior, or audit checks.
