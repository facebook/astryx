---
schema_version: 1
template_version: 3
kind: component
id: component:Table
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Table/Table.test.tsx,
    packages/core/src/Table/plugins/selection/useTableSelection.test.tsx,
    packages/core/src/Table/plugins/sortable/useTableSortable.test.tsx,
    packages/core/src/Table/plugins/rowExpansion/useTableRowExpansion.test.tsx,
    packages/cli/foundation/discovery/theming-targets.test.mjs,
    packages/cli/api/theme/targets/targets.test.mjs,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Table component contract

## Intent

Table presents consistently structured data in semantic rows and columns. This
draft records its current aggregate anatomy, parent-owned target inventory, and
stable sorting, selection, expansion, and empty-state parts without changing
runtime behavior, DOM, styling, targets, aliases, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Table and Scroll region, the aggregate Header section, Body section,
  conditional Footer section, Row, Column header cell, and Cell anatomy, and the
  eight current `table*` targets mapped below.
- The stable Sort control and Sort priority rendered by useTableSortable.
- The stable Expansion control and Expanded detail panel rendered by
  useTableRowExpansion.
- Placement of selection-plugin CheckboxInput controls in generated header and
  body cells.

**Does not own / non-goals**

- CheckboxInput visuals, Icon glyphs, or the default EmptyState surface; those
  remain owned by their respective components.
- Cell values, custom cell renderers, custom empty states, footer content, or
  expanded detail content supplied by the caller.
- Pagination, filtering, column-management, tree, grouping, sticky-column, or
  context-menu anatomy beyond the stable parts explicitly recorded here.
- New targets for current untargeted plugin parts, or correction of current
  target-reachability gaps.
- New runtime behavior, DOM, API, target, alias, or plugin contract.

## Public concepts

No new public concept is introduced. Consumer data, columns, props, composition,
plugins, defaults, and usage remain documented in `Table.doc.mjs` and the member
and hook docs.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                      | Basis                             | Draft review state                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| FR1 | Styled Table renders one keyboard-focusable Scroll region around one semantic Table.                                                                                                                                                                                                                     | Current source, docs, and tests   | Verified current behavior; no new behavior decided                        |
| FR2 | Data-driven mode renders a Body section and a Header section with Column header cells when columns are present. Each data item renders a standard Row and Cells; an empty data array instead renders the configured empty-state row when enabled. It never creates a Footer section.                     | Current source, docs, and tests   | Verified current behavior; no new behavior decided                        |
| FR3 | Children mode passes caller composition through to the Table. TableHeader, TableBody, and TableFooter provide the respective sections, and TableRow, TableHeaderCell, and TableCell provide standard rows and cells.                                                                                     | Current source, docs, and tests   | Verified current composition; no new API or DOM rule                      |
| FR4 | `Table.doc.mjs` is the canonical aggregate consumer owner for the eight current targets: `table`, `table-scroll-wrapper`, `table-header`, `table-body`, `table-footer`, `table-row`, `table-cell`, and `table-header-cell`. Member docs retain direct lookup metadata through `subComponentOf: 'Table'`. | Current docs and CLI target tests | Verified parent ownership; focused placement coverage is partial          |
| FR5 | For a sortable column, useTableSortable renders a Sort control around the column label, an Icon-owned Sort indicator glyph, and a numeric Sort priority only while multi-sort has more than one active entry.                                                                                            | Current source, docs, and tests   | Control and priority are tested; glyph presence is source-inspected only  |
| FR6 | useTableSelection renders CheckboxInput-owned Selection controls in the generated selection Column header cell and each selectable body Cell; selection remains row state rather than separate anatomy.                                                                                                  | Current source, docs, and tests   | Verified stable delegated controls; no target or state change             |
| FR7 | For an expandable row, useTableRowExpansion renders an Expansion control with an Icon-owned Expansion glyph and conditionally appends an Expanded detail panel whose cell spans the column count captured by that plugin's `transformColumns` step.                                                      | Current source, docs, and tests   | Verified stable plugin parts; current target gaps remain                  |
| FR8 | Empty data renders the default compact EmptyState unless the caller supplies replacement content or disables it.                                                                                                                                                                                         | Current source, docs, and tests   | Verified conditional delegation; caller content remains outside ownership |

### Current evidence and gaps

- The `table`, `table-scroll-wrapper`, `table-row`, `table-cell`, and
  `table-header-cell` placements have focused runtime assertions. The
  `table-header`, `table-body`, and `table-footer` placements are source-inspected;
  existing section tests assert element structure and prop forwarding but not the
  target classes.
- Sort tests assert the Sort control, labels, state, and conditional priority, but
  the test named `renders sort icon for sortable columns` checks only the buttons.
  Sort indicator glyph presence is source-inspected and lacks focused regression
  evidence. Selection and expansion suites assert their stable controls, states,
  and panel structure; delegated Icon and CheckboxInput target classes also remain
  source-inspected.
- The Expanded detail panel uses raw `tr` and `td` elements rather than TableRow
  and TableCell, so the existing `table-row` and `table-cell` targets do not reach
  that panel wrapper. Its `colSpan` comes from the column count captured when the
  expansion plugin runs `transformColumns`; a later custom plugin can add or remove
  columns and leave the span stale. The current full-span test covers only the case
  where expansion captures the final column set. This draft records both gaps and
  does not correct them.

### Allowed variation

- **AV1 - Rendering mode.** Data-driven mode generates sections, rows, and cells;
  children mode uses the caller-supplied composition without changing aggregate
  ownership.
- **AV2 - Repetition and content.** Column, Row, and Cell counts and caller-owned
  content may vary without creating new anatomy parts.
- **AV3 - Optional parts.** Header section, Footer section, default EmptyState,
  Sort, Selection, and Expansion parts may be absent according to columns,
  rendering mode, plugin configuration, data, and row eligibility.
- **AV4 - Delegated rendering.** CheckboxInput, Icon, and EmptyState may change
  internal element shape while preserving their own public contracts.

### Representative states

| State            | Required invariant                                                                                                                              | Allowed variation                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Data-driven rows | Scroll region contains Table, Header section when columns exist, Body section, and one standard Row with Cells per data item.                   | Counts, values, density, dividers, and cell content.                       |
| Empty data       | Body section contains default EmptyState unless replaced or disabled.                                                                           | Caller replacement content or no empty state.                              |
| Children mode    | Caller-supplied sections are passed directly to Table.                                                                                          | Header, Body, and Footer section presence and content.                     |
| Sortable column  | Column header cell contains Sort control and Sort indicator glyph.                                                                              | Direction and conditional multi-sort priority.                             |
| Selectable rows  | Selection controls occupy generated header and body cells.                                                                                      | Checked, indeterminate, disabled, or absent per row.                       |
| Expandable row   | Expansion control occupies a generated Cell; open state adds the detail panel after its row using the expansion plugin's captured column count. | Expanded state, caller detail content, and later plugin column transforms. |

### Transformation and precedence order

- No new plugin ordering, column transformation, slot placement, wrapping,
  sizing, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced. Existing memoization and
  plugin-specific render behavior remain outside this documentation change.

## Accessibility contract

This draft does not change or extend the current native table semantics,
focusable Scroll region, column-header scope, sort `aria-sort`, selection
`aria-selected`, CheckboxInput labels, or expansion `aria-expanded` behavior.

## Design relationships

| Anatomy or state      | Design requirement                                                                | Representation authority       | Hierarchy role | Component contract |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Table                 | Groups the semantic table structure.                                              | Current source and public docs | Supporting     | FR1-FR4            |
| Scroll region         | Provides keyboard-reachable horizontal overflow around Table.                     | Current source and public docs | Supporting     | FR1, FR4           |
| Header section        | Groups Column header cells separately from body data.                             | Current source and public docs | Supporting     | FR2-FR4            |
| Column header cell    | Identifies one column and hosts optional header controls.                         | Current source and public docs | Prominent      | FR2-FR6            |
| Sort control          | Activates sorting for one sortable column.                                        | Current source and public docs | Prominent      | FR5                |
| Sort indicator glyph  | Shows the current sort direction through Icon.                                    | `component:Icon`               | Supporting     | FR5                |
| Sort priority         | Shows a column's position in active multi-sort order.                             | Current source and public docs | Supporting     | FR5                |
| Selection control     | Selects all eligible rows or one eligible row through CheckboxInput.              | `component:CheckboxInput`      | Prominent      | FR6                |
| Body section          | Groups data, empty-state, and expanded-detail rows.                               | Current source and public docs | Supporting     | FR2-FR4, FR7, FR8  |
| Row                   | Groups standard header, body, or footer cells.                                    | Current source and public docs | Supporting     | FR2-FR4, FR6       |
| Cell                  | Contains one value or caller-provided content in a standard body or footer row.   | Current source and public docs | Prominent      | FR2-FR4, FR6, FR7  |
| Default empty state   | Communicates that the current data array has no rows through EmptyState.          | `component:EmptyState`         | Prominent      | FR8                |
| Expansion control     | Expands or collapses one eligible row.                                            | Current source and public docs | Prominent      | FR7                |
| Expansion glyph       | Shows the current expansion direction through Icon.                               | `component:Icon`               | Supporting     | FR7                |
| Expanded detail panel | Presents caller-provided detail content in a spanning row below the expanded row. | Current source and public docs | Prominent      | FR7                |
| Footer section        | Groups caller-supplied summary or total rows below the body.                      | Current source and public docs | Supporting     | FR3, FR4           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Table": {"target": "table"},
  "Scroll region": {"target": "table-scroll-wrapper"},
  "Header section": {"target": "table-header"},
  "Column header cell": {"target": "table-header-cell"},
  "Sort control": {"inherits": "table-header-cell"},
  "Sort indicator glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Sort priority": {
    "none": {
      "reason": "unsettled: The multi-sort rank has no direct public target and uses a component-owned accent style; future exposure still needs an owner decision"
    }
  },
  "Selection control": {
    "delegatesTo": {
      "owner": "component:CheckboxInput",
      "target": "checkbox-input"
    }
  },
  "Body section": {"target": "table-body"},
  "Row": {"target": "table-row"},
  "Cell": {"target": "table-cell"},
  "Default empty state": {
    "delegatesTo": {"owner": "component:EmptyState", "target": "empty-state"}
  },
  "Expansion control": {
    "none": {
      "reason": "unsettled: The expansion button has no direct public target and uses component-owned styles; future exposure still needs an owner decision"
    }
  },
  "Expansion glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Expanded detail panel": {
    "none": {
      "reason": "reachability-gap: The plugin renders its detail row and cell as raw elements, so the current table-row and table-cell targets do not reach the panel wrapper"
    }
  },
  "Footer section": {"target": "table-footer"}
}
```

The exact map records all eight current non-deprecated Table targets once. The
legacy `base-table` alias is compatibility, not anatomy. TableHeader, TableBody,
TableFooter, TableRow, TableCell, and TableHeaderCell retain direct docs linked by
`subComponentOf: 'Table'`; they do not need independent component specs for this
aggregate ownership.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, exact
  target mapping, delegation, inheritance, factual `none` classifications, and
  the rule that deprecated aliases do not count as anatomy.
- `architecture:container-padding` owns the inherited inset protocol consumed by
  the Scroll region and Cell edge compensation.
- `architecture:interaction-modality` owns shared keyboard and pointer modality;
  Table and its plugins retain their current local interactions.
- `architecture:public-component-api` owns the stable props, components, hooks,
  exports, and compatibility boundary; this documentation adds no API.

## Verification map

| Contract            | Verification                                                                                         | Representative states                                  | Mutation or failure expectation                                                                                                                                                                                                                                           | Audit section         |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| FR1-FR3             | `Table.test.tsx` render, structure, children-mode, section, and target assertions                    | Data-driven rows, empty data, and children composition | Removing Table, Scroll region, or configured structure fails existing role, structure, class, or prop-forwarding assertions; Row and Cell are conditional on rendered data or caller composition.                                                                         | `audit:Table/anatomy` |
| FR4                 | CLI discovery and API target tests plus source inspection                                            | Direct member docs and unfiltered/scoped target output | Duplicating a parent/member target or changing the canonical owner fails parent-aware discovery assertions; section target placement remains source-inspected.                                                                                                            | `audit:Table/theming` |
| FR5                 | `plugins/sortable/useTableSortable.test.tsx` plus source inspection                                  | Unsorted, ascending, descending, and multi-sort        | Removing the Sort control, conditional priority, or ARIA state fails existing assertions. Removing the Sort indicator glyph does not currently fail a focused test; glyph presence and delegated Icon target placement remain source-inspected.                           | `audit:Table/anatomy` |
| FR6                 | `plugins/selection/useTableSelection.test.tsx`                                                       | Select all, individual, disabled, and non-selectable   | Removing header/body Selection controls or row selection state fails existing structure, label, interaction, and ARIA assertions; delegated CheckboxInput target placement remains source-inspected.                                                                      | `audit:Table/anatomy` |
| FR7                 | `plugins/rowExpansion/useTableRowExpansion.test.tsx` plus source inspection                          | Collapsed, expanded, and non-expandable rows           | Removing the Expansion control, conditional detail panel, captured-count `colSpan`, or ARIA state fails existing assertions in the covered plugin order; later column transforms, delegated Icon target placement, and untargeted panel wrappers remain source-inspected. | `audit:Table/anatomy` |
| FR8                 | `Table.test.tsx` empty-state suite plus EmptyState public target metadata                            | Default, custom, disabled, and non-empty               | Removing conditional empty behavior fails existing assertions; default EmptyState delegation remains source-inspected.                                                                                                                                                    | `audit:Table/anatomy` |
| Theming anatomy map | `scripts/check-knowledge.mjs`, `themingTargets.test.ts`, and CLI parent-aware target discovery tests | Canonical anatomy, eight current targets, legacy alias | Missing, extra, duplicated, prefixed, stale, alias-backed, or independently owned member mappings fail repository validation or discovery coverage.                                                                                                                       | `audit:Table/theming` |

## Decision log

None. This draft records current facts and the user-directed canonical parent
ownership without introducing a component-local design, API, behavior, layout,
or theming decision.

## Open questions

- **OQ1 - Should the current untargeted Sort priority, Expansion control, or
  Expanded detail panel gain direct public theming targets?** (`human-api`) This
  factual map does not decide future exposure.
- **OQ2 - Should focused runtime tests pin the Sort indicator glyph, the
  `table-header`, `table-body`, and `table-footer` target classes, and delegated
  component target placement?** (`checkable`) Current evidence is source
  inspection plus structural and global inventory tests.
- **OQ3 - Should row expansion derive its panel span after all column transforms?**
  (`checkable`) A later custom `transformColumns` plugin can currently make the
  captured count stale.

## Content boundary

This file does not duplicate consumer prop tables or examples, plugin usage,
container-padding mechanics, shared modality rules, current audit results, or
implementation steps. It links to their owners.
