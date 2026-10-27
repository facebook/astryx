---
schema_version: 3
template_version: 7
kind: component
id: component:AlertDialog
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility, theming]
verified_by:
  [
    packages/core/src/AlertDialog/AlertDialog.test.tsx,
    packages/core/src/AlertDialog/useImperativeAlertDialog.test.tsx,
    packages/core/src/Dialog/Dialog.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: [design:reduced-motion]
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:layer-runtime,
  ]
contributing: []
system_specs:
  [spec:AST-020/FR15, spec:AST-094/FR4, spec:AST-094/FR13, spec:AST-094/FR19]
---

# AlertDialog component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. `AlertDialog`, `AlertDialogProps`, and `useImperativeAlertDialog` are exported from `@astryxdesign/core/AlertDialog`; `title`, `description`, `actionLabel`, `onAction`, and `onOpenChange` are required with `isOpen`, plus cancel label, action variant, loading, width, and an inline preview mode. |
| Behavior                | A modal confirmation that interrupts: it opens through the native dialog, cannot be dismissed by a click outside, closes on Escape or Cancel through `onOpenChange(false)`, and runs `onAction` on the action button.                                                                                                |
| End-user impact         | A keyboard or screen-reader user is told a decision is needed (the title and description are announced), lands on Cancel, and cannot lose the dialog by clicking past it.                                                                                                                                            |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                                |
| Compatibility/readiness | Released behavior as observed; this draft records it and adopts the APG Alert Dialog pattern (AR1) under `spec:AST-020/FR15`.                                                                                                                                                                                        |
| Review checks           | Reject a modal AlertDialog without `role="alertdialog"`, a title or description not linked by id, initial focus on the destructive action, or a backdrop click that dismisses it.                                                                                                                                    |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV8`; `architecture:component-theming-surface/INV3–INV7`; `architecture:layer-runtime`; `component:Dialog/AR1–AR3`; `spec:AST-020/FR15`.                                                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

AlertDialog asks a person to confirm or cancel one consequential action. It
composes Dialog's modal, focus, and dismissal runtime with a fixed anatomy —
title, description, Cancel, and one action — so a product gets an interrupting
confirmation without assembling it.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation; runtime, DOM, styling, targets, and
  public API are unchanged
- Controlled/uncontrolled behavior: unchanged — `isOpen` with `onOpenChange` is
  controlled; `useImperativeAlertDialog` owns that pair for a caller that wants
  `show`/`hide`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The confirmation anatomy and its order: title, description, then Cancel and
  action in the order FR3 states.
- The alert-dialog role, its name and description links, and the least-destructive
  initial focus.
- The imperative wrapper hook.

**Does not own / non-goals**

- Modal presentation, focus return, backdrop, and dismissal mechanics — owned by
  `component:Dialog` and `architecture:layer-runtime`.
- Button variants and loading — owned by `component:Button`.

## Public concepts

| Concept         | Closed values or states | Meaning                                                             | Availability by variant/orientation/state | Default         | Owner                   | Stability | Invalid-value behavior |
| --------------- | ----------------------- | ------------------------------------------------------------------- | ----------------------------------------- | --------------- | ----------------------- | --------- | ---------------------- |
| `isInline`      | `true`, `false`         | Renders the content inline as a non-modal preview (`role="group"`). | Always                                    | `false`         | `component:AlertDialog` | stable    | Type-rejected          |
| `actionVariant` | Button variants         | The action button's emphasis.                                       | Always                                    | `'destructive'` | `component:Button`      | stable    | Button's behavior      |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Basis                                                                            | Draft review state |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------ |
| FR1 | A modal AlertDialog opens through Dialog's native modal path and a click on the backdrop does not dismiss it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | shipped source (`purpose="form"`); Alert Dialog accessibility contract (pending) | verify             |
| FR2 | Escape and the Cancel button both call `onOpenChange(false)`; the action button calls `onAction` and leaves closing to the caller.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | shipped source and focused tests                                                 | verify             |
| FR3 | The anatomy is title, description, then the buttons: Cancel then action on wider screens, the action stacked above Cancel on small screens, Cancel keeping initial focus either way; the action may show a loading state while `isActionLoading`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | shipped source and focused tests                                                 | verify             |
| FR4 | `isInline` renders the same anatomy without modality and without the alert-dialog role.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | shipped source and public docs                                                   | verify             |
| FR5 | `useImperativeAlertDialog` returns `show`, `hide`, and the element to render, and owns `isOpen`/`onOpenChange` for its caller.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | shipped source and focused tests                                                 | verify             |
| FR6 | Under a touch presentation (`spec:AST-094` FR13), a modal AlertDialog presents by scaling from 1.2 to 1 with its opacity and its backdrop's dimming rising from 0 to 1 on the motion role `springs.alertPresent`, started at the browser's commit, with the larger start kept inside the viewport; it dismisses by a fade alone on `springs.alertDismiss` and closes at the fade's end; a close during the presentation, or a reopen during the dismissal, springs from where it is. The roles are internal with UIKit's measured values (`spec:AST-094` FR4, DEC-11). Under Reduce Motion both are the shared cross-fade (`design:reduced-motion` DR1–DR3). A fine primary pointer keeps today's motion (`spec:AST-094` FR19). | proposed from measured iOS 26.2 behavior                                         | owner review       |
| FR7 | Under a touch presentation, pointer input to the alert is held while it enters, through the layer runtime's shared input hold (`spec:AST-094` FR35); keyboard and assistive-technology input are never held, and the entrance never makes the content inert. While the alert leaves, its content is inert for the dismissal fade. The hold's timing stays internal (`spec:AST-002` FR3).                                                                                                                                                                                                                                                                                                                                        | `spec:AST-094` FR35; owner decision (DEC-1)                                      | decided            |
| FR8 | AlertDialog's actions are an action group (`family:action-groups`): a press that slides across them runs the action it lifts on, and a lift outside them runs nothing, under every pointer; keyboard and assistive-technology behavior is unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `family:action-groups`; `spec:AST-094` DEC-17                                    | decided            |
| FR9 | On a phone, a compact width under a coarse primary pointer, the alert is 320 px wide in every theme, as iOS's is; no theme role sets it. Elsewhere it keeps today's width.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | owner decision (DEC-2)                                                           | decided            |

### Allowed variation

- **AV1 — Layout.** Spacing and button width follow Dialog and Layout; the
  small-screen stacking and order are FR3's.

### Representative states

| State          | Required invariant                                          | Allowed variation      |
| -------------- | ----------------------------------------------------------- | ---------------------- |
| open, modal    | `role="alertdialog"`, named and described, focus on Cancel. | Width, action variant. |
| action loading | The action shows loading; Cancel stays available.           | Loading affordance.    |
| inline preview | `role="group"`, no modality, same content.                  | Surrounding page.      |
| imperative     | `show()` opens and `hide()` closes the same dialog.         | Caller's trigger.      |

### Transformation and precedence order

- **ORD1 — Dismissal.** Escape or Cancel → `onOpenChange(false)`; backdrop click →
  nothing; action → `onAction` only.

### Performance and resources

- **PR1 — Dialog-owned resources.** AlertDialog's only listener is the
  small-screen media query behind the button order; Dialog owns the modal
  lifecycle.

- **PR2 — The touch presentation adds no element.** The motion plays on the
  dialog surface and its `::backdrop`; AlertDialog renders no extra element
  under a touch presentation, within `spec:AST-017` FR60's open-layer
  allowance (`architecture:component-style-authoring` INV7).

## Accessibility contract

- **AR1 — AlertDialog adopts the APG Alert Dialog pattern** (`spec:AST-020/FR15`):
  the modal surface is `role="alertdialog"`, named by its title through
  `aria-labelledby` and described by its description through `aria-describedby`;
  it is modal through Dialog (focus enters it and returns to the opener on close
  per `component:Dialog/AR1–AR2`; Tab containment follows Dialog, whose record
  leaves it open); initial
  focus lands on Cancel, the least destructive action; Escape cancels; no click
  outside dismisses it. The inline preview is not an alert dialog and carries
  `role="group"`.

## Design relationships

| Anatomy or state | Design requirement                                                                             | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Title            | Names the decision.                                                                            | `component:Heading`      | Prominent      | FR3, AR1           |
| Description      | States the consequence.                                                                        | `component:Text`         | Supporting     | FR3, AR1           |
| Cancel button    | The safe way out; receives initial focus.                                                      | `component:Button`       | Supporting     | FR2, AR1           |
| Action button    | The consequential choice, with its variant and loading; stacked above Cancel on small screens. | `component:Button`       | Prominent      | FR2, FR3           |
| Backdrop         | Separates the dialog from the page; does not dismiss it.                                       | `component:Dialog`       | Supporting     | FR1                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Title": {"delegatesTo": {"owner": "component:Text", "target": "heading"}},
  "Description": {"delegatesTo": {"owner": "component:Text", "target": "text"}},
  "Cancel button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Action button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Backdrop": {
    "delegatesTo": {"owner": "component:Dialog", "target": "dialog"}
  },
  "Dialog surface": {"target": "alert-dialog"}
}
```

The dialog surface (the Dialog element AlertDialog renders) carries `alert-dialog`.

## Family and system relationships

- `component:Dialog` owns modality, focus return, and dismissal; AlertDialog
  composes it with `purpose="form"` semantics and the alert-dialog role.
- `family:overlay-dismissal` lists AlertDialog as a member: it dismisses through
  Dialog's shared owner with no deviation of its own; Escape cancels it and a
  backdrop click does not (FR1).
- `spec:AST-020/FR15` decides which APG parts a component adopts; AlertDialog
  adopts the Alert Dialog pattern's required parts because it already plays that
  role.

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Representative states                                                                                               | Mutation or failure expectation                                                                                                                                         | Audit section                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1–FR5  | `AlertDialog.test.tsx` ("calls onOpenChange(false) on Escape", "does not call onOpenChange when action is clicked", "does not call onAction on Escape", "does not disable the cancel button while the action is loading", "exposes a named group instead, with no aria-modal") and `useImperativeAlertDialog.test.tsx` ("opens on show()", "closes on hide()")                                                                                                                                                                                                                                                                                                             | open, loading, inline, imperative                                                                                   | Escape not cancelling, the action closing by itself, or the inline path claiming the role fails.                                                                        | `audit:AlertDialog/behavior`      |
| FR6, PR2 | Browser tests under a coarse pointer in Chromium and WebKit, a spring-curve oracle, a busy-main-thread case, and real-device clips on iOS Safari and Android Chrome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | present, dismiss, close during present, reopen during dismiss, Reduce Motion, a fine pointer, a narrow viewport     | a curve off its role, a start outside the viewport, a jump on interruption, a scale under Reduce Motion, changed motion under a fine pointer, or an added element fails | `audit:AlertDialog/behavior`      |
| FR7      | Browser tests under a coarse pointer, with keyboard and assistive-technology input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | a tap during the presentation, Enter and Escape during it, a screen reader's activation, a tap during the dismissal | a held key or assistive-technology action, content made inert during the entrance, or a tap that reaches a leaving alert fails                                          | `audit:AlertDialog/behavior`      |
| FR8      | Pointer-stream tests with a mouse, a pen, and a finger, and keyboard tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                     |                                                                                                                                                                         |                                   |
| FR9      | Browser tests at a phone width and at a desktop width, in the default and an alternate theme                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | the default theme, an iOS-style theme, and Dialog's compact size reading the same role                              | a width other than the theme's fails                                                                                                                                    | `audit:AlertDialog/behavior`      |
| AR1      | `AlertDialog.test.tsx` ("renders with alertdialog role", "links title via aria-labelledby", "links description via aria-describedby", "marks cancel as the initial focus target", "keeps the initial focus target on the least destructive action", "calls onOpenChange(false) on Escape", "stacks long destructive action labels above cancel on a narrow fine-pointer screen", "reaches both buttons by Tab, cancel first", "is a modal alertdialog", "does not claim the alertdialog role") and `useImperativeAlertDialog.test.tsx`; the no-backdrop-dismiss outcome and focus delegation under the Alert Dialog accessibility contract (`internal/a11y-spec`, pending) | open modal; after Escape; after Cancel                                                                              | The role, name link, description link, or Cancel initial focus is lost, or a click outside dismisses the dialog.                                                        | `audit:AlertDialog/accessibility` |

## Decision log

### DEC-1 — An alert holds pointer input while it enters

**Reference:** `component:AlertDialog/DEC-1`
**Decider:** `cixzhang`, `2026-10-26`

An alert follows every touch presentation's entrance hold (`spec:AST-094`
FR35): pointer input only, never keyboard or assistive technology, and its
content is inert only while it fades out.

### DEC-2 — On a phone an alert is 320 px wide in every theme

**Reference:** `component:AlertDialog/DEC-2`
**Decider:** `cixzhang`, `2026-10-26`

A phone-width alert matches iOS's 320 px in every theme, so it reads as a
system alert; a theme role for it is not added.

Rejected: a general compact-dialog width theme role.

## Open questions

## Content boundary

This file does not duplicate consumer prop tables or examples
(`AlertDialog.doc.mjs`), Dialog's modal contract, or shared theming rules. It
links to their owners.
