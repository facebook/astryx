---
schema_version: 1
template_version: 3
kind: component
id: component:Popover
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-31
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Popover/Popover.test.tsx,
    packages/core/src/Popover/Popover.doc.mjs,
    packages/core/src/Popover/usePopover.doc.mjs,
    packages/core/src/hooks/useFocusTrap.test.tsx,
    packages/cli/foundation/discovery/theming-targets.mjs,
    packages/cli/foundation/discovery/theming-targets.test.mjs,
    scripts/check-knowledge.mjs,
  ]
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

# Popover component contract

## Intent

Popover presents interactive, caller-supplied content in an anchored top-layer
surface. The component owns the standard trigger-to-surface composition;
`usePopover` exposes the same semantic lifecycle, focus containment, dismissal,
and rendering contract for custom compositions.

This contract records the behavior present after
[PR #5373](https://github.com/facebook/astryx/pull/5373) and the Popover target
direction settled by Cindy Zhang on 2026-08-31. It does not change runtime
behavior, public API, emitted classes, or release status. Consumer syntax and
complete signatures remain owned by `Popover.doc.mjs` and
`usePopover.doc.mjs`; automatic canonical-target emission and compatibility
removal require separately reviewed runtime work.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: documentation-only target ownership clarification;
  runtime, DOM, styling, emitted classes, and public API are unchanged
- Canonical target: `popover` owns the broad painted-surface contract for
  `<Popover>` and public `usePopover` compositions
- Deprecated alias: `popover-surface` remains emitted so existing themes keep
  working during a documented migration window; it is not a second anatomy part
  or equal durable owner
- Composed components: component-specific surface targets such as
  `selector-popup` and `multi-selector-popup` remain authoritative refinements;
  compatibility output may remain underneath until migration
- New hook consumers: a direct `usePopover` composition that needs its own theme
  reachability provides and documents an owned `surfaceTarget`; it does not
  create a new dependency on `popover-surface`
- Migration decision: target ownership is settled; automatic `popover` emission
  for every painted hook surface and eventual alias removal ship only through
  separately reviewed runtime changes

The implementation migration must preserve `popover-surface` themes until its
announced removal window. Implementation and removal each update consumer
migration guidance, target inventory, focused tests, and changelog or release
documentation; this documentation-only PR does none of those runtime steps.

## Ownership boundary

**Owns**

- The standard trigger or referenced-anchor composition, the painted Popover
  surface, the canonical broad `popover` theme target for that surface, and the
  slot that renders caller-supplied content inside it.
- The public `usePopover` semantic contract: visibility operations, trigger
  bindings, surface rendering, dialog semantics, focus containment, and
  lifecycle notifications.
- Popover-specific focus destination selection, viewport fitting, safe-area
  gutters, match-trigger sizing, conditional internal scrolling, and the
  measurement lifecycle needed to support them.
- The current fallback close control appended by the hook.

**Does not own / non-goals**

- Trigger presentation and caller content presentation — caller-owned.
- Component-specific surface refinement targets — owned and documented by the
  composed component; Popover supplies only the shared baseline target contract.
- Generic top-layer hosting, native popover lifecycle reconciliation, anchor
  positioning, portal/context selection, and same-gesture reopen protection —
  owned by `architecture:layer-runtime`.
- Shared Escape and platform-close ordering — owned by
  `family:overlay-dismissal`.
- The shared focus-trap algorithm outside Popover-specific destination choice —
  owned by `useFocusTrap`.
- Hover previews and brief helper text — owned by HoverCard and Tooltip.

## Public surface and package boundary

The installable root package and `@astryxdesign/core/Popover` subpath expose the
full Popover public surface. The backward-compatible Layer entry point re-exports
`Popover`, `usePopover`, `UsePopoverOptions`, `UsePopoverReturn`, and
`PopoverProps`; `PopoverTriggerRenderProps` is exposed through the Popover package
surface, not the Layer entry point. There is no installable
`Popover/usePopover` implementation subpath.

The source-level internal hook is a package implementation seam used by Popover
and related presentation components. Its dismissal guard and wider focus-opening
controls are not installable consumer API. Source-file exports do not promote
those concepts into the package contract.

## Public concepts

| Concept                  | Closed values or states                                      | Meaning                                                                                                            | Availability              | Default                                                                      | Owner                                                                               | Stability                                    | Invalid or unsupported behavior                                                                                                                            |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger composition      | Wrapped trigger, render-prop trigger, or referenced anchor   | Supplies the anchor and the control that opens or closes the standard component                                    | Popover                   | Wrapped trigger when children are supplied                                   | `component:Popover`                                                                 | Current public behavior                      | A referenced or wrapped anchor without a button or button role warns in development and receives no trigger handler; it does not throw.                    |
| Visibility ownership     | Uncontrolled or externally controlled                        | Chooses whether Popover stores visibility or synchronizes to caller state                                          | Popover                   | Uncontrolled                                                                 | `component:Popover`                                                                 | Current public behavior                      | Controlled changes are synchronized through show/hide; dismissal requests are reported to the caller rather than redefining the external source of truth.  |
| Popup semantics          | Dialog or neutral wrapper                                    | Exposes dialog semantics or lets child menu/listbox semantics own the popup                                        | Popover and hook          | Dialog                                                                       | `component:Popover`                                                                 | Current public behavior                      | A dialog without a label warns in development. Neutral mode omits dialog role and modal semantics.                                                         |
| Focus entry              | Automatic or caller-preserved                                | Moves focus according to the matrix below or leaves current focus unchanged                                        | Popover and hook          | Automatic                                                                    | `component:Popover`                                                                 | Current public behavior                      | A request to skip autofocus affects that opening only.                                                                                                     |
| Dismissal                | Outside/Escape enabled or disabled within native constraints | Controls light dismiss and explicit Escape participation                                                           | Popover and hook          | Both enabled                                                                 | `component:Popover`; `family:overlay-dismissal` owns Escape/platform-close ordering | Current public behavior                      | Disabling Escape alone cannot override the native Escape behavior of an auto popover; explicit-dismiss behavior requires light dismiss to be disabled too. |
| Surface treatment        | Default surface or caller-owned treatment                    | Applies the shared painted surface and optional consumer styling                                                   | Popover and hook          | Default surface                                                              | `component:Popover`                                                                 | Current public behavior                      | Custom styling does not change lifecycle, focus, or dismissal semantics.                                                                                   |
| Surface target ownership | Shared baseline or component-specific refinement             | Assigns `popover` as the broad surface owner and lets a composed component add its own target on that same element | Popover and hook          | `popover` baseline; no component-specific refinement                         | `component:Popover`; the composed component owns its refinement target              | Accepted contract; runtime alignment pending | `popover-surface` is compatibility output, not a new target for consumers or a second anatomy owner.                                                       |
| Placement and fit        | Logical placement/alignment plus preferred width             | Positions the anchor surface and constrains it to available space                                                  | Popover and hook renderer | Below/start; Popover matches trigger minimum width when no width is supplied | `component:Popover` above `architecture:layer-runtime`                              | Current public behavior                      | Preferred width and trigger matching remain capped by viewport and safe-area availability.                                                                 |

### Public `usePopover` semantic inputs

Consumer syntax, exact names, and types remain in `usePopover.doc.mjs`; this
table owns their semantic effect.

| Input concept                     | Default                          | Effect and lifetime                                                                                                                                                                                              | Invalid or unsupported behavior                                                                                          |
| --------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Show and hide notifications       | Absent                           | Fire after the hook updates its visibility for an imperative or reconciled browser transition. They remain active for the mounted hook instance.                                                                 | No callback is fired when no transition occurs. Callers own any focus return they add in a hide notification.            |
| Surface styling                   | No consumer override             | Merges consumer StyleX, class, and inline styles onto the painted surface for every rendered lifetime.                                                                                                           | Styling cannot move ownership to the positioned outer layer; positioning styles belong to the renderer's layer props.    |
| Light and Escape dismissal        | Enabled                          | Escape dismissal registers through the focus trap when enabled; outside light dismiss uses native `popover="auto"` and is not shared-stack coordinated.                                                          | Escape disablement is only complete when native light dismiss is also disabled.                                          |
| Automatic focus                   | Enabled                          | Runs once for each successful open unless that opening requests preservation.                                                                                                                                    | If no genuine content control exists, dialog mode falls back to the surface container.                                   |
| Fallback close control and label  | Included; “Close popover”        | Appends an end-of-trap close control for each rendered surface.                                                                                                                                                  | When omitted, the hook does not synthesize another close affordance.                                                     |
| Popup role, label, and modality   | Dialog, modal, no implicit label | Stamps semantics on the painted surface for its rendered lifetime.                                                                                                                                               | Neutral role suppresses dialog and modal semantics. Missing dialog label warns in development rather than throwing.      |
| Default surface                   | Enabled                          | Applies the shared background, radius, and elevation treatment while rendered.                                                                                                                                   | Turning it off delegates painting to caller content but does not turn `usePopover` into a different lifecycle primitive. |
| Optional component surface target | No component-specific refinement | Adds a component-owned refinement target beside the canonical `popover` target on the same rendered surface. New direct hook consumers provide and document one only when they need distinct theme reachability. | `surfaceTarget` does not create another surface or owner. Do not pass or depend on deprecated `popover-surface`.         |

### Public `usePopover` semantic outputs

| Output concept        | Meaning and lifetime                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger binding       | A ref binding establishes the anchor while attached; ARIA trigger state tracks the current role and open state; a stable anchor identifier supports advanced composition. Detaching the trigger removes its anchor association. |
| Visibility operations | `show`, `hide`, and `toggle` are the canonical operations for the mounted hook instance. Show may preserve current focus for one opening; hide and toggle add no separate caller-owned focus destination.                       |
| Open state            | Reflects the hook's reconciled visibility. Browser-initiated close is observed on the queued native toggle event, so DOM visibility may lead React state briefly.                                                               |
| Surface binding       | A content ref identifies the focus-trap surface while mounted.                                                                                                                                                                  |
| Renderer              | Produces the positioned layer and painted surface around caller content, including focus containment and the optional fallback close control. The renderer must remain in the React tree for the surface to exist.              |
| Surface identifier    | A stable identifier connects the trigger's control relationship to the rendered surface for the hook instance.                                                                                                                  |

### Side effects and lifetime

- Attaching the trigger ref assigns and removes the CSS anchor name used by the
  Layer runtime.
- Successful visibility operations call the browser popover methods when
  available, update hook state, and invoke the corresponding lifecycle
  notification. Native close events reconcile back into that same state model.
- The default context layer keeps its mounted host while closed after initial
  resolution; open state, not host existence, controls visibility. Lazy mounting
  remains a Layer-level option rather than a separate Popover contract.
- Popover component trigger handlers and ARIA state exist only while the trigger
  is mounted and enabled. Disabling Popover ignores its trigger interaction; it
  does not disable the caller's trigger element.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                        | Basis                                                             | Acceptance and implementation state                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| FR1 | Popover and public `usePopover` expose one visibility lifecycle with canonical show, hide, and toggle operations. Options that refine opening remain part of that operation; an internal need does not create a durable parallel toggle concept. | Current public package surface plus owner direction on 2026-08-31 | Direction settled; current internal helper naming remains a verification gap, not a second API decision                    |
| FR2 | Focus destination is derived from popup role, activation style, content, and autofocus policy. Callers do not choose a public focus target.                                                                                                      | PR #5373, current source, and current tests                       | Settled current component behavior                                                                                         |
| FR3 | The preferred surface size is capped to logical viewport and safe-area availability before overflow is enabled.                                                                                                                                  | PR #5373, current source, tests, and Storybook fixtures           | Verified in unit/style evidence; real rendered viewport evidence remains a gap                                             |
| FR4 | Popover enables internal scrolling only after measured overflow exceeds the current tolerance. Fitting content does not become a scroll container.                                                                                               | PR #5373 and current tests                                        | Verified current behavior                                                                                                  |
| FR5 | Overflow signals while open coalesce into at most one measurement per animation frame, and Popover owns no measurement observers while closed.                                                                                                   | PR #5373 and current tests                                        | Verified current resource behavior                                                                                         |
| FR6 | Component anatomy contains the caller trigger and content, one painted Popover surface, and the optional fallback close control. Popover owns no Header, Body, or separate shared-hook surface part.                                             | Current source, docs target inventory, and tests                  | Accepted anatomy; stale consumer anatomy corrected by this contract                                                        |
| FR7 | The painted surface has one broad canonical target, `popover`. `popover-surface` is a deprecated compatibility alias on that same part; composed components may add one authoritative component-specific refinement target.                      | Owner direction on 2026-08-31 plus current target inventory       | Accepted semantic contract; automatic hook-wide emission and compatibility removal remain separately reviewed runtime work |

### Allowed variation

- **AV1 — Trigger composition.** Wrapped, render-prop, and referenced-anchor
  modes may attach the same semantic trigger behavior without changing the
  surface contract.
- **AV2 — Popup semantics.** Dialog mode may focus the dialog container;
  role-neutral popups let their child role and content focus model remain
  exposed.
- **AV3 — Surface treatment.** The hook may omit its default paint or add a
  component-owned refinement target while preserving the canonical `popover`
  ownership, lifecycle, focus containment, and dismissal model.
- **AV4 — Placement.** Logical placement, alignment, preferred width, and
  available viewport size may change geometry without changing the fit and
  overflow precedence below.

### Representative focus and dismissal states

| State                                             | Required invariant                                                                                                                                                           | Allowed variation                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Pointer or touch activation of dialog Popover     | Initial focus moves to the labeled dialog container so an action does not appear preselected.                                                                                | The trigger and content may vary.                                                                        |
| Keyboard or AT-style activation of dialog Popover | Initial focus moves to the first genuine content control; when none exists, it moves to the dialog container.                                                                | Activation with absent or zero event detail follows this path. Named AT announcement remains unverified. |
| Read-only dialog                                  | The dialog container receives initial focus; the fallback close control remains reachable by Tab but is not selected as initial content.                                     | Caller content may contain no tabbable control.                                                          |
| Neutral-role popup                                | The neutral wrapper is not selected as a dialog focus target; automatic entry prefers genuine content focus, or callers may disable autofocus for trigger-retained patterns. | Child menu, listbox, or other semantics own their focus model.                                           |
| Automatic focus disabled                          | Opening does not move focus.                                                                                                                                                 | May be persistent configuration or a one-opening show preference.                                        |
| Controlled open                                   | External open state invokes the no-activation opening path: first genuine content control, then dialog-container fallback.                                                   | The caller remains the visibility source of truth.                                                       |
| Tab from a focused container                      | Focus enters the first tabbable descendant.                                                                                                                                  | If none exists, focus remains inside.                                                                    |
| Shift+Tab from a focused container                | Focus enters the last tabbable descendant.                                                                                                                                   | If none exists, focus remains inside.                                                                    |
| Escape                                            | The topmost eligible Popover closes according to shared dismissal policy.                                                                                                    | Explicit-dismiss surfaces may disable both light and Escape dismissal.                                   |
| Close after focus entered the popup               | Focus returns to the trigger when removal would otherwise strand focus.                                                                                                      | A caller may additionally own focus return through its hide notification.                                |

### Transformation and precedence order

- **ORD1 — Visibility operation.** `toggle` selects the existing `show` or `hide`
  transition; it is not a second lifecycle. Opening preferences refine `show`.
  Popover derives any internal focus destination before invoking that operation.
- **ORD2 — Preferred inline size.** An explicit width wins over trigger matching.
  Without explicit width, Popover prefers trigger minimum width. Either preferred
  size remains capped by available viewport and safe-area space.
- **ORD3 — Viewport fit.** Logical placement and alignment select the applicable
  safe-area gutters; the positioned layer and painted surface are capped before
  overflow state is evaluated.
- **ORD4 — Conditional scroll.** Measured overflow greater than 1 px enables
  internal scrolling and overscroll containment; fitting content leaves both
  disabled.

### Performance and resources

- **PR1 — Open-only observation.** Resize, mutation, captured resource-load,
  window-resize, and visual-viewport-resize observation exists only while the
  Popover component is open; cleanup disconnects listeners and observers and
  cancels pending work.
- **PR2 — One measurement per frame.** Repeated signals while a measurement is
  pending coalesce into one animation-frame callback.
- **PR3 — Stable state update.** Measurement updates overflow state only when the
  overflow boolean changes.

## Accessibility contract

- **AR1 — Trigger relationship.** The trigger exposes expanded state, the popup
  relationship, and a role-appropriate popup type while mounted.
- **AR2 — Dialog naming.** Dialog mode requires a caller-provided accessible
  label and places dialog/modal semantics on the painted surface. Missing naming
  warns in development but does not synthesize a label.
- **AR3 — Focus containment.** Automatic entry and Tab/Shift+Tab behavior follow
  the matrix above; a trapped surface with no tabbable descendant does not let
  focus escape.
- **AR4 — Focus return.** Dismissal returns focus to the trigger when focus had
  entered the closing Popover and would otherwise be lost.
- **AR5 — Evidence boundary.** Current automated tests establish DOM roles, ARIA
  state, focus movement, and focus return. The Storybook manual-AT story is a
  fixture, not a recorded result. PR #5373 records no named NVDA + Chrome or
  VoiceOver + Safari announcement result, so this contract makes no AT
  announcement claim.

## Design relationships

| Anatomy or state       | Design requirement                                                                                                      | Representation authority       | Hierarchy role | Component contract |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Trigger element        | Supplies or references the control and anchor without becoming Popover-owned presentation.                              | Caller content                 | Supporting     | FR6, AR1           |
| Popover surface        | Paints the component surface, owns the canonical `popover` target, and carries fit, scroll, focus, and dialog behavior. | Current source and owner DEC-2 | Prominent      | FR2–FR7, AR2–AR4   |
| Popover content        | Renders caller-supplied interaction or information inside the surface.                                                  | Caller content                 | Prominent      | FR2, FR6           |
| Fallback close control | Provides an end-of-trap close affordance without becoming the initial focus destination.                                | `component:Button`             | Supporting     | FR2, AR3           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Trigger element": {
    "none": {
      "reason": "intentional: The trigger is caller-owned and receives no Popover theming target."
    }
  },
  "Popover surface": {"target": "popover"},
  "Popover content": {
    "none": {
      "reason": "intentional: Caller-supplied content is caller-owned; normal CSS may inherit from the surface, but Popover provides no content target."
    }
  },
  "Fallback close control": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  }
}
```

### Deprecated compatibility target

`popover-surface` is a deprecated alias for `popover` on the same painted
surface. It is not anatomy and has no independent conceptual ownership. The
component doc marks it with `deprecatedFor: 'popover'`, so the anatomy validator
excludes it from the active target inventory while the runtime keeps emitting
it for existing themes.

Every public `usePopover` painted surface belongs to the broad `popover` target.
A composed component may add its own authoritative refinement target, such as
`selector-popup` or `multi-selector-popup`, on that same element. New direct
hook consumers that need distinct theme reachability provide and document an
owned `surfaceTarget`; they do not use `popover-surface`.

Automatic hook-wide `popover` emission and eventual removal of the compatibility
alias are runtime migration work outside this contract. Existing
`popover-surface` themes remain supported until that separately reviewed
migration includes target-inventory and regression-test updates plus changelog
or release guidance.

## Family and system relationships

- `architecture:public-component-api` owns installable reachability and the
  distinction between public package API and source-level implementation seams.
- `architecture:layer-runtime` owns the shared host, native popover lifecycle,
  anchor geometry, portal/context behavior, and same-gesture dismissal guard;
  Popover owns the component-specific fit, overflow, and focus composition above
  that runtime.
- `architecture:interaction-modality` owns shared modality classification and
  evidence expectations. Popover owns the destination matrix and derives the
  internal focus choice from activation and role.
- `architecture:component-theming-surface` owns anatomy qualification and target
  placement. `popover` is the one broad target on the painted surface;
  `popover-surface` is only its deprecated compatibility alias. Caller content
  adds no target, the fallback close control delegates to Button's target, and
  composed components own any additional surface refinement target.
- `family:overlay-dismissal` owns topmost Escape and platform-close ordering.
  Popover participates through the shared layer owner while retaining its local
  focus, outside-dismiss, and open-state behavior.

## Verification map

| Contract                     | Verification                                                                                                                          | Representative states                                                                                              | Mutation or failure expectation                                                                                                                       | Audit section                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Public boundary, FR1         | `Popover.test.tsx` compile-time public-surface assertions plus package/barrel inspection                                              | Public component/hook imports and package-internal seam                                                            | Promoting internal controls or changing public operations fails type assertions or package review.                                                    | `audit:Popover/api`           |
| FR2, AR2–AR4                 | `Popover.test.tsx` focus/role suites and `useFocusTrap.test.tsx` container-entry suites                                               | Pointer, keyboard/AT-style, read-only, neutral role, no autofocus, controlled, Tab/Shift+Tab, Escape, focus return | Changing a destination, selecting fallback close initially, or allowing focus escape fails focus assertions.                                          | `audit:Popover/accessibility` |
| FR3, FR4                     | `Popover.test.tsx` sizing/overflow suites; `Popover.stories.tsx` real-viewport scenarios for manual/browser evidence                  | Explicit width, trigger matching, all alignments, fitting and overflowing content                                  | Removing a cap, reversing width precedence, or always enabling scroll fails emitted-style or overflow assertions.                                     | `audit:Popover/layout`        |
| FR5                          | `Popover.test.tsx` scheduling and observer-lifecycle suites                                                                           | Closed, opened, repeated signals, cleanup                                                                          | Constructing observers while closed or measuring more than once per pending frame fails lifecycle assertions.                                         | `audit:Popover/resources`     |
| FR6, FR7 and theming anatomy | `Popover.test.tsx`, `Popover.doc.mjs`, `usePopover.doc.mjs`, `astryx theme targets Popover --json`, and `scripts/check-knowledge.mjs` | One real surface with canonical `popover`; deprecated alias on that element; composed-component refinements        | A fake anatomy part, loss of compatibility output, missing deprecation metadata, or an active target without a real owner fails review or validation. | `audit:Popover/theming`       |
| AR5                          | `Popover.stories.tsx` manual-AT fixture and PR #5373 test record                                                                      | Read-only dialog manual-AT fixture; no recorded NVDA/VoiceOver announcement result                                 | A fixture without recorded AT/browser observations cannot be cited as announcement proof.                                                             | `audit:Popover/at-evidence`   |

## Decision log

### DEC-1 — One canonical visibility operation model

**Reference:** `component:Popover/DEC-1`

**Decider:** Cindy Zhang, 2026-08-31

Showing, hiding, and toggling are one visibility lifecycle. Options may refine the
opening half of toggle, but a package-internal need for a derived focus destination
does not establish a durable parallel toggle API. Popover derives focus placement
from activation, role, content, and autofocus policy; consumers are not asked to
choose it.

Rejected: preserving a separate `toggleWithOptions` concept or exposing
`focusTarget` as durable API. Both describe implementation choices within the
same caller operation, and public focus selection would let callers create
inconsistent or inaccessible destinations.

### DEC-2 — One canonical Popover surface target

**Reference:** `component:Popover/DEC-2`

**Decider:** Cindy Zhang, 2026-08-31

`popover` is the broad canonical theming baseline automatically owned by every
painted surface created by `<Popover>` or public `usePopover`.
`popover-surface` is deprecated compatibility output on that same element, not a
second anatomy part or equal owner. Existing themes using it remain supported
through a documented migration window.

Composed components keep authoritative refinement targets such as
`selector-popup` and `multi-selector-popup`. Optional `surfaceTarget` adds that
owned refinement on the same surface; it does not replace the broad `popover`
baseline. New direct hook consumers that need distinct reachability provide and
document an owned target rather than depending on `popover-surface`.

Rejected: treating `popover` and `popover-surface` as two durable sibling targets,
or inventing a “Shared hook surface” anatomy part to satisfy inventory coverage.
Both make one painted element look like two design concepts and preserve an
accidental implementation name as permanent public structure.

## Verification gaps

These implementation and evidence items remain required follow-up, but they do
not block acceptance of the semantic contract above.

- **VG1 — Internal operation naming.** Current source still names a
  package-internal wider toggle helper separately. This contract treats it as an
  implementation seam to reconcile in future runtime work, not as public or
  durable package API. This documentation-only PR does not rename it.
- **VG2 — Real browser behavior.** Unit tests assert emitted sizing styles and
  synthetic dimensions, not rendered viewport layout. Native popover light
  dismiss, top-layer ordering, anchor geometry, and rendered focus behavior still
  require real Chromium/WebKit evidence when changed.
- **VG3 — AT announcement.** The current story provides manual instructions, but
  named NVDA + Chrome and VoiceOver + Safari results are absent. No announcement
  outcome is claimed.
- **VG4 — Target migration.** Current runtime still emits `popover-surface` as
  the automatic shared class and reaches `popover` through Popover's explicit
  `surfaceTarget`. A separate implementation must make `popover` automatic for
  every public hook surface while preserving the alias, then verify direct-hook
  and composed-component target inventories before any later removal.

## Open questions

None. DEC-1 settles the visibility model and derived focus destination; DEC-2
settles canonical target ownership and compatibility direction. The remaining
items are verification or separately reviewed implementation work, not human API
questions.

## Content boundary

This file does not duplicate consumer signatures, prop tables, examples,
implementation steps, shared layer algorithms, or family dismissal rules. It
links to their owners and records only Popover-specific semantics, boundaries,
and invariants.
