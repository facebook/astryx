---
schema_version: 1
template_version: 3
kind: component
id: component:CommandPalette
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/CommandPalette/CommandPalette.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteInput.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteList.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteItem.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteGroup.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteFooter.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# CommandPalette component contract

## Intent

CommandPalette presents searchable commands inside a Dialog. This draft records
its current aggregate consumer anatomy, target ownership, and delegated stable
parts without changing runtime behavior, styling, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Search orchestration and the current Input, List, Item, Group, Group heading,
  Empty, and Footer parts and targets.
- The native Query field rendered inside the default Input.

**Does not own / non-goals**

- Dialog's surface, Icon's glyph, Spinner's loading indicator, or Kbd's shortcut
  badges — owned by their respective components.
- Caller-provided replacement Input, Footer, item content, or trailing input
  content — owned by the product callsite.
- A `command-palette` root target — no such current target exists, and this
  factual backfill does not invent one.
- Shared layer hosting, positioning, or lifecycle rules beyond the current
  records linked below.

## Public concepts

No new public concept is introduced. Consumer props, slots, and usage remain
documented in `CommandPalette.doc.mjs` and its subcomponent docs.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                 | Basis                             | Draft review state                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| FR1 | The current default render places Input and Footer around a List inside a delegated Dialog; the List contains Items, optional Groups and Group headings, or Empty according to the current results. | Current source, docs, and tests   | Verified current behavior; no new behavior decided                        |
| FR2 | Input, List, Item, Group, Group heading, Empty, and Footer carry the seven current `command-palette-*` targets documented below; no `command-palette` root target exists.                           | Current source and target docs    | Verified current inventory; focused placement coverage is partial         |
| FR3 | The default Input delegates its Search glyph to Icon and pending Loading spinner to Spinner; the default Footer delegates keyboard shortcuts to Kbd; the containing surface delegates to Dialog.    | Current source and component docs | Verified current composition; no ownership change                         |
| FR4 | Query field is a distinct native text field inside Input and currently has no separate public target. The `command-palette-input` target is on the surrounding search region, not the native field. | Current source and target docs    | Verified current reachability; long-term theming intent remains unsettled |

### Allowed variation

- **AV1 — Results.** Item count, grouping, selected content, and empty state may
  vary without changing the aggregate anatomy.
- **AV2 — Slots.** Caller-provided Input and Footer content may replace the
  defaults without becoming CommandPalette-owned subparts.
- **AV3 — Delegated rendering.** Dialog, Icon, Spinner, and Kbd may change their
  internal element shape while preserving their own public contracts.

### Representative states

| State                  | Required invariant                                      | Allowed variation                               |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Ungrouped results      | List contains Item instances.                           | Item count and caller-rendered content.         |
| Grouped results        | List contains Group, Group heading, and Item instances. | Group names, count, ordering, and item content. |
| Empty bootstrap/search | List contains Empty instead of Items.                   | Caller-provided empty content.                  |
| Pending search         | Default Input may contain Loading spinner.              | Spinner is absent when no search is pending.    |
| Default slots          | Input and Footer render their documented defaults.      | Footer shortcut text and translated labels.     |
| Caller-replaced slots  | The slot content replaces the corresponding default.    | Replacement structure remains caller-owned.     |

### Transformation and precedence order

- No new search, selection, layout, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend CommandPalette's current Dialog, combobox,
listbox, option, announcement, or keyboard behavior.

## Design relationships

| Anatomy or state  | Design requirement                                                      | Representation authority       | Hierarchy role | Component contract |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Dialog            | Presents the containing modal surface.                                  | `component:Dialog`             | Supporting     | FR1, FR3           |
| Input             | Paints the search region around the query field and supporting visuals. | Current source and public docs | Prominent      | FR1, FR2, FR4      |
| Search glyph      | Presents the search symbol in the default Input.                        | `component:Icon`               | Supporting     | FR3                |
| Query field       | Accepts the native text query inside Input.                             | Current source and public docs | Prominent      | FR1, FR4           |
| Loading spinner   | Indicates a pending search in the default Input.                        | `component:Spinner`            | Supporting     | FR3                |
| List              | Presents the current result collection or Empty state.                  | Current source and public docs | Supporting     | FR1, FR2           |
| Item              | Presents one selectable command result.                                 | Current source and public docs | Prominent      | FR1, FR2           |
| Group             | Arranges related Items together.                                        | Current source and public docs | Supporting     | FR1, FR2           |
| Group heading     | Labels one Group visually.                                              | Current source and public docs | Supporting     | FR1, FR2           |
| Empty             | Presents the no-results or no-query message.                            | Current source and public docs | Prominent      | FR1, FR2           |
| Footer            | Presents default guidance or caller-provided footer content.            | Current source and public docs | Supporting     | FR1, FR2           |
| Keyboard shortcut | Presents one shortcut as painted key badges in the default Footer.      | `component:Kbd`                | Supporting     | FR3                |

The native Query field is separate from the Input region that carries
`command-palette-input`. Its current lack of a direct target is observed
reachability, not a decision that it must remain unthemeable.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Dialog": {
    "delegatesTo": {"owner": "component:Dialog", "target": "dialog"}
  },
  "Input": {"target": "command-palette-input"},
  "Search glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Query field": {
    "none": {
      "reason": "unsettled: No current public target is applied directly to the native query field; future exposure still needs an owner decision"
    }
  },
  "Loading spinner": {
    "delegatesTo": {"owner": "component:Spinner", "target": "spinner"}
  },
  "List": {"target": "command-palette-list"},
  "Item": {"target": "command-palette-item"},
  "Group": {"target": "command-palette-group"},
  "Group heading": {"target": "command-palette-group-heading"},
  "Empty": {"target": "command-palette-empty"},
  "Footer": {"target": "command-palette-footer"},
  "Keyboard shortcut": {
    "delegatesTo": {"owner": "component:Kbd", "target": "kbd"}
  }
}
```

The seven local targets are current public seams. The delegated parts retain
their existing component owners. The Query field `none` disposition records a
current audit gap and does not authorize a new target.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, delegation, and factual `none` dispositions.
- `architecture:public-component-api` owns the stable props and composition
  surface; this documentation adds no API.
- `architecture:interaction-modality` owns shared keyboard and pointer modality;
  this draft does not redefine focus ownership or input behavior.
- `family:overlay-dismissal` identifies CommandPalette as a current member and
  records its component-local Escape handling as an adoption gap.
- No layer-runtime record is linked because no current record with that scope is
  present in this checkout.

## Verification map

| Contract            | Verification                                                                    | Representative states                                  | Mutation or failure expectation                                                                                                                                                                                                                     | Audit section                  |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| FR1                 | CommandPalette root and subcomponent render suites plus source inspection       | Default, grouped, empty, pending, and replaced slots   | Removing the asserted Dialog, Query field, List, Item, Group, Group heading, Empty, or Footer content fails existing role, content, or slot assertions; Search glyph, Loading spinner, and Keyboard shortcut presence remain source-inspected only. | `audit:CommandPalette/anatomy` |
| FR2                 | Source inspection, `themingTargets.test.ts`, and `CommandPaletteGroup.test.tsx` | Seven local targets; Group and Group heading placement | Removing a current target fails the global inventory; moving Group or Group heading fails focused class assertions.                                                                                                                                 | `audit:CommandPalette/theming` |
| FR3                 | Source inspection plus Dialog, Icon, Spinner, and Kbd public target metadata    | Default surface, Input visuals, and Footer shortcuts   | Existing focused tests do not assert the composed Icon, Spinner, or Kbd instances; changing delegated ownership requires this map and the delegated component metadata to change.                                                                   | `audit:CommandPalette/theming` |
| FR4                 | `CommandPaletteInput.test.tsx` and source inspection                            | Native query field with idle and pending Input         | Removing the field fails combobox tests; adding a field target requires an explicit map update.                                                                                                                                                     | `audit:CommandPalette/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                   | Canonical anatomy and seven current local targets      | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation.                                                                                                                                                               | `audit:CommandPalette/theming` |

Focused target-placement assertions currently cover Group and Group heading.
Input, List, Item, Empty, and Footer placement rely on source inspection plus the
global target inventory. Existing tests assert default Footer text and pending
announcements, but do not assert that Icon, Spinner, or Kbd renders.

## Decision log

None. This draft records current facts and introduces no component-local design,
layer, API, or theming decision.

## Open questions

- **OQ1 — Should Query field gain a stable public theming target?** (`human-api`)
  Its current lack of direct reachability is an audit gap, not settled intent.
- **OQ2 — Should focused tests pin the default Search glyph, pending Loading
  spinner, and default Footer Keyboard shortcuts?** (`checkable`) Their presence
  is currently source-inspected rather than asserted.

## Content boundary

This file does not duplicate consumer prop tables/examples, shared layer or
modality rules, current audit results, or implementation steps. It links to
their owners.
