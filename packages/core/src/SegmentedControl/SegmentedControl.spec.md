---
schema_version: 1
template_version: 3
kind: component
id: component:SegmentedControl
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming, accessibility]
verified_by:
  [
    packages/core/src/SegmentedControl/SegmentedControl.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# SegmentedControl component contract

## Intent

SegmentedControl presents a group of mutually exclusive choices through
SegmentedControlItem children. This draft records the current consumer anatomy
and theming ownership without changing selection behavior, targets, or public
API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged; selection remains controlled by
  `value` and `onChange`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The radiogroup control and its current `segmented-control` theming target.
- SegmentedControlItem's segment button and its current
  `segmented-control-item` theming target.
- Rendering optional icon content and a visible label inside a segment.

**Does not own / non-goals**

- The artwork supplied through an item's `icon` prop — owned by the caller.
- A separate anatomy part or target for selected state; selection is state on the
  segment target.
- A visible control-level label; the control's required `label` is its accessible
  name and is not rendered as visual anatomy.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `SegmentedControl.doc.mjs` and `SegmentedControlItem.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                           | Basis                           | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | The radiogroup container carries the current `segmented-control` target and renders its supplied children.    | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | Each SegmentedControlItem renders one radio button carrying the current `segmented-control-item` target.      | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR3 | A visible item label and optional icon render inside the item without separate public targets.                | Current source and tests        | Verified current behavior; no target change        |
| FR4 | Selected and disabled remain reflected states on `segmented-control-item`, not standalone anatomy or targets. | Current source, docs, and tests | Verified current behavior; no target change        |

### Allowed variation

- A segment may render its visible label, an icon and label, or an icon while the
  required label supplies the accessible name.

### Representative states

- Selected, unselected, disabled, and enabled items retain the same anatomy.
  Selection and disabled styling vary on the segment target.

### Transformation and precedence order

- No new selection, focus, layout, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend the existing radiogroup, radio, accessible
name, roving focus, disabled-message, or selection behavior.

## Design relationships

| Anatomy or state | Design requirement                                          | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Control          | Presents the current grouped choice container.              | Current source and public docs | Supporting     | FR1                |
| Segment          | Presents one mutually exclusive choice and its item states. | Current source and public docs | Prominent      | FR2, FR4           |
| Label            | Identifies a segment visually when not hidden.              | Current source and public docs | Prominent      | FR3                |
| Icon             | Presents optional caller-supplied artwork within a segment. | Caller-supplied content        | Supporting     | FR3                |

Selection is a state of Segment, not a separate anatomy part.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Control": {"target": "segmented-control"},
  "Segment": {"target": "segmented-control-item"},
  "Label": {"inherits": "segmented-control-item"},
  "Icon": {"inherits": "segmented-control-item"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, inherited
  parts, and state-on-target rules.

## Verification map

| Contract            | Verification                                                | Representative states                          | Mutation or failure expectation                                                        | Audit section                    |
| ------------------- | ----------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| FR1, FR2            | `SegmentedControl.test.tsx` radiogroup and rendering suites | Control with multiple segment items            | Removing the group or item semantics fails existing role and content assertions.       | `audit:SegmentedControl/anatomy` |
| FR3                 | `SegmentedControl.test.tsx` label and icon suites           | Visible label, icon with label, icon-only item | Removing or changing current label/icon rendering fails existing DOM assertions.       | `audit:SegmentedControl/anatomy` |
| FR4                 | `SegmentedControl.test.tsx` selection and disabled suites   | Selected, unselected, and disabled items       | Breaking reflected item state fails current ARIA, class, or data-attribute assertions. | `audit:SegmentedControl/theming` |
| Target inventory    | `packages/core/src/theme/themingTargets.test.ts`            | Control and item targets                       | Runtime and documented target metadata drift fails target validation.                  | `audit:SegmentedControl/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                               | Canonical anatomy and both current targets     | Missing, extra, prefixed, or stale mappings fail repository validation.                | `audit:SegmentedControl/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design,
selection, accessibility, or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, selection or focus
mechanics, implementation steps, or system rules. It links to their owners.
