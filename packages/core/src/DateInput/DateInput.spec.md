---
schema_version: 3
template_version: 7
kind: component
id: component:DateInput
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/DateInput/DateInput.test.tsx,
    packages/core/src/DateInput/DateInputTouch.test.tsx,
    packages/core/src/DateInput/NativeDateField.test.tsx,
    packages/core/src/DateInput/Presentation.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:input-fields, family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-043]
---

# DateInput component contract

This draft records shipped behavior plus one objective conformance fix already settled
by `family:input-fields/FR6`. It does not approve a new public API, default,
compatibility promise, ownership boundary, or visual direction.

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | API shape and defaults remain unchanged. The native-picker surface now follows the existing `changeAction` order, optimistic-value, and busy-feedback contract.                                                               |
| Behavior                | `presentation` selects the picker surface; an omitted value remains `adaptive-native`; `presentation` wins over deprecated `nativePicker`; every committed path emits the same controlled ISO-date value and action feedback. |
| End-user impact         | People can type or pick one date using a surface suited to the primary pointer; native-picker saves now run instead of being silently dropped.                                                                                |
| Builder impact          | Existing native DateInput `changeAction` handlers now run after `onChange` and receive optimistic busy feedback. No API or migration work is required.                                                                        |
| Compatibility/readiness | Compatible patch correction under the current input-field family rule. Released defaults and controlled ownership are preserved; exact-head browser evidence remains audit evidence rather than product authority.            |
| Review checks           | Reject a surface-mapping change, lost constraint, callback-order change, unlabeled field, unreachable disabled reason, changed close behavior, or a theming target placed on the wrong owner.                                 |
| Governing rules         | `spec:AST-043/FR1–FR5`; `family:input-fields/FR1–FR6, FR8–FR9`; `family:overlay-dismissal/FR1–FR7`, including its recorded BottomSheet adoption gap; the three architecture records linked above.                             |

This table is a review projection; the body below is authoritative only after this
record becomes `current`.

## Intent

DateInput presents one controlled calendar date through a labeled input-field
surface. A person may type the value or use a Calendar, bottom-sheet calendar, or
browser/OS date picker selected by the public presentation contract.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: compatible patch; no API shape or default changes, and the native
  surface now adopts the existing `changeAction` contract instead of dropping it
- Controlled/uncontrolled behavior: unchanged; DateInput remains controlled by
  `value`, with `undefined` representing no selected date
- Migration decision: `spec:AST-043/DEC-1` and `spec:AST-043/DEC-2` own the
  `presentation` vocabulary, default, deprecated `nativePicker` mapping, and
  precedence

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Selecting the pointer, bottom-sheet, or native field surface from the resolved
  public presentation.
- Parsing typed dates, formatting committed dates, enforcing DateInput constraints,
  and emitting one controlled ISO date or `undefined`.
- The DateInput field wrapper, calendar-toggle affordance, clear composition, and
  focus handoff between those controls and the selected picker surface.
- DateInput-specific composition of Field, Calendar, Popover, BottomSheet, and the
  browser/OS date control.

**Does not own / non-goals**

- Label, description, status, disabled-reason, width, and shared clear-button
  presentation — owned by `component:Field`, `component:FieldStatus`, and
  `family:input-fields`.
- Calendar-grid dates, navigation, and selection semantics — owned by
  `component:Calendar`.
- Popover hosting and topmost dismissal — owned by `component:Popover` and
  `family:overlay-dismissal`.
- Bottom-sheet hosting and dismissal — owned by `component:BottomSheet` and the
  overlay-dismissal family. The bottom-sheet surface inherits BottomSheet's recorded
  shared-dismissal adoption gap.
- Cross-component picker vocabulary and deprecated-prop migration — owned by
  `spec:AST-043`.
- Browser/OS picker appearance, locale, momentum, or hit areas.

## Public concepts

| Concept                 | Closed values or states                                                         | Meaning                                                    | Availability by variant/orientation/state                                                                                                  | Default           | Owner                                           | Stability            | Invalid-value behavior                                                                  |
| ----------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| selected date           | `undefined` or `YYYY-MM-DD` ISO date                                            | Controlled committed calendar date                         | Every surface                                                                                                                              | `undefined`       | `component:DateInput`                           | stable               | Types reject other values; unparseable typed text is announced and reverts on commit    |
| presentation            | `popover`, `bottom-sheet`, `native`, `adaptive-bottom-sheet`, `adaptive-native` | Surface that collects the date                             | Every pointer; adaptive values resolve by primary pointer                                                                                  | `adaptive-native` | `spec:AST-043`                                  | stable               | Types reject other values; DateInput has no text-only presentation                      |
| legacy native selection | `touch`, `always`, `never`                                                      | Deprecated mapping to the released picker behavior         | Used only when `presentation` is absent                                                                                                    | `touch` behavior  | `spec:AST-043`                                  | deprecated, retained | `presentation` wins when both props are present                                         |
| committed display       | `date`, `date_long`, `date_weekday`, `system_date`, or formatter function       | Display shape for the committed ISO date                   | Closed field on every surface; never rewrites in-progress typed text                                                                       | `date_long`       | `component:DateInput`                           | stable               | Function output is displayed; unparsable output cannot be re-committed as typed text    |
| selectable range        | optional `min`, `max`, and date-constraint predicates                           | Dates that may commit                                      | Every surface; native surfaces validate on commit when the OS cannot disable them                                                          | unbounded         | `component:DateInput` with `component:Calendar` | stable               | A rejected date does not replace the controlled value and is announced where applicable |
| calendar configuration  | one or two popover months; week start Sunday through Saturday                   | Calendar-grid layout                                       | Week start applies to popover and bottom-sheet surfaces; month count applies only to the popover; neither is expressible by native pickers | one month, Sunday | `component:DateInput` with `component:Calendar` | stable               | Types close the value set                                                               |
| field state             | enabled, disabled, disabled with reason, busy, optional, required, status       | Shared field semantics and supporting presentation         | Every surface, with surface-specific control mechanics                                                                                     | enabled, not busy | `family:input-fields`                           | stable               | Conflicting optional/required resolution follows the shared Field owner                 |
| clear affordance        | absent or present while a committed value exists                                | Emits `undefined` and preserves the field interaction path | Every surface when `hasClear` and a value are present; hidden while disabled or busy                                                       | absent            | `component:DateInput` with `component:Field`    | stable               | No control renders when there is no value                                               |
| field shell             | standalone Field or admitted InputGroup child                                   | Ownership of label, status, and outer geometry             | Pointer surface supports both; other surfaces preserve the same public field semantics                                                     | standalone        | `family:input-fields`                           | stable               | InputGroup context selects grouped adaptation                                           |

## Behavioral and layout contract

Draft requirements identify their evidence basis; they do not turn observation into
approved policy.

| ID   | Candidate invariant                                                                                                                                                                                                                       | Basis                                                           | Draft review state                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| FR1  | DateInput MUST present the controlled ISO `value` and emit `onChange` with the next ISO date or `undefined` without maintaining a competing committed value.                                                                              | Current source, docs, and focused tests                         | Verified shipped behavior                 |
| FR2  | The five `presentation` values MUST resolve to the fine/coarse surfaces in `spec:AST-043/FR1`; omitting both presentation props MUST preserve `adaptive-native`.                                                                          | `spec:AST-043/FR1–FR3`; Presentation tests                      | Settled by current system authority       |
| FR3  | Explicit `presentation` MUST outrank deprecated `nativePicker`; the legacy values MUST retain their mappings and development-only warning from `spec:AST-043/FR3–FR4`.                                                                    | Current source, docs, and Presentation tests                    | Settled by current system authority       |
| FR4  | Adaptive resolution MUST use the primary pointer rather than viewport width or any-pointer availability, so tablets receive a touch surface and touchscreen laptops retain the typable field.                                             | Current source, consumer docs, and surface-selection tests      | Verified shipped behavior                 |
| FR5  | Text, Calendar, bottom-sheet, and native commit paths MUST enforce `min`, `max`, and `dateConstraints`; a rejected value MUST NOT replace the controlled value.                                                                           | Current source and all four focused suites                      | Verified shipped behavior                 |
| FR6  | Named committed formats MUST follow the InternationalizationProvider locale and shared Timestamp vocabulary; formatting MUST NOT rewrite in-progress typed text.                                                                          | Current source, docs, locale tests, `spec:AST-043/FR5`          | Verified shipped behavior                 |
| FR7  | Every value-change path MUST call `onChange` before `changeAction`, present the proposed value optimistically, and expose one busy state while the Action is pending.                                                                     | `family:input-fields/FR6`; current source and focused tests     | Settled shared rule and verified adoption |
| FR8  | The pointer field MUST open its Calendar from the input, calendar toggle, ArrowDown, or Alt+ArrowDown; Popover dismissal and focus return MUST remain owned by the shared Popover path.                                                   | Current source, Popover composition, keyboard/focus tests       | Verified shipped behavior                 |
| FR9  | A pointer-surface Calendar selection MUST commit and close its Popover; a bottom-sheet Calendar selection MUST remain editable in the open sheet until Save closes the surface.                                                           | Current source and pointer/touch tests                          | Verified shipped behavior                 |
| FR10 | Standalone mode MUST compose Field; admitted InputGroup mode MUST remove competing Field chrome while preserving name, description, value, keyboard, focus, and editing semantics.                                                        | `family:input-fields/FR3`; current source and InputGroup tests  | Settled shared rule and verified adoption |
| FR11 | Clear MUST emit `undefined` through the ordinary change pipeline. The pointer and bottom-sheet surfaces restore field focus using their shipped timing; the native surface MUST NOT reclaim focus because doing so reopens the OS picker. | Current source and focused clear tests                          | Verified shipped behavior                 |
| FR12 | Disabled-with-reason MUST remain focusable enough to expose its explanation while blocking typing, calendar activation, and value mutation; ordinary disabled and busy states remain inactive.                                            | `family:input-fields/FR4–FR5`; current source and focused tests | Settled shared rule and verified adoption |

### Allowed variation

- **AV1 — Field presentation.** Label visibility, description, required/optional
  indicators, status placement, size, explicit width, and supported InputGroup
  composition may vary without changing the selected date.
- **AV2 — Date reachability.** Bounds, custom predicates, week start, month count,
  placeholder, and committed display format may vary within their public domains.
- **AV3 — Surface selection.** A caller may force any supported surface or retain the
  adaptive default; the resulting date value and shared field semantics remain the
  same.
- **AV4 — Theme output.** Themes may restyle admitted DateInput targets while shared
  Field, Calendar, Popover, BottomSheet, Icon, and clear-button owners retain their
  own targets and semantics.

### Representative states

| State              | Required invariant                                                                             | Allowed variation                  |
| ------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------- |
| empty rest         | Labelled field shows the placeholder and calendar affordance without a committed value.        | Label, placeholder, size, width    |
| committed rest     | Field displays the controlled value in the selected committed format.                          | Format and locale                  |
| typing             | Raw typed text remains visible until commit or reversion.                                      | Parseable text form and locale     |
| invalid typed text | Field reflects invalid state, announces the error, and preserves the prior committed value.    | Invalid text                       |
| constrained date   | Unreachable dates cannot commit on any surface.                                                | Bound or predicate source          |
| popover open       | Input reflects expanded dialog state and the Calendar is reachable by pointer and keyboard.    | Month count and week start         |
| bottom sheet open  | Touch calendar remains open across date corrections until Save.                                | Visible month and wheel state      |
| native open/closed | Real date input retains its labelled controlled value while the browser/OS owns picker chrome. | Engine-provided picker             |
| disabled           | Mutation and activation are blocked.                                                           | With or without a reason           |
| busy               | Value interaction is blocked, `aria-busy` is exposed, and one Spinner is visible.              | Explicit loading or pending Action |
| clearable          | A committed value has one labelled clear action that emits `undefined`.                        | Surface and value                  |
| status             | Error, warning, or success remains named and uses shared status presentation.                  | Status type, message, placement    |
| InputGroup         | Group owns outer field chrome while DateInput preserves its field semantics.                   | Group prefix or suffix content     |

### Transformation and precedence order

- **ORD1 — Surface.** Resolve explicit `presentation`; otherwise map deprecated
  `nativePicker`; otherwise use `adaptive-native`; then resolve adaptive values from
  the primary pointer.
- **ORD2 — Display.** While editing, display pending typed text; otherwise format the
  controlled or optimistic ISO value with the selected format and provider locale.
- **ORD3 — Commit.** Parse or receive the proposed date, reject it when constrained,
  call `onChange`, then start `changeAction` with the same proposed value and busy
  presentation.
- **ORD4 — Clear.** Emit `undefined` through ORD3, then apply the selected surface's
  shipped focus policy: pointer and bottom-sheet fields reclaim focus, while the native
  field does not reopen the OS picker.

### Performance and resources

- **PR1 — Bounded calendar window.** The bottom-sheet calendar mounts a bounded window
  of month panes around the visible month rather than the complete reachable century.
- **PR2 — Scroll work.** Scroll-driven measurement and selection updates remain
  animation-frame throttled or settle-driven; listeners, frames, timers, and observers
  are cleaned up on deactivation or unmount.

## Accessibility contract

- **AR1 — Field relationships.** Every surface keeps an accessible label; required,
  description, status, disabled-reason, and busy relationships remain programmatically
  exposed through the shared Field contract.
- **AR2 — Pointer combobox.** The typable field exposes combobox state and a dialog
  popup; ArrowDown and Alt+ArrowDown open it, Escape dismisses it outside active IME
  composition, and focus is not reclaimed from an intentional destination.
- **AR3 — Validation.** Invalid typed or native selections are exposed without color
  alone; rejected typed input uses an assertive alert and native rejection remains
  described to assistive technology.
- **AR4 — Disabled reason.** A disabled field with a reason remains focusable and
  described while all value mutation and picker activation stay blocked.
- **AR5 — Native control.** The browser/OS date input remains the labelled value owner;
  the painted committed-value overlay is excluded from the accessibility tree.
- **AR6 — Touch calendar.** The bottom-sheet Calendar preserves one reachable day per
  month, arrow-key date movement, named weekday columns, selected/today semantics,
  single-tab-stop wheels, and exactly one reachable footer action for the visible
  surface.
- **AR7 — Directionality.** DateInput's own calendar and clear controls exchange logical
  inline sides in RTL while preserving their labels and meanings; Calendar navigation
  remains owned and verified by `component:Calendar`.

## Design relationships

| Anatomy or state                 | Design requirement                                                               | Representation authority                    | Hierarchy role | Component contract |
| -------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- | -------------- | ------------------ |
| Label and supporting text        | Shared Field hierarchy surrounds one coherent input boundary.                    | `family:input-fields` and `component:Field` | Supporting     | FR10, AR1          |
| Field surface                    | One stable bordered input surface contains value and end controls.               | `family:input-fields/FR1–FR2`               | Prominent      | FR1, FR7, FR10     |
| Calendar affordance              | Communicates the picker path without replacing typed entry.                      | Current source and consumer docs            | Supporting     | FR8                |
| Calendar popover                 | Presents date selection while preserving Field ownership.                        | `component:Calendar`, `component:Popover`   | Prominent      | FR5, FR8–FR9       |
| Bottom-sheet calendar            | Presents the same date contract for a coarse pointer.                            | Current source and `spec:AST-043`           | Prominent      | FR2, FR4, FR9      |
| Native picker                    | Hands picker chrome to the browser/OS while retaining DateInput field semantics. | `spec:AST-043`, browser/OS                  | Prominent      | FR2–FR6, AR5       |
| Clear, busy, and status controls | Use the shared input-family end-control and status relationships.                | `family:input-fields` and shared primitives | Supporting     | FR7, FR11–FR12     |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Text input": {"target": "date-input"},
  "Calendar icon": {"target": "date-input-toggle-icon"},
  "Calendar popover": {
    "delegatesTo": {"owner": "component:Popover", "target": "popover"}
  },
  "Clear button": {
    "delegatesTo": {"owner": "component:Field", "target": "input-clear-button"}
  },
  "Status message": {
    "delegatesTo": {"owner": "component:FieldStatus", "target": "field-status"}
  }
}
```

The `date-input` target owns the composite field surface. The
`date-input-toggle-icon` target reflects collapsed and expanded states on the icon
itself. The deprecated `date-input-clear-icon` alias remains compatibility metadata;
the shared `input-clear-icon` target owns current clear-glyph theming.

## Family and system relationships

- `family:input-fields` owns stable field sizing, end-control space, grouped
  adaptation, disabled reasons, loading, Transition Actions, status placement, and
  the iOS-only focus-zoom floor; DateInput adopts every listed concept.
- `family:overlay-dismissal` owns topmost Popover and BottomSheet dismissal. DateInput's
  Popover path uses the shared owner; its bottom-sheet path inherits BottomSheet's
  recorded adoption gap. DateInput owns only selection, open-state requests, and focus
  policy.
- `spec:AST-043` owns the picker presentation vocabulary, default, native fallback,
  deprecated mapping, and precedence.
- `architecture:component-theming-surface` owns target admission, painting-element
  placement, state reflection, and anatomy mapping.
- `architecture:interaction-modality` owns input-modality principles; DateInput uses
  the primary pointer to choose an interaction surface rather than a width breakpoint.
- `architecture:public-component-api` owns the package/export and public-prop boundary.

## Verification map

| Contract                                             | Verification                                                                   | Representative states                                                                                    | Mutation or failure expectation                                                                    | Audit section                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1, FR5–FR8, FR10–FR12; AR1–AR4                     | `DateInput.test.tsx`                                                           | empty, valued, typing, invalid, constrained, open, disabled, busy, clear, status, grouped                | Value, callbacks, ARIA, disabled guard, focus, or shared-field composition drifts                  | `audit:DateInput/pointer-field` |
| FR2–FR4                                              | `Presentation.test.tsx`, `NativeDateField.test.tsx`, `DateInputTouch.test.tsx` | every presentation, omitted props, every deprecated mapping, dual props, fine/coarse, touchscreen laptop | A value resolves to the wrong surface, width affects modality, or legacy behavior wins incorrectly | `audit:DateInput/presentation`  |
| FR5–FR7; AR1, AR3–AR5                                | `NativeDateField.test.tsx`                                                     | empty, valued, focused, constrained, disabled, clear, formatted, locale                                  | Native commit, overlay, label, constraint, or focus reconciliation drifts                          | `audit:DateInput/native`        |
| FR1, FR4–FR7, FR9, FR11–FR12; AR1, AR4, AR6; PR1–PR2 | `DateInputTouch.test.tsx`                                                      | closed/open, month grid, selection correction, wheels, bounds, keyboard, swipe, mouse drag, clear, busy  | Touch value parity, bounded rendering, focus, semantics, or gesture ownership drifts               | `audit:DateInput/touch`         |
| FR2–FR3, FR6                                         | `DateInput.doc.mjs`, Storybook controls, `scripts/check-knowledge.mjs`         | five presentation values, deprecated prop, named formats, English and Chinese docs                       | Source, docs, types, or default mappings disagree                                                  | `audit:DateInput/docs-api`      |
| Theming anatomy                                      | `DateInput.test.tsx`, `themingTargets.test.ts`, generated probe theme          | root size/status/disabled, toggle state, shared clear target                                             | Target class or state is missing, undocumented, or placed on the wrong element                     | `audit:DateInput/theming`       |
| FR8; AR2                                             | `apps/storybook/stories/DateInput.stories.tsx`, component-scoped axe           | open Calendar dialog plus closed field states                                                            | Important popup semantics stay unreachable to the browser audit                                    | `audit:DateInput/a11y`          |
| AR7                                                  | `apps/storybook/rtl-audit/targets.json`, component RTL audit                   | calendar and clear controls in LTR and RTL                                                               | DateInput-owned controls fail to exchange logical inline order                                     | `audit:DateInput/rtl`           |

## Decision log

No component-local decision is created by this observational draft. The governing
presentation decisions remain in `spec:AST-043/DEC-1` through `DEC-3`.

## Open questions

None. Any future API, compatibility, ownership, or subjective visual change requires
its canonical current owner; this draft records only shipped behavior.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit results,
implementation steps, Calendar/Popover/BottomSheet internals, or input-family and
presentation-system rules. It links to those owners and records only DateInput's
observable composition and current evidence boundaries.
