---
schema_version: 3
template_version: 4
kind: component
id: component:BottomSheetSwitcher
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/BottomSheet/BottomSheetSwitcher.test.tsx,
    apps/storybook/stories/BottomSheetSwitcher.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-027]
---

# BottomSheetSwitcher component contract

## Intent

BottomSheetSwitcher coordinates a mutually exclusive sequence of BottomSheet
children inside one shared native dialog. This draft records verified shipped and
remediated behavior without adding a prop, changing a default, or settling the
open modality, hosting, identifier, or theming decisions below.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: observational backfill plus a shared-dismissal conformance
  fix; public props, defaults, exports, DOM ownership, and transition behavior stay
  unchanged
- Controlled/uncontrolled behavior: `activeSheet` remains fully controlled
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One shared native dialog for all directly nested BottomSheet children.
- Which child sheet is active, retained during a handoff, or hidden.
- Shared scrim, focus containment, scroll lock, Escape/platform-close routing,
  and final focus return for the flow.

**Does not own / non-goals**

- A child sheet's panel, content, handle, height, snap points, swipe mechanics, or
  local visual styling — owned by `component:BottomSheet`.
- Page-level stacking or clipping escape — owned by
  `architecture:layer-runtime` and `spec:AST-027`.
- An ordered visible sheet stack — proposed separately by open `BottomSheetStack`
  work and not part of this component.

## Public concepts

| Concept             | Closed values or states                              | Meaning                                                                               | Availability by variant/orientation/state                                      | Default                                | Owner                                                                     | Stability | Invalid-value behavior                                                                     |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| Active sheet        | `null` or one nested BottomSheet `sheetId`           | Selects the only interactive child, or closes the flow                                | All presentations                                                              | `null` is closed; the prop is required | `component:BottomSheetSwitcher`                                           | released  | A non-matching or duplicate id is not given a safe public fallback by the current contract |
| Shared presentation | `true` / `false` through `hasScrim`                  | Selects the current modal scrim-backed host or non-modal no-scrim host                | Entire flow                                                                    | `true`                                 | `component:BottomSheetSwitcher`                                           | released  | Boolean only                                                                               |
| Child identity      | Non-empty `sheetId` on each direct BottomSheet child | Associates controlled selection, labeling, purpose, and transition state with a child | Direct nested BottomSheet children                                             | none                                   | `component:BottomSheet`                                                   | released  | Empty ids warn and stay hidden; duplicate-id behavior is not specified                     |
| Dismissal request   | `onActiveSheetChange(null)`                          | Reports an allowed implicit close without taking control from the caller              | Escape/platform close, scrim click, or swipe according to active child purpose | none                                   | `component:BottomSheetSwitcher`; `family:overlay-dismissal` owns ordering | released  | The caller may retain its controlled value                                                 |
| Dialog surface      | inherited dialog props plus `ref` and `onCancel`     | Reaches the one shared native dialog                                                  | Entire flow                                                                    | none                                   | `component:BottomSheetSwitcher`                                           | released  | Component-owned semantics and handlers retain precedence                                   |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. This draft cannot clear the gaps it records.

| ID  | Candidate invariant                                                                                                                                                                                             | Basis                                                    | Draft review state                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FR1 | Zero or one child sheet is interactive for each controlled `activeSheet` value; all other children are hidden or retained inert and `aria-hidden` during a transition.                                          | Current source, docs, and tests                          | Verified shipped behavior                                                              |
| FR2 | All child sheets share one native dialog. Opening the first sheet opens that dialog once; handoffs do not replace it.                                                                                           | Current source, docs, and tests                          | Verified shipped behavior                                                              |
| FR3 | During a handoff, the entering sheet is above the retained sheet. A taller retained sheet aligns down to a shorter entering sheet, and the retained sheet fades only after required transform motion completes. | Current source and transition tests                      | Verified shipped behavior; exact visual treatment remains human-reviewed               |
| FR4 | Closing retains the outgoing sheet through its exit, then closes the dialog. A modal flow restores focus to the element captured when that modal flow opened.                                                   | Current source and focus tests                           | Verified shipped behavior                                                              |
| FR5 | `hasScrim=true` uses `showModal()`, a native backdrop, focus containment, and page scroll lock. `hasScrim=false` uses `show()` without a backdrop or scroll lock and leaves the page interactive.               | Current source, docs, tests, and Chromium evidence       | Verified shipped behavior; the non-modal host remains a `spec:AST-027` conformance gap |
| FR6 | The active child purpose governs implicit dismissal: `info` allows Escape, scrim click, and swipe; `form` allows Escape; `required` blocks all three and exposes `alertdialog`.                                 | Current BottomSheet docs and switcher tests              | Verified shipped behavior                                                              |
| FR7 | While visible, the switcher participates in `family:overlay-dismissal`; one Escape or platform close request reaches only the topmost present layer, and descendants receive a deeper logical layer scope.      | `family:overlay-dismissal` and the audit regression test | Settled remediation in this audit                                                      |
| FR8 | A stale gesture from an outgoing sheet cannot change the shared scrim, and unmounting a retained sheet cannot keep the shared dialog open.                                                                      | Current tests                                            | Verified shipped behavior                                                              |
| FR9 | The switcher forwards its ref, neutral dialog attributes, styling inputs, and composed handlers to the shared dialog while preserving its owned ARIA and dismissal behavior.                                    | Current source, public API architecture, and tests       | Verified shipped behavior                                                              |

### Allowed variation

- **AV1 — Child content and panel geometry.** Child content, height, snap points,
  and panel styling vary under `component:BottomSheet` without changing the
  switcher's one-active-child protocol.
- **AV2 — Transition timing.** Theme motion tokens may vary timing while preserving
  the ordering and inertness in FR3.

### Representative states

| State      | Required invariant                                                                                                    | Allowed variation                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Closed     | Shared dialog is closed and no child is interactive.                                                                  | Child panels may remain mounted but hidden.                                              |
| First open | Matching child is visible and interactive in one shared dialog.                                                       | Child-owned height and content.                                                          |
| Handoff    | Entering child is interactive; retained child is visible but inert and hidden from accessibility APIs until it fades. | Alignment offset depends on measured panel geometry.                                     |
| Closing    | Outgoing child is retained inert while exit motion completes; modal focus and scroll ownership remain until close.    | Theme-controlled duration.                                                               |
| Modal      | Native modal host, backdrop, focus containment, and scroll lock are active.                                           | Active child's `purpose` controls implicit dismissal.                                    |
| Non-modal  | Native non-modal host has no backdrop or scroll lock and background content remains interactive.                      | The current clipping/stacking limitation is a conformance gap, not an allowed exception. |

### Transformation and precedence order

- **ORD1 — Handoff completion.** Select next child → mark previous child retained
  and inert → start entering transform and any required retained alignment → wait
  for both transforms → fade retained child → hide it.
- **ORD2 — Label precedence.** Consumer `aria-label` wins; otherwise consumer
  `aria-labelledby` wins; otherwise the active or retained child label names the
  dialog.

### Performance and resources

- **PR1 — One shared host.** A flow keeps one dialog, focus boundary, scroll lock,
  and backdrop across child handoffs rather than mounting a host for every child.
- **PR2 — Stable child registration.** Parent rerenders and changing consumer ref
  identities do not unregister a mounted child or cancel an active handoff.

## Accessibility contract

- **AR1 — Dialog semantics.** Modal presentations expose `aria-modal`; a required
  child changes the implicit dialog role to `alertdialog`; every visible flow has
  a consumer-provided or active-child-derived accessible name.
- **AR2 — Focus and inertness.** Modal focus remains inside the dialog, retained
  children are inert and `aria-hidden`, and focus returns after the final exit.
- **AR3 — Ordered dismissal.** Escape and platform close follow
  `family:overlay-dismissal`, including IME protection and topmost-layer ordering.

## Design relationships

| Anatomy or state | Design requirement                                                               | Representation authority                               | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------- | ------------------ |
| Shared dialog    | Transparent host for the flow's interaction and accessibility boundary           | Current source and public docs                         | Structural     | FR2, FR5, AR1      |
| Sheet panels     | Delegate visible panel, content, handle, and gesture presentation to BottomSheet | `component:BottomSheet` draft as observational context | Prominent      | FR1, FR3           |
| Scrim            | Optional native backdrop that dims and blocks the page in modal presentation     | Current source and public docs                         | Supporting     | FR5                |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Shared dialog": {
    "none": {
      "reason": "intentional: The transparent dialog is hosting, positioning, event, and focus machinery rather than a stable painted part."
    }
  },
  "Sheet panels": {
    "delegatesTo": {"owner": "component:BottomSheet", "target": "bottom-sheet"}
  },
  "Scrim": {
    "none": {
      "reason": "reachability-gap: The switcher-owned native backdrop paints the scrim but has no current public theming target."
    }
  }
}
```

## Family and system relationships

- `family:overlay-dismissal` owns topmost Escape and platform-close ordering; the
  switcher adopts that shared owner while visible.
- `architecture:layer-runtime` owns native dialog behavior and current hosting.
- `architecture:component-theming-surface` owns anatomy qualification and target
  disposition.
- `architecture:public-component-api` and `spec:AST-002` own the released prop,
  DOM, ref, and compatibility surface.
- `spec:AST-027` identifies the non-modal `show()` plus page-level `z-index` path
  as a migration gap; this draft does not treat it as an exception.

## Verification map

| Contract         | Verification                                      | Representative states                                                                      | Mutation or failure expectation                                                                                        | Audit section                             |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1–FR4, FR8     | `BottomSheetSwitcher.test.tsx`                    | closed, first open, handoffs in either completion order, rapid replacement, unmount, close | A child becomes interactive at the wrong time, a retained child disappears early, or the shared host lifecycle breaks. | `audit:BottomSheetSwitcher/behavior`      |
| FR5–FR7, AR1–AR3 | `BottomSheetSwitcher.test.tsx`; Chromium evidence | modal/non-modal, info/form/required, nested layer, IME, focus return                       | Modality, dismissal order, naming, inertness, scroll lock, or focus behavior diverges.                                 | `audit:BottomSheetSwitcher/accessibility` |
| FR9              | `BottomSheetSwitcher.test.tsx`; export checks     | ref, DOM/ARIA/data/events, class, style, xstyle                                            | A supported input is dropped or overrides component-owned semantics accidentally.                                      | `audit:BottomSheetSwitcher/api`           |
| Theming anatomy  | `scripts/check-knowledge.mjs`; theming tests      | dialog, delegated sheet panel, scrim                                                       | A non-painting host gains a target, a delegated panel loses its owner, or the scrim gap disappears without review.     | `audit:BottomSheetSwitcher/theming`       |

## Decision log

None. This draft records observed behavior and one remediation already required by
current shared authority; it introduces no component-local design or API decision.

## Open questions

- **OQ1 — Should modality and scrim paint remain coupled behind `hasScrim`, or
  become independent public concepts?** (`human-api`)
- **OQ2 — What safe behavior should a non-matching or duplicate child `sheetId`
  have?** (`human-api`)
- **OQ3 — Should the switcher-owned scrim gain a public theming target?**
  (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables, audit scores, screenshots,
BottomSheet panel mechanics, shared dismissal rules, or layer-hosting migration
steps. It links to their owners.
