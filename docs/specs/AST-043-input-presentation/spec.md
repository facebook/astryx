---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-043
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-24
phase: accepted
owners: [imdreamrunner]
affects_architecture: [architecture:public-component-api]
affects_families: [family:input-fields]
affects_contributing: []
affects_consumer_docs: []
---

# Date and time input presentation system spec

## Intent

One prop question — which surface collects the value — currently has two
answers:

- `ContextMenu`, `DropdownMenu`, `MoreMenu`, `Selector`, and `MultiSelector`
  use `presentation` (`'popover' | 'bottom-sheet' | 'adaptive'`).
- `DateInput`, `DateTimeInput`, and `TimeInput` use `nativePicker`
  (`'touch' | 'always' | 'never'`), which names only the native surface and
  hides that Astryx-on-desktop, Astryx-on-touch (bottom sheet), and — for
  `TimeInput` — a plain text field with no picker are different surfaces.

This spec gives the three date/time inputs a `presentation` prop whose values
distinguish every surface, preserves today's default and deprecated-prop
behavior exactly, and deprecates — but does not remove — `nativePicker`. No
existing record owns this cross-component vocabulary (searched: component
contracts, `architecture:public-component-api`, `family:input-fields`,
`nativePicker` / `presentation` / `AdaptivePresentation` in code and records).

## Non-goals

- Any surface's appearance, anatomy, or interaction — unchanged and owned by
  each component, except the new surfaces DEC-3 approves. Eligibility/fallback
  behavior changes only as FR2 states (for `native`).
- Renaming menu/selector `presentation` or their `adaptive` (OQ1).
- Removing `nativePicker` — breaking under `spec:AST-017`, needs its own
  record. Migration tooling follows `spec:AST-017` FR8 using the FR3 mapping.

## Requirements

- **FR1 — Prop, values, and surfaces.** `DateInput`, `DateTimeInput`, and
  `TimeInput` MUST accept optional `presentation`, default
  `'adaptive-native'`:

  | Value                   | Fine pointer   | Coarse pointer |
  | ----------------------- | -------------- | -------------- |
  | `text-input`            | Text field     | Text field     |
  | `popover`               | Astryx desktop | Astryx desktop |
  | `bottom-sheet`          | Astryx sheet   | Astryx sheet   |
  | `native`                | Native         | Native         |
  | `adaptive-bottom-sheet` | Astryx desktop | Astryx sheet   |
  | `adaptive-native`       | Astryx desktop | Native (FR2)   |

  | Surface        | `DateInput`                    | `DateTimeInput`                   | `TimeInput`                                                                       |
  | -------------- | ------------------------------ | --------------------------------- | --------------------------------------------------------------------------------- |
  | Text field     | Typed field, no picker         | Typed fields, no picker           | Typed field (today's `never`)                                                     |
  | Astryx desktop | Typed field + calendar popover | Typed fields + date/time popovers | — (fine resolves via Text field; `popover` is not a distinct `TimeInput` surface) |
  | Astryx sheet   | BottomSheet calendar           | BottomSheet date/time wheels      | BottomSheet time wheels (DEC-3)                                                   |
  | Native         | Browser/OS date picker         | Browser/OS date + time pickers    | Browser/OS time picker                                                            |

  Coarse uses the inputs' existing pointer test, no width condition. Forced
  values (`popover` on coarse, `bottom-sheet`/`text-input` where not reached
  today) MUST render the named surface, never silently substitute another.

- **FR2 — Fallback split for native.** `presentation="native"` MUST always
  show the native surface, with no eligibility fallbacks — a state the native
  control cannot express (seconds, non-default step/increment, preset time
  options, no usable native control) is the caller's explicit choice.
  `presentation="adaptive-native"` — including the default and
  `nativePicker="touch"` — MUST keep the released fallbacks: in those same
  states it falls back to the component's Astryx surface (per-segment for
  `DateTimeInput`: date may go native while time falls back), exactly as
  released today.

- **FR3 — Default and `nativePicker` preserved exactly.** Omitting both props
  MUST behave as today's `nativePicker="touch"`. `nativePicker` and its
  exported types MUST remain, marked `@deprecated`, resolving exactly as
  released for unmigrated and migrated callsites alike:

  | `nativePicker` | `DateInput` / `DateTimeInput` | `TimeInput`       |
  | -------------- | ----------------------------- | ----------------- |
  | `touch`        | `adaptive-native`             | `adaptive-native` |
  | `always`       | `native`                      | `native`          |
  | `never`        | `adaptive-bottom-sheet`       | `text-input`      |

  (`TimeInput`'s released `never` is the typed field on every pointer; a sheet
  for `TimeInput` comes only from explicit
  `presentation="bottom-sheet" | "adaptive-bottom-sheet"`.) Preserving the
  prop with equivalent meaning is nonbreaking (`spec:AST-017` FR4).

- **FR4 — Precedence.** If both props are set, `presentation` MUST win and
  `nativePicker` MUST be ignored, regardless of order or pointer. A
  development-only warning SHOULD name the FR3 replacement whenever
  `nativePicker` is used, and MUST NOT fire in production.

- **FR5 — Docs and types agree.** Each component's consumer docs (en + zh),
  exported types, and Storybook controls MUST show FR1 values/default (six
  values) and `nativePicker` only as deprecated with its FR3 replacement.

### Platform support

- Floor: unchanged (`spec:AST-013`, each component); no value renders no
  picker (FR2's `adaptive-native` fallback guarantees an Astryx surface).
- Browser evidence: each FR1 value on fine/coarse browsers, plus FR2 fallback
  states, because jsdom reports neither pointer type nor native pickers.

## Current-state impact

- `packages/core/src/{DateInput,DateTimeInput,TimeInput}`: add `presentation`,
  deprecate `nativePicker` (FR1–FR4); docs/types (FR5); DEC-3 new surfaces;
  implementing PR adds the `spec:AST-017` FR8 migration + nonbreaking
  Changeset. Menu/selector components: unchanged.

## Verification

| Contract | Verification                               | Representative states                                                                                 | Mutation or failure expectation                                               |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| FR1      | Unit tests per input + real-browser check  | 6 values × fine/coarse, incl. forced + `TimeInput` sheet                                              | Wrong/substituted surface fails                                               |
| FR2      | Unit tests, native requested               | Seconds, step≠default, presets, no usable native: `native` stays native; `adaptive-native` falls back | Any fallback under `native`, or none under `adaptive-native`, fails           |
| FR3–FR4  | Unit tests: default, deprecated, dual-prop | Omitted; `touch`/`always`/`never` per component; both props, any order                                | Mapping drift (incl. `TimeInput:never→sheet`) or `nativePicker` winning fails |
| FR5      | Doc/type consistency tests                 | All 3 components, en + zh                                                                             | Documented-but-untyped value/default fails                                    |

## Decision log

### DEC-1 — Unify on `presentation`; values name the surface

**Reference:** `spec:AST-043/DEC-1`
**Decider:** imdreamrunner, 2026-09-24

Builders already meet `presentation` on menus/selectors for this question.
Rejected: literal rename to `'touch'|'always'|'never'` (hides desktop vs
sheet vs text field), one `astryx` value (same loss), shared `'adaptive'`
(hides sheet vs native), two coexisting props with overlapping meaning.

### DEC-2 — Default `adaptive-native`; deprecate, don't remove

**Reference:** `spec:AST-043/DEC-2`
**Decider:** imdreamrunner, 2026-09-24

`adaptive-native` is today's default renamed; `nativePicker` stays working
(FR3/FR4) — removal is the breaking event, not the rename. Rejected:
defaulting to `adaptive-bottom-sheet`, and `nativePicker` winning over
`presentation`.

### DEC-3 — Forced surfaces and `TimeInput` sheet approved

**Reference:** `spec:AST-043/DEC-3`
**Decider:** cixzhang, 2026-09-24

Forced `popover` on coarse, `bottom-sheet` on fine, and a new `TimeInput`
bottom sheet (the time half of `DateTimeInput`'s sheet) are approved new
surfaces. This closes the former open question on FR1's forced reach;
implementation may rely on FR1 as written.

## Open questions

- **OQ1 — Menu/selector rename** (`human-api`): later rename their `adaptive`
  to `adaptive-bottom-sheet` under this deprecation pattern? Out of scope.
