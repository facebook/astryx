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

A builder choosing how `DateInput`, `DateTimeInput`, or `TimeInput` presents
its picker today learns two vocabularies for one question — which surface
collects the value, on which pointer:

- `ContextMenu`, `DropdownMenu`, `MoreMenu`, `Selector`, and `MultiSelector`
  already answer with `presentation`
  (`'popover' | 'bottom-sheet' | 'adaptive'`).
- The three date/time inputs answer with `nativePicker`
  (`'touch' | 'always' | 'never'`), a name that describes one surface (the
  browser/OS picker) and hides the other two: Astryx's desktop surface and
  Astryx's bottom sheet are different surfaces, and `never` silently means
  both of them, selected by pointer.

This spec unifies the date/time inputs on `presentation`, with values that
name every surface distinctly, preserves the current default behavior, and
deprecates — but does not remove — `nativePicker`.

This record is a new system spec because no existing record owns the
cross-component picker-surface vocabulary: the component contracts own their
own props, `architecture:public-component-api` owns shared API shape but not
these values, and `family:input-fields` owns field chrome, not picker
surfaces. Current records and code were searched for `nativePicker`,
`presentation`, and `AdaptivePresentation` before drafting; the only owners
found are the per-component implementations named below.

## Non-goals

- Changing any resolved surface's appearance, anatomy, or interaction. The
  Astryx popover, Astryx bottom sheet, and native control keep their current
  design and behavior except where a newly reachable forced value (FR5)
  requires rendering an existing surface on a pointer it does not reach today.
- Renaming `presentation` on `ContextMenu`, `DropdownMenu`, `MoreMenu`,
  `Selector`, or `MultiSelector`, or changing their `adaptive` resolution.
  Their `adaptive` is semantically the `adaptive-bottom-sheet` policy below
  (with their own compact-width-plus-coarse-pointer trigger); aligning that
  name is a separate decision (OQ2).
- Removing `nativePicker`, its exported types, or any consumer callsite that
  uses them. Removal, if ever proposed, needs its own breaking-change record
  under `spec:AST-017`.
- Changing the pointer test that selects a touch surface, `min`/`max`
  forwarding, constraint enforcement on commit, formatting, or the
  seconds/increment/preset fallbacks in FR7.
- Equivalent internal implementations remain valid when they satisfy this
  contract. Internal files and components (for example the current native,
  pointer, and touch field implementations) are not renamed by this spec.

## Requirements

- **FR1 — One prop name.** `DateInput`, `DateTimeInput`, and `TimeInput` MUST
  accept `presentation` as the picker-surface policy prop. The prop MUST be
  optional and MUST default to `'adaptive-native'` (FR3).

- **FR2 — Five values, each naming a surface policy.** `presentation` MUST
  accept exactly `'popover' | 'bottom-sheet' | 'native' |
'adaptive-bottom-sheet' | 'adaptive-native'`, resolving per pointer
  (fine = primary pointer is not coarse; coarse = primary pointer is coarse,
  the inputs' existing test, with no width condition):

  | Value                   | Fine pointer        | Coarse pointer      |
  | ----------------------- | ------------------- | ------------------- |
  | `popover`               | Astryx desktop      | Astryx desktop      |
  | `bottom-sheet`          | Astryx bottom sheet | Astryx bottom sheet |
  | `native`                | Native              | Native              |
  | `adaptive-bottom-sheet` | Astryx desktop      | Astryx bottom sheet |
  | `adaptive-native`       | Astryx desktop      | Native              |

  where, per component:

  | Surface             | `DateInput`                    | `DateTimeInput`                               | `TimeInput`                   |
  | ------------------- | ------------------------------ | --------------------------------------------- | ----------------------------- |
  | Astryx desktop      | Typed field + calendar popover | Typed date/time fields + popovers             | Typed/combobox field          |
  | Astryx bottom sheet | BottomSheet calendar           | BottomSheet date/time wheels                  | BottomSheet time wheels (FR6) |
  | Native              | `<input type="date">`          | `<input type="date">` + `<input type="time">` | `<input type="time">`         |

- **FR3 — Default is behavior-identical to today.** Omitting `presentation`
  (and `nativePicker`) MUST resolve as `adaptive-native`, which is exactly
  the current default `nativePicker="touch"`: Astryx desktop on a fine
  pointer, native on a coarse pointer.

- **FR4 — `nativePicker` is deprecated and keeps working.** `nativePicker`
  and the exported `DateInputNativePicker`, `DateTimeInputNativePicker`, and
  `TimeInputNativePicker` types MUST remain accepted, marked deprecated in
  types and consumer docs, and MUST resolve exactly as released:

  | Deprecated `nativePicker` | Resolves as `presentation` |
  | ------------------------- | -------------------------- |
  | `touch`                   | `adaptive-native`          |
  | `always`                  | `native`                   |
  | `never`                   | `adaptive-bottom-sheet`    |

  Per `spec:AST-017` FR4, preserving the old prop with equivalent meaning
  makes this change nonbreaking. A development-only warning SHOULD name the
  replacement value when `nativePicker` is supplied. No release under this
  spec removes the prop.

- **FR5 — Precedence when both props are supplied.** When a callsite supplies
  both `presentation` and `nativePicker`, `presentation` MUST win,
  `nativePicker` MUST be ignored, and a development-only warning SHOULD say
  so. The outcome MUST NOT depend on prop order or pointer type.

- **FR6 — Forced values are new, explicit reach — not silent fallback.** The
  forced values reach surfaces the current props cannot select on that
  pointer: `popover` on a coarse pointer and `bottom-sheet` on a fine pointer
  (for `DateInput`/`DateTimeInput`), and any bottom-sheet surface for
  `TimeInput`, which today renders its typed field on coarse pointers under
  `nativePicker="never"`. Implementation MUST render the named Astryx surface
  in those states; it MUST NOT silently substitute the typed field, the other
  Astryx surface, or the native control. Consequently the FR4 mapping changes
  one released state: `TimeInput` with `nativePicker="never"` on a coarse
  pointer moves from the typed field to the bottom sheet once migrated
  (whether by codemod or by hand). That delta is intentional under the new
  vocabulary, is called out for owner approval (OQ1), and unmigrated
  `nativePicker="never"` callsites keep the typed field until they migrate —
  the deprecated prop's own resolution does not change.

- **FR7 — Native-surface eligibility fallbacks are preserved.** Requesting a
  native surface (`native`, or the coarse branch of `adaptive-native`) MUST
  retain the released Astryx fallbacks where the native control cannot
  express the contract: `hasSeconds`, a non-default increment/step, or (for
  `DateTimeInput`) preset time options keep the Astryx time field while the
  date segment may still go native. A browser without a usable native
  date/time control keeps the Astryx surface, as today.

- **FR8 — Consumer docs and types move together.** Each component's
  `.doc.mjs` (English and Chinese), exported prop types, and Storybook
  controls MUST present `presentation` with the FR2 values and the
  `adaptive-native` default, and MUST show `nativePicker` only as deprecated
  with its FR4 replacement. Any exported `*Presentation` type for these
  components MUST include all five values; a shared exported type is
  permitted but not required.

- **FR9 — Mechanical migration is provided.** `astryx upgrade` MUST rewrite
  literal `nativePicker` values using the FR4 table, MUST leave a callsite
  that already sets `presentation` with `presentation` winning (removing or
  flagging the dead `nativePicker`; see FR5), and MUST report — not guess —
  non-literal `nativePicker` expressions it cannot map value-by-value.

### Platform support

- Supported feature/engine floor: unchanged from the current inputs
  (`spec:AST-013`); the native branch requires the platform's
  `<input type="date">` / `<input type="time">`.
- Unsupported behavior: FR7 fallback to the Astryx surface; no state renders
  no picker.
- Browser evidence: real-browser checks on a fine-pointer desktop browser and
  a coarse-pointer mobile browser (or device emulation with a coarse primary
  pointer) for each value in FR2, because jsdom cannot report pointer type or
  draw native pickers.

## Current-state impact

- `packages/core/src/DateInput`, `DateTimeInput`, `TimeInput`: new
  `presentation` prop and types, deprecated `nativePicker`, FR5 precedence,
  FR6 forced-surface reach (including a `TimeInput` bottom sheet).
- Consumer docs: the three components' `.doc.mjs` files and Storybook stories
  switch their primary vocabulary to `presentation`.
- CLI/codemods: one `astryx upgrade` rewrite (FR9); a nonbreaking Changeset
  under `spec:AST-017` FR4/FR7 for `@astryxdesign/core` (and `@astryxdesign/cli`
  if the codemod ships there).
- Unchanged: `ContextMenu`, `DropdownMenu`, `MoreMenu`, `Selector`,
  `MultiSelector` props and resolution; `architecture:public-component-api`
  and `family:input-fields` gain a reference to this record only if it is
  promoted to `current`.

## Verification

| Contract | Verification                                                        | Representative states                                                    | Mutation or failure expectation                                         |
| -------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FR1–FR3  | Component unit tests per input                                      | Each of 5 values × fine/coarse; omitted prop                             | Dropping a value or changing the default fails a surface assertion      |
| FR4–FR5  | Unit tests rendering deprecated and dual-prop callsites             | `touch`/`always`/`never`; both props, both orders                        | Resolving `nativePicker` over `presentation`, or a mapping drift, fails |
| FR6      | Unit tests + real-browser check                                     | `popover` on coarse, `bottom-sheet` on fine, `TimeInput` sheet on coarse | Silent typed-field substitution fails the named-surface assertion       |
| FR7      | Existing native-picker test suites, extended                        | Seconds, custom increment, preset options, native requested              | Losing the Astryx fallback fails existing tests                         |
| FR8      | Doc/type consistency tests (`docPropLiterals`, `docPropReferences`) | All three components, en + zh docs                                       | A value or default documented but not typed (or vice versa) fails       |
| FR9      | Codemod fixture tests                                               | Literal, dual-prop, and dynamic `nativePicker` callsites                 | An unmapped literal, or a guessed dynamic rewrite, fails                |

## Decision log

### DEC-1 — Rename by unifying on `presentation`, not by aliasing one surface

**Reference:** `spec:AST-043/DEC-1`
**Decider:** imdreamrunner, 2026-09-24

The date/time inputs adopt the menu/selector prop name `presentation`
because builders already meet it there for the same question. The values
cannot be shared verbatim with menus/selectors: those components have no
native surface, and these inputs have no anchored menu. Rejected:
keeping `nativePicker` and adding a second prop with overlapping meaning
(two owners for one policy), and reusing `'adaptive'` for both adaptive
policies (it would hide the exact distinction — Astryx sheet vs native —
that builders asked to see).

### DEC-2 — Default to `adaptive-native`, preserving today's default

**Reference:** `spec:AST-043/DEC-2`
**Decider:** imdreamrunner, 2026-09-24

`adaptive-native` is `nativePicker="touch"` renamed, so no consumer's
resolved surface changes unless they opt in. Rejected: defaulting to
`adaptive-bottom-sheet` (Astryx everywhere) — a visual and behavioral change
for every coarse-pointer consumer, unrelated to the rename.

### DEC-3 — Deprecate `nativePicker`; do not remove it in this change

**Reference:** `spec:AST-043/DEC-3`
**Decider:** imdreamrunner, 2026-09-24

The deprecated prop keeps working with its released meaning (FR4), with
`presentation` winning when both are set (FR5). Under `spec:AST-017` FR4
this keeps the rename nonbreaking; removal would be the breaking event and
needs its own record and codemod evidence. Rejected: removing `nativePicker`
in the implementing change, and letting `nativePicker` win for back-compat
(it would make the new prop unreliable exactly at migrated callsites that
still pass the old one).

## Open questions

- **OQ1 — `TimeInput` bottom sheet** (`human-design`): DEC-1/FR6 give
  `TimeInput` an Astryx bottom-sheet time-wheel surface it does not have
  today, and move migrated `nativePicker="never"` coarse-pointer callsites
  from the typed field to that sheet. A design owner must confirm the sheet
  (anatomy, wheels, Save/Reset chrome) before implementation; without it,
  `bottom-sheet` for `TimeInput` cannot ship as specified.
- **OQ2 — Menu/selector `adaptive` naming** (`human-api`): should
  `ContextMenu`, `DropdownMenu`, `MoreMenu`, `Selector`, and `MultiSelector`
  later rename `adaptive` to `adaptive-bottom-sheet` under the same
  deprecation pattern? Out of scope here; recorded so the vocabulary drift
  is a decision, not an accident.
