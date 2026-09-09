---
schema_version: 3
template_version: 3
kind: component
id: component:MoreMenu
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/MoreMenu/MoreMenu.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/Button/Button.test.tsx,
    packages/core/src/Icon/Icon.test.tsx,
    packages/core/src/List/List.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:interaction-modality,
    architecture:layer-runtime,
  ]
contributing: []
system_specs: []
---

# MoreMenu component contract

## Intent

MoreMenu provides a visible icon-only overflow trigger and delegates its action
presentation to DropdownMenu. This draft records current consumer anatomy and
theming ownership without changing runtime behavior, styling, targets, or public
API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The overflow-menu composition and its visible icon-only trigger defaults.
- The Menu surface's current `more-menu` target, which is a second class on the
  composed DropdownMenu panel.

**Does not own / non-goals**

- Trigger-button presentation — delegated to `component:Button`.
- Default semantic trigger artwork resolution — delegated to the Icon registry;
  the current artwork renders directly inside Button and does not carry Icon's
  `icon` target. Arbitrary caller-rendered trigger content remains caller-owned.
- Menu-panel lifecycle and presentation switching — delegated to
  `component:DropdownMenu`.
- Anchored action rows, sections, dividers, selectable indicators, and nested
  flyouts — delegated to `component:DropdownMenu`.
- BottomSheet action rows and lists — delegated through DropdownMenu to
  `component:List`; the touch frame remains owned by `component:BottomSheet`.
- Shared layer lifecycle or dismissal policy.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `MoreMenu.doc.mjs`; its action data and presentation values remain those of
DropdownMenu.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                           | Basis                           | Draft review state                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| FR1 | Every current render contains one icon-only Trigger button and one DropdownMenu-owned Menu surface. Anchored presentation uses Pointer action rows; BottomSheet presentation uses Touch action rows. The default trigger icon resolves through the Icon registry, while a caller may replace it with arbitrary React content. | Current source, docs, and tests | Verified current behavior; no new behavior decided  |
| FR2 | The current `more-menu` target is applied to the composed DropdownMenu panel as an additional class. It is not applied to the Trigger button.                                                                                                                                                                                 | Current source, docs, and tests | Verified current target placement; no target change |
| FR3 | Button owns the Trigger button and the Icon registry owns default semantic trigger artwork resolution. DropdownMenu owns Pointer action rows; List owns Touch action rows rendered through DropdownMenu's BottomSheet path.                                                                                                   | Current source and owner docs   | Verified current delegation; no ownership change    |
| FR4 | MoreMenu forwards the current open state, placement, alignment, and pointer/touch presentation policy to DropdownMenu without adding a parallel menu runtime.                                                                                                                                                                 | Current source and tests        | Verified composition; no behavior change            |

### Allowed variation

- **AV1 — Trigger icon.** The default semantic three-dot icon may be replaced by
  an icon component or arbitrary React content without moving the MoreMenu target
  onto the trigger.
- **AV2 — Presentation.** DropdownMenu may resolve the current anchored or
  BottomSheet presentation while MoreMenu keeps the same trigger and Menu-surface
  ownership.
- **AV3 — Interior.** Action rows, sections, dividers, icons, selectable
  indicators, and nested actions may vary according to DropdownMenu's current
  data contract.

### Representative states

| State                  | Required invariant                                                                        | Allowed variation                                    |
| ---------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Default overflow menu  | Trigger button uses the default Icon-resolved glyph and Menu surface carries `more-menu`. | Button size, variant, placement, and alignment vary. |
| Arbitrary icon content | Trigger button remains Button-owned while caller content bypasses Icon ownership.         | Caller owns the rendered content.                    |
| Pointer presentation   | DropdownMenu owns the anchored Menu interior and Pointer action rows.                     | Rows, sections, dividers, and nested flyouts vary.   |
| Touch presentation     | DropdownMenu owns the BottomSheet-backed Menu interior; List owns Touch action rows.      | Touch rows and drill-in depth vary.                  |

### Transformation and precedence order

- No new icon-resolution, presentation-resolution, open-state, positioning, or
  styling precedence rule is introduced.

### Performance and resources

- No new loading, listener, measurement, or render constraint is introduced.

## Accessibility contract

This draft does not change or extend MoreMenu's existing accessible label,
tooltip, icon-only Button semantics, focus behavior, keyboard operation, or
dismissal behavior.

## Design relationships

| Anatomy or state                | Design requirement                                                               | Representation authority       | Hierarchy role    | Component contract |
| ------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Trigger button                  | Provides the visible and discoverable entry point for secondary actions.         | `component:Button`             | Supporting        | FR1, FR3           |
| Icon-resolved trigger icon      | Draws semantic three-dot artwork from the active Icon registry.                  | Icon registry                  | Supporting        | FR1, FR3           |
| Caller-rendered trigger content | Presents arbitrary caller content supplied through the icon override.            | Caller-supplied content        | Context-dependent | FR1, FR3           |
| Menu surface                    | Adds MoreMenu's target to the composed DropdownMenu panel, not the trigger.      | Current source and public docs | Prominent         | FR1, FR2           |
| Pointer action row              | Presents an action or nested flyout trigger in the anchored presentation.        | `component:DropdownMenu`       | Prominent         | FR1, FR3, FR4      |
| Touch action row                | Presents an action or drill-in entry through ListItem in the touch presentation. | `component:List`               | Prominent         | FR1, FR3, FR4      |

The Menu surface is the DropdownMenu panel itself. It carries both
`astryx-more-menu` and DropdownMenu's own panel target; the local class is not a
wrapper and does not retarget the trigger. DropdownMenu remains the owner of the
presentation runtime and anchored interior. Its touch path delegates action rows
to List rather than extending the pointer-row target into the BottomSheet
presentation.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Trigger button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Icon-resolved trigger icon": {
    "none": {
      "reason": "unsettled: The current useIcon artwork renders directly inside Button; whether it should carry Icon's icon target needs an owner decision."
    }
  },
  "Caller-rendered trigger content": {
    "none": {
      "reason": "intentional: Arbitrary React icon content is caller-owned and receives no MoreMenu target."
    }
  },
  "Menu surface": {"target": "more-menu"},
  "Pointer action row": {
    "delegatesTo": {
      "owner": "component:DropdownMenu",
      "target": "dropdown-menu-item"
    }
  },
  "Touch action row": {
    "delegatesTo": {"owner": "component:List", "target": "list-item"}
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, the local
  Menu-surface target, and composition delegation rules.
- `architecture:icon-resolution-and-component-slots` owns active-theme icon
  resolution. MoreMenu's default artwork uses that registry but currently
  bypasses Icon's painted `icon` target.
- `architecture:interaction-modality` owns the shared pointer, touch, keyboard,
  and adaptive-presentation boundaries inherited through DropdownMenu; this
  draft changes none of them.
- `architecture:layer-runtime` owns the current DropdownMenu Popover host, native
  light-dismiss reconciliation, and BottomSheet host distinction. MoreMenu adds
  no parallel layer runtime.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering and
  records MoreMenu as a shared owner through its composed DropdownMenu root;
  BottomSheet presentation retains BottomSheet's recorded local-only adoption
  gap.

## Verification map

| Contract            | Verification                                                                        | Representative states                            | Mutation or failure expectation                                                                   | Audit section             |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1, FR4            | `MoreMenu.test.tsx` render, pointer, bottom-sheet, placement, and controlled suites | Default, custom icon, pointer, touch             | Replacing the composition or changing forwarded behavior fails existing render/interaction tests. | `audit:MoreMenu/anatomy`  |
| FR2                 | MoreMenu target test, source inspection, and theming target inventories             | Closed trigger and composed menu panel           | Moving `more-menu` onto the trigger or removing it from the panel fails target evidence.          | `audit:MoreMenu/theming`  |
| FR3                 | MoreMenu, DropdownMenu, Button, Icon, and List source/owner tests                   | Trigger, icon branches, pointer rows, touch rows | A composed part loses its owner target or is documented as a new MoreMenu-owned descendant.       | `audit:MoreMenu/theming`  |
| Layer relationships | `MoreMenu.test.tsx`, `DropdownMenu.test.tsx`, and current layer/dismissal records   | Light dismiss, Escape, pointer, touch            | Documentation gives MoreMenu a parallel runtime or misstates the current dismissal owner.         | `audit:MoreMenu/behavior` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                       | Canonical anatomy and current target             | Missing, extra, prefixed, stale, or unclassified mappings fail repository validation.             | `audit:MoreMenu/theming`  |

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, modality, or layer-system decision.

## Open questions

- **OQ1 — Should the default trigger artwork render through Icon's public
  target?** (`human-api`) The current registry lookup preserves semantic artwork
  replacement but leaves the painted glyph outside the `icon` target; this
  draft does not change that reachability.

## Content boundary

This file does not duplicate consumer prop tables, DropdownMenu item examples,
icon-resolution rules, implementation steps, or shared modality, layer,
dismissal, and theming rules. It links to their owners.
