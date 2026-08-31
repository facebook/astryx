---
schema_version: 1
template_version: 3
kind: component
id: component:ComplexSelector
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/ComplexSelector/ComplexSelector.test.tsx,
    packages/core/src/Field/Field.test.tsx,
    packages/core/src/Icon/Icon.test.tsx,
    scripts/check-knowledge.mjs,
  ]
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:layer-runtime]
contributing: []
system_specs: []
---

# ComplexSelector component contract

## Intent

ComplexSelector renders a field-owned shell, an owned trigger, and a dialog
popup for caller-provided rich selection content. This draft records current
consumer anatomy and theming ownership without changing runtime behavior,
styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The trigger and its current `complex-selector` target.
- The trailing indicator icon and its current
  `complex-selector-indicator-icon` target.
- The painted popup surface and its current `complex-selector-popup` target.

**Does not own / non-goals**

- Field-shell presentation — rendered by Field and themed through Field's
  current `field` target.
- General Icon presentation — rendered by Icon for semantic icon names and icon
  component types and themed through Icon's current `icon` target.
- Arbitrary ReactNode content supplied through `startIcon` — rendered directly
  and owned by the product callsite.
- The selector-specific structure supplied through `children` — owned by the
  product callsite.
- Shared layer lifecycle, positioning, and dismissal behavior.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `ComplexSelector.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                       | Basis                           | Draft review state                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | The current render contains a Field, Trigger, Indicator icon, and mounted Popup; one optional start slot may contain either an Icon-rendered start icon or caller-rendered start content. | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | Trigger, Indicator icon, and Popup carry `complex-selector`, `complex-selector-indicator-icon`, and `complex-selector-popup`, respectively.                                               | Current source, docs, and tests | Verified current behavior; no target change        |
| FR3 | Field delegates to Field's `field` target, and a semantic name or icon component in the start slot delegates to Icon's `icon` target.                                                     | Current source and owner tests  | Verified current behavior; no target change        |
| FR4 | Arbitrary ReactNode start content renders directly and carries no ComplexSelector-owned target.                                                                                           | Current source                  | Verified current behavior; no target change        |

### Allowed variation

- Caller-provided popup content may vary without becoming a new
  ComplexSelector-owned anatomy part or target.
- The optional start slot has two factual branches: semantic names and icon
  component types render through Icon, while arbitrary ReactNode content renders
  directly under caller ownership.

### Representative states

- Input and ghost variants use the same six-part anatomy and current targets.
- The start slot is absent when `startIcon` is omitted. When present, exactly
  one of Icon-rendered start icon or Caller-rendered start content applies.
- The Popup remains mounted in both states: it is hidden while closed and shown
  while open. The Indicator icon remains present and reflects collapsed or
  expanded state on its current target.

### Transformation and precedence order

- No new value, open-state, positioning, or style precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend ComplexSelector's existing field, trigger,
dialog, focus, or keyboard behavior.

## Design relationships

| Anatomy or state              | Design requirement                                                               | Representation authority       | Hierarchy role    | Component contract |
| ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Field                         | Provides the field shell around the owned trigger.                               | Field component                | Supporting        | FR1, FR3           |
| Trigger                       | Displays the current value or placeholder and opens the popup.                   | Current source and public docs | Prominent         | FR1, FR2           |
| Icon-rendered start icon      | Optionally presents a semantic or component icon through Icon.                   | Icon component                 | Supporting        | FR1, FR3           |
| Caller-rendered start content | Optionally presents arbitrary React content directly in the start slot.          | Caller-supplied content        | Context-dependent | FR1, FR4           |
| Indicator icon                | Presents the trailing disclosure glyph and reflects collapsed or expanded state. | Current source and public docs | Supporting        | FR1, FR2           |
| Popup                         | Keeps the dialog surface mounted, hidden while closed and painted while open.    | Current source and public docs | Prominent         | FR1, FR2           |

The Field and Icon delegations preserve their existing owners. Arbitrary
ReactNode start content remains caller-owned and receives no local target. The
local Indicator icon target remains distinct because it carries the selector's
expanded/collapsed state and rotation on the glyph itself. Caller-provided popup
content remains outside the owned anatomy inventory.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Field": {"delegatesTo": {"owner": "component:Field", "target": "field"}},
  "Trigger": {"target": "complex-selector"},
  "Icon-rendered start icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Caller-rendered start content": {
    "none": {
      "reason": "intentional: Arbitrary ReactNode content is caller-owned and receives no ComplexSelector target."
    }
  },
  "Indicator icon": {"target": "complex-selector-indicator-icon"},
  "Popup": {"target": "complex-selector-popup"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, and delegation rules.
- `architecture:layer-runtime` owns the current `usePopover` host, positioning,
  native light-dismiss, and visibility reconciliation used by the Popup.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering;
  ComplexSelector participates through its composed Popover owner.
- Field and Icon retain ownership of their delegated targets and presentation.

## Verification map

| Contract            | Verification                                                               | Representative states                            | Mutation or failure expectation                                                               | Audit section                   |
| ------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1                 | `ComplexSelector.test.tsx` render, ghost-trigger, and popup suites         | Default closed, ghost start branches, open Popup | Removing a documented part fails existing role, content, or structure assertions.             | `audit:ComplexSelector/anatomy` |
| FR2                 | Component target suites, source inspection, and theming target inventories | Closed/open Popup; expanded Indicator icon       | Removing or renaming a current local target fails component assertions or target inventories. | `audit:ComplexSelector/theming` |
| FR3, FR4            | Icon owner tests and `renderIconSlot` source inspection                    | Semantic/component icon; arbitrary ReactNode     | A branch gains the wrong owner, loses its target, or receives an invented local target.       | `audit:ComplexSelector/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                              | Canonical anatomy and current local targets      | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.    | `audit:ComplexSelector/theming` |

Current component tests directly assert the Trigger and Popup targets. Source
inspection confirms that non-lazy `useLayer` keeps the Popup mounted while
closed. The Indicator icon target is covered by source inspection and shared
target inventories rather than a dedicated component assertion. `renderIconSlot`
and Icon owner tests distinguish the Icon-rendered branch from arbitrary
caller-owned ReactNode content.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, or layer-system decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, caller-provided
popup structure, implementation steps, or shared layer and theming rules. It
links to their owners.
