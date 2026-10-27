---
schema_version: 3
template_version: 7
kind: component
id: component:Tooltip
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-27
owners: [cixzhang]
review_triggers: [behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/Tooltip/Tooltip.test.tsx,
    packages/core/src/Tooltip/useTooltip.test.tsx,
    packages/core/src/Tooltip/__tests__/Tooltip.a11y.test.tsx,
    packages/core/src/Tooltip/__tests__/Tooltip.a11y.chromium.spec.ts,
    packages/core/src/Tooltip/__tests__/TooltipHoverBridge.a11y.chromium.spec.ts,
    packages/core/src/Tooltip/__tests__/TooltipFocusReturn.a11y.chromium.spec.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Tooltip component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Tooltip` with `content`, `children` or `anchorRef`, `placement` (`above`), `alignment` (`center`), `delay` (200), `hideDelay` (0), `focusTrigger` (`auto`), `touchTrigger` (`auto`), `isEnabled`, `isOpen`, `isDefaultOpen`, `onOpenChange`, and `hasHoverIndication`; target `tooltip`. |
| Behavior                | A `role="tooltip"` layer that describes its trigger. It opens on hover after `delay`, on keyboard focus, and on a qualifying tap; it stays open while the pointer moves onto it, and closes on leave, Escape, or pressing the trigger.                                                    |
| End-user impact         | Mouse, keyboard, and touch users can each reveal the hint, move onto it, and dismiss it; screen-reader users hear it as the trigger's description.                                                                                                                                        |
| Builder impact          | None.                                                                                                                                                                                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no public change.                                                                                                                                                                                                                                               |
| Review checks           | Reject a tooltip that cannot be hovered or dismissed (WCAG 1.4.13), one that opens on pointer or programmatic focus, a lost `aria-describedby` link, or Escape that also closes a layer underneath.                                                                                       |
| Governing rules         | WCAG 1.4.13; `family:overlay-dismissal`; `architecture:layer-runtime`; `architecture:interaction-modality`; `architecture:component-theming-surface`.                                                                                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

Tooltip renders supplied tooltip content on an owned overlay surface associated
with a caller-owned trigger. It owns how the trigger is wired, when the tooltip
opens and closes for each input, and the surface's anatomy. Consumer usage lives
in `Tooltip.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: uncontrolled by default; `isOpen` forces the
  state, and a controlled tooltip reports close requests through
  `onOpenChange(false)` without closing itself (FR7)
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The rendered tooltip surface and content inside that surface (FR1).
- Trigger wiring and when the tooltip opens and closes for each input
  (FR2–FR8).

**Does not own / non-goals**

- The trigger element — supplied by the caller or referenced externally and
  outside Tooltip's owned anatomy.
- An arrow element — the current implementation renders none.
- Layer hosting and anchor positioning — owned by `architecture:layer-runtime`;
  shared Escape ordering — owned by `family:overlay-dismissal`.
- The `useTooltip` hook's public contract — an uncontracted module; this record
  covers Tooltip's observable behavior.

## Public concepts

| Concept       | Closed values or states   | Meaning                                                                                           | Availability by variant/orientation/state | Default | Owner               | Stability | Invalid-value behavior           |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------- | ------------------- | --------- | -------------------------------- |
| Focus trigger | `auto`, `always`, `never` | Whether keyboard focus opens the tooltip: only on naturally focusable triggers, always, or never. | Every trigger mode.                       | `auto`  | `component:Tooltip` | Stable    | TypeScript rejects other values. |
| Touch trigger | `auto`, `tap`, `none`     | Whether a tap opens it: unless the trigger performs its own action, always, or never.             | Touch and pen without hover.              | `auto`  | `component:Tooltip` | Stable    | TypeScript rejects other values. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                | Basis                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1 | The rendered tooltip contains one owned surface, `role="tooltip"`, carrying the `tooltip` target, at most 300 px wide, with the supplied `content` inside; content has no separate target and there is no arrow.                                                                                                                         | Current source, docs, and tests |
| FR2 | Trigger wiring: text-only `children` are wrapped in a focusable inline span; element `children` attach to their first element; `anchorRef` attaches to that element. The trigger's `aria-describedby` gains the tooltip id, merged with and later restored to any existing value.                                                        | Current source and tests        |
| FR3 | On a hover-capable pointer, entering the trigger opens after `delay` ms; leaving closes after `hideDelay` ms. With `hideDelay` 0 a short bridge lets the pointer move onto the surface without closing it, and the surface stays open while hovered.                                                                                     | WCAG 1.4.13; tests              |
| FR4 | Keyboard focus that matches `:focus-visible` opens the tooltip per `focusTrigger`; pointer, programmatic, and tap-induced focus do not.                                                                                                                                                                                                  | Current source and tests        |
| FR5 | On touch, a completed tap opens per `touchTrigger` when the finger lifts; a touch that becomes a scroll, or a press the browser does not count as a tap, does not open it. A second tap on the trigger, a tap outside, or a scroll starting outside closes it.                                                                           | Current source and tests        |
| FR6 | Escape closes a visible tooltip through the shared dismissal stack when it is the topmost layer and is consumed there, so a layer underneath stays open; Escape during text composition is ignored. Pressing an uncontrolled tooltip's trigger closes it.                                                                                | WCAG 1.4.13; tests              |
| FR7 | `isOpen` forces the tooltip shown or hidden and suppresses hover and focus hiding; a controlled tooltip answers Escape by calling `onOpenChange(false)` without hiding, and is not closed by pressing the trigger. `isDefaultOpen` opens it on mount, still dismissible. `isEnabled={false}` disables triggers and drops a pending open. | Current source and tests        |
| FR8 | `onOpenChange` reports each show and hide. `hasHoverIndication` (`auto`: text-only children) adds a hover cue to the inline trigger.                                                                                                                                                                                                     | Current source and tests        |

### Allowed variation

- Supplied content may vary without adding a Tooltip-owned child target.

### Representative states

- The owned anatomy is unchanged across wrapped-trigger and external-anchor
  modes; the trigger remains outside it.

### Transformation and precedence order

- **ORD1 — Open state.** `isOpen`, then the input triggers.

### Performance and resources

- **PR1 — Timers.** A pending show is dropped when triggers are disabled or the
  component unmounts.

## Accessibility contract

- **AR1 — Description.** The trigger's `aria-describedby` names the tooltip
  (FR2).
- **AR2 — Content on hover or focus.** The tooltip is hoverable, dismissible,
  and persistent per WCAG 1.4.13 (FR3, FR6).
- **AR3 — Focus modality.** Only keyboard focus opens it (FR4).
- **AR4 — Focus return.** When closing a popover from the keyboard returns
  focus to a trigger that carries a tooltip, the tooltip shows for that focus
  without an error.

## Design relationships

| Anatomy or state | Design requirement                                  | Representation authority       | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Tooltip surface  | Presents the current painted overlay surface.       | Current source and public docs | Supporting     | FR1, FR2           |
| Tooltip text     | Presents supplied content within the owned surface. | Current source and public docs | Prominent      | FR1, FR2           |

The trigger is caller-owned and outside this anatomy. The current implementation
has no arrow element.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Tooltip surface": {"target": "tooltip"},
  "Tooltip text": {"inherits": "tooltip"}
}
```

## Family and system relationships

- `family:overlay-dismissal` owns Escape routing and topmost handling.
- `architecture:layer-runtime` owns hosting and positioning.
- `architecture:interaction-modality` owns the focus-visible modality FR4 uses.
- `architecture:component-theming-surface` owns the `tooltip` target.

## Verification map

| Contract            | Verification                                                                                                                                     | Representative states                               | Mutation or failure expectation                                                  | Audit section                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| FR1                 | `Tooltip.test.tsx` role/content suite                                                                                                            | Rendered surface and supplied content               | Removing the surface or content fails existing tooltip role and text assertions. | `audit:Tooltip/anatomy`       |
| FR2–FR8             | `Tooltip.test.tsx`; `useTooltip.test.tsx`                                                                                                        | Hover, focus, tap, Escape, controlled, default open | Wrong open or close for an input fails.                                          | `audit:Tooltip/behavior`      |
| AR1–AR4             | `Tooltip.a11y.test.tsx`; `Tooltip.a11y.chromium.spec.ts`; `TooltipHoverBridge.a11y.chromium.spec.ts`; `TooltipFocusReturn.a11y.chromium.spec.ts` | Real-browser hover bridge and focus return          | A tooltip that vanishes on the way to it or strands focus fails.                 | `audit:Tooltip/accessibility` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                    | Canonical anatomy and current target                | Missing, extra, prefixed, or stale mappings fail repository validation.          | `audit:Tooltip/theming`       |

Read from source, with no focused test yet:

- FR1: the 300 px maximum width, the `tooltip` target, and the absence of an
  arrow.
- FR4: `focusTrigger="always"` and `"never"`, and programmatic focus not
  opening the tooltip.
- FR8: `hasHoverIndication`.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, layer-system rules,
implementation steps, or system rules. It links to their owners.
