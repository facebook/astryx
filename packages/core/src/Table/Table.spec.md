---
schema_version: 3
template_version: 3
kind: component
id: component:Table
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-01
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Table/Table.test.tsx,
    packages/core/src/Table/Table.perf.test.tsx,
    packages/core/src/Table/plugins/selection/useTableSelection.test.tsx,
    packages/core/src/Table/plugins/sortable/useTableSortable.test.tsx,
    packages/core/src/Table/plugins/rowExpansion/useTableRowExpansion.test.tsx,
    packages/cli/foundation/discovery/theming-targets.test.mjs,
    packages/cli/api/theme/targets/targets.test.mjs,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: [module:Table/useTableRowStatus]
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
contract records its current aggregate anatomy, parent-owned target inventory,
stable sorting, selection, expansion, and empty-state parts, and the shared
`TablePlugin` protocol through which public modules compose. Module-local API,
generated anatomy, accessibility, migration, and evidence belong to each listed
`module:*` record.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive targets plus an intentional visual change to two
  existing affordances. Two targets are added (`table-sort-button`,
  `table-filter-button`); no target, alias, DOM structure, prop, or export is
  removed or renamed, and no public API changes.
- Intentional visual changes, both to the sort control and the filter trigger:
  - They are now the real `Button` and `IconButton` rather than native buttons
    that restated Button's interaction states, so they take Button's hover and
    pressed overlay and its `scale(0.98)` press, and the filter trigger draws
    the shared 2px focus ring in place of the user agent's default outline. Its
    box becomes Button's `sm` square (28x28 measured, above the 24px WCAG 2.2
    2.5.8 minimum).
  - Their resting `opacity: 0.35` is gone. Composited, that put them at 1.57:1
    against the header, below the 3:1 WCAG 1.4.11 asks of a UI component; they
    now render at `--color-icon-secondary`, measured 4.74:1, and stay visible at
    rest rather than fading in on header hover.
  - The column heading inside the sort control is unchanged: measured against
    its `<th>`, colour, white-space, overflow, text-overflow, font size and
    weight all match.
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none. A theme that styled either affordance through a
  structural selector keeps working; the new targets are the supported route.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Table and Scroll region, the aggregate Header section, Body section,
  conditional Footer section, Row, Column header cell, and Cell anatomy, and the
  ten current `table*` targets mapped below.
- The stable Sort control and Sort priority rendered by useTableSortable.
- The stable Expansion control and Expanded detail panel rendered by
  useTableRowExpansion.
- Placement of selection-plugin CheckboxInput controls in generated header and
  body cells.
- The shared `TablePlugin` transform surface, phase order, sequential composition,
  named-plugin ordering, slot protocol, failure isolation, and stable plugin-array
  identity used by every Table module.

**Does not own / non-goals**

- CheckboxInput visuals, Icon glyphs, or the default EmptyState surface; those
  remain owned by their respective components.
- Cell values, custom cell renderers, custom empty states, footer content, or
  expanded detail content supplied by the caller.
- Pagination, filtering, column-management, tree, grouping, sticky-column, or
  context-menu anatomy beyond the stable parts explicitly recorded here.
- The public API, generated columns or other anatomy, internal precedence,
  accessibility, migration, performance evidence, or theming decisions of an
  independently contractible module. `module:Table/useTableRowStatus` owns those
  concerns for `useTableRowStatus`.
- New targets for current untargeted plugin parts, or correction of current
  target-reachability gaps.
- New runtime behavior, DOM, API, target, or alias.

## Public concepts

Table records two aggregate public concepts without duplicating module-local APIs:

| Concept           | Closed values or states                                           | Meaning                                                                              | Availability by variant/orientation/state | Default                    | Owner             | Stability | Invalid-value behavior                                                                                        |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- | -------------------------- | ----------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| Plugin collection | Named `Record<string, TablePlugin<T>>` or absent                  | Adds ordered transformations to the data-driven Table pipeline.                      | Data-driven Table                         | Absent                     | `component:Table` | Stable    | Development warns for unknown transform keys, non-functions, and empty plugins; unsupported keys are ignored. |
| Plugin transform  | Column, element-render-prop, scroll-wrapper, or context transform | Changes one owned pipeline phase while preserving the common `TablePlugin` protocol. | According to the transform method         | Omitted methods are no-ops | `component:Table` | Stable    | A throwing transform is isolated and the prior accumulated value continues.                                   |

Consumer data, columns, props, module signatures, defaults, and usage remain
documented in `Table.doc.mjs` and the member and module docs.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                         | Basis                                | Evidence state                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| FR1  | Styled Table renders one keyboard-focusable Scroll region around one semantic Table.                                                                                                                                                                                                                                                                                                              | Current source, docs, and tests      | Verified current behavior; no new behavior decided                              |
| FR2  | Data-driven mode renders a Body section and a Header section with Column header cells when columns are present. Each data item renders a standard Row and Cells; an empty data array instead renders the configured empty-state row when enabled. It never creates a Footer section.                                                                                                              | Current source, docs, and tests      | Verified current behavior; no new behavior decided                              |
| FR3  | Children mode passes caller composition through to the Table. TableHeader, TableBody, and TableFooter provide the respective sections, and TableRow, TableHeaderCell, and TableCell provide standard rows and cells.                                                                                                                                                                              | Current source, docs, and tests      | Verified current composition; no new API or DOM rule                            |
| FR4  | `Table.doc.mjs` is the canonical aggregate consumer owner for the ten current targets: `table`, `table-scroll-wrapper`, `table-header`, `table-body`, `table-footer`, `table-row`, `table-cell`, `table-header-cell`, `table-sort-button` (reflecting `direction`), and `table-filter-button` (reflecting `active`). Member docs retain direct lookup metadata through `subComponentOf: 'Table'`. | Current docs and CLI target tests    | Verified parent ownership; focused placement coverage is partial                |
| FR5  | For a sortable column, useTableSortable renders a Sort control around the column label, an Icon-owned Sort indicator glyph, and a numeric Sort priority only while multi-sort has more than one active entry.                                                                                                                                                                                     | Current source, docs, and tests      | Control and priority are tested; glyph presence is source-inspected only        |
| FR6  | useTableSelection renders CheckboxInput-owned Selection controls in the generated selection Column header cell and each selectable body Cell; selection remains row state rather than separate anatomy.                                                                                                                                                                                           | Current source, docs, and tests      | Verified stable delegated controls; no target or state change                   |
| FR7  | For an expandable row, useTableRowExpansion renders an Expansion control with an Icon-owned Expansion glyph and conditionally appends an Expanded detail panel whose cell spans the column count captured by that plugin's `transformColumns` step.                                                                                                                                               | Current source, docs, and tests      | Verified stable plugin parts; current target gaps remain                        |
| FR8  | Empty data renders the default compact EmptyState unless the caller supplies replacement content or disables it.                                                                                                                                                                                                                                                                                  | Current source, docs, and tests      | Verified conditional delegation; caller content remains outside ownership       |
| FR9  | Table converts the caller's named plugin record into one ordered array after its built-in styling plugin. Known names use the current canonical sequence `columnSettings → sort → tree → selection → pagination`; every other name follows that known set while preserving its record insertion order.                                                                                            | Current source and docs              | Current shared ordering; canonical-name coverage is source-inspected            |
| FR10 | Every applicable non-context transform runs sequentially in the resolved plugin-array order, so a later plugin receives the value returned by every earlier successful plugin. A throwing transform reports a development error and leaves the prior accumulated value in the pipeline.                                                                                                           | Current source and tests             | Sequential composition is tested; failure isolation is source-inspected         |
| FR11 | `transformColumns` completes before element transforms. Table then applies table, header-cell/header-row, body-cell/body-row, scroll-wrapper, and context phases at their render points. Header-cell contributions use `before`, `content`, `after`, `overlay`, and `below` slots. Context transforms run in reverse so the first plugin becomes the outermost provider.                          | Current source, types, and tests     | Transform application is tested; complete cross-phase order is source-inspected |
| FR12 | When built-in and named plugin references are unchanged, Table reuses the resolved plugin array; unknown/custom plugin value identity and insertion order remain stable inputs to memoization.                                                                                                                                                                                                    | Current source and performance tests | Current performance contract; focused named-order coverage is partial           |

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
  where expansion captures the final column set. This contract records both gaps
  and does not correct them.

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
- **AV5 - Module participation.** Any named module may omit transform phases it does
  not need. Unknown/custom plugin names remain valid and follow the shared fallback
  ordering without acquiring module-local semantics here.

### Representative states

| State            | Required invariant                                                                                                                              | Allowed variation                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Data-driven rows | Scroll region contains Table, Header section when columns exist, Body section, and one standard Row with Cells per data item.                   | Counts, values, density, dividers, and cell content.                       |
| Empty data       | Body section contains default EmptyState unless replaced or disabled.                                                                           | Caller replacement content or no empty state.                              |
| Children mode    | Caller-supplied sections are passed directly to Table.                                                                                          | Header, Body, and Footer section presence and content.                     |
| Sortable column  | Column header cell contains Sort control and Sort indicator glyph.                                                                              | Direction and conditional multi-sort priority.                             |
| Selectable rows  | Selection controls occupy generated header and body cells.                                                                                      | Checked, indeterminate, disabled, or absent per row.                       |
| Expandable row   | Expansion control occupies a generated Cell; open state adds the detail panel after its row using the expansion plugin's captured column count. | Expanded state, caller detail content, and later plugin column transforms. |
| Multiple plugins | Built-in styling runs first, then named plugins compose in the resolved order; later transforms receive earlier results.                        | Supported transform subset, custom names, and omitted phases.              |

### Transformation and precedence order

- **ORD1 - Plugin array.** Built-in plugins precede named consumer plugins. Known
  names sort by the canonical list; unknown/custom names retain record insertion
  order after the known set.
- **ORD2 - Sequential transforms.** Each non-context phase reduces over that array
  from first to last. A later plugin receives the earlier accumulated value.
- **ORD3 - Render phases.** Column transforms complete before element transforms;
  element transforms run at the table, header, body, and scroll-wrapper render
  points. Context transforms run from last to first so array priority and provider
  nesting agree: the first plugin is outermost.
- **ORD4 - Module boundary.** Module records may rely on this protocol and state the
  transforms they contribute, but they do not redefine aggregate phase or
  named-plugin ordering.

### Performance and resources

- **PR1 - Stable plugin array.** Table reuses the resolved plugin array while the
  built-in array and named plugin values are referentially unchanged, including
  when the caller recreates the containing record.
- **PR2 - Module ownership.** Each module owns any stronger render, allocation,
  listener, observer, or initialization constraint created by its transforms.
  Table owns only the common array and transform pipeline cost.

## Accessibility contract

This contract does not change or extend the current native table semantics,
focusable Scroll region, column-header scope, sort `aria-sort`, selection
`aria-selected`, CheckboxInput labels, or expansion `aria-expanded` behavior.
Each public module owns accessibility introduced by its transforms; the shared
pipeline does not confer correctness on module output.

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
  "Sort control": {"target": "table-sort-button"},
  "Sort indicator glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Sort priority": {
    "none": {
      "reason": "unsettled: The multi-sort rank has no direct public target and uses a component-owned accent style; future exposure still needs an owner decision"
    }
  },
  "Filter control": {"target": "table-filter-button"},
  "Filter indicator glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
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

The exact map records all ten current non-deprecated Table targets once. The
legacy `base-table` alias is compatibility, not anatomy. TableHeader, TableBody,
TableFooter, TableRow, TableCell, and TableHeaderCell retain direct docs linked by
`subComponentOf: 'Table'`; they do not need independent component specs for this
aggregate ownership.

The Sort control and the Filter control are rendered by Button and IconButton, so
INV5 would make them delegate to `button`. They hold their own targets instead
because each guarantees a public visual contract `button` cannot express: a
colour on `table-sort-button` paints the sort glyph and leaves the column name on
the header cell (routed by the `color` derived-var entry in
`theming.derived`, INV11), where the same colour on `button` paints label and end
content together by Button's own contract; and a colour on `table-filter-button`
reaches one column's funnel rather than every button in the table. Both targets
sit on the painting element that Button renders — the control itself, not a
wrapper — so INV4 holds, and the interaction model stays Button's. The precedent
is `toggle-button`, which carries its own target on the Button it renders.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, exact
  target mapping, delegation, inheritance, factual `none` classifications, and
  the rule that deprecated aliases do not count as anatomy.
- `architecture:container-padding` owns the inherited inset protocol consumed by
  the Scroll region and Cell edge compensation. This container-system
  participation does not make Table a structural member of
  `family:layout-regions`.
- `architecture:interaction-modality` owns shared keyboard and pointer modality;
  Table and its plugins retain their current local interactions.
- `architecture:public-component-api` owns the stable props, components, hooks,
  exports, and compatibility boundary; this documentation adds no API.
- `module:Table/useTableRowStatus` owns the row-status module's API, generated
  anatomy, resolution and warning precedence, accessibility, performance,
  migration, and evidence. Table owns only the shared plugin protocol and its
  aggregate composition order.

## Verification map

| Contract            | Verification                                                                                         | Representative states                                               | Mutation or failure expectation                                                                                                                                                                                                                                           | Audit section             |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1-FR3             | `Table.test.tsx` render, structure, children-mode, section, and target assertions                    | Data-driven rows, empty data, and children composition              | Removing Table, Scroll region, or configured structure fails existing role, structure, class, or prop-forwarding assertions; Row and Cell are conditional on rendered data or caller composition.                                                                         | `audit:Table/anatomy`     |
| FR4                 | CLI discovery and API target tests plus source inspection                                            | Direct member docs and unfiltered/scoped target output              | Duplicating a parent/member target or changing the canonical owner fails parent-aware discovery assertions; section target placement remains source-inspected.                                                                                                            | `audit:Table/theming`     |
| FR5                 | `plugins/sortable/useTableSortable.test.tsx` plus source inspection                                  | Unsorted, ascending, descending, and multi-sort                     | Removing the Sort control, conditional priority, or ARIA state fails existing assertions. Removing the Sort indicator glyph does not currently fail a focused test; glyph presence and delegated Icon target placement remain source-inspected.                           | `audit:Table/anatomy`     |
| FR6                 | `plugins/selection/useTableSelection.test.tsx`                                                       | Select all, individual, disabled, and non-selectable                | Removing header/body Selection controls or row selection state fails existing structure, label, interaction, and ARIA assertions; delegated CheckboxInput target placement remains source-inspected.                                                                      | `audit:Table/anatomy`     |
| FR7                 | `plugins/rowExpansion/useTableRowExpansion.test.tsx` plus source inspection                          | Collapsed, expanded, and non-expandable rows                        | Removing the Expansion control, conditional detail panel, captured-count `colSpan`, or ARIA state fails existing assertions in the covered plugin order; later column transforms, delegated Icon target placement, and untargeted panel wrappers remain source-inspected. | `audit:Table/anatomy`     |
| FR8                 | `Table.test.tsx` empty-state suite plus EmptyState public target metadata                            | Default, custom, disabled, and non-empty                            | Removing conditional empty behavior fails existing assertions; default EmptyState delegation remains source-inspected.                                                                                                                                                    | `audit:Table/anatomy`     |
| FR9-FR11            | `Table.test.tsx`, `types.ts`, `BaseTable.tsx`, and `useBaseTablePlugins.ts`                          | Built-in plus known and custom named plugins; every transform phase | Sequential composition, base-before-user behavior, transform application, and slot output have focused coverage; complete known-name sorting, phase order, exception continuation, and context nesting remain source-inspected.                                           | `audit:Table/plugins`     |
| FR12, PR1           | `Table.perf.test.tsx` plus `useBaseTablePlugins.ts` source inspection                                | Same plugin references, recreated record, and changed plugin value  | Unchanged plugin values must preserve the resolved array and representative no-op row-update budgets; focused named-record identity coverage remains partial.                                                                                                             | `audit:Table/performance` |
| Module backlink     | `scripts/check-knowledge.mjs`                                                                        | Active parent and colocated module record                           | A missing, duplicate, mis-parented, wrong-kind, misnamed, or undiscovered module record fails knowledge validation.                                                                                                                                                       | `audit:Table/modules`     |
| Theming anatomy map | `scripts/check-knowledge.mjs`, `themingTargets.test.ts`, and CLI parent-aware target discovery tests | Canonical anatomy, ten current targets, legacy alias                | Missing, extra, duplicated, prefixed, stale, alias-backed, or independently owned member mappings fail repository validation or discovery coverage.                                                                                                                       | `audit:Table/theming`     |

## Decision log

**DEC-1 — the sort and filter affordances carry their own targets rather than
delegating to `button`.** Both are rendered inside Table's own plugins, so there
is no wrapper a consumer can interpose and no `renderX` prop to route around:
restyling either meant `.astryx-table-header-cell button[aria-haspopup='dialog']`,
a selector that says "the button that opens a dialog" — the filter funnel today,
anything tomorrow. Each also guarantees a visual contract `button` cannot
express; see the anatomy note above for why, and INV5's exception. The precedent
is `toggle-button`.

**DEC-2 — a colour on `table-sort-button` is routed to the glyph and dropped
from the control.** The sort control holds the column name as well as the glyph,
and the name belongs to the header cell, so the colour cannot land on the button
itself: `theming.derived` maps `color` onto the private
`--_table-sort-glyph-color` with `replaces: true`. `table-filter-button` needs no
such routing — that control holds nothing but its funnel.

**DEC-3 — both controls are built on `Button`/`IconButton`.** They previously
restated Button's rest, hover, pressed, focus-ring, press-transform and
reduced-motion behaviour on native buttons, which is drift waiting to happen.
The visible consequences are listed under Compatibility and are intentional.

**DEC-4 — the resting `opacity: 0.35` is removed as an accessibility fix**, not
a preference: it put both affordances at 1.57:1 against the header where WCAG
1.4.11 asks 3:1. The sorted state still changes glyph as well as colour, so the
state is never colour alone.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, module-local API or
generated anatomy, plugin usage recipes, container-padding mechanics, shared
modality rules, current audit results, or implementation steps. It links to their
owners.
