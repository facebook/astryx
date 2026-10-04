---
schema_version: 3
template_version: 7
kind: component
id: component:Schedule
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers:
  [public-api, behavior, layout, scrolling, layering, accessibility]
verified_by:
  [
    packages/lab/src/Schedule/Schedule.test.tsx,
    packages/lab/src/Schedule/__tests__/ScheduleTimeGrid.a11y.chromium.spec.ts,
    apps/storybook/stories/Schedule.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-theming-surface,
  ]
contributing: []
system_specs: [spec:AST-002/DEC-1, spec:AST-025/DEC-1, spec:AST-027/DEC-1]
---

# Schedule component contract

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One additive prop: `onEventActivate?: (event: CalendarEvent, domEvent: React.MouseEvent<HTMLButtonElement>) => void` on `Schedule`, mirrored on `ScheduleContextValue.onEventActivate` so a custom view can honor it. No other public syntax changes.                                                                                                                                                                                                                                                                                                                                                      |
| Behavior                | In the week and day views one viewport owns both scroll axes; the day header, all-day row, and hour gutter are sticky items of the same grid as the day columns (FR1–FR3). A range that contains today opens once, one hour before now, and never moves the person's own scroll afterwards (FR4–FR6). Simultaneous events share the column side by side in a deterministic, isolated layout; nothing is covered or dropped (FR7–FR10). With `onEventActivate`, every painted event is a native button that reports the event on click, Enter, and Space; without it, the views stay read-only (FR11–FR14). |
| End-user impact         | Pointer users open an event's details; keyboard users reach and scroll the grid and activate events; screen-reader users get named event buttons in day groups; people with classic scrollbars or narrow windows see one aligned header, gutter, and body; a week opened in the afternoon shows the afternoon.                                                                                                                                                                                                                                                                                             |
| Builder impact          | Optional: pass `onEventActivate` to make events interactive. No migration; read-only callers change nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Compatibility/readiness | Additive within the experimental `@astryxdesign/lab` surface. Read-only markup is preserved apart from the keyboard-reachable viewport that `spec:AST-025` already requires. This record is `draft`; its candidate statements govern only once approved.                                                                                                                                                                                                                                                                                                                                                   |
| Review checks           | Reject a `renderEvent` or second activation seam, a rank/priority/`isShared` field, an `initialScroll` prop, a second scroll container inside the time grid, JavaScript scrollbar-width constants, inter-block `z-index` or any page-level stacking band, focusable nodes inside the hidden read-only grid, a scroll that re-runs on data refresh or theme change, and built-in popovers, actions, or selection state on events.                                                                                                                                                                           |
| Governing rules         | `spec:AST-002` FR1–FR4, FR10 (admission and independently correct states); `spec:AST-025` FR2, FR12, FR14, FR15, FR18 (one explicit owner, keyboard access, chaining, native scrollbars, deterministic nesting); `spec:AST-027` FR1–FR6 (local stacking inside an isolation owner).                                                                                                                                                                                                                                                                                                                        |

This table is a review projection; the body below is authoritative.

## Intent

Schedule renders events from a caller-owned source as a month grid, a week or
day time grid, or a list, for the range around a controlled date. It owns
timezone-aware date math, range paging through header plugins, async loading
with a suspended fallback, and the layout of events inside each view. The time
grid is the view where geometry carries meaning: an event's vertical extent is
its duration, its horizontal share of a day column is how many things happen
at once, and the viewport's scroll position is which part of the day a person
is looking at. This record settles those three geometric contracts and the one
interaction seam the component exposes on events.

## Compatibility and migration

- Released default preserved: not yet released as stable; the component ships
  in the experimental `@astryxdesign/lab` package.
- Compatibility class: additive. `onEventActivate` is optional and absent by
  default. The time grid's default behaviour changes in three ways that no
  caller can observe through API: initial scroll position when the range
  contains today, side-by-side placement of simultaneous events, and one
  scroll owner with sticky header, all-day row, and gutter.
- Controlled/uncontrolled behavior: unchanged. `date` stays fully controlled
  through `onChangeDate`; Schedule holds no selection state.
- Migration decision: none required (DEC-1 through DEC-4 are additive or
  internal).

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Resolving the rendered range from `view` and `date`, filtering and sorting
  the event source to that range, and suspending while a loader is pending.
- The time-grid geometry: the single scroll viewport, sticky header, all-day
  row and hour gutter, hour slots, the now-line, and the placement of timed and
  all-day events inside their day columns, including how simultaneous events
  share a column.
- The initial scroll position of the time-grid viewport for each rendered
  range, and remembering a person's scroll offset for that range across the
  suspended fallback and the loaded content.
- The event activation seam: turning painted event blocks into native buttons
  when `onEventActivate` is present, their accessible names, DOM order, and the
  callback contract.
- The hidden read-only grid that announces the time grid's structure to
  assistive technology when no activation seam is present.

**Does not own / non-goals**

- What activating an event means: details surfaces, popovers, navigation,
  editing, selection, or any product semantics — owned by the product
  callsite, which receives the event and the activating element.
- Event creation, moving, resizing, or drag — not Schedule concepts.
- A ranking or priority between simultaneous events; no event is preferred
  over another in layout.
- The paging controls and view switcher — owned by the header plugins.
- Cross-surface stacking of anything that floats above the page — owned by
  `architecture:layer-runtime`; Schedule paints nothing in the top layer.
- Keyboard scrolling mechanics, scroll chaining, and native scrollbar
  presentation — owned by `spec:AST-025`; Schedule participates through the
  shared scroll hook.

## Public concepts

Consumer prop syntax and examples remain in `Schedule.doc.mjs`.

| Concept          | Closed values or states                                             | Meaning                                                                                                                  | Availability by variant/orientation/state                                                                             | Default                                      | Owner                | Stability        | Invalid-value behavior                                              |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------- | ---------------- | ------------------------------------------------------------------- |
| view             | month, week, day, list, or a caller-built view object               | which layout renders the range and how the range expands around `date`                                                   | always                                                                                                                | required                                     | `component:Schedule` | experimental Lab | type-level only                                                     |
| event source     | static array, async loader                                          | where events for the rendered range come from; a loader suspends until it resolves                                       | always                                                                                                                | required                                     | `component:Schedule` | experimental Lab | type-level only                                                     |
| categories       | label and one of ten colors                                         | how an event's `category` string resolves to a color and an announced name                                               | always                                                                                                                | `[]`; unmatched names render blue            | `component:Schedule` | experimental Lab | an unknown color is a type error                                    |
| focus date       | any instant                                                         | the day treated as today for highlighting; it does not drive the initial scroll, which follows the clock                 | month, week, day                                                                                                      | now at mount                                 | `component:Schedule` | experimental Lab | n/a                                                                 |
| hour window      | `minHour` 0–23, `maxHour` 1–24, `hourHeight` pixels                 | which hours the time grid draws and how tall one hour is                                                                 | week, day                                                                                                             | 0, 24, 100                                   | `component:Schedule` | experimental Lab | out-of-range hours are clamped; `maxHour` is forced above `minHour` |
| event activation | callback present, callback absent                                   | whether painted events are interactive buttons that report the activated event, or decorative blocks in a read-only grid | week and day event blocks, timed and all-day; month and list views render events read-only regardless of the callback | absent                                       | `component:Schedule` | experimental Lab | n/a                                                                 |
| initial position | today in range, today not in range                                  | where the time-grid viewport opens for a rendered range                                                                  | week, day                                                                                                             | one hour before now, or the window start     | `component:Schedule` | experimental Lab | derived; not caller-settable                                        |
| overlap column   | one column per concurrently painted event inside an overlap cluster | how simultaneous events share a day column                                                                               | week, day timed events                                                                                                | equal columns, expanded into free neighbours | `component:Schedule` | experimental Lab | derived; not caller-settable                                        |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Basis                                                                | Draft review state |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------ |
| FR1  | The time grid MUST have exactly one scroll container, which owns both the block and inline axes. The day header cells, the all-day row, the hour gutter, the corner, and the day columns MUST be items of one CSS grid inside that container, so header and body columns share tracks by construction. No descendant MUST establish a second scroll container on either axis.                                                                                                                                                    | DEC-4; `spec:AST-025` FR2, FR18                                      | human decision     |
| FR2  | The header cells and the all-day row MUST stay pinned to the block-start edge of the viewport while it scrolls; the hour gutter and the corner MUST stay pinned to the inline-start edge. Pinning uses `position: sticky` with logical insets, so it mirrors under right-to-left direction without direction-specific code.                                                                                                                                                                                                      | DEC-4                                                                | human decision     |
| FR3  | Under any scrollbar presentation (overlay, classic, forced-visible), at any viewport width and zoom, and in either direction, each header cell's inline-start and inline-end edges MUST lie within 1 CSS pixel of its day column's edges, including after the viewport is scrolled on the inline axis. The viewport reserves its block-axis scrollbar space with `scrollbar-gutter: stable`. The time grid MUST NOT read or hard-code scrollbar dimensions in script, and MUST NOT widen the page.                               | DEC-4; `spec:AST-025` FR15                                           | human decision     |
| FR4  | When a rendered range's days include today in the schedule's timezone, the viewport MUST open with its scroll offset at the now-line's offset within the day column minus one `hourHeight`, clamped to `[0, scrollHeight − clientHeight]`. When the range does not include today, it MUST open at offset 0, the configured `minHour`. Positioning is instant, never animated.                                                                                                                                                    | DEC-3                                                                | human decision     |
| FR5  | FR4 runs once per range key — the view object, the range's start and end instants, and the timezone — on that key's first layout. Event data arriving or refreshing, clock ticks, resizes, theme or direction changes, and re-renders MUST NOT move the viewport. Paging to another range or switching views is a new key and positions again.                                                                                                                                                                                   | DEC-3                                                                | human decision     |
| FR6  | The viewport's scroll offset for the current range key MUST survive the suspended fallback being replaced by loaded content: when the content viewport mounts for a key whose offset was already recorded, it restores that offset instead of running FR4. The memory lives above the suspense boundary, is keyed by FR5's range key, and holds at most the current key.                                                                                                                                                         | DEC-3; `architecture:react-component-runtime` resource lifetime rule | human decision     |
| FR7  | Timed events in one day column are grouped into overlap clusters: two events are in the same cluster when their visible minutes intersect, directly or through a chain of intersecting events. Events are ordered by visible start ascending, visible end descending, then `id` ascending; each takes the first column in its cluster whose last occupant ends at or before its start. The result MUST be identical for any input order of the same events.                                                                      | DEC-2                                                                | human decision     |
| FR8  | Every event in a cluster MUST be laid out side by side: its inline-start offset is its column index over the cluster's column count, and its inline size spans its own column plus every following column that no later-starting event of the cluster occupies during its minutes. Two painted blocks in one day column MUST NOT overlap by more than 1 CSS pixel on the inline axis, no block MUST be fully covered, and no event MUST be dropped. A block's minimum visible duration remains fifteen minutes.                  | DEC-2                                                                | human decision     |
| FR9  | Blocks carry no `z-index` relative to one another. The day column, the all-day surface, and the time-grid viewport are `isolation: isolate` owners; the now-line, a focused block, and a hovered block may rise with a local positive `z-index` inside their column only. No Schedule value participates in page-level stacking.                                                                                                                                                                                                 | `spec:AST-027` FR1–FR6                                               | settled            |
| FR10 | Narrow columns stay legible by subtraction, not by hiding events: the title keeps a single ellipsized line, and the time line is hidden through a container query when the block is narrower than the time label needs. Nothing about an event's position depends on its text.                                                                                                                                                                                                                                                   | DEC-2                                                                | human decision     |
| FR11 | When `onEventActivate` is provided, every painted event block in the week and day views — timed blocks and all-day pills — MUST be a native `<button type="button">`. Click, tap, Enter, and Space each invoke `onEventActivate(event, domEvent)` exactly once, where `event` is the caller's `CalendarEvent` object and `domEvent` is the activating React mouse event whose `currentTarget` is the block, so a caller can anchor its own surface to it. A multi-day timed event activates with the same event from either day. | DEC-1; `spec:AST-002` FR1–FR4                                        | human decision     |
| FR12 | With `onEventActivate` provided, the DOM order of event buttons is all-day segments in range order, then each day column's timed events in FR7 order, independent of their painted column or paint order. The time grid renders no other interactive content: no popover, menu, selection state, or secondary action.                                                                                                                                                                                                            | DEC-1                                                                | human decision     |
| FR13 | Without `onEventActivate`, event blocks remain non-interactive, painted decoration, and the hidden read-only grid remains the only accessible representation of events in the time grid. The only focusable element inside the time grid is the scroll viewport, and only while it overflows (AR1).                                                                                                                                                                                                                              | DEC-1; `spec:AST-002` FR10                                           | human decision     |
| FR14 | `onEventActivate` applies to the time-grid views. The month and list views render events read-only; the context value carries the callback so that a view can adopt it, and adoption by those views is a change to this record.                                                                                                                                                                                                                                                                                                  | DEC-1                                                                | human decision     |

### Allowed variation

- **AV1 — Hour window and density.** Callers choose `minHour`, `maxHour`, and
  `hourHeight`; FR4's lead scales with `hourHeight`, and FR3's alignment holds
  for any window.
- **AV2 — Container height.** The time grid is 640px tall by default and
  shrinks to a shorter Schedule root; the viewport is whatever remains below
  the frame header, and FR4's clamp follows the measured height.
- **AV3 — Column minimum.** Day columns are at least 140px wide and share the
  remaining width equally; narrower viewports scroll on the inline axis under
  FR1 rather than squeezing columns.
- **AV4 — Cluster width.** Blocks in a cluster split the column equally; a
  block that can expand into free columns does, so widths differ within one
  cluster without changing anyone's order.
- **AV5 — Activation styling.** A focused or hovered block may rise and show
  the focus ring inside its column; themes vary the ring through the shared
  focus tokens.

### Representative states

| State                                          | Required invariant                                                                                               | Allowed variation                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Week, today in range, afternoon                | opens with the hour before now at the top of the column area; now-line visible                                   | hour window, hour height, container height |
| Week, today in range, near midnight            | opens at the maximum offset; now-line visible                                                                    | same                                       |
| Week, today not in range                       | opens at offset 0                                                                                                | same                                       |
| Loader resolves after the person scrolled      | offset unchanged                                                                                                 | loader latency                             |
| Clock tick, resize, theme change, data refresh | offset unchanged                                                                                                 | any                                        |
| Two identical events (same title and minutes)  | two equal half-width blocks; order by `id`                                                                       | column width                               |
| Three and five simultaneous events             | three thirds, five fifths; every block ≥ 1 pixel visible and uncovered; time line hidden where it no longer fits | column width                               |
| Chain A–B–C where A and C do not meet          | A and C share a column, B beside them                                                                            | which of A/C expands                       |
| Long event containing a short one              | both visible side by side for the overlap; the long one keeps its full height                                    | widths                                     |
| Classic 15px scrollbar, 1280px wide            | header/body edges within 1px for every column                                                                    | scrollbar width                            |
| 760px wide, scrolled 160px on the inline axis  | header moves with the columns; gutter and corner stay; one inline scroller; page does not widen                  | scroll amount                              |
| Right-to-left direction                        | FR3 holds with columns and pins mirrored                                                                         | locale                                     |
| `onEventActivate` present, keyboard            | Tab reaches the viewport, then each event button in FR12 order; Enter and Space activate; ring visible           | ring tokens                                |
| `onEventActivate` absent                       | no button; hidden read-only grid announces events; viewport is the single tab stop while it overflows            | none                                       |

### Transformation and precedence order

- **ORD1 — Timed layout.** Clip each event to the visible hour window → enforce
  the fifteen-minute minimum → sort (start asc, end desc, `id` asc) → assign
  clusters → assign columns first-fit → expand each block into following free
  columns → convert to percentages of the column's minutes and width.
- **ORD2 — Initial position.** On a range key's first layout: a remembered
  offset for that key is restored; otherwise FR4 computes the offset from the
  now-line and clamps it; the offset is assigned synchronously before paint.
  A person's later scroll overwrites the remembered offset; nothing else does.
- **ORD3 — Pinning.** Sticky header cells paint above the columns, the gutter
  above the columns, and the corner above both, all as local order inside the
  isolated viewport.

### Performance and resources

- **PR1 — One measurement per range.** FR4 measures the viewport once per
  range key in a layout effect; no `ResizeObserver`, interval, or scroll-driven
  re-render is added for positioning. Remembering the offset uses one passive
  scroll listener on the viewport for its lifetime.
- **PR2 — Pure layout.** Cluster and column assignment is a pure function of
  the day's events and the hour window, with no DOM reads, and runs during
  render.
- **PR3 — Shared observers.** Keyboard ownership and overflow state come from
  the shared scroll hook; Schedule adds no observers of its own.

## Accessibility contract

- **AR1 — Reachable viewport.** The time-grid viewport is the keyboard scroll
  owner under `spec:AST-025` FR12: it is in the tab order only while an axis
  overflows, exposes `role="region"` with the rendered range title as its
  accessible name, and native Arrow and Page keys scroll it. Losing overflow
  does not move focus.
- **AR2 — Named event buttons.** With `onEventActivate`, each button's
  accessible name is the event's title, category label, time range (or "all
  day"), and full date, in that order — the same words the read-only grid
  announces for the event.
- **AR3 — Visible focus.** A focused event button shows the shared focus ring
  entirely within its day column; it rises above neighbouring blocks locally
  so the ring is never clipped by a later sibling.
- **AR4 — Decorative parts stay silent.** Header cells, hour labels, hour
  slots, the all-day cell grid, and the now-line are hidden from assistive
  technology individually; the painted viewport itself is exposed so that its
  tab stop and, with activation, its buttons are reachable. Day columns group
  their buttons under `role="group"` named with the full date.
- **AR5 — Read-only grid preserved.** Without `onEventActivate`, the hidden
  read-only `grid` with `aria-readonly`, column headers per day, row headers
  per hour, and cells that list each event's accessible label is the time
  grid's accessible representation, and it contains no focusable element.
- **AR6 — Direction and motion.** Pinning, column order, and block offsets use
  logical properties and mirror under right-to-left direction. Initial
  positioning is instant, so reduced-motion preferences have nothing to
  suppress.

## Design relationships

| Anatomy or state | Design requirement                                                                       | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Day header       | Names each column and stays visible while the day scrolls.                               | prescribed               | supporting     | FR1–FR3            |
| Hour gutter      | Labels the hour lines and stays visible while columns scroll on the inline axis.         | prescribed               | supporting     | FR1–FR3            |
| All-day row      | Stacks all-day spans in levels below the header and stays visible while the day scrolls. | prescribed               | supporting     | FR1–FR2            |
| Event block      | Shows title and time in the category color; shares the column with concurrent events.    | prescribed               | prominent      | FR7–FR12, AR2–AR3  |
| Now-line         | Marks the current minute on today's column, above blocks, inside the column.             | prescribed               | supporting     | FR4, FR9           |

The component implements design requirements without copying their rationale.
An `unsettled` representation remains a human decision; principles do not let an
agent invent the answer.

### Design decisions

<!-- design-decisions:v1 -->

| ID  | Decision                                       | Intent or reason                                                                                                   | Applies to    | Allowed variation             |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------- | ----------------------------- |
| DD1 | One `hourHeight` of lead above now             | The person sees what just happened and most of what is next without the now-line sitting on the top edge.          | week, day     | scales with `hourHeight`      |
| DD2 | Equal cluster columns with rightward expansion | Concurrent events read as concurrent; width is the only axis that changes and every event stays fully perceivable. | week, day     | expansion into free columns   |
| DD3 | Time line collapses before the title does      | The title identifies the event; the time is already implied by the block's vertical position.                      | narrow blocks | the container-query threshold |

## Family and system relationships

- `spec:AST-002` owns public-API admission. `onEventActivate` is caller-owned
  intent the component cannot derive (what activation means); its absence is a
  complete read-only state (FR13), so both states are independently correct.
- `spec:AST-025` owns scroll-container behaviour. The time-grid viewport
  integrates the shared hook on existing structure rather than wrapping it;
  keyboard access, chaining, and native scrollbars follow that record.
- `spec:AST-027` owns local stacking. FR9 places every Schedule `z-index`
  inside an isolation owner and routes nothing through page-level bands.
- `architecture:public-component-api` owns stable admission and compatibility;
  Schedule remains experimental in Lab.
- `architecture:react-component-runtime` owns effect and resource lifetime;
  FR5–FR6 and PR1 record Schedule's positioning effect and scroll memory.
- `architecture:component-theming-surface` owns target qualification; this
  record adds no theme target.

## Verification map

| Contract     | Verification                                                                                                        | Representative states                                                                                  | Mutation or failure expectation                                                                                               | Audit section                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| FR1–FR3      | `ScheduleTimeGrid.a11y.chromium.spec.ts` scroll-geometry cases (classic scrollbars, 760px inline scroll, RTL)       | fixed-height week with 15px scrollbar; narrow week scrolled 160px; RTL                                 | A second scroller, a header outside the viewport, or a non-sticky gutter drifts header or labels past 1px.                    | `audit:Schedule/layout`        |
| FR4–FR6      | `Schedule.test.tsx` positioning suite with mocked geometry; chromium initial-position cases with an installed clock | 15:00 week, 13:00 day, 23:50 day (clamp), range without today, tick/theme/resize after a manual scroll | Opening at 0 with today in range, re-running on a tick, or losing the offset across the suspense swap fails.                  | `audit:Schedule/behavior`      |
| FR7–FR10     | `timeGridLayout.test.ts` pure-function suite; chromium overlap case                                                 | tie, three, five, chain, containment, reversed input order, fifteen-minute block                       | Any inter-block overlap above 1px, a dropped event, an input-order-dependent result, or a missing `isolation: isolate` fails. | `audit:Schedule/layout`        |
| FR11–FR14    | `Schedule.test.tsx` activation suite; chromium keyboard case against the activation story                           | callback absent/present; click, Enter, Space; DOM order; month and list unchanged                      | A button without the callback, a second firing, a non-button block with the callback, or focus inside the hidden grid fails.  | `audit:Schedule/public-api`    |
| AR1, AR4–AR5 | chromium keyboard-reach case; `Schedule.test.tsx` hidden-grid suite; scoped axe audit                               | overflowing and fitting viewports; read-only week                                                      | An unreachable viewport, a focusable node inside `aria-hidden`, or a changed read-only grid fails.                            | `audit:Schedule/accessibility` |
| AR2–AR3, AR6 | `Schedule.test.tsx` name assertions; chromium focus-ring pixels and RTL case                                        | activation story focused by keyboard, LTR and RTL                                                      | A name missing the date or category, a clipped ring, or an unmirrored pin fails.                                              | `audit:Schedule/accessibility` |

## Decision log

<!-- Record the boundary or requirement, not how it was reached. A rejected alternative is at most one line here, kept only when it is consequential and likely to recur. -->

### DEC-1 — Events activate through one callback on native buttons

**Reference:** `component:Schedule/DEC-1`
**Decider:** `<pending>`

The caller owns what happens when a person activates an event; Schedule owns
how an event is reached and named. `onEventActivate(event, domEvent)` is the
whole seam: with it present every painted event in the time grid is a native
button in document order with the read-only grid's words as its name, and
without it the grid stays decorative behind its hidden read-only grid. Buttons
are ordinary tab stops; no roving composite is layered on top.

Rejected: a `renderEvent` render prop, because it hands the caller the
category colour, past dimming, and time formatting and so moves system
rendering into every product.

### DEC-2 — Simultaneous events share the column side by side

**Reference:** `component:Schedule/DEC-2`
**Decider:** `<pending>`

Concurrency is shown by width, never by paint order: an overlap cluster splits
its column into equal tracks, a block expands into following free tracks, and
no block is ever covered, so there is no rank to expose and no `z-index` between
blocks. Order inside a cluster is fixed by start, length, and `id`, which makes
the layout a function of the data alone.

Rejected: a cascade with each later level inset and raised above the previous
one, because the later block hides the earlier one's title and the order
depends on input order.

### DEC-3 — A range containing today opens one hour before now, once

**Reference:** `component:Schedule/DEC-3`
**Decider:** `<pending>`

The viewport opens where the person's attention is: the hour before now at the
top, clamped to the grid. It does this exactly once for each range a person
opens and then leaves the scroll alone, including across the suspended
fallback, so neither a late loader nor a clock tick can move what they are
reading. The component derives this from the clock and the range, so no prop
selects it.

Rejected: an `initialScroll` prop, because no caller-owned distinction between
two otherwise identical schedules has been shown.

### DEC-4 — One scroll owner with sticky header, all-day row, and gutter

**Reference:** `component:Schedule/DEC-4`
**Decider:** `<pending>`

Header, all-day row, gutter, and columns are items of one grid inside one
viewport, pinned with `position: sticky`, so their tracks are the same tracks
and a scrollbar, a zoom level, or an inline scroll cannot separate them. The
viewport reserves its scrollbar gutter and is the keyboard scroll owner.

Rejected: a header outside the viewport kept aligned by scroll synchronisation
or a scripted scrollbar-width constant, because it drifts under every
scrollbar presentation it was not measured on.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
