---
schema_version: 3
template_version: 3
kind: component
id: component:DropdownMenu
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming, public-api, behavior, accessibility]
verified_by:
  [
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenuSelectable.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenuSubMenu.test.tsx,
    packages/core/src/BottomSheet/BottomSheet.test.tsx,
    packages/core/src/List/List.test.tsx,
    packages/core/src/Indicator/Indicator.test.tsx,
    packages/core/src/Icon/Icon.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: [module:DropdownMenu/useMenuPress, module:DropdownMenu/useMenuHover]
families: [family:overlay-dismissal, family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:layer-runtime,
  ]
contributing: []
system_specs: []
---

# DropdownMenu component contract

## Intent

DropdownMenu presents actions from a visible Button trigger in either an
anchored pointer menu or a BottomSheet-hosted touch action list. This draft
records current consumer anatomy, presentation-specific ownership, and theming
reachability. Its press model — the row under the release acts and the
highlight follows the pointer — is contracted by
`module:DropdownMenu/useMenuPress`, which both presentations mount.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation; the press-model behavior
  delta is recorded in `module:DropdownMenu/useMenuPress`
- Controlled/uncontrolled behavior: unchanged
- Migration decision: `module:DropdownMenu/useMenuPress/DEC-3`

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Pointer menu surface and Touch menu surface and their shared current
  `dropdown-menu` target.
- Pointer action rows, pointer-only section headings and dividers, radio marker
  specialization, and submenu indicator presentation through the other five
  current DropdownMenu targets.
- Selecting between the current pointer and touch render paths after presentation
  policy resolves.
- Mounting the shared press model on both menu surfaces; the model itself is
  owned by `module:DropdownMenu/useMenuPress`.

**Does not own / non-goals**

- Trigger-button presentation — delegated to `component:Button`.
- The Touch sheet frame — delegated to `component:BottomSheet`.
- Touch action-list and row presentation — delegated to `component:List`.
- Shared checkbox-indicator and ordinary icon presentation — delegated to
  `component:Indicator` and `component:Icon`.
- Shared layer lifecycle or dismissal policy.

## Public concepts

Consumer props, item shapes, subcomponents, and presentation policy remain
documented in `DropdownMenu.doc.mjs` and the subcomponent docs. One
component-local concept is added by DEC-2; it keeps its released default.

| Concept         | Closed values or states                      | Meaning                                                                                     | Availability by variant/orientation/state                       | Default              | Owner                    | Stability | Invalid-value behavior                                           |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------- | ------------------------ | --------- | ---------------------------------------------------------------- |
| Row destination | `href` (+ `target`, `rel`) on an action item | The row's act is navigation: the row itself is the link (`family:navigation-destinations`). | Pointer action row and Touch action row, compound and data mode | none (an action row) | `component:DropdownMenu` | stable    | Blocked schemes follow the family rule; a disabled row has none. |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Basis                                                                                                    | Draft review state                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR1 | Every current render contains a Trigger button. Pointer presentation renders a Pointer menu surface with pointer-owned rows and optional pointer headings, dividers, indicators, and nested flyouts. Touch presentation renders a Touch sheet frame containing a Touch menu surface, Touch heading, Touch action list, and Touch action rows.                                                                                                                                                      | Current source, docs, and tests                                                                          | Verified current behavior; no new behavior decided  |
| FR2 | The six current local targets are `dropdown-menu`, `dropdown-menu-item`, `dropdown-menu-radio`, `dropdown-menu-section-heading`, `dropdown-menu-divider`, and `dropdown-menu-indicator-icon`; every target remains on its current painted element.                                                                                                                                                                                                                                                 | Current source, docs, and tests                                                                          | Verified current inventory; no target change        |
| FR3 | Button owns the Trigger button, BottomSheet owns the Touch sheet frame, List owns the Touch action list and Touch action rows, Indicator owns checkbox chrome, and Icon owns ordinary rendered icons.                                                                                                                                                                                                                                                                                              | Current source and owner docs                                                                            | Verified current delegation; no ownership change    |
| FR4 | The same `dropdown-menu` target reaches the alternative Pointer menu surface and Touch menu surface. Pointer action rows retain `dropdown-menu-item`; touch action rows instead use List's `list-item` target.                                                                                                                                                                                                                                                                                     | Current source and tests                                                                                 | Verified modality split; no target change           |
| FR5 | Both menu surfaces carry `data-astryx-menu-press` and follow `module:DropdownMenu/useMenuPress` FR1–FR7: the row under the release acts, the highlight follows a held pointer, a mouse released outside closes and a finger leaves the menu open, the browser's stray click never acts, and the Pointer menu surface declares `touch-action` by overflow. Trigger opening and keyboard navigation are unchanged.                                                                                   | `module:DropdownMenu/useMenuPress`; `DropdownMenu.test.tsx` press model suite                            | Proposed; verified in jsdom and real Chromium       |
| FR6 | When the pointer menu closes, focus returns to the Trigger button with a visible ring only when the menu was driven by keyboard; a press outside that landed on a focusable control keeps focus there.                                                                                                                                                                                                                                                                                             | `architecture:interaction-modality` INV1; proposed in this change; `DropdownMenu.test.tsx` closing suite | Proposed; verified in jsdom, pending owner review   |
| FR8 | An action row with `href` MUST render as one anchor carrying `role="menuitem"` (the pointer menu) or the touch sheet's link row, routed through `LinkProvider`; a plain click MUST run `onClick`, then close the menu (`hasCloseOnSelect`), then let the browser navigate; a modified click or middle click MUST be left to the browser and MUST NOT run `onClick`; Enter and Space MUST activate through a synthesized click that carries the key's modifiers. A disabled link row has no `href`. | `component:DropdownMenu/DEC-2`; `family:navigation-destinations`                                         | Proposed; verified in jsdom; owner to confirm DEC-1 |

### Allowed variation

- **AV1 — Presentation.** `popover`, `bottom-sheet`, and resolved `adaptive`
  presentation may select the current pointer or touch anatomy without changing
  the ownership of either branch.
- **AV2 — Content mode.** Data-driven and compound pointer menus may vary their
  rows while preserving the current target owners. Touch presentation remains
  data-driven.
- **AV3 — Optional content.** Icons, selectable indicators, headings, dividers,
  and nested actions render only when the supplied menu content requires them.

### Representative states

| State                       | Required invariant                                                                                                              | Allowed variation                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Anchored root menu          | Trigger button and Pointer menu surface render with pointer-owned rows.                                                         | Width, placement, alignment, and optional item content vary.     |
| Anchored nested flyout      | Pointer action row opens another Pointer menu surface and may show the submenu indicator icon.                                  | Loading may replace the indicator with the current Spinner.      |
| Bottom-sheet root actions   | Trigger button opens Touch sheet frame, Touch menu surface, heading, action list, and action rows.                              | Icons, sections, dividers, and action descriptions may vary.     |
| Bottom-sheet nested actions | The same frame and list owners remain while heading and rows change to the selected action level.                               | Back control and drill-in indicator follow current navigation.   |
| Selectable pointer action   | Pointer action row may contain shared checkbox or radio chrome.                                                                 | Checked and disabled state follow the current item contracts.    |
| Link row                    | The Pointer action row (or Touch action row) is the anchor; `onClick`, close and navigation run in that order on a plain click. | `target`, `rel`, icon, description and destructive variant vary. |

### Transformation and precedence order

- **ORD2 — Link row activation.** modified click → the browser alone; else
  `onClick` → close (`hasCloseOnSelect`) → the browser navigates.
- No other presentation-resolution, open-state, positioning, or styling
  precedence rule is introduced.

### Performance and resources

- No new loading, listener, measurement, or render constraint is introduced.

## Accessibility contract

This draft does not change DropdownMenu's trigger naming, menu and dialog
roles, keyboard navigation, item semantics, or dismissal ordering. While a
pointer is held, the highlight is DOM focus per
`module:DropdownMenu/useMenuPress` AR1. Focus return on close follows FR6 and
`architecture:interaction-modality` INV1 through the shared focus-return
visibility helper.

- **AR2 — A link row is one control.** The anchor carries `role="menuitem"`,
  `tabindex="-1"` and, when disabled, `aria-disabled` and no `href`; no inner
  anchor or button doubles it.

## Design relationships

| Anatomy or state                   | Design requirement                                                            | Representation authority       | Hierarchy role    | Component contract |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Trigger button                     | Provides the visible control that opens and closes the selected presentation. | `component:Button`             | Supporting        | FR1, FR3           |
| Trigger indicator icon             | Communicates disclosure on labeled triggers when enabled.                     | `component:Icon`               | Supporting        | FR1, FR3           |
| Pointer menu surface               | Paints the anchored root or nested pointer menu panel.                        | Current source and public docs | Prominent         | FR1, FR2, FR4      |
| Pointer action row                 | Presents one action, selectable option, or nested-menu entry.                 | Current source and public docs | Prominent         | FR1, FR2, FR4      |
| Icon-rendered item icon            | Adds an optional semantic or component icon to an action row through Icon.    | `component:Icon`               | Supporting        | FR1, FR3           |
| Caller-rendered item start content | Presents arbitrary React content directly in an action-row start slot.        | Caller-supplied content        | Context-dependent | FR1, FR3           |
| Checkbox indicator                 | Draws the decorative checkbox state for a checkbox action row.                | `component:Indicator`          | Supporting        | FR1, FR3           |
| Radio indicator                    | Draws shared radio chrome with the current menu-specific radio target.        | Current source and Indicator   | Supporting        | FR1, FR2, FR3      |
| Pointer section heading            | Labels a grouped set of pointer action rows.                                  | Current source and public docs | Supporting        | FR1, FR2           |
| Pointer divider                    | Separates groups of pointer action rows.                                      | Current source and public docs | Supporting        | FR1, FR2           |
| Pointer submenu indicator icon     | Identifies a pointer action row that opens a nested flyout.                   | Current source and public docs | Supporting        | FR1, FR2           |
| Touch sheet frame                  | Supplies the touch panel, scrolling area, handle, and optional scrim.         | `component:BottomSheet`        | Prominent         | FR1, FR3           |
| Touch menu surface                 | Arranges menu-owned heading and action content inside the sheet.              | Current source and public docs | Prominent         | FR1, FR2, FR4      |
| Touch heading                      | Names the current root or drill-in action view.                               | Current source and tests       | Supporting        | FR1                |
| Touch action list                  | Groups touch actions using the spacious List presentation.                    | `component:List`               | Prominent         | FR1, FR3           |
| Touch action row                   | Presents one touch action or drill-in entry using ListItem.                   | `component:List`               | Prominent         | FR1, FR3, FR4      |
| Touch divider                      | Separates groups in the touch action list.                                    | `component:Divider`            | Supporting        | FR1, FR3           |

The `dropdown-menu` target intentionally appears on both alternative menu
surfaces. The radio element also carries Indicator's shared radio target, and
the pointer divider also carries Divider's target; their local targets remain
valid distinct contracts. Touch headings retain the shared `heading` target documented by Text rather
than adding a DropdownMenu-owned heading target.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Trigger button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Trigger indicator icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Pointer menu surface": {"target": "dropdown-menu"},
  "Pointer action row": {"target": "dropdown-menu-item"},
  "Icon-rendered item icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Caller-rendered item start content": {
    "none": {
      "reason": "intentional: Arbitrary ReactNode item content is caller-owned and receives no DropdownMenu target."
    }
  },
  "Checkbox indicator": {
    "delegatesTo": {
      "owner": "component:Indicator",
      "target": "checkbox-indicator"
    }
  },
  "Radio indicator": {"target": "dropdown-menu-radio"},
  "Pointer section heading": {"target": "dropdown-menu-section-heading"},
  "Pointer divider": {"target": "dropdown-menu-divider"},
  "Pointer submenu indicator icon": {
    "target": "dropdown-menu-indicator-icon"
  },
  "Touch sheet frame": {
    "delegatesTo": {"owner": "component:BottomSheet", "target": "bottom-sheet"}
  },
  "Touch menu surface": {"target": "dropdown-menu"},
  "Touch heading": {
    "delegatesTo": {"owner": "component:Text", "target": "heading"}
  },
  "Touch action list": {
    "delegatesTo": {"owner": "component:List", "target": "list"}
  },
  "Touch action row": {
    "delegatesTo": {"owner": "component:List", "target": "list-item"}
  },
  "Touch divider": {
    "delegatesTo": {"owner": "component:Divider", "target": "divider"}
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, presentation-specific rows, and delegation rules.
- `architecture:interaction-modality` owns the shared pointer, touch, keyboard,
  and adaptive-presentation boundaries; this draft changes none of them.
- `architecture:layer-runtime` owns the current `usePopover` host, native
  light-dismiss reconciliation, anchor positioning, and nested `useLayer`
  flyouts. Touch presentation delegates hosting to BottomSheet.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering.
  DropdownMenu root participates through its Popover focus trap; the composed
  BottomSheet and DropdownMenuSubMenu retain their recorded local-only adoption
  gaps.

## Verification map

| Contract            | Verification                                                                                              | Representative states                                                                        | Mutation or failure expectation                                                                                              | Audit section                 |
| ------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| FR1, FR4            | `DropdownMenu.test.tsx` pointer, bottom-sheet, adaptive, section, divider, and drill-in suites            | Root pointer, nested pointer, root touch, drill-in                                           | Collapsing presentation-specific parts or owners fails structure, target, or role assertions.                                | `audit:DropdownMenu/anatomy`  |
| FR2                 | DropdownMenu target suites, source inspection, and theming target inventories                             | All six local targets                                                                        | Removing, renaming, or assigning a current target to the wrong part fails evidence or inventory.                             | `audit:DropdownMenu/theming`  |
| FR3                 | `DropdownMenuSelectable.test.tsx` plus BottomSheet, List, Indicator, Icon, and Divider owner tests        | Trigger, touch actions, icons, checkbox, radio                                               | A composed part loses its owner target or is documented as a new local target.                                               | `audit:DropdownMenu/theming`  |
| Layer relationships | `DropdownMenu.test.tsx`, `DropdownMenuSubMenu.test.tsx`, and current layer/dismissal architecture records | Light dismiss, nested flyout, sheet dismissal                                                | Documentation claims a shared owner where current source retains local behavior, or the reverse.                             | `audit:DropdownMenu/behavior` |
| FR5                 | `DropdownMenu.test.tsx` press model suite; the module record's own map                                    | Finger slide across rows, outside release by mouse and finger, `touch-action`, root marker   | A row acting on the press or the stray click, a lost `touch-action`, or a finger release that closes fails.                  | `audit:DropdownMenu/behavior` |
| FR6                 | `DropdownMenu.test.tsx` dismissal and closing suites                                                      | keyboard dismissal, pointer dismissal, press outside on a control, pointer pick, closed menu | Focus left on the body after a pointer pick, or a ring after pointer input, fails.                                           | `audit:DropdownMenu/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                             | Canonical anatomy and current target inventory                                               | Missing, extra, prefixed, stale, or unclassified mappings fail repository validation.                                        | `audit:DropdownMenu/theming`  |
| FR8, AR2            | `DropdownMenu.test.tsx` "DropdownMenuItem href" suite (pointer menu and bottom sheet)                     | Plain click, ⌘-click, Enter with modifiers, disabled link row                                | A row rendering an inner anchor, running `onClick` on a modified click, or a synthesized click dropping the modifiers fails. | `audit:DropdownMenu/behavior` |

## Decision log

### DEC-1 — Pointer dismissal returns focus to the trigger, ring suppressed

**Reference:** `component:DropdownMenu/DEC-1`
**Decider:** pending owner review

The shipped behavior blurred the trigger after a pointer dismissal so Safari
would not paint a ring after a touch pick. Focus falling to the page loses a
keyboard user who reaches for the arrows next. Focus now returns to the
trigger and the shared focus-return visibility helper suppresses the ring
after pointer input (`architecture:interaction-modality` INV1), as the
bottom-sheet presentation already did. The press model's own decisions remain
in `module:DropdownMenu/useMenuPress`.

### DEC-2 — A row that goes somewhere is a link

**Reference:** `component:DropdownMenu/DEC-2`

**Decider:** vjeux, 2026-09-27 (owner confirmation pending)

A menu row whose act is navigation renders as the anchor itself, not a row with
an anchor inside, so a ⌘-click, Ctrl-click or middle click keeps the browser's
meaning and `LinkProvider` routes it; `onClick` runs before navigation on a
plain click and is skipped for a modified one, which the browser owns. The menu
still closes on a modified click — the row acted. Keyboard activation
synthesizes a click carrying the key's modifiers so ⌘-Enter opens a tab.

Rejected: an `onClick` that calls `navigate()` — loses new-tab, middle-click
and the router's prefetch; an inner anchor — two controls in one row.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, item examples, focus and
positioning algorithms, implementation steps, or shared modality, layer,
dismissal, and theming rules. It links to their owners.
