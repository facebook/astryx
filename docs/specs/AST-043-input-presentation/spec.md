---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-043
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
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
  hides that Astryx-on-desktop and Astryx-on-touch (bottom sheet) are
  different surfaces: `never` silently means both, selected by pointer.

This spec gives the three date/time inputs a `presentation` prop whose values
distinguish all three surfaces, preserves today's default, and deprecates —
but does not remove — `nativePicker`. No existing record owns this
cross-component vocabulary (searched: component contracts,
`architecture:public-component-api`, `family:input-fields`, `nativePicker` /
`presentation` / `AdaptivePresentation` in code and records).

## Non-goals

- Any surface's appearance, anatomy, interaction, eligibility, or fallback
  behavior — unchanged, owned by each component. This spec changes only which
  prop and values select a surface.
- Renaming menu/selector `presentation` or their `adaptive` (OQ2).
- Removing `nativePicker` — that would be breaking under `spec:AST-017` and
  needs its own record.
- Migration tooling — the implementing change follows `spec:AST-017` FR8; the
  mapping it must apply is FR3.

## Requirements

- **FR1 — Prop and values.** `DateInput`, `DateTimeInput`, and `TimeInput`
  MUST accept optional
  `presentation: 'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'`,
  default `'adaptive-native'`, resolving:

  | Value                   | Fine pointer   | Coarse pointer |
  | ----------------------- | -------------- | -------------- |
  | `popover`               | Astryx desktop | Astryx desktop |
  | `bottom-sheet`          | Astryx sheet   | Astryx sheet   |
  | `native`                | Native         | Native         |
  | `adaptive-bottom-sheet` | Astryx desktop | Astryx sheet   |
  | `adaptive-native`       | Astryx desktop | Native         |

  (Astryx desktop = the component's fine-pointer surface today; Astryx sheet =
  its coarse-pointer Astryx surface today; Native = the browser/OS picker.
  Coarse uses the inputs' existing pointer test, no width condition. Forced
  `popover`/`bottom-sheet` on the other pointer, and any sheet for
  `TimeInput`, are new reach the implementer must render as named — OQ1.)

- **FR2 — Default unchanged.** Omitting both props MUST behave exactly as
  today's default `nativePicker="touch"` — i.e. `adaptive-native`.

- **FR3 — `nativePicker` deprecated, keeps working.** `nativePicker` and its
  exported types MUST remain, marked `@deprecated`, resolving exactly as
  released:

  | `nativePicker` | As `presentation`       |
  | -------------- | ----------------------- |
  | `touch`        | `adaptive-native`       |
  | `always`       | `native`                |
  | `never`        | `adaptive-bottom-sheet` |

  Preserving it with equivalent meaning makes this nonbreaking
  (`spec:AST-017` FR4). Note the one intentional delta behind `never`:
  migrated `TimeInput` callsites get a sheet on coarse instead of today's
  typed field (OQ1); unmigrated callsites are unchanged.

- **FR4 — Precedence.** If both props are set, `presentation` MUST win and
  `nativePicker` MUST be ignored, regardless of order or pointer. A
  development-only warning SHOULD name the replacement (FR3) whenever
  `nativePicker` is used, and MUST NOT fire in production.

- **FR5 — Docs and types agree.** Each component's consumer docs (en + zh),
  exported types, and Storybook controls MUST show FR1 values/default and
  `nativePicker` only as deprecated with its FR3 replacement.

### Platform support

- Floor and unsupported behavior: unchanged (`spec:AST-013`, each component);
  no `presentation` value renders no picker.
- Browser evidence: each FR1 value on fine- and coarse-pointer browsers,
  because jsdom reports neither pointer type nor native pickers.

## Current-state impact

- `packages/core/src/{DateInput,DateTimeInput,TimeInput}`: add `presentation`,
  deprecate `nativePicker` (FR1–FR4); docs/types (FR5); implementing PR adds
  the `spec:AST-017` FR8 migration + nonbreaking Changeset.
- Menu/selector components: unchanged.

## Verification

| Contract | Verification                                 | Representative states                     | Mutation or failure expectation               |
| -------- | -------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| FR1–FR2  | Unit tests per input                         | 5 values × fine/coarse; omitted props     | Wrong surface or default fails                |
| FR3–FR4  | Unit tests: deprecated + dual-prop callsites | `touch`/`always`/`never`; both, any order | Mapping drift or `nativePicker` winning fails |
| FR5      | Doc/type consistency tests                   | All 3 components, en + zh                 | Documented-but-untyped value/default fails    |
| FR1      | Real-browser check                           | Forced + `TimeInput` sheet states (OQ1)   | Substituting another surface fails            |

## Decision log

### DEC-1 — Unify on `presentation`; values name the surface

**Reference:** `spec:AST-043/DEC-1`
**Decider:** imdreamrunner, 2026-09-24

Builders already meet `presentation` on menus/selectors for this question.
Rejected: literal rename to `'touch'|'always'|'never'` (hides desktop vs
sheet), one `astryx` value (same loss), shared `'adaptive'` (hides sheet vs
native), and two coexisting props with overlapping meaning.

### DEC-2 — Default `adaptive-native`; deprecate, don't remove

**Reference:** `spec:AST-043/DEC-2`
**Decider:** imdreamrunner, 2026-09-24

`adaptive-native` is today's default renamed, so nothing changes unless a
builder opts in. `nativePicker` stays working (FR3/FR4) — removal is the
breaking event, not the rename. Rejected: defaulting to
`adaptive-bottom-sheet` (changes every coarse consumer), and `nativePicker`
winning over `presentation` (breaks migrated dual-prop callsites).

## Open questions

- **OQ1 — Forced/sheet reach** (`human-design`): confirm Astryx sheet design
  for `TimeInput` (none today) and forced surfaces on the non-native pointer
  before implementation; without it FR1's forced values cannot ship.
- **OQ2 — Menu/selector rename** (`human-api`): later rename their `adaptive`
  to `adaptive-bottom-sheet` under this deprecation pattern? Out of scope.
