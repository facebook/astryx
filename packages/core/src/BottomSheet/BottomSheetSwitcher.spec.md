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
system_specs: [spec:AST-002, spec:AST-027, spec:AST-044]
---

# BottomSheetSwitcher component contract

## Intent

BottomSheetSwitcher coordinates a controlled ordered path of BottomSheet
children inside one shared native dialog. The canonical `activeSheets` list is
ordered bottom-to-top: `[]` is closed, one id is the released single-sheet
flow, and a longer path presents a drill-in stack whose last id is the only
interactive sheet. The released singular `activeSheet` remains a length ≤ 1
projection of the same list. This draft records verified shipped and
remediated behavior plus the `spec:AST-044` list-form projection implemented
additively, without changing a released default or settling the open
modality, hosting, identifier, or theming decisions below.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive list-form API (`activeSheets`,
  `onActiveSheetsChange`, `finalFocusRef`) over the released surface; public
  singular props, defaults, exports, DOM ownership, and single-sheet
  transition behavior stay unchanged
- Controlled/uncontrolled behavior: the path remains fully controlled through
  exactly one value/callback pair — the list form or the released singular
  form; supplying both warns in development and the list form wins
- Migration decision: none required; singular consumers may mechanically
  rename `activeSheet={id}` to `activeSheets={[id]}` per flow

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One shared native dialog for all directly nested BottomSheet children.
- The presented ordered path: which child sheets are open, their bottom-to-top
  order, which one is interactive, which are covered, retained during a
  transition, or hidden, and the longest-valid-prefix recovery for invalid
  ids.
- Shared scrim, focus containment, scroll lock, Escape/platform-close routing,
  intra-stack focus memory, and final focus return for the flow.

**Does not own / non-goals**

- A child sheet's panel, content, handle, height, snap points, swipe mechanics, or
  local visual styling — owned by `component:BottomSheet`.
- Page-level stacking or clipping escape — owned by
  `architecture:layer-runtime` and `spec:AST-027`.
- An imperative navigation API (`push()`, `pop()`, router, or history object);
  callers update the controlled path with ordinary state operations
  (`spec:AST-044`).

## Public concepts

| Concept             | Closed values or states                                                                            | Meaning                                                                               | Availability by variant/orientation/state                                                                | Default                       | Owner                                                                     | Stability    | Invalid-value behavior                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| Sheet path          | `activeSheets`: ordered unique nested `sheetId` list                                               | Bottom-to-top open path; `[]` closes, last id is the only interactive sheet           | All presentations                                                                                        | none (canonical list form)    | `component:BottomSheetSwitcher`                                           | new          | Longest valid leading prefix presents; first invalid id warns in development (`spec:AST-044`) |
| Active sheet        | `null` or one nested BottomSheet `sheetId`                                                         | Released singular projection of the path at length ≤ 1                                | All presentations                                                                                        | `null` is closed              | `component:BottomSheetSwitcher`                                           | released     | Projected into the path and recovered by the same longest-valid-prefix rule                   |
| Shared presentation | `true` / `false` through `hasScrim`                                                                | Selects the current modal scrim-backed host or non-modal no-scrim host                | Entire flow, at every path length                                                                        | `true`                        | `component:BottomSheetSwitcher`                                           | released     | Boolean only                                                                                  |
| Child identity      | Non-empty `sheetId` on each direct BottomSheet child                                               | Associates controlled selection, labeling, purpose, and transition state with a child | Direct nested BottomSheet children                                                                       | none                          | `component:BottomSheet`                                                   | released     | Empty, unknown, or ambiguously duplicated ids stay unavailable and cut the presented prefix   |
| Dismissal request   | `onActiveSheetsChange(nextIds, details)` or singular `onActiveSheetChange(nextIds.at(-1) ?? null)` | Reports an allowed implicit one-level pop without taking control from the caller      | Escape/platform close, visible modal-scrim activation, or top-sheet swipe according to top child purpose | none                          | `component:BottomSheetSwitcher`; `family:overlay-dismissal` owns ordering | new/released | The caller may retain its controlled value; the host restores transient state                 |
| Final focus         | `finalFocusRef` element                                                                            | Preferred focus destination after the path reaches `[]` and exit completes            | Entire flow                                                                                              | captured opener (modal flows) | `component:BottomSheetSwitcher`                                           | new          | A disconnected target falls back to the captured opener; non-modal close never steals focus   |
| Dialog surface      | inherited dialog props plus `ref` and `onCancel`                                                   | Reaches the one shared native dialog                                                  | Entire flow                                                                                              | none                          | `component:BottomSheetSwitcher`                                           | released     | Component-owned semantics and handlers retain precedence                                      |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. This draft cannot clear the gaps it records.

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                    | Basis                                                    | Draft review state                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FR1  | Zero or one child sheet is interactive for each controlled `activeSheet` value; all other children are hidden or retained inert and `aria-hidden` during a transition.                                                                                                                                 | Current source, docs, and tests                          | Verified shipped behavior                                                              |
| FR2  | All child sheets share one native dialog. Opening the first sheet opens that dialog once; handoffs do not replace it.                                                                                                                                                                                  | Current source, docs, and tests                          | Verified shipped behavior                                                              |
| FR3  | During a handoff, the entering sheet is above the retained sheet. A taller retained sheet aligns down to a shorter entering sheet, and the retained sheet fades only after required transform motion completes.                                                                                        | Current source and transition tests                      | Verified shipped behavior; exact visual treatment remains human-reviewed               |
| FR4  | Closing retains the outgoing sheet through its exit, then closes the dialog. A modal flow restores focus to the element captured when that modal flow opened.                                                                                                                                          | Current source and focus tests                           | Verified shipped behavior                                                              |
| FR5  | `hasScrim=true` uses `showModal()`, a native backdrop, focus containment, and page scroll lock. `hasScrim=false` uses `show()` without a backdrop or scroll lock and leaves the page interactive.                                                                                                      | Current source, docs, tests, and Chromium evidence       | Verified shipped behavior; the non-modal host remains a `spec:AST-027` conformance gap |
| FR6  | The active child purpose governs implicit dismissal: `info` allows Escape, scrim click, and swipe; `form` allows Escape; `required` blocks all three and exposes `alertdialog`.                                                                                                                        | Current BottomSheet docs and switcher tests              | Verified shipped behavior                                                              |
| FR7  | While visible, the switcher participates in `family:overlay-dismissal`; one Escape or platform close request reaches only the topmost present layer, and descendants receive a deeper logical layer scope.                                                                                             | `family:overlay-dismissal` and the audit regression test | Settled remediation in this audit                                                      |
| FR8  | A stale gesture from an outgoing sheet cannot change the shared scrim, and unmounting a retained sheet cannot keep the shared dialog open.                                                                                                                                                             | Current tests                                            | Verified shipped behavior                                                              |
| FR9  | The switcher forwards its ref, neutral dialog attributes, styling inputs, and composed handlers to the shared dialog while preserving its owned ARIA and dismissal behavior.                                                                                                                           | Current source, public API architecture, and tests       | Verified shipped behavior                                                              |
| FR10 | `activeSheets` is the only source of truth for the open path and its bottom-to-top order; the singular `activeSheet` is its length ≤ 1 projection, and exactly one controlled pair drives one internal path.                                                                                           | `spec:AST-044` (draft) FR1–FR2; switcher tests           | Implemented with this change; pending AST-044 acceptance                               |
| FR11 | Only the last presented id is interactive. Covered path levels stay mounted through pushes and pops, inert and `aria-hidden`, with a bounded internal recede treatment.                                                                                                                                | `spec:AST-044` (draft) FR17–FR19, FR25; switcher tests   | Implemented with this change; recede geometry remains internal pending AST-044 OQ5     |
| FR12 | One-id append and one-id removal animate as push and pop; a pop exits only the former top while the revealed sheet returns and becomes active. Any other valid path edit converges deterministically without bespoke choreography.                                                                     | `spec:AST-044` (draft) FR4, FR19–FR21; switcher tests    | Implemented with this change                                                           |
| FR13 | The presented path is the longest leading prefix of non-empty, unique ids each matching exactly one mounted child. Presentation stops before the first invalid id, a development warning names it, the controlled value is never rewritten, and no callback fires to normalize it.                     | `spec:AST-044` (draft) FR12–FR15; switcher tests         | Implemented with this change                                                           |
| FR14 | Implicit dismissal (Escape/platform close, visible modal-scrim activation, or top-sheet swipe, per the top sheet's purpose) requests the presented path without its final id — with `{reason, dismissedSheetId}` details on the list callback, and `nextIds.at(-1) ?? null` on the singular callback.  | `spec:AST-044` (draft) FR2, FR26–FR28; switcher tests    | Implemented with this change                                                           |
| FR15 | A push records the covered sheet's focused element; a pop restores it while connected and owned by that sheet. After the path reaches `[]` and exit completes, an eligible `finalFocusRef` target wins over the captured opener, and a non-modal close never steals focus that moved outside the flow. | `spec:AST-044` (draft) FR33–FR36, FR39; switcher tests   | Implemented with this change                                                           |

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
| Stacked    | Only the top path level is interactive; covered levels stay mounted, inert, `aria-hidden`, and receded behind it.     | Exact recede geometry and visual depth cap are internal (`spec:AST-044` OQ5).            |
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

| Contract         | Verification                                      | Representative states                                                                                                                              | Mutation or failure expectation                                                                                                                                         | Audit section                             |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1–FR4, FR8     | `BottomSheetSwitcher.test.tsx`                    | closed, first open, handoffs in either completion order, rapid replacement, unmount, close                                                         | A child becomes interactive at the wrong time, a retained child disappears early, or the shared host lifecycle breaks.                                                  | `audit:BottomSheetSwitcher/behavior`      |
| FR10–FR15        | `BottomSheetSwitcher.test.tsx`                    | list open, push, pop, deep initial path, close-all, both prop forms, unknown/duplicate ids, dismissal details, focus record/restore, finalFocusRef | A covered level stays interactive, a second history appears, an invalid suffix presents, dismissal pops more than one level, or focus lands outside the presented path. | `audit:BottomSheetSwitcher/behavior`      |
| FR5–FR7, AR1–AR3 | `BottomSheetSwitcher.test.tsx`; Chromium evidence | modal/non-modal, info/form/required, nested layer, IME, focus return                                                                               | Modality, dismissal order, naming, inertness, scroll lock, or focus behavior diverges.                                                                                  | `audit:BottomSheetSwitcher/accessibility` |
| FR9              | `BottomSheetSwitcher.test.tsx`; export checks     | ref, DOM/ARIA/data/events, class, style, xstyle                                                                                                    | A supported input is dropped or overrides component-owned semantics accidentally.                                                                                       | `audit:BottomSheetSwitcher/api`           |
| Theming anatomy  | `scripts/check-knowledge.mjs`; theming tests      | dialog, delegated sheet panel, scrim                                                                                                               | A non-painting host gains a target, a delegated panel loses its owner, or the scrim gap disappears without review.                                                      | `audit:BottomSheetSwitcher/theming`       |

## Decision log

None. This draft records observed behavior and one remediation already required by
current shared authority; it introduces no component-local design or API decision.

## Open questions

- **OQ1 — Should modality and scrim paint remain coupled behind `hasScrim`, or
  become independent public concepts?** (`human-api`) `spec:AST-044` (draft)
  proposes retaining the released coupling and adding no `modality` prop
  (its DEC-2); this contract keeps the released behavior either way.
- **OQ2 — What safe behavior should a non-matching or duplicate child `sheetId`
  have?** (`human-api`) Implemented here as the longest-valid-prefix rule
  proposed by `spec:AST-044` (draft) DEC-5; final acceptance belongs to that
  record's OQ4.
- **OQ3 — Should the switcher-owned scrim gain a public theming target?**
  (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables, audit scores, screenshots,
BottomSheet panel mechanics, shared dismissal rules, or layer-hosting migration
steps. It links to their owners.
