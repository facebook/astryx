---
schema_version: 3
template_version: 3
kind: component
id: component:BottomSheet
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming, layout, public-api]
verified_by:
  [
    packages/core/src/BottomSheet/BottomSheet.test.tsx,
    packages/core/src/BottomSheet/BottomSheetPanel.test.tsx,
    packages/core/src/BottomSheet/BottomSheetKeyboard.test.tsx,
    packages/core/src/BottomSheet/__tests__/BottomSheetKeyboard.a11y.browser.spec.ts,
    packages/core/src/BottomSheet/__tests__/BottomSheetScrollLock.a11y.browser.spec.ts,
    packages/core/src/BottomSheet/__tests__/BottomSheetNativeModal.a11y.browser.spec.ts,
    packages/core/src/BottomSheet/sheetScrollLock.test.ts,
    apps/storybook/stories/BottomSheet.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:layer-runtime,
  ]
contributing: []
system_specs: [spec:AST-025]
---

# BottomSheet component contract

## Intent

BottomSheet presents caller-provided content in a panel that rises from the
bottom edge. This draft records current consumer anatomy, keyboard-reachable
scrolling, theming reachability, and the Content area's container padding.

## Compatibility and migration

- Released default preserved: `no` — with no `padding` prop and no theme
  padding, the Content area insets by `--spacing-4` on every logical edge
- Compatibility class: breaking default, scheduled for a minor release. Content
  whose only child is a padded Section keeps its geometry because that Section
  escapes the inset; content that supplies its own inset is padded twice until
  it drops that inset or sets `padding={0}`
- Controlled/uncontrolled behavior: unchanged
- Migration decision: `padding={0}` restores the released unpadded Content area

Consumer migration instructions belong in consumer docs and release notes.

### DEP-0009 — Deprecate the unpadded default Content area of `BottomSheet`

| Field            | Value                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id               | `DEP-0009`                                                                                                                                                          |
| cleanup          | `CLN-0018`                                                                                                                                                          |
| package          | `@astryxdesign/core`                                                                                                                                                |
| surface          | Default inset of the `BottomSheet` Content area when no `padding` prop and no theme padding are set                                                                 |
| old contract     | The Content area has no padding                                                                                                                                     |
| replacement      | `padding={0}` keeps the unpadded Content area; `padding` and theme padding already resolve before the default                                                       |
| direct authority | `component:BottomSheet` Compatibility and migration. Owners: `cixzhang`                                                                                             |
| warning          | Consumer docs and the release notes name `DEP-0009` and `padding={0}`. No runtime warning (`spec:AST-017` FR29)                                                     |
| migration        | Mechanical: add `padding={0}` to a BottomSheet that sets no padding, unless its only child is a padded Section or a Layout                                          |
| codemod          | `astryx upgrade` adds `padding={0}` before any spread, skips sheets whose only child is a core Section or Layout, and marks a nested padding-less Layout for review |
| downstream       | In-repo sheets that supply their own inset pass `padding={0}`; consumer examples rely on the default inset                                                          |
| transition       | no prior transition                                                                                                                                                 |
| state            | `proposed`                                                                                                                                                          |
| open decision    | This record is draft and needs approval                                                                                                                             |
| target plan      | `CLN-0018` in the next minor release                                                                                                                                |

### CLN-0018 — BottomSheet pads its Content area by default

| Field     | Value                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| id        | `CLN-0018`                                                                                                                           |
| lifecycle | `DEP-0009`                                                                                                                           |
| delta     | With no `padding` prop and no theme padding, the Content area insets by `--spacing-4` on every logical edge and publishes that inset |
| rollback  | Restore the unpadded default from the final-patch baseline                                                                           |
| state     | `pending` — lands in a declared minor with its `[breaking]` Changeset                                                                |

## Ownership boundary

**Owns**

- The visual Sheet panel and its current `bottom-sheet` target.
- The scrolling Content area, its shared viewport/content-box integration, and
  automatic keyboard-path selection.
- The Content area's container padding, published per
  `architecture:container-padding`.
- Standalone sheet presentation, including its optional native-dialog Scrim.
- The native dialog every sheet renders, standalone or switcher-managed, and
  the page scroll lock of a modal sheet (FR5, DEC-2).

**Does not own / non-goals**

- Caller-provided content rendered inside the Content area.
- A separate target for Content area, Handle, or Scrim; none exists on current
  `main`.
- The presentation lifecycle of its dialog and the flow's scrim ownership when
  the sheet participates in a BottomSheetSwitcher — owned by BottomSheetSwitcher.
- Shared layer hosting or dismissal policy.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `BottomSheet.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Basis                              | Draft review state                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| FR1 | The current presented sheet contains one Sheet panel, one scrolling Content area, and one decorative Handle; a Scrim is present only in scrim-backed presentation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Current source, docs, and tests    | Verified current behavior; no new behavior decided  |
| FR2 | The Sheet panel carries `bottom-sheet`; Content area, Handle, and Scrim carry no BottomSheet public target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source, docs, and tests    | Verified current behavior; no target change         |
| FR3 | Content renders in one real observed content box. Effective overflow, containment, and keyboard access come from `useScrollableArea`; the named overflowing body delegates forward Tab entry to a safe first sequential native link/button.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `spec:AST-025`; issue #5207; tests | Focus-time prototype for owner review               |
| FR4 | The Content area pads caller content by the sheet's container inset and publishes the applied inset to descendants as a container publisher.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `architecture:container-padding`   | Admitted; implementation pending                    |
| FR5 | While a sheet dialog is modal the page does not scroll: not by wheel, keyboard, or touch, and not by chaining from the sheet's own content. The lock holds from the moment the dialog is presented until the last modal sheet dialog has closed, including through a switcher handoff and beneath a modal `Dialog` opened from the sheet. The sheet's lock sets no inline positioning or overflow styles on `<body>`, and the page's scroll offset is the same when the lock releases as when it engaged. A classic scrollbar's gutter is held open only when that scrollbar takes layout space when the sheet is presented; on an engine without `scrollbar-gutter`, that hold is a `<body>` padding equal to the scrollbar's width, released with the lock. | DEC-2; `spec:AST-013` FR7, FR10    | Owner decision; real-device iOS touch evidence owed |

### Allowed variation

- Caller-provided children may vary without becoming BottomSheet-owned anatomy.
- Height, snap points, motion phase, and standalone versus switcher hosting may
  vary without changing the four-part anatomy recorded here.

### Representative states

- A standalone modal sheet renders Sheet panel, Content area, Handle, and Scrim.
- A standalone non-modal sheet renders Sheet panel, Content area, and Handle
  without a Scrim.
- A switcher-managed sheet renders the same panel anatomy in its own dialog while
  BottomSheetSwitcher coordinates that dialog's lifecycle and the flow's one Scrim.
- A modal sheet dialog locks page scroll (FR5) alone, beneath a modal `Dialog`
  opened from it, and through a switcher handoff in which two sheet dialogs are
  open; a non-modal sheet locks nothing. On a page whose `<body>` owns the
  viewport scroll, the lock holds that scroller and keeps its offset too.

### Transformation and precedence order

- Content area inset: the `padding` prop, then the theme's `padding` properties
  on `bottom-sheet`, then `--spacing-4` on every logical edge.
- No new height, gesture, or motion precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

- **AR1 — Keyboard scroll path.** The named body is a tab stop while effectively
  overflowing. On forward Tab entry, the shared hook may delegate to the first
  sequential native link/button outside navigation-key-owning surfaces. It keeps
  the body stop for excluded content and skips the body on reverse traversal
  from the delegated first child.
- **AR2 — Focus continuity.** Content, overflow, or eligibility changes MUST NOT
  move focus. Pointer/programmatic body focus never delegates. A focused body
  losing overflow remains programmatically focusable.

## Design relationships

| Anatomy or state | Design requirement                                                                    | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Sheet panel      | Presents the painted bottom-edge surface and owns panel geometry and motion.          | Current source and public docs | Prominent      | FR1, FR2           |
| Content area     | Provides the scrolling, inset area for caller-provided sheet content.                 | Current source and tests       | Prominent      | FR1, FR2, FR4      |
| Handle           | Presents the decorative grab affordance and owns the panel's drag interaction region. | Current source and tests       | Supporting     | FR1, FR2           |
| Scrim            | Dims and blocks the page in a scrim-backed host.                                      | Current source and public docs | Supporting     | FR1, FR2           |

Content area, Handle, and Scrim are stable visible parts, but no current public
target reaches them. Their `none` dispositions record factual reachability, not
a decision that they must remain unthemeable.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Sheet panel": {"target": "bottom-sheet"},
  "Content area": {
    "none": {
      "reason": "reachability-gap: No current public target reaches the scrolling content area."
    }
  },
  "Handle": {
    "none": {
      "reason": "reachability-gap: No current public target reaches the handle bar or pill."
    }
  },
  "Scrim": {
    "none": {
      "reason": "reachability-gap: No BottomSheet public target reaches the native dialog backdrop, standalone or switcher-coordinated."
    }
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, and factual `none` dispositions.
- `architecture:container-padding` owns the shared container inset protocol and
  admits the Content area as a container publisher.
- `architecture:layer-runtime` owns the current native-dialog host distinction
  and records that sheets retain local scrim and swipe behavior.
- `spec:AST-025` owns effective scroll measurement, overflow and containment,
  automatic keyboard-owner selection, and focus continuity.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering. A
  standalone BottomSheet registers with the shared stack while it is presented;
  a switcher-hosted sheet is covered by BottomSheetSwitcher's registration.

## Verification map

| Contract            | Verification                                                                                                                                                                       | Representative states                                                                                                                                                       | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                         | Audit section                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1                 | `BottomSheet.test.tsx` render, content, Handle, and scrim behavior suites                                                                                                          | Modal, non-modal, and switcher presentations                                                                                                                                | Removing a documented part fails existing content, structure, or dismissal assertions.                                                                                                                                                                                                                                                                                                                                                                  | `audit:BottomSheet/anatomy`       |
| FR2                 | Panel target assertion, source inspection, and theming target inventories                                                                                                          | Sheet panel, Content area, Handle, and Scrim                                                                                                                                | Removing the panel target or documenting an unshipped child target fails evidence or inventory.                                                                                                                                                                                                                                                                                                                                                         | `audit:BottomSheet/theming`       |
| FR3, AR1–AR2        | `BottomSheetKeyboard.test.tsx`; `BottomSheetKeyboard.a11y.browser.spec.ts`; open Storybook stories                                                                                 | fitting/overflow, plain text, usable/unusable/dynamic descendants, focus                                                                                                    | Missing/duplicate keyboard access, stale ownership, focus movement, or broken content-box layout fails.                                                                                                                                                                                                                                                                                                                                                 | `audit:BottomSheet/accessibility` |     | Layout evidence | `BottomSheetPanel.test.tsx` | Floating Handle and scrolling Content area | Reordering or merging the stable parts fails existing panel structure and style assertions. | `audit:BottomSheet/anatomy` |
| FR4                 | `BottomSheetPanel.test.tsx` container padding tests; `derivedVarRegistry.test.ts`                                                                                                  | default, `padding` prop, theme `padding`, lone padded Section child                                                                                                         | The published inset differs from the applied padding, or a lone padded Section changes geometry.                                                                                                                                                                                                                                                                                                                                                        | `audit:BottomSheet/anatomy`       |
| FR5                 | `sheetScrollLock.test.ts`; `BottomSheet.test.tsx` native modal host suite; `BottomSheetScrollLock.a11y.browser.spec.ts` in Chromium and WebKit; real-device iOS Safari touch check | modal, non-modal, beneath a Dialog, through a handoff, with and without a classic scrollbar, a `<body>` that owns the viewport scroll, an engine without `scrollbar-gutter` | The page scrolls behind a modal sheet; the sheet's own lock sets inline positioning or overflow on `<body>` (a `Dialog` opened from the sheet keeps its own body pin, so that state is excluded from this signal); the offset differs after release; the lock, or its gutter padding, outlives the last modal sheet dialog; a gutter is reserved on a page that had no scrollbar; or the page reflows sideways where `scrollbar-gutter` is unsupported. | `audit:BottomSheet/behavior`      |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                      | Canonical anatomy and current target inventory                                                                                                                              | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                                                                                                                                                                                                                                                                                                                                                              | `audit:BottomSheet/theming`       |

Existing tests directly assert the Sheet panel target, Content area placement,
Handle structure, and scrim behavior. Source and public target metadata confirm
that the other three parts have no public target.

## Decision log

### DEC-1 — BottomSheet adopts automatic shared keyboard ownership

**Reference:** `component:BottomSheet/DEC-1`
**Decider:** cixzhang, 2026-09-13

BottomSheet supplies its existing label to
`keyboardAccess.owner="contentOrViewport"`. The shared hook keeps the overflowing
body named and tabbable, delegating forward keyboard entry to a safe first native
link/button. Pointer/programmatic focus and excluded content keep the body path. BottomSheet retains `stickyContainment="always"` because the
body deliberately remains the sheet-local Sticky boundary.

A real flow-root content box supplies the hook's observation seam while preserving
representative margin, float, percentage-height, flex/grid-child, and hug-height
behavior.

### DEC-2 — The page scroll lock follows the modal dialog's own state

**Reference:** `component:BottomSheet/DEC-2`
**Decider:** imdreamrunner, 2026-10-20

A modal sheet's page scroll lock is bound to the sheet dialog being modal
(FR5): it holds exactly while any sheet dialog is in the top layer, without a
lock counter, a saved scroll offset, or inline styles on `<body>`, so any
number of open sheet dialogs, presented and re-presented in any order, lock
and release correctly. The scrollbar gutter is held only when a classic
scrollbar takes layout space at present time, because the dialog backdrop does
not cover a reserved gutter and a page without a scrollbar must not gain an
undimmed strip. The mechanism — a stylesheet rule keyed off the browser's
modal-dialog state — is the implementation's, not a public contract: an
equivalent implementation that meets FR5's observable effects satisfies this
decision.
Rejected: pinning `<body>` from script with a saved offset, because every
design that keeps more than one sheet dialog open must then keep a lock
counter and a saved offset balanced across presents and re-presents.

## Open questions

- **OQ1 — Should Content area, Handle, or Scrim gain a stable public theming
  target?** (`human-api`) Their current lack of reachability is an audit gap, not
  settled intent.

## Content boundary

This file does not duplicate consumer prop tables, examples, gesture algorithms,
implementation steps, or shared layer and theming rules. It links to their
owners.
