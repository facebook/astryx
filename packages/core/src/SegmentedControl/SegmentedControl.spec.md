---
schema_version: 3
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
modules: []
families: []
design_specs: [design:user-states, design:reduced-motion]
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: [spec:AST-094/FR4, spec:AST-094/FR13, spec:AST-094/FR19]
---

# SegmentedControl component contract

## Intent

SegmentedControl presents a group of mutually exclusive choices through
SegmentedControlItem children. This draft records the current consumer anatomy
and theming ownership, and proposes how a finger presses, drags, and selects
(FR5–FR10); targets and public API are unchanged.

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

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                    | Basis                                                | Draft review state                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| FR1  | The radiogroup container carries the current `segmented-control` target and renders its supplied children.                                                                                                                                                                                                                                                                                                             | Current source, docs, and tests                      | Verified current behavior; no new behavior decided |
| FR2  | Each SegmentedControlItem renders one radio button carrying the current `segmented-control-item` target.                                                                                                                                                                                                                                                                                                               | Current source, docs, and tests                      | Verified current behavior; no new behavior decided |
| FR3  | A visible item label and optional icon render inside the item without separate public targets.                                                                                                                                                                                                                                                                                                                         | Current source and tests                             | Verified current behavior; no target change        |
| FR4  | Selected and disabled remain reflected states on `segmented-control-item`, not standalone anatomy or targets.                                                                                                                                                                                                                                                                                                          | Current source, docs, and tests                      | Verified current behavior; no target change        |
| FR5  | Under a finger (`spec:AST-094` FR13), a change of selection slides the selected surface from the old segment to the new one as one surface, the radiogroup's `::before`, animating transform and opacity only; under a mouse the theme's colour transition applies (`spec:AST-094` FR19).                                                                                                                              | `spec:AST-094` FR13; measured iOS 26.2 behavior      | Proposed; pending owner review                     |
| FR6  | The slide plays on the internal `segmented.*` motion roles with UIKit's measured values (`spec:AST-094` FR4, DEC-11; thresholds internal under `spec:AST-002` FR3); under Reduce Motion the old surface fades out in place as the new one fades in (`design:reduced-motion` DR1–DR3).                                                                                                                                  | `spec:AST-094` FR4, DEC-11                           | Proposed; pending owner review                     |
| FR7  | Under a finger, `segmented-control-item` reflects a `pressed` state on the unselected segment a finger holds, and its look is the theme's general pressed-treatment role for text-only pressables: an overlay by default, today's look, or a dim in a theme that chooses it. This amends `design:user-states` DR1 for touch presentations (OQ1).                                                                       | Proposed amendment to `design:user-states` DR1       | Proposed; owner decision (OQ1)                     |
| FR8  | Under a finger, holding the selected segment lifts the selected surface by the theme's general pressed-thumb-lift role for draggable thumbs (SegmentedControl, Switch, Slider), which is none by default, today's look; a theme that sets it grows the surface and casts its shadow, as a transform and shadow on the existing surface. This amends `design:user-states` DR3 for touch presentations (OQ2).            | Proposed amendment to `design:user-states` DR3       | Proposed; owner decision (OQ2)                     |
| FR9  | During a drag of the selected surface, the selected label's colour follows the surface, with an internal hysteresis around each boundary; label weights change only when the drag starts. A tap selects through the browser's click (`spec:AST-094` FR11).                                                                                                                                                             | Measured iOS 26.2 behavior; `spec:AST-094` FR11      | Proposed; pending owner review                     |
| FR10 | Under a finger, a drag from the selected segment carries the selected surface with the finger, within an internal overshoot past the end segments, and the lift commits the segment nearest the finger through that segment's click; a drag that starts on another segment leaves the surface in place and commits where it lifts, as a menu's press-tracking slide commits where it lifts (`spec:AST-094` FR26–FR28). | Measured iOS 26.2 behavior; `spec:AST-094` FR26–FR28 | Proposed; pending owner review                     |

### Allowed variation

- A segment may render its visible label, an icon and label, or an icon while the
  required label supplies the accessible name.

### Representative states

- Selected, unselected, disabled, and enabled items retain the same anatomy.
  Selection and disabled styling vary on the segment target.

### Transformation and precedence order

- No new selection, focus, layout, or styling precedence rule is introduced.

### Performance and resources

- **PR1 — The touch presentation adds no element.** SegmentedControl is a
  repeated control, so it keeps the strict element budget
  (`architecture:component-style-authoring` INV7): the slide uses the
  radiogroup's `::before`, and the lift is a transform and shadow on it.

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

| Contract            | Verification                                                               | Representative states                                                                                            | Mutation or failure expectation                                                                                                                           | Audit section                    |
| ------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1, FR2            | `SegmentedControl.test.tsx` radiogroup and rendering suites                | Control with multiple segment items                                                                              | Removing the group or item semantics fails existing role and content assertions.                                                                          | `audit:SegmentedControl/anatomy` |
| FR3                 | `SegmentedControl.test.tsx` label and icon suites                          | Visible label, icon with label, icon-only item                                                                   | Removing or changing current label/icon rendering fails existing DOM assertions.                                                                          | `audit:SegmentedControl/anatomy` |
| FR4                 | `SegmentedControl.test.tsx` selection and disabled suites                  | Selected, unselected, and disabled items                                                                         | Breaking reflected item state fails current ARIA, class, or data-attribute assertions.                                                                    | `audit:SegmentedControl/theming` |
| FR5, FR6, PR1       | Selection-motion unit tests and real-browser proofs in Chromium and WebKit | a tap, a retarget, keyboard selection, Reduce Motion, a mouse                                                    | a second surface or added element, a Layout or Paint per frame, a curve off its role, travel under Reduce Motion, or changed behavior under a mouse fails | `audit:SegmentedControl/theming` |
| FR7, FR8            | Theme tests and real-browser proofs under a finger                         | the default theme, a theme that sets a dim and a lift, a held unselected segment, a held selected segment        | a look that ignores the theme roles, a lift or dim under the default theme, or a lift that adds an element fails                                          | `audit:SegmentedControl/theming` |
| FR9, FR10           | Touch-tracking unit tests and real-browser proofs                          | a hold, a drag, a release between segments, the end overshoot, a slow dither, a tap, a drag from another segment | a weight change mid-drag, a label that flips twice in a small dither, or a commit anywhere but the segment nearest the finger fails                       | `audit:SegmentedControl/anatomy` |
| Target inventory    | `packages/core/src/theme/themingTargets.test.ts`                           | Control and item targets                                                                                         | Runtime and documented target metadata drift fails target validation.                                                                                     | `audit:SegmentedControl/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                              | Canonical anatomy and both current targets                                                                       | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                   | `audit:SegmentedControl/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design,
selection, accessibility, or API decision.

## Open questions

- **OQ1 — A general pressed treatment for text-only pressables.**
  (`human-design`) Open. Proposed: one theme role, an overlay by default (today's
  look) or a dim, amending `design:user-states` DR1 for touch presentations.
- **OQ2 — A general pressed-thumb lift for draggable thumbs.** (`human-design`)
  Open. Proposed: one theme role shared by SegmentedControl, Switch, and Slider,
  none by default (today's look), amending `design:user-states` DR3 for touch
  presentations.

## Content boundary

This file does not duplicate consumer prop tables, examples, selection or focus
mechanics, implementation steps, or system rules. It links to their owners.
