---
schema_version: 3
template_version: 7
kind: component
id: component:SegmentedControl
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-28
owners: [cixzhang]
review_triggers:
  [
    public-api,
    behavior,
    layout,
    interaction,
    motion,
    theming,
    styling,
    accessibility,
    visual,
    react-runtime,
    compatibility,
  ]
verified_by:
  [
    packages/core/src/SegmentedControl/SegmentedControl.test.tsx,
    packages/core/src/RadioList/__tests__/RadioGroup.a11y.test.tsx,
    packages/core/src/RadioList/__tests__/RadioGroup.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: [design:user-states]
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-085]
---

# SegmentedControl component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. SegmentedControl takes `label`, `value`, `onChange`, `size`, `layout`, `isDisabled`, `disabledMessage`, base props, and SegmentedControlItem children.                                                                                                                                                        |
| Behavior                | A `role="radiogroup"` named by `label` with one Tab stop; arrow keys, Home, and End move focus between enabled segments, wrap, and select the segment they land on. Tabbing in never changes the value.                                                                                                                     |
| End-user impact         | People switch between a few modes with one click or arrow press, and the control shrinks with its row by truncating labels. A disabled control without a reason drops out of the tab order.                                                                                                                                 |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                                       |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. A disabled selected segment loses the Tab stop, a disabled control can have no Tab stop, a group reason describes only the radiogroup, caller handlers run while disabled, and a caller `aria-describedby` is dropped; all are listed under Current-state impact. |
| Review checks           | Reject more than one Tab stop, a value change on Tab entry, arrows that land on a disabled segment, a control that overflows its container when segments have labels, or a selection while disabled.                                                                                                                        |
| Governing rules         | WAI-ARIA radio group pattern; `spec:AST-085` FR1, FR2, FR5, FR7; `design:user-states` DR1–DR3 (through SegmentedControlItem); `architecture:component-size-cascade` INV3–INV5; `architecture:interaction-modality` INV1; `architecture:public-component-api` INV5.                                                          |

This table is a review projection; the body below is authoritative.

## Intent

SegmentedControl presents a group of mutually exclusive choices through
SegmentedControlItem children. It owns the radiogroup, its single Tab stop and
arrow-key selection, the group's size, layout, and disabled state, and the
consumer theming anatomy. Consumer usage lives in `SegmentedControl.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; `size="md"`, `layout="hug"`, not disabled
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled; selection is `value` and
  `onChange`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The radiogroup control and its current `segmented-control` theming target.
- The roving Tab stop, arrow, Home, and End navigation, and
  selection-follows-focus.
- Group size, layout, disabled state, and the disabled-reason tooltip.
- The keyboard hint shown on first keyboard focus.
- The consumer theming anatomy, including the segment target's mapping.

**Does not own / non-goals**

- Each segment's radio semantics, click selection, label and icon rendering,
  item disabled state, and paint — owned by `component:SegmentedControlItem`.
- The artwork supplied through an item's `icon` prop — owned by the caller.
- A separate anatomy part or target for selected state; selection is state on the
  segment target.
- A visible control-level label; the control's required `label` is its accessible
  name and is not rendered as visual anatomy.
- Page navigation — owned by `component:TabList`.

## Public concepts

| Concept  | Closed values or states | Meaning                                                   | Availability by variant/orientation/state | Default                   | Owner                        | Stability | Invalid-value behavior                                                                      |
| -------- | ----------------------- | --------------------------------------------------------- | ----------------------------------------- | ------------------------- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| Value    | string                  | The selected segment's value.                             | Always.                                   | required                  | `component:SegmentedControl` | Stable    | A value no segment carries selects nothing; the first enabled segment becomes the Tab stop. |
| Size     | `sm`, `md`, `lg`        | Segment height and text size.                             | Always.                                   | Inherited size, else `md` | `component:SegmentedControl` | Stable    | TypeScript rejects other values.                                                            |
| Layout   | `hug`, `fill`           | Content-sized control, or full width with equal segments. | Always.                                   | `hug`                     | `component:SegmentedControl` | Stable    | TypeScript rejects other values.                                                            |
| Disabled | off, on, on with reason | Blocks selection on every segment.                        | A reason applies only with `isDisabled`.  | off                       | `component:SegmentedControl` | Stable    | A reason without `isDisabled` renders nothing.                                              |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FR1 | The radiogroup container carries the current `segmented-control` target with `data-size`, sets `aria-label` to `label`, and renders its supplied children.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Current source, docs, and tests                                    |
| FR2 | The group is one Tab stop: the selected segment, or the first enabled segment when the value matches no segment; a disabled selected segment MUST keep the Tab stop (`spec:AST-085` FR1). Implementation gap: when the selected segment is disabled, the first enabled segment takes the Tab stop. ArrowLeft and ArrowRight move focus between enabled segments and wrap; Home and End jump to the ends; ArrowUp and ArrowDown do nothing. Disabled segments are skipped.                                                                                                                                                                                                                                                                                                                                                                                                                          | WAI-ARIA radio group pattern; current tests                        |
| FR3 | When arrow, Home, or End navigation moves focus to an enabled segment, that segment's value is passed to `onChange` if it differs. Focus entering the group from outside never changes the value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | WAI-ARIA radio group pattern; current tests                        |
| FR4 | A caller `onKeyDown` runs before built-in navigation and can cancel it with `preventDefault()`; a caller `onFocus` runs before selection-follows-focus. On first keyboard focus an ephemeral hint naming the arrow keys appears at the focused segment and dismisses on the first arrow press, a timeout, or blur.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source and tests                                           |
| FR5 | `hug` sizes the control to its segments; when any segment shows a visible label, the control never exceeds its container and labelled segments shrink and truncate. A control of only icon-only segments keeps its size. `fill` stretches the control to its container and gives segments equal shares that can shrink and truncate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current tests                                                      |
| FR6 | Size resolves from an explicit `size`, then the nearest size provider, then `md`, and reaches every segment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `architecture:component-size-cascade` INV3–INV5; current source    |
| FR7 | `isDisabled` sets `aria-disabled` on the radiogroup, disables every segment, dims the control to half opacity, and blocks selection. The group MUST keep a Tab stop while disabled (`spec:AST-085` FR1, FR7). With `disabledMessage`, the selected segment stays the Tab stop, pointer events stay on, and a reason tooltip opens on hover and keyboard focus; the reason MUST describe the focusable segment (`spec:AST-085` FR5, FR7). Implementation gap: the reason describes only the radiogroup; caller handlers on the radiogroup, such as `onKeyDown`, still run while disabled (`spec:AST-085` FR2); without a `disabledMessage` the group ignores pointer input and every segment leaves the tab order, so the control has no Tab stop; and with a `disabledMessage`, the control also has no Tab stop when the value matches no segment or the selected segment is itself `isDisabled`. | `spec:AST-085`; current tests                                      |
| FR8 | The radiogroup owns `role`, `aria-label` (from `label`), `aria-disabled`, and `data-size`; a caller value for any of them is replaced. Other base props reach the radiogroup, and `ref` reaches it. Implementation gap: a caller `aria-describedby` is replaced, by the disabled-reason id or by nothing, against `architecture:public-component-api` INV5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `architecture:public-component-api` INV5; current source and tests |

### Allowed variation

- **AV1 — Segments.** A segment may render its visible label, an icon and label,
  or an icon while the required label supplies the accessible name.
- **AV2 — Theme paint.** Themes may restyle the control and segments through
  their targets and the reflected states.

### Representative states

| State                | Required invariant                                             | Allowed variation |
| -------------------- | -------------------------------------------------------------- | ----------------- |
| Hug, labelled        | Content-sized; capped at the container; labels truncate.       | Size.             |
| Fill                 | Full width; equal segments.                                    | —                 |
| Unmatched value      | First enabled segment is the Tab stop; Tab-in changes nothing. | —                 |
| Disabled with reason | Selected segment focusable; reason tooltip; no selection.      | —                 |
| Disabled, no reason  | No selection. Implementation gap: no Tab stop (FR7).           | —                 |

### Transformation and precedence order

- **ORD1 — Keydown.** Caller `onKeyDown`, then the hint, then navigation unless
  prevented.
- **ORD2 — Tab stop.** The selected segment (today only while enabled, or while
  the group is disabled with a reason and the segment is not itself
  `isDisabled`), then the first enabled segment for a
  value that matches no segment.

### Performance and resources

- **PR1 — Bounded resources.** One roving-focus handler, one hint, and the
  disabled-reason tooltip's pointer and focus listeners on the radiogroup per
  control, plus, through the tooltip's layer, the shared gesture counter's
  document listeners, installed once per page; segments share the press
  controller's window and document listeners.

## Accessibility contract

- **AR1 — Group semantics.** `role="radiogroup"` named by `label`; segments
  follow `component:SegmentedControlItem` AR1.
- **AR2 — Keyboard.** FR2 and FR3.
- **AR3 — Disabled reason.** FR7.

## Design relationships

| Anatomy or state | Design requirement                                          | Representation authority       | Hierarchy role | Component contract                   |
| ---------------- | ----------------------------------------------------------- | ------------------------------ | -------------- | ------------------------------------ |
| Control          | Presents the current grouped choice container.              | Current source and public docs | Supporting     | FR1, FR5                             |
| Segment          | Presents one mutually exclusive choice and its item states. | Current source and public docs | Prominent      | `component:SegmentedControlItem` FR1 |
| Label            | Identifies a segment visually when not hidden.              | Current source and public docs | Prominent      | `component:SegmentedControlItem` FR3 |
| Icon             | Presents optional caller-supplied artwork within a segment. | Caller-supplied content        | Supporting     | `component:SegmentedControlItem` FR3 |

`design:user-states` governs the segments' pressed overlay and its
selected-segment exception (`component:SegmentedControlItem` FR5); no other
design record governs SegmentedControl. Selection is a state of Segment, not a
separate anatomy part. The consumer
docs declare both targets on SegmentedControl, so the map below covers the
segment parts as well.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Control": {"target": "segmented-control"},
  "Segment": {"target": "segmented-control-item"},
  "Label": {"inherits": "segmented-control-item"},
  "Icon": {"inherits": "segmented-control-item"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, inherited
  parts, and state-on-target rules.
- `spec:AST-085` owns disabled focusability, reasons, and callbacks; FR7
  records the gaps.
- `component:SegmentedControlItem` owns each segment.

## Verification map

| Contract            | Verification                                                                                                                                                                                                                               | Representative states                                                   | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                            | Audit section                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| FR1, AR1            | `SegmentedControl.test.tsx` rendering, size, and data-testid cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-group-*` states                                                | Control with several segments; sizes                                    | Lost group semantics or name fails. Evidence gap: no test asserts the `segmented-control` target or `data-size`.                                                                                                                                                                                                                                                                                                                           | `audit:SegmentedControl/anatomy`       |
| FR2, FR3, ORD2, AR2 | `SegmentedControl.test.tsx` keyboard-navigation and unmatched-value cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-group-*` states                                         | Arrows, wrap, Home, End; Tab-in with an unmatched or disabled selection | A value change on Tab entry, no wrap, or landing on a disabled segment fails.                                                                                                                                                                                                                                                                                                                                                              | `audit:SegmentedControl/accessibility` |
| FR4, ORD1           | `SegmentedControl.test.tsx` container handler forwarding cases                                                                                                                                                                             | Caller `onKeyDown`, with and without `preventDefault`                   | A caller key handler that cannot cancel navigation fails. Evidence gap: no test asserts the caller `onFocus` order or the keyboard hint.                                                                                                                                                                                                                                                                                                   | `audit:SegmentedControl/behavior`      |
| FR5                 | `SegmentedControl.test.tsx` layout cases                                                                                                                                                                                                   | Hug, fill, narrow row, icon-only                                        | A control that overflows, or squeezes icon-only segments, fails.                                                                                                                                                                                                                                                                                                                                                                           | `audit:SegmentedControl/layout`        |
| FR6                 | Evidence gap: no test asserts size precedence or its propagation                                                                                                                                                                           | —                                                                       | —                                                                                                                                                                                                                                                                                                                                                                                                                                          | `audit:SegmentedControl/layout`        |
| FR7, AR3            | `SegmentedControl.test.tsx` disabled and disabledMessage cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-group-disabled` and `segmented-group-disabled-with-message` states | Group and item disabled; with reason                                    | A selection while disabled, or a missing reason tooltip, fails. Evidence gap: no test asserts the half opacity, or caller handlers while disabled. The `segmented-group-disabled` state declares `tabReachable: false`, asserting the current FR7 gap pending conformance. The `segmented-option-group-disabled-with-message` state declares no description on the focusable segment, asserting the reason-target gap pending conformance. | `audit:SegmentedControl/accessibility` |
| FR8                 | `SegmentedControl.test.tsx` role-override and data-testid cases                                                                                                                                                                            | Forwarded role                                                          | A forwarded prop that overrides the role fails. Evidence gap: no test asserts `ref` or a caller `aria-describedby`.                                                                                                                                                                                                                                                                                                                        | `audit:SegmentedControl/api`           |
| PR1                 | Evidence gap: no test asserts the absence of global listeners                                                                                                                                                                              | —                                                                       | —                                                                                                                                                                                                                                                                                                                                                                                                                                          | `audit:SegmentedControl/behavior`      |
| Target inventory    | `packages/core/src/theme/themingTargets.test.ts`                                                                                                                                                                                           | Control and item targets                                                | A rendered class absent from the documented targets fails.                                                                                                                                                                                                                                                                                                                                                                                 | `audit:SegmentedControl/theming`       |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                                                                              | Canonical anatomy and both current targets                              | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                                                                                                                                                                                                                                                                                                    | `audit:SegmentedControl/theming`       |

## Current-state impact

- **Disabled Tab stop (FR7).** A control disabled without a reason has no Tab
  stop, against `spec:AST-085` FR1 and FR7.
- **Disabled selected Tab stop (FR2, FR7).** A disabled selected segment
  loses the Tab stop to the first enabled segment, and a control disabled with
  a reason has no Tab stop when its value matches no segment or its selected
  segment is itself disabled, against `spec:AST-085` FR1.
- **Group reason (FR7).** A group `disabledMessage` describes only the
  radiogroup, not the focusable segment, against `spec:AST-085` FR5 and FR7.
- **Caller handlers while disabled (FR7).** Caller handlers on the radiogroup,
  such as `onKeyDown`, still run while disabled, against `spec:AST-085` FR2.
- **Caller description (FR8).** A caller `aria-describedby` on the control is
  replaced, against `architecture:public-component-api` INV5.

## Decision log

- **Keyboard model (FR2).** The keyboard model is horizontal only: ArrowLeft
  and ArrowRight skip disabled segments and select the segment they reach, and
  ArrowUp and ArrowDown do nothing. `spec:AST-085` leaves which items a
  composite's arrow keys visit to the composite.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
