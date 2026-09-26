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
    packages/core/src/Drawer/Drawer.test.tsx,
    packages/core/src/Layer/useLayerDismissal.test.tsx,
    packages/core/src/Layer/layerDismissalFamilies.test.tsx,
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

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current Core surface    | Breaking import-path move with no runtime delta. At this commit, `@astryxdesign/core` exports `Drawer` and `DrawerProps` from the package root and the `./Drawer` subpath, and the `@astryxdesign/lab` exports are removed; `DrawerProps` extends `BaseProps<HTMLDialogElement>`, separately declares `ref`, and requires `isOpen`, `onOpenChange`, `label`, and `children`.                                                                                                                                                          |
| Behavior                | Drawer-owned visibility is controlled by the caller for a viewport-relative, full-height logical-side overlay. `hasScrim` at native open selects `showModal()` or a manual Popover API host; changing it while open is unsupported. The shared layer dismissal stack gates Escape and platform close for the full rendered lifetime, the browser top layer owns paint order in both presentations, exit renders current children, and completed close returns focus to the element focused at open.  |
| End-user impact         | None; runtime behavior, motion, sizing, dismissal ordering, and accessibility are unchanged from the hardened Lab component.                                                                  |
| Builder impact          | Breaking import move: `@astryxdesign/lab` no longer exports Drawer; imports move to `@astryxdesign/core` (root or `./Drawer` subpath) and `astryx upgrade --apply` rewrites supported imports. CLI scaffolding gains Drawer blocks (DrawerShowcase, DrawerRowInspector) and Drawer-based templates. Props, defaults, and caller-owned state are unchanged.                                                                                                                                                                                                          |
| Compatibility/readiness | Breaking changeset for the import-path move with no behavior change versus the hardened Lab Drawer; Drawer becomes a stable Core component, while this record remains `draft` and its candidate statements require approval. FR13–FR14 record shared-family and top-layer conformance.                                                                                                                                                                                            |
| Review checks           | Reject regional, docked, or block-axis models; claims that modality and scrim are currently independent; reintroduction of a Drawer-local Escape registry or page-level z-index band; claims that mixed-presentation or nested stacking is guaranteed beyond the shared stack's contract; behavior or theming deltas beyond the import-path move; or a surviving Lab export.                                                                                                                                                            |
| Record context          | `component:Drawer` FR1–FR14 and AR1–AR6 are draft candidate statements. Linked records govern only within their own declared authority and scope.                                                                                                                                                                                                                                                                                                                                                   |

This table summarizes the draft body below; it does not change this record's declared authority.

## Intent

Drawer presents contextual details or controls in a full-height side panel that
floats over the current page without reflowing it. It supports modal inspection
with a scrim and non-modal master-detail inspection that leaves the page behind
available.

This draft records the stable viewport-only Core component after its
layer-lifecycle hardening and package promotion. It introduces no new prop or
scope concept. In particular, it does not revive a regional, pane-scoped, or
container-targeted Drawer model.

## Compatibility and migration

- Released default preserved: `yes`; existing Lab behavior and defaults become the
  stable Core defaults.
- Compatibility class: breaking import-path move from `@astryxdesign/lab` to
  `@astryxdesign/core/Drawer`; runtime props, defaults, root element, styling
  inputs, and controlled ownership remain unchanged.
- Controlled/uncontrolled behavior: unchanged for Drawer-owned paths; callers
  provide `isOpen`, while direct native mutation through the public dialog ref is
  outside that guarantee.
- Migration decision: `astryx upgrade --apply` rewrites supported Lab Drawer
  imports and re-exports to `@astryxdesign/core/Drawer`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The viewport-relative side-panel surface, logical edge, inline-size budget, and
  entry/exit motion.
- The current presentation input: its value at native open selects `showModal()`
  or the manual Popover API host. Changing it while open is unsupported.
- Drawer-local focus entry/return, built-in close affordance, uncanceled
  backdrop-click handling, and retention of its host through controlled exit
  while rendering current caller-owned children.
- Registering the layer with the shared dismissal stack for its rendered
  lifetime. Escape and platform-close routing belong to the shared owner; paint
  order in both presentations belongs to the browser top layer.

**Does not own / non-goals**

- Caller-provided headers, forms, inspectors, footers, or other content.
- Block-axis sheets — owned by `component:BottomSheet`.
- Persistent panels that reserve layout space or push page content.
- Regional or pane-scoped placement, a caller-supplied container, or independent
  modality and scrim axes. Those are not current Drawer concepts.
- Cross-family Escape and platform-close ordering — owned by
  `family:overlay-dismissal`; Drawer participates through the shared owner.
- Button painting for the built-in close affordance — delegated to
  `component:Button` through IconButton.

## Public concepts

Consumer prop syntax and examples remain in `Drawer.doc.mjs`.

| Concept            | Closed values or states                       | Meaning                                                           | Availability by state                                           | Default                 | Owner              | Stability                 | Invalid-value behavior                                 |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------ | ------------------ | ------------------------- | ------------------------------------------------------ |
| visibility         | open, closed                                  | whether caller-controlled Drawer presentation is requested        | all presentations                                               | caller-controlled       | `component:Drawer` | stable Core contract      | required controlled value                              |
| logical edge       | inline start, inline end                      | viewport edge from which the panel enters and exits               | open and exiting                                                | inline end              | `component:Drawer` | stable Core contract      | closed type rejects other values                       |
| presentation       | modal with scrim, non-modal without scrim     | native host mode and associated document semantics                | chosen when the native host opens; live changes are unsupported | modal with scrim        | `component:Drawer` | stable Core contract      | one current boolean selects the initial mode           |
| inline-size budget | pixel number or valid CSS length              | desktop inline size and reveal-mode mobile cap                    | desktop and mobile page-reveal mode                             | `400px`                 | `component:Drawer` | stable Core contract      | invalid CSS lengths are unsupported                    |
| mobile coverage    | page reveal, full viewport                    | whether narrow viewports retain a visible page strip              | viewports at or below the mobile boundary                       | 56px page reveal        | `component:Drawer` | stable Core contract      | closed boolean                                         |
| close affordance   | built-in close button present, absent         | whether Drawer supplies its top-trailing close action             | modal and non-modal presentations                               | present                 | `component:Drawer` | stable Core contract      | closed boolean                                         |
| sibling order      | earlier opened, later opened, exiting, closed | shared-stack Escape eligibility and browser top-layer paint order | sibling Drawers in either presentation                          | later opened is topmost | `component:Drawer` | stable Core contract      | nested composition is outside the documented contract  |


## Behavioral and layout contract

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                      | Draft review state                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| FR1  | Drawer MUST remain a viewport-relative, full-block-size overlay on the logical inline-start or inline-end edge and MUST NOT reserve layout space or reflow the page beneath it.                                                                                                                                                                                                                                | Current source, docs, stories, and tests                   | Verified current behavior; no new behavior decided                                                       |
| FR2  | The logical edge selected for an open Drawer MUST remain latched through its exit even when caller state changes the live edge prop during close.                                                                                                                                                                                                                                                              | Current exit-side test and implementation                  | Verified current behavior                                                                                |
| FR3  | The desktop inline-size budget MUST accept pixel numbers or CSS lengths and remain bounded by the viewport. At or below 640px, page-reveal mode MUST preserve 56px and use `width` as a cap; full-mobile mode MUST override `width` with `100dvw`.                                                                                                                                                             | Current docs, styles, and width tests                      | Verified current behavior                                                                                |
| FR4  | Visibility through Drawer-owned behavior MUST follow `isOpen`. Uncanceled Escape routed by the shared stack, uncanceled modal-backdrop activation, and the built-in close action request `false`; Drawer prevents its handled native `cancel` event from closing the dialog directly. During controlled exit, Drawer keeps its host and content region mounted while rendering the caller's current `children`. | Current prop contract and lifecycle tests                  | Verified for Drawer-owned paths; direct native mutation through the public ref is outside this guarantee |
| FR5  | At open time, `hasScrim={true}` MUST select native `showModal()` with `aria-modal`, a focus trap, body scroll locking, and a visible backdrop; `hasScrim={false}` MUST select a manual Popover API host that leaves the page behind interactive. Changing `hasScrim` while open is not a supported native-mode transition.                                                                                      | Current source, docs, and initial-mode tests               | Initial modes verified; live presentation changes unsupported                                            |
| FR6  | An uncanceled modal root/backdrop click (`target === currentTarget` while live `hasScrim` is true) MUST request close. Descendant clicks and dialog-root clicks while live `hasScrim` is false MUST NOT request close, and non-modal presentation MUST NOT install an invisible outside-pointer dismissal plane.                                                                                                | Current click tests                                        | Verified current behavior                                                                                |
| FR7  | The built-in close affordance MUST appear by default in both presentations, carry an accessible name, and request close without taking open-state ownership. Callers may explicitly omit it.                                                                                                                                                                                                                   | Current docs and close-button tests                        | Verified current behavior                                                                                |
| FR8  | Opening MUST present the native host, capture the element focused before opening, and attempt to focus the first rendered `[data-autofocus]` descendant, if any. After a completed controlled close releases the native host, Drawer MUST attempt to restore focus to the captured element.                                                                                                                    | Current presence hook and focus tests                      | Verified for completed controlled close                                                                  |
| FR9  | Closing MUST retain the panel host, content region, edge, and native presentation while the exit remains visible and continue rendering the caller's current `children`. The transform transition is authoritative, a computed-duration backstop prevents a lost event from stranding the host, and native release and React hiding land together so no frame paints outside the top layer.                    | Current lifecycle tests and browser close-visibility guard | Observable outcome verified                                                                              |
| FR10 | Sibling Drawers MUST be composed as siblings. The last-opened present sibling owns the first Escape request through the shared stack; a closing sibling retains that ownership through its visible exit, and reopening registers a new active cycle so one request never closes two surfaces. Paint order in both presentations follows the browser top layer's chronological order.                            | Current docs, shared stack, and tests                      | Verified current behavior                                                                                |
| FR11 | At this commit, `DrawerProps` extends `BaseProps<HTMLDialogElement>` and separately declares `ref`. The root filters `open`, merges `xstyle`, `className`, and `style`, forwards remaining unclaimed props, composes consumer `onClick`, forwards consumer `onKeyDown` ahead of the shared document-level Escape owner, and owns `aria-label`, `aria-modal`, and `onCancel`. A consumer `onKeyDown` that prevents default cancels shared-stack Escape dismissal for the press. | Current source and focused keyboard tests                  | Recorded current behavior for the stable Core surface                                                    |
| FR12 | At this commit, the painted root dialog emits the documented `drawer` target and `side` selector axis and applies the container-padding reset. No separate Drawer target is currently emitted for content or scrim; future target qualification remains owned by `architecture:component-theming-surface`.                                                                                                     | Current source, docs, and structural target metadata       | Current reachability only; no target-admission decision                                                  |
| FR13 | Drawer MUST join the shared dismissal stack for its full rendered lifetime, provide logical depth to descendant layers, route platform close through the same topmost/IME decision, and preserve consumer `preventDefault()` ownership.                                                                                                                                                                        | Shared family contract and focused tests                   | Verified current conformance                                                                             |
| FR14 | Non-modal Drawer MUST use a manual Popover API host so cross-surface order comes from the browser top layer rather than a page-level z-index band. The reduced fallback may use `dialog.show()` only below the Popover API support floor.                                                                                                                                                                      | Current source, browser guard, and `spec:AST-027`          | Verified current conformance                                                                             |

### Allowed variation

- **AV1 — Caller content.** Any renderable inspector/detail content may occupy the
  scrolling content region without becoming Drawer-owned anatomy. Drawer renders
  current `children`; callers decide whether the underlying data remains available
  during exit.
- **AV2 — Inline size.** Consumers may choose the desktop budget within valid CSS
  and viewport constraints. It remains the cap in mobile page-reveal mode, while
  full-mobile mode uses `100dvw` instead.
- **AV3 — Presentation.** The value at native open selects the modal dialog or
  the non-modal popover host. Changing `hasScrim` while open is unsupported.
- **AV4 — Close control.** Callers may hide the built-in close button.
- **AV5 — Motion duration.** Themes may alter the transform transition duration;
  close timing follows computed CSS and reduced-motion preferences.

### Representative states

| State                             | Required invariant                                                                                                                              | Allowed variation                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Closed                            | no native presentation or visible panel                                                                                                         | caller content may remain mounted in React                                        |
| Modal inspector                   | opened with `hasScrim` true via `showModal()` with scrim, modal semantics, focus trap, and body lock                                            | edge, width, caller content, autofocus destination, and built-in close affordance |
| Non-modal master-detail inspector | opened with `hasScrim` false via the manual popover host; no scrim, `aria-modal`, or body lock; the page behind stays interactive               | edge, width, caller content, and built-in close affordance                        |
| Narrow viewport with page reveal  | panel does not exceed its `width` cap and preserves 56px of the page                                                                            | requested width below the cap                                                     |
| Narrow full-coverage viewport     | panel uses `100dvw`, overriding the requested `width`                                                                                           | caller content                                                                    |
| Two sibling Drawers               | later-opened open Drawer paints above through the browser top layer and owns the first Escape request through the shared stack                  | edge, width, caller content, and either presentation composed as siblings         |
| Exiting Drawer                    | panel host, content region, logical edge, native presentation, and stack registration remain while the exit is visible; current children render | caller-controlled child data and motion duration                                  |

### Transformation and precedence order

- **ORD1 — Open.** Resolve the current logical edge and width, retain the rendered
  panel, capture the currently focused element, use current `hasScrim` to select
  the native host, then honor a rendered autofocus destination.
- **ORD2 — Close.** During controlled close, Drawer keeps its panel and
  caller-provided content visible through the exit animation. Transition
  completion or the computed-duration backstop releases the native host and hides
  React output together, so presentation ends without an intermediate visible
  frame; Drawer then attempts to restore focus to the previously focused element
  when available.
- **ORD3 — Sibling order.** Sibling order comes from the shared dismissal stack
  and the browser top layer: the last-opened present sibling is frontmost and
  handles Escape first in both presentations. Descendant overlays remain governed
  by their own component and family contracts rather than Drawer nesting.

### Performance and resources

- **PR1 — Exit-only resources.** Transition listeners and the backstop timer exist
  only while close is waiting for the visible transform exit and are removed on
  completion, interruption, or unmount.
- **PR2 — Presentation cleanup.** Native presentation and any active body scroll
  lock exist only for their active states and are released on controlled close,
  unmount, or hidden Activity cleanup.
- **PR3 — Viewport-relative sizing.** Drawer derives sizing from `width`,
  `isFullWidthOnMobile`, and the viewport; callers do not supply a regional
  measurement target.

## Accessibility contract

- **AR1 — Name.** `label` is a required string forwarded to `aria-label`; caller
  content is not used as an implicit name. Current code does not reject an empty
  or whitespace-only value.
- **AR2 — Modal truthfulness.** At open time, `hasScrim={true}` uses native modal
  dialog state and `aria-modal`; `hasScrim={false}` uses the non-modal popover
  host and omits `aria-modal`. Changing `hasScrim` while open is not a supported
  transition.
- **AR3 — Keyboard dismissal.** Escape requests close only for the topmost
  registered layer through the shared stack; a consumer `onKeyDown` that prevents
  default cancels that dismissal, and unrelated keys do not dismiss.
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
  ordering. Drawer participates through the shared owner for its rendered
  lifetime and supplies logical depth to descendant layers.
- `architecture:layer-runtime` owns the distinction between native modal hosting,
  non-modal dialog presentation, top-layer behavior, and shared layer plumbing.
- `architecture:public-component-api` owns stable API admission and compatibility.
  Drawer now exposes its documented DOM/ref/event and controlled-state contract
  through the stable Core package; FR11 records that surface.
- `architecture:react-component-runtime` owns effect/resource cleanup, native-host
  synchronization, and node/lifecycle safety. This draft records Drawer-owned
  visible close and focus-handoff outcomes.
- `architecture:component-theming-surface` owns target qualification and future
  anatomy mapping; this draft records the existing `drawer` target only.
- `spec:AST-027/DEC-3` requires equivalent floating interactions to use an
  applicable native top-layer host. Modal `showModal()` and non-modal manual
  Popover hosting satisfy that cross-surface route; the documented reduced
  fallback remains below the Popover API support floor.

## Verification map

| Contract        | Verification                                                                            | Representative states                                                                                     | Mutation or failure expectation                                                                                                                                  | Audit section                |
| --------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1–FR7         | `Drawer.test.tsx` render, initial-mode, click, sizing, side, and control suites         | closed/open, both edges, initial modal/non-modal modes, mobile widths                                     | Layout reflows; an initial mode gains the wrong semantics; uncanceled root-click or full-mobile sizing becomes nondeterministic.                                 | `audit:Drawer/behavior`      |
| FR11            | Drawer source and focused keyboard composition/cancellation tests                       | filtered `open`, merged styling/ref, forwarded unclaimed props, owned ARIA/cancel, composed click, forwarded keydown | Current forwarding changes without review or shared-stack Escape ignores documented consumer cancellation.                                                       | `audit:Drawer/public-api`    |
| FR8, AR1–AR5    | `Drawer.test.tsx` label forwarding, autofocus, close, and focus-return suites           | initial modal/non-modal modes, autofocus target, connected previously focused element                     | Focus moves before presentation, completed controlled close fails to restore focus, or label forwarding/dismissal naming breaks.                                 | `audit:Drawer/accessibility` |
| FR9, PR1–PR2    | close timing tests, browser close-visibility guard, and presence-hook source inspection | controlled close, transform end, unrelated transition, lost-event backstop                                | Native presentation ends before visible exit, the host is stranded, cleanup paths retain resources, or an intermediate frame paints outside native presentation. | `audit:Drawer/motion`        |
| FR10, FR13, AR3 | Drawer shared-stack suites plus `useLayerDismissal` and family tests                    | siblings, closing top, reopen, unmount, nested descendant                                                 | One Escape closes two surfaces, a closing host drops ownership, or a reopened sibling keeps stale order.                                                         | `audit:Drawer/layers`        |
| FR14            | Drawer source plus `spec:AST-027` impact inventory and native-host browser guard        | modal host, manual-popover host, reduced fallback                                                         | Non-modal presentation returns to a page-level band or loses native-host ordering.                                                                               | `audit:Drawer/layers`        |
| FR12            | source, `Drawer.doc.mjs`, and current target discovery                                  | start/end root Panel and inherited container context                                                      | Current root target/axis or padding reset changes, or the record claims an unreachable child target or decides future admission.                                 | `audit:Drawer/theming`       |
| AR6             | side tests and source inspection plus Storybook ancestor-RTL audit                      | settled `end` placement under ancestor RTL; transform mirroring and reduced motion source-inspected       | Audited settled placement or source-inspected ancestor mirroring/reduced-motion behavior changes without corresponding evidence.                                 | `audit:Drawer/accessibility` |

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, scope, or layer-system decision.

## Open questions

None. Regional placement, independent modality/scrim axes, and block-axis sheets
are outside the current component boundary. Any future proposal for them requires
fresh public-API and design authority rather than being inferred from this
stable component contract.

## Content boundary

This file does not duplicate consumer prop tables or examples, shared
dismissal-stack internals, transition algorithms, current audit scores,
implementation steps, or shared family/system rules. It links to their owners.
