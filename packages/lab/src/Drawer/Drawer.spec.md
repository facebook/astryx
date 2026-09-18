---
schema_version: 3
template_version: 5
kind: component
id: component:Drawer
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/lab/src/Drawer/Drawer.test.tsx,
    .github/scripts/modal-close-visibility.js,
    apps/storybook/rtl-audit/rtl-audit.mjs,
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
    architecture:react-component-runtime,
  ]
contributing: []
system_specs: [spec:AST-027/DEC-3]
---

# Drawer component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current Lab surface     | No public-API delta. At this commit, the experimental `@astryxdesign/lab` root exports `Drawer` and `DrawerProps`; `DrawerProps` extends `BaseProps<HTMLDialogElement>`, separately declares `ref`, and requires `isOpen`, `onOpenChange`, `label`, and `children`. This records current reachability, not a stable compatibility promise.                                                                                                                                                                                                             |
| Behavior                | Drawer-owned visibility is controlled by the caller for a viewport-relative, full-height logical-side overlay. Native mode is selected from `hasScrim` at open; changing it while open is unsupported, although the current implementation updates scrim styling, `aria-modal`, modal-root clicks, and body lock live. Drawer-local registration gates Escape for same-presentation siblings and assigns non-modal z-index; modal paint is browser-owned, while mixed-presentation and nested stacking are unspecified. Exit renders current children. |
| End-user impact         | None from this documentation-only record; current modal/non-modal semantics, focus return, dismissal, motion, sizing, and sibling ordering remain unchanged.                                                                                                                                                                                                                                                                                                                                                                                           |
| Builder impact          | None; there is no migration or new caller choice. State and content remain caller-owned; Drawer renders the caller's current children during exit. Sibling composition remains current consumer guidance.                                                                                                                                                                                                                                                                                                                                              |
| Compatibility/readiness | Additive documentation with no runtime or default change; Drawer remains experimental in Lab, this record remains `draft`, and its candidate statements require approval. FR13–FR14 record named family/top-layer conformance gaps.                                                                                                                                                                                                                                                                                                                    |
| Review checks           | Reject regional, docked, or block-axis models; claims that modality and scrim are currently independent; or claims that the local registry and non-modal `show()` path satisfy shared dismissal/top-layer rules, guarantee mixed-presentation or nested ordering, or establish stable API/theming compatibility.                                                                                                                                                                                                                                       |
| Record context          | `component:Drawer` FR1–FR14 and AR1–AR6 are draft candidate statements. Linked records govern only within their own declared authority and scope.                                                                                                                                                                                                                                                                                                                                                                                                      |

This table summarizes the draft body below; it does not change this record's declared authority.

## Intent

Drawer presents contextual details or controls in a full-height side panel that
floats over the current page without reflowing it. It supports modal inspection
with a scrim and non-modal master-detail inspection that leaves the page behind
available.

This draft records the viewport-only Lab component that exists on current `main`.
It introduces no runtime, styling, theming, or public-API change. In particular,
it does not revive a regional, pane-scoped, or container-targeted Drawer model.

## Compatibility and migration

- Released default preserved: `not yet released`; Drawer remains in
  `@astryxdesign/lab`.
- Compatibility class: additive maintainer documentation only; runtime, DOM,
  styling, targets, props, and consumer docs remain unchanged.
- Controlled/uncontrolled behavior: unchanged for Drawer-owned paths; callers
  provide `isOpen`, while direct native mutation through the public dialog ref is
  outside that guarantee.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The viewport-relative side-panel surface, logical edge, inline-size budget, and
  entry/exit motion.
- The current presentation input: its value at native open selects `showModal()`
  or `show()`. Changing it while open is unsupported; current live effects are
  recorded as implementation facts rather than durable transition policy.
- Drawer-local focus entry/return, built-in close affordance, uncanceled
  backdrop-click handling, and retention of its host through controlled exit
  while rendering current caller-owned children.
- The local registration order used for same-presentation sibling Escape
  eligibility and non-modal z-index assignment. Modal paint order is browser-owned.

**Does not own / non-goals**

- Caller-provided headers, forms, inspectors, footers, or other content.
- Block-axis sheets — owned by `component:BottomSheet`.
- Persistent panels that reserve layout space or push page content.
- Regional or pane-scoped placement, a caller-supplied container, or independent
  modality and scrim axes. Those are not current Drawer concepts.
- Cross-family Escape and platform-close ordering — owned by
  `family:overlay-dismissal`; current Drawer has a recorded local-adoption gap.
- Button painting for the built-in close affordance — delegated to
  `component:Button` through IconButton.

## Public concepts

Consumer prop syntax and examples remain in `Drawer.doc.mjs`.

| Concept            | Closed values or states                       | Meaning                                                                     | Availability by state                                             | Default                             | Owner              | Stability                 | Invalid-value behavior                                 |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------- | ------------------ | ------------------------- | ------------------------------------------------------ |
| visibility         | open, closed                                  | whether caller-controlled Drawer presentation is requested                  | all presentations                                                 | caller-controlled                   | `component:Drawer` | experimental Lab contract | required controlled value                              |
| logical edge       | inline start, inline end                      | viewport edge from which the panel enters and exits                         | open and exiting                                                  | inline end                          | `component:Drawer` | experimental Lab contract | closed type rejects other values                       |
| presentation       | modal with scrim, non-modal without scrim     | native open mode and associated initial semantics                           | chosen when the native dialog opens; live changes are unsupported | modal with scrim                    | `component:Drawer` | experimental Lab contract | one current boolean selects the initial mode           |
| inline-size budget | pixel number or valid CSS length              | desktop inline size and reveal-mode mobile cap                              | desktop and mobile page-reveal mode                               | `400px`                             | `component:Drawer` | experimental Lab contract | invalid CSS lengths are unsupported                    |
| mobile coverage    | page reveal, full viewport                    | whether narrow viewports retain a visible page strip                        | viewports at or below the mobile boundary                         | 56px page reveal                    | `component:Drawer` | experimental Lab contract | closed boolean                                         |
| close affordance   | built-in close button present, absent         | whether Drawer supplies its top-trailing close action                       | modal and non-modal presentations                                 | present                             | `component:Drawer` | experimental Lab contract | closed boolean                                         |
| sibling order      | earlier opened, later opened, exiting, closed | same-presentation local Escape eligibility and non-modal z-index assignment | sibling Drawers using one presentation mode                       | later opened is last registry entry | `component:Drawer` | experimental Lab contract | mixed-presentation and nested stacking are unspecified |

## Behavioral and layout contract

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                              | Basis                                                      | Draft review state                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| FR1  | Drawer MUST remain a viewport-relative, full-block-size overlay on the logical inline-start or inline-end edge and MUST NOT reserve layout space or reflow the page beneath it.                                                                                                                                                                                                                                                                                  | Current source, docs, stories, and tests                   | Verified current behavior; no new behavior decided                                                       |
| FR2  | The logical edge selected for an open Drawer MUST remain latched through its exit even when caller state changes the live edge prop during close.                                                                                                                                                                                                                                                                                                                | Current exit-side test and implementation                  | Verified current behavior                                                                                |
| FR3  | The desktop inline-size budget MUST accept pixel numbers or CSS lengths and remain bounded by the viewport. At or below 640px, page-reveal mode MUST preserve 56px and use `width` as a cap; full-mobile mode MUST override `width` with `100dvw`.                                                                                                                                                                                                               | Current docs, styles, and width tests                      | Verified current behavior                                                                                |
| FR4  | Visibility through Drawer-owned behavior MUST follow `isOpen`. Uncanceled Escape and modal-backdrop handling, and the built-in close action, request `false`; Drawer prevents its handled native `cancel` event from closing the dialog directly. During controlled exit, Drawer keeps its host and content region mounted while rendering the caller's current `children`.                                                                                      | Current prop contract and lifecycle tests                  | Verified for Drawer-owned paths; direct native mutation through the public ref is outside this guarantee |
| FR5  | At open time, `hasScrim={true}` MUST select native `showModal()` with `aria-modal`, body scroll locking, and a visible backdrop; `hasScrim={false}` MUST select non-modal `show()` and leave the page behind interactive. Changing `hasScrim` while open is not a supported native-mode transition. The current implementation still updates scrim styling, `aria-modal`, modal-root click handling, and body locking live without switching the native mode.    | Current source, docs, and initial-mode tests               | Initial modes verified; live presentation changes unsupported                                            |
| FR6  | An uncanceled modal root/backdrop click (`target === currentTarget` while live `hasScrim` is true) MUST request close. Descendant clicks and dialog-root clicks while live `hasScrim` is false MUST NOT request close, and non-modal presentation MUST NOT install an invisible outside-pointer dismissal plane.                                                                                                                                                 | Current click tests                                        | Verified current behavior                                                                                |
| FR7  | The built-in close affordance MUST appear by default in both presentations, carry an accessible name, and request close without taking open-state ownership. Callers may explicitly omit it.                                                                                                                                                                                                                                                                     | Current docs and close-button tests                        | Verified current behavior                                                                                |
| FR8  | Opening MUST present the native dialog and attempt to focus the first rendered `[data-autofocus]` descendant, if any. After a completed controlled close, Drawer MUST attempt to restore focus to the element that was active before opening.                                                                                                                                                                                                                    | Current presence hook and focus tests                      | Verified for completed controlled close                                                                  |
| FR9  | Closing MUST retain the panel host, content region, edge, and native dialog while the exit remains visible and continue rendering the caller's current `children`. Once the visible exit completes, Drawer MUST release native dialog state and hide the panel before the next paint.                                                                                                                                                                            | Current lifecycle tests and browser close-visibility guard | Observable outcome verified; mechanism private                                                           |
| FR10 | Current Drawer-local coordination is registration-based. Among open sibling Drawers using the same presentation mode, the most recently registered handles a Drawer-local Escape event that reaches it; closing or unmounting unregisters it so the prior open Drawer becomes eligible. Non-modal siblings receive increasing local z-indexes, while modal paint order is browser-owned. Mixed-presentation visual ordering and nested stacking are unspecified. | Current source, docs, and non-modal stack tests            | Recorded current behavior; local family adoption gap remains                                             |
| FR11 | At this commit, `DrawerProps` extends `BaseProps<HTMLDialogElement>` and separately declares `ref`. The root filters `open`, merges `xstyle`, `className`, and `style`, forwards remaining unclaimed props, composes consumer `onClick` and `onKeyDown`, and owns `aria-label`, `aria-modal`, and `onCancel`. A consumer `onKeyDown` that prevents default cancels Drawer-owned Escape handling.                                                                 | Current source and focused keyboard tests                  | Recorded current Lab behavior; not a stable compatibility decision                                       |
| FR12 | At this commit, the painted root dialog emits the documented `drawer` target and `side` selector axis and applies the container-padding reset. No separate Drawer target is currently emitted for content or scrim; future target qualification remains owned by `architecture:component-theming-surface`.                                                                                                                                                       | Current source, docs, and structural target metadata       | Current reachability only; no target-admission decision                                                  |
| FR13 | Drawer currently uses a component-local registry for open order, Escape eligibility, and non-modal z-index assignment. It does not control native modal top-layer order. That implementation is a deviation from `family:overlay-dismissal/FR1`, not an accepted family exception or a new component-local policy.                                                                                                                                               | Current family adoption table                              | Known current adoption gap                                                                               |
| FR14 | Non-modal Drawer currently uses `dialog.show()` plus a page-level z-index band rather than a native top-layer host. That implementation is a named conformance gap against `spec:AST-027/DEC-3`, not part of the durable component contract.                                                                                                                                                                                                                     | Current source and `spec:AST-027`                          | Known current top-layer gap                                                                              |

### Allowed variation

- **AV1 — Caller content.** Any renderable inspector/detail content may occupy the
  scrolling content region without becoming Drawer-owned anatomy. Drawer renders
  current `children`; callers decide whether the underlying data remains available
  during exit.
- **AV2 — Inline size.** Consumers may choose the desktop budget within valid CSS
  and viewport constraints. It remains the cap in mobile page-reveal mode, while
  full-mobile mode uses `100dvw` instead.
- **AV3 — Presentation.** The value at native open selects modal or non-modal
  dialog mode. Changing `hasScrim` while open is unsupported; current live scrim,
  ARIA, root-click, and body-lock updates are implementation effects rather than a
  supported native-mode transition.
- **AV4 — Close control.** Callers may hide the built-in close button.
- **AV5 — Motion duration.** Themes may alter the transform transition duration;
  close timing follows computed CSS and reduced-motion preferences.

### Representative states

| State                             | Required invariant                                                                                                                                  | Allowed variation                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Closed                            | no native dialog presentation or visible panel                                                                                                      | caller content may remain mounted in React                                        |
| Modal inspector                   | opened with `hasScrim` true via `showModal()` with scrim, modal semantics, and body lock                                                            | edge, width, caller content, autofocus destination, and built-in close affordance |
| Non-modal master-detail inspector | opened with `hasScrim` false via `show()`; no scrim, `aria-modal`, modal-root dismissal, or body lock; Escape requires an event reaching the dialog | edge, width, caller content, and built-in close affordance                        |
| Narrow viewport with page reveal  | panel does not exceed its `width` cap and preserves 56px of the page                                                                                | requested width below the cap                                                     |
| Narrow full-coverage viewport     | panel uses `100dvw`, overriding the requested `width`                                                                                               | caller content                                                                    |
| Two non-modal sibling Drawers     | later-opened open Drawer receives a higher page-level z-index and handles Escape dispatched within it                                               | edge, width, and caller content                                                   |
| Exiting Drawer                    | panel host, content region, logical edge, and native presentation remain while the exit is visible; current children render                         | caller-controlled child data and motion duration                                  |

### Transformation and precedence order

- **ORD1 — Open.** Resolve the current logical edge and width, retain the rendered
  panel, capture the currently focused element, use current `hasScrim` to select
  the native dialog mode, then honor a rendered autofocus destination.
- **ORD2 — Close.** During controlled close, Drawer keeps its panel and
  caller-provided content visible through the exit animation. After exit,
  presentation ends without an intermediate visible frame, and Drawer attempts to
  restore focus to the previously focused element when available.
- **ORD3 — Sibling order.** For same-presentation sibling Drawers, registration
  order gates Drawer-local Escape handling; non-modal siblings also receive
  increasing z-indexes. Modal paint order is browser-owned. Mixed-presentation
  visual ordering and nested stacking are unspecified.

### Performance and resources

- **PR1 — Exit cleanup.** Any resources used to coordinate exit are released after
  completion, interruption, or unmount.
- **PR2 — Presentation cleanup.** Controlled closing or unmounting Drawer releases
  native presentation and any active body scroll lock.
- **PR3 — Viewport-relative sizing.** Drawer derives sizing from `width`,
  `isFullWidthOnMobile`, and the viewport; callers do not supply a regional
  measurement target.

## Accessibility contract

- **AR1 — Name.** `label` is a required string forwarded to `aria-label`; caller
  content is not used as an implicit name. Current code does not reject an empty
  or whitespace-only value.
- **AR2 — Modal truthfulness.** At open time, `hasScrim={true}` uses native modal
  dialog state and `aria-modal`; `hasScrim={false}` uses non-modal dialog state and
  omits `aria-modal`. Changing `hasScrim` while open is not a supported transition.
- **AR3 — Keyboard dismissal.** For sibling Drawers using the same presentation
  mode, Escape requests close only for the last-opened still-open Drawer when a
  Drawer-local event reaches it; a consumer `onKeyDown` that prevents default
  cancels Drawer-owned keydown handling, and unrelated keys do not dismiss. Mixed
  presentation modes are not covered by this guarantee.
- **AR4 — Focus lifecycle.** Focus enters visible Drawer content through the
  documented autofocus/native path and, after a completed controlled close, Drawer
  attempts to restore focus to the element that was active when the Drawer opened.
- **AR5 — Close affordance.** The built-in close action retains an accessible name
  and Button-owned keyboard/focus behavior in both presentations.
- **AR6 — Direction and motion.** Logical inset placement follows computed
  direction; slide-direction mirroring currently requires a `[dir="rtl"]`
  ancestor. Self-applied `dir="rtl"` and CSS-only direction do not trigger
  transform mirroring. Motion reduces under `prefers-reduced-motion` without
  changing the final state.

## Design relationships

| Anatomy or state | Design requirement                                                                                                     | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Panel            | Paints the full-height side surface and owns edge, width, border, shadow, and motion.                                  | Current source and public docs | Prominent      | FR1–FR3, FR9, FR12 |
| Content region   | Provides full-height scrolling for caller-owned inspector content.                                                     | Current source and public docs | Prominent      | FR4, AV1           |
| Close button     | Supplies the persistent top-trailing dismissal action when enabled.                                                    | `component:Button`             | Supporting     | FR7, AR5           |
| Modal scrim      | At initial modal open, communicates the scrim-backed presentation and provides root-click activation behind the panel. | Current source and public docs | Supporting     | FR5, FR6, AR2      |
| Page reveal      | Preserves overlay context on narrow viewports unless full coverage is requested.                                       | Current public docs            | Supporting     | FR3                |

The root Panel carries the current `drawer` target and reflects `side`. Consumer
docs do not yet declare canonical `usage.anatomy`, and no separate Drawer target is
currently reachable for Content region, Close button, or Modal scrim. This draft
does not decide future target qualification.

## Family and system relationships

- `family:overlay-dismissal` owns cross-component Escape and platform-close
  ordering. Drawer is a member but remains local-only on current `main`; FR13
  records that adoption gap without legitimizing a parallel policy.
- `architecture:layer-runtime` owns the distinction between native modal hosting,
  non-modal dialog presentation, top-layer behavior, and shared layer plumbing.
- `architecture:public-component-api` owns stable API admission and compatibility.
  Drawer remains experimental in Lab; FR11 records current DOM/ref/event
  reachability without making a stable compatibility decision.
- `architecture:react-component-runtime` owns effect/resource cleanup, native-host
  synchronization, and node/lifecycle safety. This draft records Drawer-owned
  visible close and focus-handoff outcomes.
- `architecture:component-theming-surface` owns target qualification and future
  anatomy mapping; this draft records the existing `drawer` target only.
- `spec:AST-027/DEC-3` requires equivalent floating interactions to use an
  applicable native top-layer host. Current non-modal Drawer does not yet conform;
  FR14 records that system-owned gap without adopting its implementation.

## Verification map

| Contract        | Verification                                                                            | Representative states                                                                                     | Mutation or failure expectation                                                                                                                                  | Audit section                |
| --------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1–FR7         | `Drawer.test.tsx` render, initial-mode, click, sizing, side, and control suites         | closed/open, both edges, initial modal/non-modal modes, mobile widths                                     | Layout reflows; an initial mode gains the wrong semantics; uncanceled root-click or full-mobile sizing becomes nondeterministic.                                 | `audit:Drawer/behavior`      |
| FR11            | Drawer source and focused keyboard composition/cancellation tests                       | filtered `open`, merged styling/ref, forwarded unclaimed props, owned ARIA/cancel, composed click/keydown | Current forwarding changes without review or built-in Escape ignores documented consumer cancellation.                                                           | `audit:Drawer/public-api`    |
| FR8, AR1–AR5    | `Drawer.test.tsx` label forwarding, autofocus, close, and focus-return suites           | initial modal/non-modal modes, autofocus target, connected previously focused element                     | Focus moves before presentation, completed controlled close fails to restore focus, or label forwarding/dismissal naming breaks.                                 | `audit:Drawer/accessibility` |
| FR9, PR1–PR2    | close timing tests, browser close-visibility guard, and presence-hook source inspection | controlled close, transform end, unrelated transition, lost-event backstop                                | Native presentation ends before visible exit, the host is stranded, cleanup paths retain resources, or an intermediate frame paints outside native presentation. | `audit:Drawer/motion`        |
| FR10, FR13, AR3 | Drawer non-modal LIFO tests plus source and `family:overlay-dismissal` adoption table   | two non-modal siblings, Drawer-local keydown, unmount, remaining sibling                                  | One event closes two tested siblings, Drawer-local behavior is promised globally, or tested non-modal ordering is extended to mixed/nested cases.                | `audit:Drawer/layers`        |
| FR14            | Drawer source plus `spec:AST-027` impact inventory and DEC-3                            | non-modal `show()` host and page-level stack band                                                         | The current workaround is documented as conforming or mistaken for durable component policy.                                                                     | `audit:Drawer/layers`        |
| FR12            | source, `Drawer.doc.mjs`, and current target discovery                                  | start/end root Panel and inherited container context                                                      | Current root target/axis or padding reset changes, or the record claims an unreachable child target or decides future admission.                                 | `audit:Drawer/theming`       |
| AR6             | side tests and source inspection plus Storybook ancestor-RTL audit                      | settled `end` placement under ancestor RTL; transform mirroring and reduced motion source-inspected       | Audited settled placement or source-inspected ancestor mirroring/reduced-motion behavior changes without corresponding evidence.                                 | `audit:Drawer/accessibility` |

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, scope, or layer-system decision.

## Open questions

None. Regional placement, independent modality/scrim axes, and block-axis sheets
are outside the current component boundary. Any future proposal for them requires
fresh public-API and design authority rather than being inferred from this
current-state backfill.

## Content boundary

This file does not duplicate consumer prop tables or examples, private registry
and transition algorithms, current audit scores, implementation steps, or shared
family/system rules. It links to their owners.
