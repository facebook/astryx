---
schema_version: 3
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

# Popover component contract

## Intent

Popover presents caller-supplied interactive content in an anchored top-layer surface. `<Popover>` owns the standard trigger-to-surface composition; `usePopover` exposes the same lifecycle, focus containment, dismissal, and rendering semantics for custom compositions. Consumer syntax and signatures remain in [`Popover.doc.mjs`](./Popover.doc.mjs) and [`usePopover.doc.mjs`](./usePopover.doc.mjs).

## Compatibility and migration

- Released default preserved: `yes`.
- Compatibility class: documentation-only ownership clarification; runtime, DOM, styling, emitted classes, public API, and release status are unchanged.
- `popover` is the canonical broad target for every painted `<Popover>` and public `usePopover` surface. `popover-surface` remains emitted with `deprecatedFor: 'popover'` as a compatibility alias on that same element until a documented removal window.
- A composed component may add one authoritative component-specific refinement, such as `selector-popup` or `multi-selector-popup`, through `surfaceTarget`. New direct hook consumers needing distinct reachability document an owned refinement; they do not depend on `popover-surface`.
- Automatic hook-wide `popover` emission and later alias removal require separate runtime reviews. Each step must preserve existing themes and update migration guidance, target inventory, focused tests, and release documentation.

## Ownership boundary

**Owns:** the standard wrapped, render-prop, or referenced trigger composition; one painted surface and caller-content slot; public hook visibility, trigger, renderer, focus, semantics, and notifications; Popover-specific focus destination, viewport fit, safe-area gutters, trigger-width preference, conditional scrolling, open-only measurement; and the hook's optional fallback close control.

**Does not own:** caller trigger/content presentation; composed-component refinement targets; HoverCard/Tooltip use cases; generic hosting, portal/context selection, native lifecycle, anchor geometry, or same-gesture reopening ([Layer runtime](../../../../docs/architecture/layer-runtime.md)); shared Escape/platform-close ordering ([overlay dismissal](../../../../docs/families/overlay-dismissal.md)); shared modality classification ([interaction modality](../../../../docs/architecture/interaction-modality.md)); or the shared focus-trap algorithm outside Popover's destination choice ([`useFocusTrap`](../hooks/useFocusTrap.ts)).

## Public concepts

The root package and `@astryxdesign/core/Popover` expose `Popover`, `usePopover`, their options/return/props types, and `PopoverTriggerRenderProps`. The compatible Layer entry re-exports all except `PopoverTriggerRenderProps`; there is no installable `Popover/usePopover` subpath. Source-only dismissal guards and wider focus-opening controls remain implementation seams under [AST-002](../../../../docs/specs/AST-002/spec.md) and [public component API](../../../../docs/architecture/public-component-api.md).

| Concept           | Values / default                                                        | Durable contract                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger           | wrapped children, render prop, or referenced anchor; wrapped by default | Supplies the anchor and control. A wrapped/referenced element without a button or button role warns in development, receives no handler, and does not throw. Disabled Popover ignores only its own trigger interaction. |
| Visibility        | uncontrolled (default) or controlled                                    | `show`, `hide`, and `toggle` are one lifecycle. Controlled state remains caller-owned; dismissal requests report through the established callback path.                                                                 |
| Popup semantics   | labeled modal dialog (default) or neutral wrapper                       | Dialog mode stamps role/modal/name and warns, rather than throws or invents a label, when unnamed. Neutral mode leaves menu/listbox semantics to caller content.                                                        |
| Focus entry       | automatic (default) or caller-preserved                                 | Focus follows the matrix below once per successful open; a skip request applies only to that opening. Consumers do not choose a public focus target.                                                                    |
| Dismissal         | outside and Escape enabled by default                                   | Escape joins the shared stack. Disabling Escape is complete only with native light dismiss also disabled.                                                                                                               |
| Surface           | default paint; optional consumer styling and refinement                 | `xstyle`, class, and inline style merge on the painted surface without changing lifecycle. `hasSurface` may delegate paint; `surfaceTarget` adds one refinement on the same surface.                                    |
| Placement and fit | below/start; trigger minimum width unless explicit width                | Logical placement/alignment and preferred width remain capped by viewport and safe-area availability; explicit width wins over trigger matching.                                                                        |
| Hook lifecycle    | optional notifications and fallback close control (`Close popover`)     | Notifications fire only after an actual imperative or reconciled transition. The fallback control is appended per rendered surface when enabled and is not replaced when omitted.                                       |

The mounted hook returns a trigger ref that owns the anchor association while attached, a stable anchor identifier, role/open ARIA props, reconciled open state, a content ref binding the focus-trap surface, a stable surface ID, and a renderer that must remain in the React tree. Detaching the trigger removes its association; removing the renderer removes the surface. After initial resolution, the default context host remains mounted while open state controls visibility. Browser-initiated close can hide the DOM before the queued native `toggle` event updates React state.

## Behavioral and layout contract

- **FR1 — One lifecycle.** `toggle` selects `show` or `hide`; opening options refine `show` rather than create a parallel operation. Popover derives its internal focus destination.
- **FR2 — Focus.** Destination derives from popup role, activation style, content, and autofocus policy; the fallback close control is never treated as initial content.
- **FR3 — Fit.** The preferred size is capped to logical viewport and safe-area availability before overflow is evaluated.
- **FR4 — Conditional scroll.** Internal scrolling and overscroll containment begin only when measured overflow exceeds 1 px; fitting content remains a non-scroll container.
- **FR5 — Resources.** Resize, mutation, captured load, window resize, and visual-viewport resize observation exists only while open; signals coalesce to one animation-frame measurement, cleanup cancels all work, and state updates only when the overflow boolean changes.
- **FR6 — Anatomy.** The component has caller trigger and content, one painted Popover surface, and an optional fallback close control—no Header, Body, or shared-hook surface part.
- **FR7 — Target ownership.** `popover` is the one broad canonical target; `popover-surface` is its deprecated compatibility alias; a composed component may add one owned refinement on the same surface.

### Allowed variation

Trigger composition, dialog versus neutral semantics, default versus caller-owned paint, component refinement, logical placement/alignment, preferred width, and available viewport may vary without changing lifecycle, ownership, focus containment, dismissal, or fit/overflow precedence.

### Representative focus and dismissal states

| State                                   | Required result                                                                                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pointer/touch dialog open               | Focus the labeled dialog container so no action appears preselected.                                                                                        |
| Keyboard/AT-style dialog open           | Focus the first genuine content control, then the dialog container if none exists.                                                                          |
| Controlled or autofocus-suppressed open | Controlled open uses the no-activation path and remains caller-owned; disabling autofocus moves no focus, either persistently or for one `show`.            |
| Read-only dialog                        | Focus the container; the fallback close control remains reachable by Tab but is not initial focus.                                                          |
| Neutral popup                           | Do not focus the wrapper as a dialog; prefer genuine content, or preserve trigger focus when autofocus is disabled.                                         |
| Container focused                       | Tab enters the first tabbable descendant; Shift+Tab enters the last; with none, focus remains contained.                                                    |
| Dismiss request                         | Shared Escape closes the topmost eligible Popover; native outside dismissal follows the light-dismiss option. Fully explicit-dismiss surfaces disable both. |
| Close after focus entered               | Focus returns to the trigger when removal would otherwise strand it; a caller may additionally own focus return through its hide notification.              |

### Transformation and precedence order

1. Resolve `toggle` to show/hide and derive any opening focus preference.
2. Prefer explicit width, otherwise trigger minimum width; cap either to available viewport/safe-area space.
3. Apply logical placement/alignment gutters to the positioned layer and painted surface.
4. Enable scrolling only after post-cap measurement exceeds the 1 px tolerance.

## Accessibility contract

- The mounted trigger exposes expanded state, control relationship, and the popup type promised by its composition mode.
- Dialog mode requires a caller-provided accessible label and places dialog/modal semantics on the painted surface; neutral mode omits them.
- Automatic entry, Tab/Shift+Tab containment, Escape ordering, and focus return follow the states above and [overlay dismissal](../../../../docs/families/overlay-dismissal.md).
- Automated evidence proves DOM roles/ARIA and focus movement/return, not announcements; no NVDA/VoiceOver result is claimed. [Draft AST-009](https://github.com/facebook/astryx/pull/5786) is non-authoritative proposal context for release evidence, not a policy this current contract adopts before it lands.

## Design relationships

| Anatomy                | Requirement / owner                                     | Role       |
| ---------------------- | ------------------------------------------------------- | ---------- |
| Trigger element        | caller-owned control and anchor; no Popover target      | Supporting |
| Popover surface        | owns `popover`, fit, scroll, focus, and dialog behavior | Prominent  |
| Popover content        | caller-owned interaction/information inside the surface | Prominent  |
| Fallback close control | delegates presentation to `component:Button` / `button` | Supporting |

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

Target qualification, alias treatment, and anatomy mapping belong to [component theming surface](../../../../docs/architecture/component-theming-surface.md). `popover-surface` is compatibility output, not anatomy or an equal owner.

## Family and system relationships

- [Public component API](../../../../docs/architecture/public-component-api.md) and [AST-002](../../../../docs/specs/AST-002/spec.md) own installable reachability, canonical operation shape, and the source/public seam.
- [Layer runtime](../../../../docs/architecture/layer-runtime.md) owns hosting, native lifecycle reconciliation, anchor geometry, portal/context behavior, and same-gesture guards; Popover owns the focus, fit, and overflow composition above it.
- [Interaction modality](../../../../docs/architecture/interaction-modality.md) owns shared modality; Popover owns its destination matrix.
- [Component theming surface](../../../../docs/architecture/component-theming-surface.md) owns target qualification and alias rules; Popover owns its one broad surface target and composed refinements own theirs.
- [Overlay dismissal](../../../../docs/families/overlay-dismissal.md) owns topmost Escape/platform-close ordering; Popover retains local focus, outside-dismiss, and open-state behavior.

## Verification map

| Contract             | Evidence                                                                                                                                                                  | Boundary / pending proof                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public boundary, FR1 | [`Popover.test.tsx`](./Popover.test.tsx), package/barrel inspection, consumer docs                                                                                        | Type assertions reject internal-control promotion; binding review verifies trigger attach/detach, anchor and role/open ARIA, stable IDs, content ref, and renderer lifetime. |
| FR2, accessibility   | [`Popover.test.tsx`](./Popover.test.tsx), [`useFocusTrap.test.tsx`](../hooks/useFocusTrap.test.tsx)                                                                       | Covers representative focus, role, Escape, and return states; real AT remains below.                                                                                         |
| FR3–FR5              | [`Popover.test.tsx`](./Popover.test.tsx), [`Popover.stories.tsx`](../../../../apps/storybook/stories/Popover.stories.tsx)                                                 | Unit/style evidence covers caps, scrolling, and observers; rendered viewport proof remains pending.                                                                          |
| FR6–FR7              | [`Popover.doc.mjs`](./Popover.doc.mjs), [`usePopover.doc.mjs`](./usePopover.doc.mjs), theming discovery, [`check-knowledge.mjs`](../../../../scripts/check-knowledge.mjs) | Rejects fake anatomy, lost alias metadata/output, or ownerless active targets.                                                                                               |
| AT evidence gap      | [PR #5373](https://github.com/facebook/astryx/pull/5373); [draft AST-009 proposal](https://github.com/facebook/astryx/pull/5786)                                          | The manual story is a fixture, not an announcement result; the unlanded proposal is context, not authority.                                                                  |

## Decision log

### DEC-1 — One canonical visibility operation model

**Reference:** `component:Popover/DEC-1` · **Decider:** Cindy Zhang, 2026-08-31 — Showing, hiding, and toggling are one lifecycle. Opening options may refine that operation, but internal focus derivation does not establish `toggleWithOptions` or public `focusTarget` as a second durable concept. Callers cannot select destinations that create inconsistent or inaccessible focus.

### DEC-2 — One canonical Popover surface target

**Reference:** `component:Popover/DEC-2` · **Decider:** Cindy Zhang, 2026-08-31 — `popover` is the broad baseline for every `<Popover>` and public `usePopover` painted surface. `popover-surface` remains a deprecated alias on that element; owned composed refinements may coexist without replacing the baseline. Rejected: durable sibling targets or a fictitious “Shared hook surface” anatomy part.

## Verification gaps

- **VG1 — Internal naming.** Source still names a wider package-internal toggle helper; future runtime work must reconcile it under the canonical operation without making it public.
- **VG2 — Browser behavior.** Unit tests do not prove rendered viewport layout, native light dismiss/top-layer order, real anchor geometry, or rendered focus; applicable changes require real Chromium and WebKit evidence.
- **VG3 — AT evidence.** The story has instructions but no named NVDA + Chrome or VoiceOver + Safari receipt. This remains a release-evidence gap for [PR #5373](https://github.com/facebook/astryx/pull/5373). [Draft AST-009](https://github.com/facebook/astryx/pull/5786) proposes a named release gate but is non-authoritative until landed; this contract claims no announcement result.
- **VG4 — Target migration.** Runtime still emits `popover-surface` automatically and reaches `popover` through `<Popover>`'s explicit refinement. Separate work must make `popover` automatic for every public hook surface, preserve the alias, verify direct-hook/composed inventories, and separately review any later removal.

## Open questions

None.

## Content boundary

This file records only Popover-specific semantics, boundaries, decisions, gaps, and evidence links. Consumer signatures/examples, implementation steps, shared layer algorithms, family dismissal rules, theming policy, and AT policy stay with their owners.
