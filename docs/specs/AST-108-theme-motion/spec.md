---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-108
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-26
phase: accepted
owners: [cixzhang]
affects_architecture:
  [architecture:theme-tokens, architecture:theme-authoring-contract]
affects_families: []
affects_contributing: []
affects_consumer_docs: [motion, tokens, theme]
---

# Theme motion system spec

<!-- path-applicability:v1 -->

```json
{
  "paths": ["packages/core/src/theme/**", "packages/core/src/motion/**"]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A theme sets how fast and how lively its motion feels, and whether motion is
reduced for everyone, with three knobs. The same knobs drive the CSS motion
tokens and the animator's springs and curves, and animations that run together
start and land together. Every per-use motion value stays internal.

## Non-goals

- Per-role or per-component motion settings for themes.
- Loosening Reduce Motion: no option turns off `design:reduced-motion`
  DR1–DR4 for a person who asked for it.
- A public resolver for a theme's motion values (OQ1).

## Public contract

```ts
defineTheme({
  name: 'Brand',
  motion: {tempo: 1, character: 'standard', reducedMotion: 'system'},
});
```

## Requirements

- **FR1 — Three motion knobs.** `defineTheme`'s `motion` takes
  `{tempo, character, reducedMotion}`:
  - `tempo` is a number, default `1`, clamped to 0.75–1.5; it scales every
    motion duration;
  - `character` is `'crisp'`, `'standard'` (default), or `'expressive'`; it
    picks the entrance and move curves and the spring bounce. Three steps are
    the recommendation the owner adopted with the knobs; a continuous bounce
    is not offered;
  - `reducedMotion` is `'system'` (default) or `'always'`; `'always'` applies
    `design:reduced-motion` DR1–DR3 for everyone, and `'system'` follows each
    person's setting. No value loosens Reduce Motion.
- **FR2 — The knobs generate the CSS motion tokens.** The theme's
  `--duration-*` tokens are their base values times `tempo`. `character` sets
  only the job-named `--ease-entrance` and `--ease-move` tokens, declared in
  `tokens.stylex.ts`. `--ease-standard`, which today's exits read, and
  `--ease-exit`, which defaults to `cubic-bezier(0.42, 0, 1, 1)` (the exit
  role's measured curve), are the same at every character, so exits stay
  quiet. With `tempo` 1 and `character`
  `'standard'`, the tokens are today's: `--duration-*` 130, 175, 230, 310, 410,
  550, 730, 975 and 1300 ms, and `--ease-standard`
  `cubic-bezier(0.24, 1, 0.4, 1)`; `--ease-entrance` and `--ease-move` equal
  `--ease-standard` at `'standard'`. The curves at `'crisp'` and
  `'expressive'` are a decelerate-only curve and a curve with a slight
  overshoot.
- **FR3 — The animator's tables derive from the same knobs.** The animator's
  base tables, every role in `spec:AST-094` FR4, derive from the theme's
  `tempo` and `character` at their source: a spring's duration scales by
  `tempo`, and `character` offsets the role's measured bounce by an amount
  times the role's fixed weight: `'standard'` adds nothing, and `'crisp'` and
  `'expressive'` shift it down and up, so exits, fades, and full-screen moves,
  whose weight is zero, never overshoot. With
  `tempo` 1 and `character` `'standard'`, every role plays its measured value
  exactly. A spring keeps its measured physics, scaled by `tempo` and shaped
  by `character`; it does not follow a CSS duration or easing twin. The roles
  and their weights stay internal.
- **FR4a — Coordinated animations share one clock.** Animations that run
  together start and land together: they play the same motion role, or the CSS
  part is timed from the spring's computed settle time, and never as two
  independently timed curves. This covers an element and the siblings that
  glide around it (`spec:AST-105`'s one shared timing), `presence`'s enter and
  exit, a sheet and its scrim, a menu's grow and its content, and a CSS fade
  paired with a JavaScript spring, such as MobileNav's close timed from its
  computed duration and BottomSheet's scrim, whose fade lasts the sheet's
  computed settle time.
- **FR4 — Some motion is fixed on purpose.** The knobs do not move
  finger-following and drag motion, scroll momentum and decay, the rubber
  band, the on-screen keyboard's motion (`spec:AST-099` FR8), press and hover
  clocks, gesture thresholds (`spec:AST-002` FR3), busy loops such as spinners
  and skeletons, or the 200 ms Reduce Motion cap; `tempo` may shorten a
  Reduce Motion cross-fade but never lengthens it.
- **FR5 — Existing motion configuration keeps working.** `defineTheme`'s
  `motion` also accepts the existing `MotionScaleConfig`, and
  `expandMotionScale` and the `MotionScale*` types are unchanged. A
  `MotionScaleConfig` keeps generating its CSS duration tokens, and the tempo
  it implies drives those durations only: the animator's tables stay at tempo 1
  unless the theme sets `tempo` itself, so an existing theme renders exactly as
  before, springs included. Explicit
  `MotionScaleConfig` fields and explicit `tokens` win over `tempo` and
  `character`, and an extending theme's motion configuration replaces its
  base's, as today.
- **FR6 — Server rendering gets the same values.** A theme is plain data, and
  the theme utilities run on the server. `'system'` is resolved by emitting
  the reduced token set behind `prefers-reduced-motion` in the generated CSS,
  so the server never guesses and nothing flashes at hydration. An internal,
  pure `resolveThemeMotion(theme)` returns the knobs, durations, easings, and
  role tables for the animator and for server code; it touches no DOM and has
  no import-time side effects. The animator reads a person's Reduce Motion
  setting only when an animation starts, on the client.
- **FR7 — Docs ship with it.** The motion, duration-token, and easing-token
  docs, the theme template, the theme-authoring guide, and
  `architecture:theme-authoring-contract` describe the three knobs, the fixed
  list, and the precedence before the implementation lands.

## Current-state impact

- `defineTheme`'s `motion` widens to accept the three knobs beside the existing
  `MotionScaleConfig`; existing themes render exactly as before.
- Core gains `--ease-entrance`, `--ease-move`, and `--ease-exit`.
- BottomSheet's scrim fades over `--duration-medium` while the sheet settles
  on its spring; it moves to the spring's settle time (FR4a).
- `spec:AST-094` FR4 and `design:reduced-motion` DR2 and the draft
  `design:motion` DR3 and `spec:AST-090` are amended to match.

## Verification

| Contract | Verification                                                                         | Representative states                                                                                       | Mutation or failure expectation                                                                                               |
| -------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2 | Theme unit tests over generated CSS                                                  | each `tempo` bound and 1; each `character`; `reducedMotion` both values; no `motion`                        | a token off its formula, today's tokens changed at the defaults, an exit curve that changes, or a value outside a clamp fails |
| FR3      | Tests that the CSS tokens and the animator's tables derive from the same knob values | each role at the defaults and at each knob value                                                            | a role off its measured value at the defaults, a role that ignores a knob it follows, or overshoot on a weight-0 role fails   |
| FR4a     | Browser tests of each paired animation at each knob value                            | an element and gliding siblings, a sheet and its scrim, a menu's grow and content, a CSS fade with a spring | paired animations that end more than one frame apart fail                                                                     |
| FR4      | Unit tests of each fixed item                                                        | finger tracking, momentum, rubber band, keyboard, press and hover clocks, loops, Reduce Motion cap          | a fixed item that moves with a knob, or a cross-fade longer than 200 ms, fails                                                |
| FR5      | Theme tests with today's configurations                                              | a `MotionScaleConfig` theme, explicit tokens, an extending theme                                            | changed output for an existing theme, or a knob that beats an explicit field, fails                                           |
| FR6      | Server-render tests and import checks                                                | a server render with each `reducedMotion`; importing the theme and motion modules                           | a DOM access at import or on the server, a missing media-query set, or a hydration change fails                               |
| FR7      | Docs review                                                                          | each listed doc                                                                                             | a doc without the knobs, the fixed list, or the precedence fails                                                              |

## Decision log

### DEC-1 — A theme's motion is three knobs; per-role tables stay internal

**Reference:** `spec:AST-108/DEC-1`
**Decider:** `cixzhang`, `2026-10-26`

Theme authors set how fast and how lively motion feels and whether it is
reduced for everyone; few want per-use values. Three knobs drive CSS tokens and JavaScript springs from the same values, and the measured
per-role values stay internal. This supersedes `spec:AST-094` DEC-11's "all
internal" for exactly these three knobs.

Rejected: a public token per motion group.

## Open questions

- **OQ1 — Whether a theme's motion values get a public resolver.**
  (`human-design`) Open. `resolveThemeMotion` is internal.
