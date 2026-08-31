---
schema_version: 1
template_version: 3
kind: component
id: component:Pagination
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [
    packages/core/src/Pagination/Pagination.test.tsx,
    packages/core/src/Button/Button.test.tsx,
    packages/core/src/Text/Text.test.tsx,
    packages/core/src/NumberInput/NumberInput.test.tsx,
    packages/core/src/Selector/Selector.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture: [architecture:component-theming-surface]
contributing: []
system_specs: []
---

# Pagination component contract

## Intent

Pagination presents controls for moving through pages and may let people choose a
page size or enter a page directly. This draft records its current consumer
anatomy, four local theming targets, delegated control ownership, and current
unreached Ellipsis without changing runtime behavior, styling, targets, or public
API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Pagination navigation landmark and its current `pagination` target.
- The Dot, Page input label, and Page input total parts and their current
  `pagination-dot`, `pagination-input-label`, and `pagination-input-total`
  targets.
- Choosing which stable controls and readouts render for the current paging
  configuration.

**Does not own / non-goals**

- Button, Text, NumberInput, or Selector presentation and targets; those remain
  owned by their respective components.
- Button icon artwork or other internals of delegated controls.
- A public target for Ellipsis; none exists on current `main`.
- New paging behavior, variants, state, public API, or theming targets.

## Public concepts

No new public concept is introduced. Consumer props, presentations, defaults,
and usage remain documented in `Pagination.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                | Basis                                  | Draft review state                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| FR1 | The current render contains one Pagination landmark and Previous/next buttons. Page-size selector, First/last buttons, Page number buttons, Ellipsis, Count readout, Compact readout, Dots, Page input label, Page input, and Page input total appear only when their existing conditions are met. | Current source, docs, and tests        | Verified current behavior; no new behavior decided                        |
| FR2 | Pagination, Dot, Page input label, and Page input total carry the four current local targets `pagination`, `pagination-dot`, `pagination-input-label`, and `pagination-input-total`.                                                                                                               | Current source, docs, and history      | Verified current inventory; focused placement coverage is absent          |
| FR3 | Page-size selector delegates to Selector; First/last, Previous/next, and Page number buttons delegate to Button; Count and Compact readouts delegate to Text; Page input delegates to NumberInput.                                                                                                 | Current source and owner evidence      | Verified current ownership; no target change                              |
| FR4 | Ellipsis is stable visible Pagination-rendered content in a numbered presentation and currently carries no public target.                                                                                                                                                                          | Current source, tests, and target docs | Verified current reachability; long-term theming intent remains unsettled |

### Allowed variation

- **AV1 — Paging data.** Current page, total pages, total items, page size, and
  stride may vary without changing anatomy ownership.
- **AV2 — Presentation.** Existing presentation selection changes which optional
  stable parts are present; presentation names and runtime states are not anatomy.
- **AV3 — Delegated rendering.** Button, Text, NumberInput, and Selector may
  change internal element shape while preserving their own public contracts.

### Representative states

| State                         | Required invariant                                                                | Allowed variation                                  |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| Numbered, known page count    | Page number buttons render; Ellipsis appears only where pages are omitted.        | Page count, sibling range, and active page.        |
| Count with known item total   | Count readout renders between Previous/next buttons.                              | Range and total text.                              |
| Compact with known page count | Compact readout renders between Previous/next buttons.                            | Current and total page text.                       |
| Dots with known page count    | One Dot renders for each page and active state stays on the Dot target.           | Dot count and active Dot.                          |
| Input with known page count   | Page input label, Page input, and Page input total render; First/last may render. | Label text and first/last opt-out.                 |
| Input with unknown page count | Page input label and disabled Page input remain; total and First/last are absent. | Cursor-backed current page.                        |
| None                          | Previous/next buttons remain without a presentation-specific part between them.   | Enabled state follows current paging availability. |

The optional Page-size selector may precede the paging controls in any current
presentation when page-size options are provided.

### Transformation and precedence order

- No new page calculation, range generation, optimistic update, or styling
  precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend Pagination's existing navigation landmark,
button naming, current-page semantics, roving Dot focus, live announcements, or
input bounds.

## Design relationships

| Anatomy or state      | Design requirement                                                 | Representation authority       | Hierarchy role | Component contract |
| --------------------- | ------------------------------------------------------------------ | ------------------------------ | -------------- | ------------------ |
| Pagination            | Groups the page-size and paging controls in a navigation landmark. | Current source and public docs | Supporting     | FR1, FR2           |
| Page-size selector    | Lets people choose the number of items shown per page.             | `component:Selector`           | Supporting     | FR1, FR3           |
| First/last buttons    | Jump directly to the first or last known page.                     | `component:Button`             | Supporting     | FR1, FR3           |
| Previous/next buttons | Move backward or forward through pages.                            | `component:Button`             | Prominent      | FR1, FR3           |
| Page number button    | Selects one page directly in the numbered presentation.            | `component:Button`             | Prominent      | FR1, FR3           |
| Ellipsis              | Indicates an omitted span of page numbers.                         | Current source and public docs | Supporting     | FR1, FR4           |
| Count readout         | Presents the visible item range and total.                         | `component:Text`               | Prominent      | FR1, FR3           |
| Compact readout       | Presents the current and total page counts.                        | `component:Text`               | Prominent      | FR1, FR3           |
| Dot                   | Presents and selects one page in the dot presentation.             | Current source and public docs | Prominent      | FR1, FR2           |
| Page input label      | Names the editable page field visually.                            | Current source and public docs | Supporting     | FR1, FR2           |
| Page input            | Accepts a direct page-number entry.                                | `component:NumberInput`        | Prominent      | FR1, FR3           |
| Page input total      | Presents the known total after the editable page field.            | Current source and public docs | Supporting     | FR1, FR2           |

The three Button rows are separate stable controls with different conditions and
jobs; they do not create Pagination-owned Button targets. Presentation values,
size, disabled state, and active state remain capabilities on owning targets,
not anatomy entries.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Pagination": {"target": "pagination"},
  "Page-size selector": {
    "delegatesTo": {"owner": "component:Selector", "target": "selector"}
  },
  "First/last buttons": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Previous/next buttons": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Page number button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Ellipsis": {
    "none": {
      "reason": "unsettled: no current public target is applied to the Pagination-rendered ellipsis"
    }
  },
  "Count readout": {
    "delegatesTo": {"owner": "component:Text", "target": "text"}
  },
  "Compact readout": {
    "delegatesTo": {"owner": "component:Text", "target": "text"}
  },
  "Dot": {"target": "pagination-dot"},
  "Page input label": {"target": "pagination-input-label"},
  "Page input": {
    "delegatesTo": {"owner": "component:NumberInput", "target": "number-input"}
  },
  "Page input total": {"target": "pagination-input-total"}
}
```

The four local targets are current public seams. Delegated controls retain their
component owners. Ellipsis has no current target; that factual `none` disposition
does not decide whether it should remain unreachable.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, delegation, state placement, and factual `none` dispositions.
- Button, Text, NumberInput, and Selector retain ownership of their delegated
  targets and presentation.

## Verification map

| Contract            | Verification                                                                                         | Representative states                                      | Mutation or failure expectation                                                                    | Audit section              |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1                 | `Pagination.test.tsx` presentation, page-size, input, and navigation suites                          | Numbered, count, compact, dots, input, none, known/unknown | Removing or misplacing a stable control fails existing role, text, or interaction assertions.      | `audit:Pagination/anatomy` |
| FR2                 | Source inspection, public target metadata, target-introduction history, and `themingTargets.test.ts` | Four local targets and their current capabilities          | Removing a current target fails the global inventory; focused placement is not currently pinned.   | `audit:Pagination/theming` |
| FR3                 | Pagination composition tests plus Button, Text, NumberInput, and Selector target tests and metadata  | All delegated controls and readouts                        | A composed owner losing its target fails owner coverage; replacing it requires this map to change. | `audit:Pagination/theming` |
| FR4                 | `generatePageRange` tests, render-source inspection, and current target metadata                     | Left, right, and two-sided omission                        | Adding or documenting an Ellipsis target requires an explicit map and target-inventory update.     | `audit:Pagination/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                        | Canonical anatomy and four current local targets           | Missing, extra, prefixed, stale, or multiply assigned local mappings fail repository validation.   | `audit:Pagination/theming` |

Pagination has broad behavior coverage but no focused assertions for placement
of its four local target classes. Delegated owner tests pin the owner targets;
Pagination tests pin that the corresponding controls render, not their target
class composition.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, behavior, or theming decision.

## Open questions

- **OQ1 — Which focused tests should pin placement and reflected properties for
  the four local Pagination targets?** (`checkable`)
- **OQ2 — Should Ellipsis gain a stable public theming target?** (`human-api`)
  Its current lack of reachability is an audit gap, not settled intent.

## Content boundary

This file does not duplicate consumer prop tables/examples, paging algorithms,
implementation steps, owner-component internals, or system theming rules. It
links to their owners.
