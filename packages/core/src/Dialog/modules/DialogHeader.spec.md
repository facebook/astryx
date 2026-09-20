---
schema_version: 3
template_version: 1
kind: module
id: module:Dialog/DialogHeader
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-14
owners: [cixzhang, imdreamrunner]
review_triggers: [theming, layout]
verified_by:
  [
    packages/core/src/Dialog/DialogHeader.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
parent_component: component:Dialog
references: [architecture:component-theming-surface]
---

# DialogHeader module contract

## Intent

`DialogHeader` presents the title region of a Dialog and its optional close
control. This record owns the stable header-row, title-block, and close-icon
anatomy and their public theming targets.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive theme targets only; default layout, paint,
  interaction, accessibility, and public props remain unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The header row that arranges title content and trailing controls.
- The title block that groups the title and optional subtitle.
- The close icon rendered for the optional close action.
- The `dialog-header`, `dialog-header-title-block`, and
  `dialog-header-close-icon` targets.

**Does not own / non-goals**

- Dialog modality, dismissal policy, or focus lifecycle — owned by
  `component:Dialog` and its linked system records.
- Generic Button or Icon presentation outside this module — owned by those
  components.
- New public props or default visual changes.

## Public API and concepts

No component prop changes. This contract adds three public theming surfaces for
existing anatomy.

| Concept            | Closed values or states           | Meaning                                                 | Default                      | Owner                        | Stability |
| ------------------ | --------------------------------- | ------------------------------------------------------- | ---------------------------- | ---------------------------- | --------- |
| Header row target  | present                           | Styles the row that arranges title content and controls | Existing row visuals         | `module:Dialog/DialogHeader` | stable    |
| Title block target | present                           | Styles the title/subtitle grouping element              | Existing title stack visuals | `module:Dialog/DialogHeader` | stable    |
| Close icon target  | present when close action renders | Styles the close glyph itself                           | Existing medium Icon visuals | `module:Dialog/DialogHeader` | stable    |

## Behavioral contract

| ID  | Invariant                                                                                                             | Basis                                     | Review state |
| --- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------ |
| FR1 | The header row MUST carry `dialog-header` on the element that applies its row layout and gap.                         | Current implementation and owner decision | settled      |
| FR2 | The title block MUST carry `dialog-header-title-block` on the element that applies its title/subtitle layout and gap. | Current implementation and owner decision | settled      |
| FR3 | The rendered close Icon MUST carry `dialog-header-close-icon` on the glyph element that applies icon presentation.    | Current implementation and owner decision | settled      |
| FR4 | Omitting `onOpenChange` MUST continue to omit the close action and its optional close-icon anatomy.                   | Released behavior                         | settled      |

### Transformation and precedence order

- The module applies each target to its owning element before normal theme CSS
  resolves through the shared theming pipeline.

### Performance and resources

- The additive class names and metadata introduce no listener, observer, timer,
  measurement, or asynchronous resource.

## Accessibility contract

- Theme targets MUST NOT change the title's role, focus behavior, dialog naming,
  or the close button's accessible name and operation.

## Design relationships

| Anatomy or state | Design requirement                                                | Representation authority        | Module contract |
| ---------------- | ----------------------------------------------------------------- | ------------------------------- | --------------- |
| Header row       | Owns arrangement and spacing among title content and controls.    | This module                     | FR1             |
| Title block      | Owns title/subtitle grouping and spacing.                         | This module                     | FR2             |
| Close icon       | Owns the close glyph's visual box inside the Button-owned action. | This module with Icon rendering | FR3, FR4        |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Header row": {"target": "dialog-header"},
  "Title block": {"target": "dialog-header-title-block"},
  "Close icon": {"target": "dialog-header-close-icon"}
}
```

## Parent and system relationships

- `component:Dialog` owns modal behavior and the aggregate Dialog contract.
- `component:Layout` owns the composed LayoutHeader region outside the three
  module-owned inner parts.
- `component:Button` owns the close action's control behavior and outer button
  presentation.
- `component:Icon` renders the glyph; this module guarantees a distinct target
  for the close icon's DialogHeader-specific visual contract.
- `architecture:component-theming-surface` owns target qualification, anatomy
  mapping, and the requirement that each target sits on its painter.

## Verification map

| Contract            | Verification                                                                            | Representative states                        | Mutation or failure expectation                                           |
| ------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| FR1–FR3             | `DialogHeader.test.tsx`, target inventory, generated probe theme, and source inspection | title only, title/subtitle, close action     | A target is missing, undocumented, or moved away from its owning painter. |
| FR4                 | Existing close-button presence tests                                                    | with and without `onOpenChange`              | The optional target renders without the optional close action.            |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                           | all three module anatomy entries and targets | Anatomy, docs, runtime targets, and the module map drift.                 |

## Decision log

### DEC-1 — Header targets follow stable anatomy and visual ownership

**Reference:** `module:Dialog/DialogHeader/DEC-1`
**Decider:** cixzhang, 2026-09-14

Each public target represents documented anatomy and is applied to the element
that owns the corresponding visuals. The header row, title block, and close icon
meet that admission rule and are approved as additive targets.

## Open questions

None.

## Content boundary

This record does not duplicate consumer signatures/examples, parent Dialog
behavior, implementation steps, or shared theming rules. It links to their
canonical owners.
