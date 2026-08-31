---
schema_version: 1
template_version: 3
kind: component
id: component:ContextMenu
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/ContextMenu/ContextMenu.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/BottomSheet/BottomSheet.test.tsx,
    packages/core/src/List/List.test.tsx,
    scripts/check-knowledge.mjs,
  ]
families: [family:overlay-dismissal]
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

# ContextMenu component contract

## Intent

ContextMenu presents actions for a caller-provided region in either a
cursor-positioned pointer menu or a BottomSheet-hosted touch action list. This
draft records current consumer anatomy, presentation-specific ownership, and
theming reachability without changing runtime behavior, styling, targets, or
public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Trigger area's context-menu invocation wiring.
- The alternative Pointer menu surface and Touch menu surface and their shared
  current `context-menu` target.
- Cursor-anchor placement and current open-state coordination across the two
  presentation paths.

**Does not own / non-goals**

- Caller-provided Trigger area content.
- Pointer action-row presentation — delegated to `component:DropdownMenu`.
- The Touch sheet frame — delegated to `component:BottomSheet`.
- Data-driven Touch action-list and row presentation — delegated to
  `component:List`.
- Shared layer lifecycle or dismissal policy.

## Public concepts

No new public concept is introduced. Consumer props, content modes, and
presentation policy remain documented in `ContextMenu.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                     | Basis                           | Draft review state                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | Every render contains a caller-provided Trigger area. Pointer presentation opens a Pointer menu surface at the current local cursor anchor; touch presentation opens a Touch sheet frame containing a Touch menu surface and, for data mode, a Touch action list and Touch action rows. | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | The current `context-menu` target remains on the painted Pointer menu surface and alternative Touch menu surface, not on the Trigger area or cursor anchor.                                                                                                                             | Current source, docs, and tests | Verified current inventory; no target change       |
| FR3 | Pointer action rows retain DropdownMenu ownership. The touch frame retains BottomSheet ownership, while data-driven touch lists and rows retain List ownership.                                                                                                                         | Current source and owner docs   | Verified current delegation; no ownership change   |
| FR4 | Compound `menuContent` remains a caller-supplied pointer-menu interior and may also render inside the touch frame; the data-driven touch path instead converts the same item data to List and ListItem presentation.                                                                    | Current source and tests        | Verified current branches; no behavior change      |

### Allowed variation

- **AV1 — Invocation.** Right-click, keyboard context-menu invocation, and
  long-press may open the current resolved presentation without changing
  anatomy ownership.
- **AV2 — Presentation.** `popover`, `bottom-sheet`, and resolved `adaptive`
  presentation may select the current pointer or touch anatomy.
- **AV3 — Content mode.** Data-driven pointer content renders through
  DropdownMenu helpers; compound content remains caller-composed. Data-driven
  touch content renders through List.

### Representative states

| State                 | Required invariant                                                                                  | Allowed variation                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Pointer data menu     | Trigger area opens Pointer menu surface with DropdownMenu-owned rows.                               | Cursor position, row content, width, and nested flyouts may vary.  |
| Pointer compound menu | Trigger area opens the same surface around caller-supplied menu content.                            | Caller chooses supported DropdownMenu interior components.         |
| Touch data menu       | Trigger area opens Touch sheet frame and Touch menu surface containing List-owned actions.          | Heading, sections, dividers, icons, and drill-in depth may vary.   |
| Touch compound menu   | Trigger area opens Touch sheet frame around the ContextMenu surface and caller-supplied interior.   | Caller-supplied content remains responsible for its own structure. |
| Disabled trigger      | Trigger area remains rendered and the native browser context menu is not suppressed by ContextMenu. | Caller-provided content remains unchanged.                         |

### Transformation and precedence order

- No new presentation-resolution, cursor-position, long-press, item-rendering,
  or styling precedence rule is introduced.

### Performance and resources

- No new loading, listener, measurement, or render constraint is introduced.

## Accessibility contract

This draft does not change or extend ContextMenu's existing menu and dialog
naming, keyboard invocation, long-press path, focus movement, item semantics, or
dismissal behavior.

## Design relationships

| Anatomy or state     | Design requirement                                                                | Representation authority       | Hierarchy role    | Component contract |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Trigger area         | Defines the caller-owned region that accepts context-menu input.                  | Caller-supplied content        | Context-dependent | FR1, FR2           |
| Pointer menu surface | Paints the menu at the current cursor anchor.                                     | Current source and public docs | Prominent         | FR1, FR2           |
| Pointer action row   | Presents an action, selectable option, or nested-menu entry through DropdownMenu. | `component:DropdownMenu`       | Prominent         | FR1, FR3, FR4      |
| Touch sheet frame    | Supplies the touch panel, scrolling area, handle, and optional scrim.             | `component:BottomSheet`        | Prominent         | FR1, FR3           |
| Touch menu surface   | Arranges ContextMenu-owned heading and content inside the sheet.                  | Current source and public docs | Prominent         | FR1, FR2           |
| Touch action list    | Groups data-driven touch actions using the spacious List presentation.            | `component:List`               | Prominent         | FR1, FR3, FR4      |
| Touch action row     | Presents one data-driven touch action or drill-in entry using ListItem.           | `component:List`               | Prominent         | FR1, FR3, FR4      |

The `context-menu` target intentionally appears on both alternative painted
menu surfaces. Trigger area content stays caller-owned and the zero-size cursor
anchor is positioning infrastructure rather than consumer anatomy.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Trigger area": {
    "none": {
      "reason": "intentional: Caller-provided trigger content remains caller-owned and the ContextMenu wrapper has no public target."
    }
  },
  "Pointer menu surface": {"target": "context-menu"},
  "Pointer action row": {
    "delegatesTo": {
      "owner": "component:DropdownMenu",
      "target": "dropdown-menu-item"
    }
  },
  "Touch sheet frame": {
    "delegatesTo": {"owner": "component:BottomSheet", "target": "bottom-sheet"}
  },
  "Touch menu surface": {"target": "context-menu"},
  "Touch action list": {
    "delegatesTo": {"owner": "component:List", "target": "list"}
  },
  "Touch action row": {
    "delegatesTo": {"owner": "component:List", "target": "list-item"}
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, presentation-specific rows, and delegation rules.
- `architecture:interaction-modality` owns the shared right-click, keyboard,
  long-press, pointer, touch, and adaptive-presentation boundaries; this draft
  changes none of them.
- `architecture:layer-runtime` owns the current context-mode `useLayer` host and
  cursor-anchor positioning. ContextMenu currently retains local outside-click
  and Escape listeners; touch hosting delegates to BottomSheet.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering and
  records ContextMenu and BottomSheet as current local-only adoption gaps. This
  anatomy backfill does not migrate either path.

## Verification map

| Contract            | Verification                                                                                      | Representative states                         | Mutation or failure expectation                                                                    | Audit section                |
| ------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, FR4            | `ContextMenu.test.tsx` pointer, long-press, bottom-sheet, adaptive, compound, and drill-in suites | Pointer data/compound and touch data/compound | Collapsing presentation-specific parts or content owners fails structure, role, or behavior tests. | `audit:ContextMenu/anatomy`  |
| FR2                 | ContextMenu target tests, source inspection, and theming target inventories                       | Pointer and touch menu surfaces               | Moving `context-menu` to the trigger or removing it from a painted branch fails evidence.          | `audit:ContextMenu/theming`  |
| FR3                 | ContextMenu, DropdownMenu, BottomSheet, and List owner tests                                      | Pointer rows, touch frame, touch list/rows    | A composed part loses its owner target or is documented as a new ContextMenu target.               | `audit:ContextMenu/theming`  |
| Layer relationships | `ContextMenu.test.tsx` and current layer/dismissal architecture records                           | Outside click, Escape, context anchor, sheet  | Documentation claims shared dismissal where current source retains local behavior.                 | `audit:ContextMenu/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                     | Canonical anatomy and current target          | Missing, extra, prefixed, stale, or unclassified mappings fail repository validation.              | `audit:ContextMenu/theming`  |

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, modality, or layer-system decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, menu examples, cursor and
long-press algorithms, implementation steps, or shared modality, layer,
dismissal, and theming rules. It links to their owners.
