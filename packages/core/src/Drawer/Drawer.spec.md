---
schema_version: 3
template_version: 4
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
- Controlled/uncontrolled behavior: unchanged; visibility remains fully
  controlled.
- Migration decision: `astryx upgrade --apply` rewrites supported Lab Drawer
  imports and re-exports to `@astryxdesign/core/Drawer`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The viewport-relative side-panel surface, logical edge, inline-size budget, and
  entry/exit motion.
- The combined modal-with-scrim and non-modal-without-scrim presentation choice.
- Drawer-local focus entry/return, built-in close affordance, backdrop-click
  policy, and preservation of its host and content region through exit. Current
  caller-provided children remain caller-owned throughout that interval.
- The observable last-opened ordering of sibling Drawers.

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

| Concept            | Closed values or states                       | Meaning                                                                | Availability by state                     | Default                  | Owner              | Stability            | Invalid-value behavior                         |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | ------------------------ | ------------------ | -------------------- | ---------------------------------------------- |
| visibility         | open, closed                                  | whether caller-controlled Drawer presentation is requested             | all presentations                         | caller-controlled        | `component:Drawer` | stable Core contract | required controlled value                      |
| logical edge       | inline start, inline end                      | viewport edge from which the panel enters and exits                    | open and exiting                          | inline end               | `component:Drawer` | stable Core contract | closed type rejects other values               |
| presentation       | modal with scrim, non-modal without scrim     | document modality and visible backdrop versus interactive page context | selected for the presented lifetime       | modal with scrim         | `component:Drawer` | stable Core contract | one current boolean selects the paired outcome |
| inline-size budget | pixel number or valid CSS length              | maximum desktop inline size of the panel                               | desktop and as the mobile cap             | `400px`                  | `component:Drawer` | stable Core contract | browser CSS parsing handles invalid strings    |
| mobile coverage    | page reveal, full viewport                    | whether narrow viewports retain a visible page strip                   | viewports at or below the mobile boundary | 56px page reveal         | `component:Drawer` | stable Core contract | closed boolean                                 |
| close affordance   | built-in close button present, absent         | whether Drawer supplies its top-trailing close action                  | modal and non-modal presentations         | present                  | `component:Drawer` | stable Core contract | closed boolean                                 |
| sibling order      | earlier opened, later opened, exiting, closed | which sibling paints and responds as the current front Drawer          | unrelated sibling Drawers                 | last opened is frontmost | `component:Drawer` | stable Core contract | nesting is outside the documented composition  |

## Behavioral and layout contract

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                           | Basis                                      | Draft review state                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| FR1  | Drawer MUST remain a viewport-relative, full-block-size overlay on the logical inline-start or inline-end edge and MUST NOT reserve layout space or reflow the page beneath it.                                                                                                                                                               | Current source, docs, stories, and tests   | Verified current behavior; no new behavior decided    |
| FR2  | The logical edge selected for an open Drawer MUST remain latched through its exit even when caller state changes the live edge prop during close.                                                                                                                                                                                             | Current exit-side test and implementation  | Verified current behavior                             |
| FR3  | The desktop inline-size budget MUST accept pixel numbers or CSS lengths, remain bounded by the viewport, and act as the mobile cap. At or below 640px, Drawer MUST preserve a 56px page reveal unless full-mobile coverage is selected.                                                                                                       | Current docs, styles, and width tests      | Verified current behavior                             |
| FR4  | Visibility MUST remain caller-controlled. Escape, backdrop activation, and built-in close actions request `false`; native dialog state MUST NOT become a second open-state owner. Drawer keeps its host and content region mounted while visibly exiting, but it renders the caller's current `children` and does not snapshot prior content. | Current prop contract and lifecycle tests  | Verified current behavior                             |
| FR5  | The current presentation choice is paired: scrim-backed presentation uses native `showModal()`, `aria-modal`, body scroll locking, and a visible backdrop; clear presentation uses a manual Popover API host and leaves the page behind interactive.                                                                                          | Current source, docs, and modal tests      | Verified current behavior; independent axes not owned |
| FR6  | Activating the visible modal backdrop MAY request close. Clicking panel content MUST NOT close Drawer, and non-modal presentation MUST NOT install an invisible outside-pointer dismissal plane.                                                                                                                                              | Current click tests                        | Verified current behavior                             |
| FR7  | The built-in close affordance MUST appear by default in both presentations, carry an accessible name, and request close without taking open-state ownership. Callers may explicitly omit it.                                                                                                                                                  | Current docs and close-button tests        | Verified current behavior                             |
| FR8  | Opening MUST capture the external invoking element, enter the native dialog host, and honor one rendered `data-autofocus` descendant when present. Final close MUST return focus to the captured connected invoker when focus can be restored.                                                                                                | Current presence hook and focus tests      | Verified current behavior                             |
| FR9  | Closing MUST retain the panel host, content region, edge, and native dialog through the transform exit while rendering the caller's current `children`. The transform transition is authoritative; a computed-duration backstop prevents a lost event from stranding the host. Native close and React hiding occur together.                  | Current presence hook and close guard      | Verified current behavior                             |
| FR10 | Sibling Drawers MUST be composed as siblings. The last-opened present sibling is visually frontmost and owns the first Escape request; a closing sibling retains ownership through exit, and reopening creates a new active-cycle order without one request closing two surfaces.                                                             | Current docs, shared stack, and tests      | Verified current behavior                             |
| FR11 | Consumer DOM, data, ARIA, style, class, ref, click, and keyboard inputs MUST reach or compose on the root dialog according to `BaseProps`. A consumer keyboard handler that prevents default MAY cancel Drawer-owned Escape handling.                                                                                                         | Current BaseProps implementation and tests | Verified current behavior                             |
| FR12 | The root dialog is the painted panel and carries the public `drawer` theming target with the logical `side` axis. Drawer resets inherited container padding at that root; caller content and the scrim have no separate Drawer target.                                                                                                        | Current source, docs, and target metadata  | Verified current reachability; no target change       |
| FR13 | Drawer MUST join the shared dismissal stack for its full rendered lifetime, provide logical depth to descendant layers, route platform close through the same topmost/IME decision, and preserve consumer `preventDefault()` ownership.                                                                                                       | Shared family contract and focused tests   | Verified current conformance                          |
| FR14 | Non-modal Drawer MUST use a manual Popover API host so cross-surface order comes from the browser top layer rather than a page-level z-index band. The reduced fallback may use `dialog.show()` only below the Popover API support floor.                                                                                                     | Current source, browser guard, and AST-027 | Verified current conformance                          |

### Allowed variation

- **AV1 — Caller content.** Any renderable inspector/detail content may occupy the
  scrolling content region without becoming Drawer-owned anatomy. Callers retain
  the child data they want to remain visible during exit.
- **AV2 — Inline size.** Consumers may choose the desktop budget within valid CSS
  and viewport constraints.
- **AV3 — Presentation.** Modal and non-modal states deliberately differ in page
  availability, scroll locking, and backdrop behavior.
- **AV4 — Close control.** Callers may hide the built-in close button only when
  their content provides an appropriate dismissal path.
- **AV5 — Motion duration.** Themes may alter the transform transition duration;
  close timing follows computed CSS and reduced-motion preferences.

### Representative states

| State                             | Required invariant                                                                                                                           | Allowed variation                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Closed                            | no native dialog presentation or visible panel                                                                                               | caller content may remain mounted in React             |
| Modal inspector                   | side panel, visible scrim, modal semantics, body lock, and close affordance                                                                  | edge, width, caller content, and autofocus destination |
| Non-modal master-detail inspector | side panel leaves page interaction available and has no modal backdrop                                                                       | edge, width, and caller content                        |
| Narrow viewport with page reveal  | panel does not exceed its budget and preserves 56px of the page                                                                              | requested width below the cap                          |
| Narrow full-coverage viewport     | panel covers the dynamic viewport inline size                                                                                                | caller content                                         |
| Two sibling Drawers               | later-opened Drawer paints and dismisses first                                                                                               | either presentation, provided composition is sibling   |
| Exiting Drawer                    | panel host, content region, and logical edge stay stable until native-host release; caller retains any child data it wants to remain visible | computed transition duration                           |

### Transformation and precedence order

- **ORD1 — Open.** Resolve the current logical edge and width, retain the rendered
  panel, capture the external invoker, open the selected native dialog mode, then
  honor a rendered autofocus destination.
- **ORD2 — Close.** Caller state requests close; Drawer retains its panel host,
  content region, edge, presentation, and native dialog through the transform
  exit while rendering the caller's current children. Transition completion or
  the backstop closes the host and hides React output in one task; focus then
  returns to the captured invoker when available.
- **ORD3 — Sibling order.** For sibling Drawers, current open order determines
  frontmost visual and Escape ownership. Descendant overlays remain governed by
  their own component/family contracts rather than Drawer nesting.

### Performance and resources

- **PR1 — Exit-only resources.** Transition listeners and the backstop timer exist
  only while close is waiting for the visible transform exit and are removed on
  completion or cleanup.
- **PR2 — Presentation-only resources.** Native dialog presentation and body scroll
  locking exist only for their active states and are released on close, unmount,
  or hidden Activity cleanup.
- **PR3 — No regional observation.** Current viewport-only Drawer owns no target
  measurement, ResizeObserver, MutationObserver, or scroll synchronization.

## Accessibility contract

- **AR1 — Name.** Every Drawer MUST receive a non-empty accessible name through
  its required label contract; caller content does not become an implicit name.
- **AR2 — Modal truthfulness.** Modal presentation uses native modal dialog state
  and `aria-modal`; non-modal presentation omits `aria-modal` and leaves the page
  behind available.
- **AR3 — Keyboard dismissal.** Escape requests close only for the current
  frontmost sibling and respects consumer cancellation; unrelated keys do not
  dismiss.
- **AR4 — Focus lifecycle.** Focus enters visible Drawer content through the
  documented autofocus/native path and returns to the connected invoker after
  final close when possible.
- **AR5 — Close affordance.** The built-in close action retains an accessible name
  and Button-owned keyboard/focus behavior in both presentations.
- **AR6 — Direction and motion.** Logical edges resolve under LTR/RTL, and motion
  reduces under `prefers-reduced-motion` without changing the final state.

## Design relationships

| Anatomy or state | Design requirement                                                                    | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Panel            | Paints the full-height side surface and owns edge, width, border, shadow, and motion. | Current source and public docs | Prominent      | FR1–FR3, FR9, FR12 |
| Content region   | Provides full-height scrolling for caller-owned inspector content.                    | Current source and public docs | Prominent      | FR4, AV1           |
| Close button     | Supplies the persistent top-trailing dismissal action when enabled.                   | `component:Button`             | Supporting     | FR7, AR5           |
| Modal scrim      | Communicates and activates the paired modal presentation behind the panel.            | Current source and public docs | Supporting     | FR5, FR6, AR2      |
| Page reveal      | Preserves overlay context on narrow viewports unless full coverage is requested.      | Current public docs            | Supporting     | FR3                |

The root Panel carries the current `drawer` target and reflects `side`. Consumer
docs do not yet declare canonical `usage.anatomy`, so this draft does not add a
machine-readable theming-anatomy map or admit targets for Content region, Close
button, or Modal scrim.

## Family and system relationships

- `family:overlay-dismissal` owns cross-component Escape and platform-close
  ordering. Drawer participates through the shared owner for its rendered
  lifetime and supplies logical depth to descendant layers.
- `architecture:layer-runtime` owns the distinction between native modal hosting,
  non-modal dialog presentation, top-layer behavior, and shared layer plumbing.
- `architecture:public-component-api` owns stable API admission and compatibility.
  Drawer now exposes its documented DOM/ref/event and controlled-state contract
  through the stable Core package.
- `architecture:react-component-runtime` owns effect/resource cleanup, native-host
  synchronization, and node/lifecycle safety. Drawer owns the visible open/close
  outcome and focus handoff.
- `architecture:component-theming-surface` owns target qualification and future
  anatomy mapping; this draft records the existing `drawer` target only.
- `spec:AST-027/DEC-3` requires equivalent floating interactions to use an
  applicable native top-layer host. Modal `showModal()` and non-modal manual
  Popover hosting satisfy that cross-surface route; the documented reduced
  fallback remains below the Popover API support floor.

## Verification map

| Contract        | Verification                                                              | Representative states                                        | Mutation or failure expectation                                                                          | Audit section                |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1–FR7         | `Drawer.test.tsx` render, mode, click, sizing, side, and control suites   | closed/open, both edges, modal/non-modal, mobile widths      | Layout reflows, a mode gains the wrong semantics, or controlled state stops matching.                    | `audit:Drawer/behavior`      |
| FR11            | Drawer source, shared BaseProps contract, and keyboard cancellation tests | ref, DOM/data/ARIA/style inputs, click and keyboard handlers | A supported root input is dropped or built-in Escape ignores documented consumer cancellation.           | `audit:Drawer/public-api`    |
| FR8, AR1–AR5    | `Drawer.test.tsx` label, autofocus, close, and focus-return suites        | labeled modal/non-modal, autofocus target, connected opener  | Focus moves before presentation, fails to return, or a dismissal path loses its accessible name.         | `audit:Drawer/accessibility` |
| FR9, PR1–PR2    | close timing tests and `modal-close-visibility.js`                        | transition end, unrelated transition, lost-event backstop    | Native close cuts off motion, strands the host, or leaves one painted frame outside its host.            | `audit:Drawer/motion`        |
| FR10, FR13, AR3 | Drawer/shared-stack tests and native-host browser guard                   | siblings, closing top, reopen, unmount, nested descendant    | One Escape closes two surfaces, a closing host drops ownership, or a reopened sibling keeps stale order. | `audit:Drawer/layers`        |
| FR14            | source, `spec:AST-027/DEC-3`, and native-host browser guard               | modal host, manual-popover host, reduced fallback            | Non-modal presentation returns to a page-level band or loses native-host ordering.                       | `audit:Drawer/layers`        |
| FR12            | source, `Drawer.doc.mjs`, and current target discovery                    | start/end Panel and inherited container context              | The root target/axis moves, padding leaks in, or docs claim an unshipped child target.                   | `audit:Drawer/theming`       |
| AR6             | side tests, reduced-motion source inspection, and Storybook RTL audit     | inline start/end under LTR and RTL; reduced motion           | A physical edge replaces logical behavior or the reduced-motion guard disappears.                        | `audit:Drawer/accessibility` |

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, scope, or layer-system decision.

## Open questions

None. Regional placement, independent modality/scrim axes, and block-axis sheets
are outside the current component boundary. Any future proposal for them requires
fresh public-API and design authority rather than being inferred from this
stable component contract.

## Content boundary

This file does not duplicate consumer prop tables or examples, shared dismissal-stack
internals, transition algorithms, current audit scores, implementation steps, or
shared family/system rules. It links to their owners.
