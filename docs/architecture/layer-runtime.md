---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:layer-runtime
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/Layer/,
    packages/core/src/Popover/,
    packages/core/src/Dialog/,
    packages/lab/src/Drawer/,
    packages/core/src/DropdownMenu/,
    packages/core/src/Tooltip/,
    packages/core/src/HoverCard/,
    packages/core/src/Toast/,
    packages/core/src/CommandPalette/,
    packages/core/src/hooks/useFocusTrap.ts,
    packages/core/src/hooks/useMenuHover.ts,
  ]
verified_by:
  [
    packages/core/src/Layer/useLayer.test.tsx,
    packages/core/src/Layer/layerHost.test.ts,
    packages/core/src/Layer/anchorName.test.ts,
    packages/core/src/Layer/useLayerDismissal.test.tsx,
    packages/core/src/Layer/layerDismissalInvariants.test.tsx,
    packages/core/src/Popover/Popover.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenuSubMenu.test.tsx,
    packages/core/src/hooks/useFocusTrap.test.tsx,
    packages/core/src/hooks/useMenuHover.test.tsx,
    packages/core/src/Toast/ToastViewport.test.tsx,
  ]
deciding_specs: []
---

# Layer runtime

This record describes the layer runtime shipped on current `main`. Accepted but
unimplemented changes live in `spec:AST-003`; they are not current architecture.

## Purpose

Layered UI must escape clipping, stay positioned against its trigger, preserve
nearby theme and writing context, and reconcile browser-owned visibility with
React state.

This record separates DOM hosting, browser top-layer promotion, positioning, and
current dismissal plumbing. A component does not inherit every behavior merely
because it uses one of those mechanisms.

## System model

### Browser hosts and corrective portals

A browser host determines whether and how a surface enters the browser's top
layer:

- `popover="auto"` provides native top-layer promotion, light dismissal, close
  requests, and the browser's auto-popover stack;
- `popover="manual"` provides top-layer promotion without native light dismissal
  or auto-popover exclusivity;
- `dialog.showModal()` provides a native modal boundary, backdrop, inert outside
  content, and platform close requests;
- `dialog.show()` provides a non-modal dialog in its containing context; and
- ordinary DOM rendering provides none of those browser guarantees.

A React portal changes DOM placement. It is not itself a top-layer host and
cannot use `z-index` to outrank a native modal dialog.

`useLayer` keeps a context layer at its JSX position when that position is safe.
When parsing, interactive-content, or inline-formatting constraints make that
position unsafe, it portals only beyond the outermost unsafe ancestor. A
persistent `<template>` marker preserves the intended position so the host can be
resolved again when the render call moves. The nearest safe host preserves live
CSS custom-property inheritance; direction and writing mode are copied only when
the portal would otherwise lose them.

A normal React portal retains React context. `architecture:theme-application`
owns Theme provider behavior; this record owns where a layer's DOM is hosted.

### Positioning

`useLayer` has three positioning modes:

- **context / anchor:** the trigger receives a unique CSS `anchor-name`; the
  surface receives `position-anchor`, logical `position-area`, and ordered
  fallback positions;
- **context / custom:** the trigger and `position-anchor` relationship remain,
  while the caller owns geometry, fallback, offset, and direction handling; and
- **fixed:** the caller supplies viewport `x` and `y` coordinates and receives no
  CSS-anchor geometry.

Anchor names form a list so several layers may share one trigger without
clobbering one another. Standard placement uses the `self-*` logical keyword
family so inherited direction controls RTL behavior. Every anchored placement
can flip across either axis. Centered placements also gain span fallbacks so the
surface can move along the alignment axis near viewport edges. Clearance is
applied to both edges of the placement axis so a flip retains the gap.

Popover adds component-specific viewport sizing and overflow behavior above this
geometry. Those constraints are not universal Layer behavior.

### Current browser support behavior

Native Popover API plus CSS Anchor Positioning provide the complete behavior
implemented by the main path: top-layer promotion, native light dismiss,
auto-popover stacking and association, logical anchor geometry, and browser
fallback placement.

When `showPopover` or `hidePopover` is unavailable, `useLayer` falls back to
changing `display`. Explicit component controls can still show and hide mounted
content, callbacks and React state still update, and fixed coordinates still
apply. This fallback does not reproduce top-layer promotion, native outside or
close-request behavior, auto-popover exclusivity or nesting, invoker focus order,
anchored geometry, or collision fallbacks.

Public docs do not yet state this reduced behavior as a support boundary. The
accepted support contract and documentation change are owned by `spec:AST-003`.

### Current Popover lifecycle and light dismissal

Public `useLayer` defaults to `popover="manual"`; Popover-family APIs normally
select `popover="auto"`. Browser-initiated closes are observed through the queued
`toggle` event. The browser may already have hidden the surface before `isOpen`,
`onHide`, or controlled-state synchronization catches up.

`gestureCounter` identifies the physical pointer or keyboard gesture in flight.
`useLayer` records the gesture associated with a browser close and
`wasJustDismissed()` prevents that same press from reopening a trigger.
DropdownMenu and Selector-family trigger paths consume this guard.

`useMenuHover` adds a real native invoker relationship for applicable auto
popovers. It separately suppresses the synthetic `mouseenter` produced when a
closing panel exposes a stationary trigger, while allowing a genuine later hover.

Controls that sit beside an open layer can temporarily gain `popovertarget`
during a press so native light dismissal does not mistake them for outside
interaction. Their click action is cancelled as an invoker toggle so the control
can perform its own action without closing the layer.

### Current dismissal plumbing

`family:overlay-dismissal` owns the shipped Escape/platform-close membership
contract. The current shared stack registers present layers with `close` or
`block` behavior and orders them by logical depth, DOM containment, then stable
active-cycle registration sequence. `useFocusTrap` adapts an active trap with `onEscape` into
that stack.

Tooltip, HoverCard, Dialog, Lab Drawer, Popover, DropdownMenu, Lightbox, and
MobileNav all register with the shared stack. Tooltip and HoverCard report current DOM presence;
Popover and DropdownMenu register through `useFocusTrap`; Dialog, Lightbox, and
MobileNav additionally ask `shouldDismissOnCloseRequest()` before acting on native
platform close requests. Other family members still use local Escape handling as
listed in `family:overlay-dismissal`.

Outside interaction is not coordinated by the shared stack. Current paths are
independent:

- auto popovers use native light dismiss;
- native dialogs handle backdrop clicks locally;
- ContextMenu uses a local outside `mousedown` listener;
- Tooltip and HoverCard use hover/focus loss plus a touch-only outside listener;
- sheets own scrim and swipe behavior; and
- dropdown submenus encode their root-close relationship locally through
  `DropdownMenuContext`.

The shared stack exposes `isTopmostLayer()`, but current outside, backdrop, touch,
and swipe paths do not use it. There is no shared interaction-owner role,
association graph, branch registry, or outside-branch resolution operation on
current `main`.

### Current global and nonparticipating surfaces

LayerProvider supplies Toast configuration and mounts ToastViewport. It is not a
general portal host for all layers. Without a provider, `useToast` creates a
separate React root under `document.body` and mirrors root theme attributes onto
it.

ToastViewport uses `popover="manual"` for top-layer promotion and documents an
above-dialog intent. A body-level manual popover remains behind an active native
modal, so the current root/fallback host does not fulfill that intent. Toast
state also lives inside the viewport.

CommandPalette composes native Dialog. Its normal launcher presentation therefore
uses `showModal()`; its documentation/showcase `isInline` path does not. It
currently handles Escape on its own element as well as composing Dialog.

Banner and FieldStatus are in-flow. `useAnnounce` is nonvisual. AlertDialog,
imperative Dialog, Lightbox, and ordinary Popover-family surfaces are
interaction-local. `useKeyboardHint`, Carousel's control overlay, and visual-only
layers use Layer rendering without joining Escape/platform dismissal.

## Boundaries and invariants

- **INV1 — Corrective portals preserve locality.** A context layer stays inline
  when safe and otherwise moves only outside the outermost unsafe ancestor.
- **INV2 — Hosting and promotion are separate.** A React portal moves DOM. Native
  Popover or modal Dialog APIs control top-layer participation and modal
  boundaries.
- **INV3 — Positioning modes do not leak.** Anchor mode owns logical placement and
  fallbacks; custom mode owns its geometry; fixed mode owns explicit coordinates.
- **INV4 — Shared anchors compose.** One layer adding or removing its anchor name
  does not overwrite names belonging to sibling layers.
- **INV5 — Logical placement remains direction-aware.** Standard anchored
  placement derives from the surface's inherited writing direction and keeps
  clearance after a fallback flip.
- **INV6 — Native close reconciliation is single-fired.** Programmatic hide and
  browser close do not double-fire state or `onHide` updates.
- **INV7 — Existing native-light-dismiss guards identify gestures.** The same
  physical press that closes a Layer cannot immediately reopen it; menu-hover also
  suppresses exposure-induced hover.
- **INV8 — Current Escape delivery follows registered layers.** The shared stack
  uses present `close` and `block` entries in its current depth, containment, and
  stable-registration order.
- **INV9 — Outside channels remain component-owned and uncoordinated.** Current
  backdrop, pointer, touch, hover/focus, and swipe handlers act through their
  owning component or browser mechanism rather than one shared branch operation.
- **INV10 — LayerProvider is Toast configuration, not a universal layer host.**
  Trigger-associated layers resolve near their JSX position independently of the
  provider.

This record does not make future eligible-owner, branch-association, global-host,
or browser-support requirements current. It does not own component focus entry or
return, modal semantics, channel admission policy, public controlled/uncontrolled
APIs, visual treatment, or theming anatomy.

## Current gaps and accepted change

Current gaps are observable facts, not current target behavior:

- Tooltip currently consumes Escape ahead of an associated Popover, menu, or
  Dialog instead of acting as passive information.
- There is no distinction between active, blocking, passive, and visual-only
  registration roles.
- Outside interaction cannot resolve a whole associated menu/submenu branch or a
  nested child branch through shared infrastructure.
- Backdrop, manual outside, touch, and swipe paths do not share the existing
  gesture claim or one association model.
- Toast's root and fallback hosts remain behind active native modals.
- CommandPalette's local Escape handler bypasses shared owner selection.
- The reduced browser fallback is not documented as non-equivalent.
- Existing tests simulate Popover `toggle` and DOM nesting; they do not prove
  native pointer light dismissal, top-layer/modal ordering, real anchor geometry,
  SSR parser repair, or nested portal behavior in supported browsers.

`spec:AST-003` is the accepted, unimplemented change that owns requirements,
migration, verification, and completion criteria for these gaps. This record must
be updated only as that work ships.

## Change coupling

- A change to `useLayer` hosting or lifecycle verifies safe inline placement,
  corrective portals, host relocation, show/hide reconciliation, theme
  inheritance, writing context, and reduced-browser behavior.
- A positioning change verifies all placement/alignment combinations in LTR and
  RTL, viewport-edge fallbacks, offsets after flips, shared anchors, custom mode,
  and fixed mode.
- A Popover lifecycle change verifies programmatic and browser closes, controlled
  state, temporary invoker association, and same-gesture trigger behavior.
- A dismissal-stack change updates `family:overlay-dismissal` when membership or
  Escape/platform delivery changes.
- A local outside, backdrop, touch, hover, or swipe change preserves the owning
  component's policy and verifies interactions with nested surfaces.
- A Toast host change preserves queued and visible toasts, timers, focus handoff,
  theme context, and ordering.
- A CommandPalette host change preserves native modality, search state, focus
  entry/return, and controlled close behavior.
- A browser fallback change updates public `useLayer` and Popover docs and tests
  for both the native path and actual fallback.

## Owning code

- `Layer/useLayer.tsx` owns Popover API lifecycle, state reconciliation,
  anchor/fixed/custom rendering, trigger source, and current same-gesture memory.
- `Layer/layerHost.ts` owns safe inline versus nearest corrective portal placement.
- `Layer/anchorName.ts` owns composition of anchor names on one trigger.
- `Layer/gestureCounter.ts` owns physical pointer/key gesture identity.
- `Layer/layerStack.ts`, `Layer/useLayerDismissal.ts`, and
  `Layer/LayerDepthContext.tsx` own current registration, presence, ordering, and
  Escape/platform routing.
- `Popover/usePopover.tsx` owns focus-trap composition and default native light
  dismiss for Popover-family surfaces.
- `hooks/useFocusTrap.ts` adapts dismissible traps into current shared
  registration; it does not own component focus policy.
- `hooks/useMenuHover.ts` owns hover-open confirmation, native invoker wiring,
  menu focus, and exposure-induced re-hover suppression.
- `Layer/useTouchTrigger.ts` owns touch trigger classification and the current
  touch-only outside listener for Tooltip/HoverCard.
- `DropdownMenuContext` and `DropdownMenuSubMenu` own the current local
  menu-cascade parent-close chain.
- Dialog families own native modal/backdrop presentation and their local channel
  policies.
- Lab Drawer owns modal `showModal()` and non-modal `showPopover()` hosting while
  the shared dismissal stack owns Escape and platform close routing.
- `LayerProvider`, `ToastContext`, `useToast`, and `ToastViewport` own current
  notification state, dispatch, and viewport rendering.
- CommandPalette owns command search and selection; Dialog owns its native modal
  host.
- `family:overlay-dismissal` owns Escape/platform-close membership.
  `architecture:interaction-modality` owns last-input modality.
  `architecture:public-component-api` owns public component and hook contracts.
  `architecture:theme-application` owns provider and portal theme context.

## Deciding specs

No system spec changes the shipped runtime described here.

`spec:AST-003` is accepted but unimplemented. It defines the approved next
runtime and must move to `shipped` before its requirements are incorporated into
this current architecture record.

## Verification

| Invariant  | Evidence                                                                                       | Failure signal                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| INV1, INV2 | `useLayer.test.tsx` and `layerHost.test.ts`                                                    | Invalid DOM, stale host, lost theme/writing context, or portal mistaken for top-layer promotion         |
| INV3–INV5  | `useLayer.test.tsx` and `anchorName.test.ts`                                                   | A mode leaks geometry, RTL resolves from the wrong context, fallback clips, or a sibling anchor is lost |
| INV6, INV7 | `useLayer.test.tsx`, `Popover.test.tsx`, `DropdownMenu.test.tsx`, and `useMenuHover.test.tsx`  | Duplicate close callback or the same press/re-hover reopens a surface                                   |
| INV8       | `useLayerDismissal.test.tsx`, `layerDismissalInvariants.test.tsx`, and `useFocusTrap.test.tsx` | Current top registered layer is skipped, two layers close, or a blocker leaks through                   |
| INV9       | Representative Dialog, ContextMenu, Tooltip/HoverCard, and BottomSheet source/tests            | A current local channel silently changes ownership or policy                                            |
| INV10      | `LayerProvider.tsx`, `useToast.tsx`, and `ToastViewport.test.tsx`                              | Provider begins relocating ordinary layers or Toast fallback loses its current lifecycle                |

Current unit coverage proves emitted styles, reducers, state transitions, and DOM
placement. Native Popover, `<dialog>`, focus, top-layer ordering, and rendered
anchor geometry require real Chromium and WebKit evidence when changed.
