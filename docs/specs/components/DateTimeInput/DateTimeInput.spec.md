---
schema_version: 3
template_version: 7
kind: component
id: component:DateTimeInput
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/DateTimeInput/DateTimeInput.test.tsx,
    packages/core/src/DateTimeInput/DateTimeInputTouch.test.tsx,
    packages/core/src/DateTimeInput/NativePickerSegments.test.tsx,
    packages/core/src/DateTimeInput/Presentation.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:input-fields, family:overlay-dismissal]
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: [spec:AST-043]
---

# DateTimeInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One controlled ISO date-time value presented through coordinated date and time segments; `presentation` selects Astryx, native, or adaptive picker surfaces.                                              |
| Behavior                | Date and time changes emit one combined value; clear emits `undefined`; controlled empty state remains empty in every rendered picker.                                                                    |
| End-user impact         | People selecting a date and time see one value reflected consistently in the closed field and the active picker, including after clearing.                                                                |
| Builder impact          | None.                                                                                                                                                                                                     |
| Compatibility/readiness | Released defaults and deprecated `nativePicker` behavior remain unchanged. The presentation matrix is governed by current `spec:AST-043`; component-local observations remain draft pending owner review. |
| Review checks           | Reject competing picker selection, date/time output that is not one valid combined value, presentation precedence drift, lost per-segment fallback, or broken segment accessibility.                      |
| Governing rules         | `spec:AST-043`, `family:input-fields`, `family:overlay-dismissal`, and objective platform accessibility standards.                                                                                        |

This table is a review projection; the body below is authoritative.

## Intent

DateTimeInput presents one controlled date-time value as coordinated date and time
segments under one field label. Depending on `presentation`, the segments use
Astryx popovers, one coordinated bottom sheet, browser or operating-system inputs,
or pointer-adaptive combinations of those surfaces.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: no public surface change; existing types, defaults,
  callbacks, roles, and exports remain stable
- Controlled/uncontrolled behavior: DateTimeInput remains controlled; `undefined`
  represents no committed date-time value
- Migration decision: none; picker presentation and deprecated `nativePicker`
  compatibility remain governed by `spec:AST-043`

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Coordinating date and time segments into one controlled ISO date-time value.
- Choosing and composing the date and time surfaces selected by `presentation`.
- Applying component-local date-time bounds, date constraints, time precision,
  typed-time stepping, and optional preset-time behavior.
- Emitting `onChange` before an optional optimistic `changeAction`.

**Does not own / non-goals**

- Field label, description, status, disabled-reason, and clear-button presentation —
  owned by `component:Field` and `component:FieldStatus`.
- Calendar-grid rendering and date-cell interaction — owned by
  `component:Calendar`.
- Popover and sheet hosting or dismissal — owned by the composed layer components
  and `family:overlay-dismissal`.
- Cross-component picker-presentation vocabulary and deprecated-prop mapping —
  owned by `spec:AST-043`.

## Public concepts

| Concept                 | Closed values or states                                                         | Meaning                                                                     | Availability by variant/orientation/state                         | Default           | Owner                     | Stability  | Invalid-value behavior                         |
| ----------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- | ------------------------- | ---------- | ---------------------------------------------- |
| Committed date-time     | valid ISO local date-time string or `undefined`                                 | The one controlled value reflected by both segments and active picker.      | Every presentation.                                               | `undefined`       | `component:DateTimeInput` | Stable     | Rejected edits revert without emitting change. |
| Picker presentation     | `popover`, `bottom-sheet`, `native`, `adaptive-bottom-sheet`, `adaptive-native` | Selects which surface collects date and time.                               | Every render; pointer adaptation applies only to adaptive values. | `adaptive-native` | `spec:AST-043`            | Stable     | Type-rejected.                                 |
| Legacy picker selection | `touch`, `always`, `never`                                                      | Deprecated compatibility input mapped by `spec:AST-043`; presentation wins. | When `presentation` is omitted.                                   | `touch`           | `spec:AST-043`            | Deprecated | Type-rejected.                                 |
| Time precision          | minute-only or seconds                                                          | Controls value precision and whether native time can represent it.          | Every presentation; native fallback follows `spec:AST-043`.       | minute-only       | `component:DateTimeInput` | Stable     | Type-rejected.                                 |
| Preset-time cadence     | omitted, `5`, `10`, `15`, `30`, or `60` minutes                                 | Adds a fine-pointer time listbox without restricting typed entry.           | Astryx pointer time field only.                                   | omitted           | `component:DateTimeInput` | Stable     | Type-rejected.                                 |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                       | Basis                                                                 | Draft review state                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| FR1 | DateTimeInput MUST reflect one controlled date-time value across its visible segments and active picker, and MUST NOT reveal a competing selected date after the parent accepts a clear.                                                  | Public docs, controlled component seam, current source, focused tests | Verified observation; owner approval pending           |
| FR2 | Every committed date or time change MUST emit one valid combined ISO date-time value; clearing MUST emit `undefined`; changing time while no date is committed MUST emit nothing.                                                         | Public types, docs, current source, focused tests                     | Verified observation; owner approval pending           |
| FR3 | `presentation`, deprecated `nativePicker`, precedence, pointer adaptation, forced surfaces, and per-segment native fallbacks MUST follow `spec:AST-043` FR1–FR4.                                                                          | `spec:AST-043`                                                        | Inherited current authority                            |
| FR4 | When `changeAction` is present, every value-change path MUST call `onChange` first, show the proposed controlled value optimistically, and contribute to one busy state until the controlled value accepts or replaces it.                | `family:input-fields/FR6`                                             | Inherited current authority                            |
| FR5 | The two pointer segments share one row while each retains its intrinsic basis; when the container is narrower, flex wrapping moves them into separate full-width rows.                                                                    | Public docs, current source, focused layout tests                     | Verify rendered geometry; class-level behavior covered |
| FR6 | Date-time bounds and date constraints MUST prevent invalid commits. Native controls MAY receive platform hints, but JavaScript validation remains the final commit boundary; calendar-only options MAY be unavailable on native surfaces. | Public docs, current source, focused presentation tests               | Verified observation; owner approval pending           |
| FR7 | A preset-time listbox MUST remain optional, preserve typed entry, expose one selected option independently from keyboard highlight, and limit offered values to the selected date's effective minimum and maximum.                        | Public docs, current source, focused interaction tests                | Verified observation; owner approval pending           |

### Allowed variation

- **AV1 — Surface.** The caller may force Astryx, native, or bottom-sheet surfaces,
  or choose an adaptive presentation within the current system-spec matrix.
- **AV2 — Date and time formatting.** Locale, hour format, seconds, week start,
  month count, and preset cadence may vary through their documented inputs.
- **AV3 — Optional field support.** Clear, loading, status, disabled reason,
  description, and label visibility may be omitted without changing value ownership.

### Representative states

| State                       | Required invariant                                                                                        | Allowed variation                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Empty                       | Both segments and every active picker expose no committed selection.                                      | Placeholder and selected surface.          |
| Date-time value             | Date segment, time segment, and active picker reflect the same committed value.                           | Locale, hour format, and time precision.   |
| Cleared after picker change | Closed field is empty and reopening the picker reveals no selected date or retained committed time.       | Picker focus date may remain navigational. |
| Busy                        | Proposed value remains visible; mutation paths are unavailable; both editable segments expose busy.       | Explicit loading or pending action source. |
| Focusable disabled          | Both segments remain focusable enough to expose the reason while every value-changing path stays blocked. | Disabled-reason text.                      |

### Transformation and precedence order

- **ORD1 — Picker selection.** Resolve `presentation` before deprecated
  `nativePicker`, apply pointer adaptation, then apply only the per-segment native
  fallbacks permitted by `spec:AST-043`.
- **ORD2 — Value mutation.** Validate the proposed segment value, combine it with
  its committed counterpart, call `onChange`, present the optimistic combined
  value, then run `changeAction` in a transition.

### Performance and resources

- **PR1 — Preset options.** The time listbox mounts option nodes only while open;
  omitted preset cadence leaves no listbox nodes or combobox semantics.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Field naming.** The date segment is named by the field label; the time
  segment uses `timeLabel` or a localized label-derived fallback. Description,
  status, and disabled-reason text remain referenced from both segments.
- **AR2 — Picker semantics.** The Astryx date segment is a combobox controlling a
  dialog; the optional preset-time field is a combobox controlling one listbox.
  Omitted preset cadence leaves the time field without combobox semantics.
- **AR3 — Keyboard and focus.** Documented keyboard activation, date-popover
  dismissal, preset-time navigation, focus containment, and focus restoration
  remain operable on their active surfaces.
- **AR4 — Required, invalid, busy, and disabled.** Both editable segments expose
  applicable required, invalid, busy, and disabled states; a focusable disabled
  reason never re-enables mutation.

## Design relationships

| Anatomy or state     | Design requirement                                                 | Representation authority                        | Hierarchy role | Component contract |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | -------------- | ------------------ |
| Segment row          | Groups the two bordered segments and wraps them as one layout row. | Current source and public docs                  | Prominent      | FR1, FR5           |
| Date segment         | Presents date text and access to the active date picker.           | Current source and public docs                  | Prominent      | FR1–FR3, AR1–AR3   |
| Time segment         | Presents time text and access to the active time surface.          | Current source and public docs                  | Prominent      | FR1–FR3, AR1–AR3   |
| Picker surfaces      | Collect date and time without becoming competing values.           | `spec:AST-043` and composed component contracts | Supporting     | FR1–FR3            |
| Busy/disabled/status | Uses shared input-family representations.                          | `family:input-fields`                           | Supporting     | FR4, AR4           |

The component implements design requirements without copying their rationale.
An unsettled representation remains a human decision; principles do not let an
agent invent the answer.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Segment row": {"target": "date-time-input"},
  "Date input": {"target": "date-time-input-date-segment"},
  "Calendar icon": {"target": "date-time-input-toggle-icon"},
  "Date picker": {
    "none": {
      "reason": "reachability-gap: Active picker paint is owned by Calendar, Popover, BottomSheet, or the browser-native control, so no single DateTimeInput target reaches every presentation."
    }
  },
  "Time input": {"target": "date-time-input-time-segment"},
  "Clock icon": {"target": "date-time-input-clock-icon"},
  "Time options popover": {"target": "date-time-input-time-listbox"},
  "Time option": {"target": "date-time-input-time-option"},
  "Clear button": {
    "delegatesTo": {"owner": "component:Field", "target": "input-clear-button"}
  },
  "Status message": {
    "delegatesTo": {"owner": "component:FieldStatus", "target": "field-status"}
  }
}
```

The calendar-toggle target reflects expanded or collapsed state. The time-options
listbox owns option rows through the `date-time-input-time-option` target; the
leading clock glyph uses `date-time-input-clock-icon`.

## Family and system relationships

- `family:input-fields` owns shared field sizing, end-control geometry, loading,
  optimistic change actions, status placement, disabled reasons, and iOS text-entry
  focus-zoom behavior.
- `family:overlay-dismissal` owns the Popover and BottomSheet dismissal stack.
- `architecture:component-theming-surface` owns target admission, state
  reflection, and anatomy mapping.
- `spec:AST-043` owns picker-presentation values, defaults, precedence,
  compatibility mapping, forced surfaces, and native fallback rules.

## Verification map

| Contract            | Verification                                                                            | Representative states                                         | Mutation or failure expectation                                                                                                      | Audit section                     |
| ------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| FR1–FR2             | `DateTimeInput.test.tsx`                                                                | empty, calendar selection, typed date/time, clear             | A stale Calendar selection, partial output, or invalid mutation makes a public-state test fail.                                      | `audit:DateTimeInput/behavior`    |
| FR3, FR6            | `Presentation.test.tsx`, `NativePickerSegments.test.tsx`, `DateTimeInputTouch.test.tsx` | forced, adaptive, legacy, native fallback, constrained commit | A substituted surface, precedence drift, or invalid commit makes a presentation test fail.                                           | `audit:DateTimeInput/surfaces`    |
| FR4, AR4            | `DateTimeInput.test.tsx`, `DateTimeInputTouch.test.tsx`                                 | pending, loading, disabled reason                             | Mutation during busy/disabled state or stale optimistic output makes a state test fail.                                              | `audit:DateTimeInput/state`       |
| FR5                 | `DateTimeInput.test.tsx`                                                                | intrinsic row, narrow-container wrap classes                  | Removing the intrinsic basis or wrap styles makes the class-level layout assertions fail; rendered geometry remains review evidence. | `audit:DateTimeInput/layout`      |
| FR7, AR1–AR3        | `DateTimeInput.test.tsx`, `DateTimeInputTouch.test.tsx`                                 | popovers, time options, keyboard/focus                        | Wrong role, name, state, keyboard behavior, or focus behavior makes a focused interaction test fail.                                 | `audit:DateTimeInput/interaction` |
| Theming anatomy map | `scripts/check-knowledge.mjs`, `themingTargets.test.ts`                                 | root, segments, icons, listbox, options                       | Missing, undocumented, or wrongly placed targets fail knowledge or target checks.                                                    | `audit:DateTimeInput/theming`     |

## Decision log

No component-local decision is asserted by this draft. Current cross-component
picker decisions remain in `spec:AST-043`.

## Open questions

None. Owner review may accept, amend, or reject the observational component-local
rows without changing inherited current authority.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit
results, implementation steps, Calendar/Field/layer contracts, or the
picker-presentation system specification.
