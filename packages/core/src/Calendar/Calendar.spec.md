---
schema_version: 3
template_version: 7
kind: component
id: component:Calendar
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, theming]
verified_by:
  [
    packages/core/src/Calendar/Calendar.test.tsx,
    packages/core/src/hooks/useGridFocus.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:react-component-runtime,
  ]
contributing: []
system_specs: [spec:AST-020/FR15]
---

# Calendar component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. `Calendar` and `CalendarProps` are exported from `@astryxdesign/core/Calendar`; `mode` selects a single date or a range, with `value`/`defaultValue`/`onChange`, bounds, constraints, span limits, focus date, and display options. |
| Behavior                | One or two months render as day grids; a day is picked by pointer or keyboard; each month's focused day is its one roving Tab stop that arrow, Home/End, and Page keys move, following the reading direction.                                     |
| End-user impact         | A keyboard or screen-reader user meets a named month grid, moves through it by day, week, and month, and hears each day's name, selection, today marker, and disabled state.                                                                      |
| Builder impact          | None.                                                                                                                                                                                                                                             |
| Compatibility/readiness | Released behavior as observed; this draft records it and adopts the APG Grid pattern for the day grid (AR1) under `spec:AST-020/FR15`.                                                                                                            |
| Review checks           | Reject a day grid without `role="grid"` or a name, two days holding a Tab stop, an arrow key that stops following the reading direction, or a selection or today state carried only by colour.                                                    |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV8`; `architecture:component-theming-surface/INV3–INV7`; `spec:AST-020/FR15`.                                                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

Calendar lets a person pick a date or a date range by looking at whole months. It
owns the month grid, its navigation, selection and range semantics, and the
keyboard model that moves through days; date fields compose it.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation; runtime, DOM, styling, targets, and
  public API are unchanged
- Controlled/uncontrolled behavior: unchanged — `value` with `onChange` is
  controlled; `defaultValue` starts internal state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The month grid: its weekday column headers, week rows, day cells, outside days,
  week numbers, and variable row count.
- Month navigation, the focused day, and the keyboard model that moves it.
- Single and range selection semantics, bounds, constraints, and span limits.

**Does not own / non-goals**

- The text field, popover, and bottom sheet that present a Calendar — owned by
  `component:DateInput` and its siblings.
- Time of day — owned by `component:DateTimeInput`.

## Public concepts

| Concept     | Closed values or states                      | Meaning                                         | Availability by variant/orientation/state | Default                                                     | Owner                | Stability | Invalid-value behavior       |
| ----------- | -------------------------------------------- | ----------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- | -------------------- | --------- | ---------------------------- |
| `mode`      | `single`, `range`                            | Whether one date or a start–end pair is picked. | Always                                    | `single`                                                    | `component:Calendar` | stable    | Type-rejected                |
| Focused day | one visible day                              | The day whose button holds the grid's Tab stop. | Always                                    | selected day (`single`), else today, else first enabled day | `component:Calendar` | stable    | Clamped to the visible range |
| Day state   | selected, in range, today, disabled, outside | What a day cell exposes and paints.             | Per cell                                  | none                                                        | `component:Calendar` | stable    | Not applicable               |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant                                                                                                                                                                                                          | Basis                                                                  | Draft review state |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| FR1 | Each rendered month is one `role="grid"` named for its month and year, with a `columnheader` per weekday and one `row` per week.                                                                                             | shipped source and focused tests                                       | verify             |
| FR2 | Exactly one day button within each rendered month holds `tabIndex={0}`; every other day button in that month is `-1`.                                                                                                        | shipped `useGridFocus` behavior; Grid accessibility contract (pending) | verify             |
| FR3 | A disabled day (outside bounds or rejected by a constraint) stays in the grid, is exposed as disabled, and cannot be picked.                                                                                                 | shipped source and focused tests                                       | verify             |
| FR4 | In `range` mode the first pick starts the range and the second ends it, a second pick before the start swapping the two so the end never precedes the start; `minRangeSpan`/`maxRangeSpan` bound it.                         | shipped source and focused tests                                       | verify             |
| FR5 | Moving the focused day across a month boundary navigates the visible month so the focused day stays visible; an arrow can also land on a borrowed adjacent-month day, which is exposed `aria-disabled` and cannot be picked. | shipped source and focused tests                                       | verify             |

### Allowed variation

- **AV1 — Month layout.** Row count, outside days, and week numbers may vary by
  props without changing FR1–FR5.
- **AV2 — Internal state.** The focused-day and selection state may be stored in
  any private shape.

### Representative states

| State                  | Required invariant                                              | Allowed variation     |
| ---------------------- | --------------------------------------------------------------- | --------------------- |
| single, nothing picked | Today holds its month's Tab stop; no day is selected.           | Month shown.          |
| single, picked         | The selected day is exposed as selected and holds the Tab stop. | Month shown.          |
| range, in progress     | The start is selected; hovered days preview the range.          | Pointer position.     |
| two months             | Both grids are named; one Tab stop in each.                     | Which month is first. |
| bounded                | Days outside `min`/`max` are disabled.                          | Which days.           |

### Transformation and precedence order

- **ORD1 — Pick.** Disabled check → mode-specific selection update → `onChange`.
- **ORD2 — Focus movement.** Key → reading-direction mapping → target day → month
  navigation if needed → focus.

### Performance and resources

- **PR1 — Render-owned grid.** Day cells render from props and state; focus
  movement reads the grid's cells on demand and keeps no per-cell listeners.

## Accessibility contract

- **AR1 — The day grid adopts the APG Grid pattern** (`spec:AST-020/FR15`), as
  one composite control: each month is `role="grid"` with an accessible name,
  weekday `columnheader` cells, week `row`s, and day `gridcell`s that carry
  `aria-selected` when selected or in range and hold one `button` named by the
  full date, which exposes `aria-current="date"` for today and `aria-disabled`
  when disabled; one day button holds the Tab stop — the selected day in
  `single` mode, else today, else the first enabled day of the month.
  ArrowLeft and ArrowRight move by a day following the reading direction,
  ArrowUp and ArrowDown by a week, Home and End to the first and last day of the
  week, PageUp and PageDown by a month, and Enter or Space picks the focused day;
  an arrow skips a day disabled by bounds or a constraint and continues in the
  same direction.
  Implementation gaps: PageUp and PageDown change the visible month but target
  the day a week away and, when that day is not shown, focus the first day
  button in the grid that is not natively disabled, which can be an
  adjacent-month day; and the arrow keys can focus a borrowed adjacent-month
  day that is `aria-disabled`, because cell focusability checks only native
  `disabled`.

## Design relationships

| Anatomy or state | Design requirement                                                     | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Calendar root    | Holds the header and the grid; carries the component's theming target. | Current source and public docs | Supporting     | FR1                |
| Month header     | Names the month and offers previous/next navigation.                   | Current source and public docs | Supporting     | FR1, FR5           |
| Day button       | The control a date is picked with; carries the day target.             | Current source and public docs | Prominent      | FR2, FR3, AR1      |
| Day grid         | Presents the weeks and days as a named grid.                           | Current source and public docs | Prominent      | FR1, FR2, AR1      |
| Selected day     | Marks the chosen day or range without relying on colour alone.         | Current source and public docs | Prominent      | FR4, AR1           |
| Today marker     | Marks today distinctly from selection.                                 | Current source and public docs | Supporting     | AR1                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Calendar root": {"target": "calendar"},
  "Month header": {"target": "calendar-nav"},
  "Day grid": {
    "none": {
      "reason": "reachability-gap: No current public target reaches the grid element itself; `calendar` paints the root and `calendar-day` the day buttons."
    }
  },
  "Day button": {"target": "calendar-day"},
  "Selected day": {"inherits": "calendar-day"},
  "Today marker": {"inherits": "calendar-day"}
}
```

`calendar` is carried by the root element, `calendar-nav` by the previous and
next month buttons inside the Month header, and `calendar-day` by each day
button.

## Family and system relationships

- `spec:AST-020/FR15` decides which APG parts a component adopts; the day grid
  adopts the Grid pattern because it already acts as one composite control.

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Representative states                                       | Mutation or failure expectation                                                                                                                    | Audit section                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| FR1–FR5  | `Calendar.test.tsx` structure, selection, bounds, and navigation suites                                                                                                                                                                                                                                                                                                                                                                                                             | single, range, two months, bounded                          | A missing header, a pickable disabled day, an inverted range, or a focused day scrolled out of view fails.                                         | `audit:Calendar/behavior`      |
| AR1      | `Calendar.test.tsx` (grid roles and names, `aria-multiselectable` by mode, month-change announcements, day names) and `useGridFocus.test.tsx` (roving tabindex, RTL mirroring); `Calendar.test.tsx` "ArrowUp skips a disabled cell in the same column to the next enabled row (complex-2)" for the disabled-day skip; the one-Tab-stop-per-month (FR2), Home/End, Page and activation keys on Calendar itself under the Grid accessibility contract (`internal/a11y-spec`, pending) | LTR and RTL; month boundary; selected, today, disabled days | A day loses its role, name or state, two days in one month hold a Tab stop, or an arrow, Home/End, Page or activation key stops moving or picking. | `audit:Calendar/accessibility` |

## Decision log

None. This draft records shipped behavior; the Grid adoption follows the system
rule rather than a component-local decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples (`Calendar.doc.mjs`),
the date-field composition records, or shared theming rules. It links to their
owners.
