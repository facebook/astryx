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
  - packages/core/src/Table/Table.test.tsx
  - packages/core/src/Table/Table.perf.test.tsx
  - packages/core/src/Table/plugins/selection/useTableSelection.test.tsx
  - packages/core/src/Table/plugins/sortable/useTableSortable.test.tsx
  - packages/core/src/Table/plugins/rowExpansion/useTableRowExpansion.test.tsx
  - packages/cli/foundation/discovery/theming-targets.test.mjs
  - packages/cli/api/theme/targets/targets.test.mjs
  - packages/core/src/theme/themingTargets.test.ts
  - scripts/check-knowledge.mjs
modules: [module:Table/useTableRowStatus]
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:interaction-modality,
    architecture:knowledge-contracts,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Table component contract

## Intent

Table presents structured data in semantic rows and columns. This aggregate contract owns Table anatomy, the eight current Table targets, and the shared `TablePlugin` protocol; independently contractible plugin behavior stays in each listed `module:*` record.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: documentation-only; runtime, DOM, styling, targets, aliases, public API, and controlled/uncontrolled behavior are unchanged
- Migration decision: none

## Ownership boundary

**Owns**

- Aggregate Table, Scroll region, section, Row, Column header cell, Cell, stable plugin-part anatomy, and the current target map below.
- Shared `TablePlugin` transforms, slots, ordering, composition, failure isolation, context nesting, and resolved-array identity.

**Does not own / non-goals**

- Caller content or delegated CheckboxInput, Icon, and EmptyState internals.
- Pagination, filtering, column management, tree, grouping, sticky-column, context-menu, or other plugin anatomy beyond the stable parts recorded here.
- Module-local API, generated anatomy, precedence, accessibility, migration, or evidence. [The row-status module](./plugins/rowStatus/useTableRowStatus.spec.md) owns those for `useTableRowStatus`.
- New runtime behavior, DOM, API, targets, aliases, or correction of current reachability gaps.

## Public concepts

| Concept           | Contract                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Plugin collection | Data-driven Table accepts an optional named `Record<string, TablePlugin<T>>`; consumer syntax remains in [Table.doc.mjs](./Table.doc.mjs). |
| Plugin transform  | A plugin may implement any subset of the shared column, element, wrapper, or context transforms; omitted methods are no-ops.               |

## Behavioral and layout contract

- **FR1 — Aggregate structure.** Styled Table renders one keyboard-focusable Scroll region around one semantic Table. Data-driven mode always generates Body, generates Header with Column header cells when columns exist, renders each item as a standard Row with Cells, and never generates Footer; children mode passes caller-owned section composition through, including optional Footer. Empty data renders the default compact EmptyState unless caller content replaces it or `false` disables it.
- **FR2 — Stable plugin anatomy.** A sortable column always gets a Sort control around its label and an Icon-delegated glyph; numeric priority appears only when multi-sort is enabled with multiple active entries. Selection contributes CheckboxInput-delegated header/body controls; expansion contributes its control, Icon-delegated glyph, and conditional detail panel. These are aggregate parts, not parent ownership of module internals.
- **FR3 — Shared protocol.** Each applicable non-context transform runs sequentially in resolved plugin-array order and receives the prior successful result. A throwing transform reports a development error and leaves that prior result in the pipeline.
- **FR4 — Invalid plugins.** Development warns for unknown transform keys, non-function transform values, and empty plugins. Unknown keys are ignored; invoked invalid transforms remain isolated by FR3.
- **FR5 — Expansion gap.** The detail panel spans the column count captured when expansion runs `transformColumns`; a later custom column transform can make that `colSpan` stale. The existing full-span test covers only expansion receiving the final columns; this current correctness gap is recorded, not fixed.

### Allowed variation

Rendering mode, row/column counts, caller content, optional sections and plugin parts, and delegated internals may vary without creating aggregate anatomy or changing the shared protocol. Data-driven rows, empty data, children composition, and one or many named plugins must preserve FR1-FR5; module-specific states remain with their module contracts.

### Transformation and precedence order

- **ORD1 — Plugin array.** Built-in styling runs first. Known names resolve as `columnSettings → sort → tree → selection → pagination`; unknown names follow in record insertion order when a new array is resolved.
- **ORD2 — Phase order.** `transformColumns` completes before table, header-cell, header-row, body-cell, body-row, and scroll-wrapper transforms at their render points. Header cells compose `before`, `content`, `after`, `overlay`, and `below`.
- **ORD3 — Context order.** Context transforms run in reverse array order, making the first plugin the outermost provider.
- **ORD4 — Module boundary.** Modules may depend on this protocol but must not redefine relative plugin or phase order.

### Performance and resources

- **PR1 — Stable plugin array.** Table reuses the resolved array while the built-in array and named plugin key/value identities are unchanged, including a recreated or reordered containing record; a new array preserves unknown-plugin insertion order.
- **PR2 — Resource ownership.** Table owns common array and transform-pipeline cost. Each module owns any stronger render, allocation, listener, observer, or initialization constraint introduced by its transforms.

## Accessibility contract

Table MUST preserve native table semantics, the focusable Scroll region, column-header scope, sort `aria-sort`, selection `aria-selected`, CheckboxInput labels, and expansion `aria-expanded`. Each module owns accessibility introduced by its transforms; the shared pipeline does not make module output correct. Shared platform behavior remains with [interaction modality](../../../../docs/architecture/interaction-modality.md).

## Design relationships

[Table.doc.mjs](./Table.doc.mjs) owns the aggregate consumer anatomy. This map records each current part's exact target, inheritance, delegation, or factual lack of reachability.

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
      "reason": "unsettled: The multi-sort rank has no direct public target and future exposure still needs an owner decision"
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
      "reason": "unsettled: The expansion button has no direct public target and future exposure still needs an owner decision"
    }
  },
  "Expansion glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Expanded detail panel": {
    "none": {
      "reason": "reachability-gap: The raw detail row and cell are not reached by the current table-row and table-cell targets"
    }
  },
  "Footer section": {"target": "table-footer"}
}
```

The deprecated `base-table` alias is compatibility, not anatomy. Member docs keep `subComponentOf: 'Table'`; they do not become independent contract owners.

## Family and system relationships

- [Component theming](../../../../docs/architecture/component-theming-surface.md) owns target qualification and mapping; [container padding](../../../../docs/architecture/container-padding.md), [public API](../../../../docs/architecture/public-component-api.md), [interaction modality](../../../../docs/architecture/interaction-modality.md), and [knowledge contracts](../../../../docs/architecture/knowledge-contracts.md) own their shared boundaries.
- [The row-status module](./plugins/rowStatus/useTableRowStatus.spec.md) owns its API, generated anatomy, resolution, accessibility, migration, and evidence. Table owns only the common protocol and aggregate ordering.

## Verification map

| Contract           | Binding evidence and current limit                                                                                                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1-FR2            | [Table.test.tsx](./Table.test.tsx), [sortable](./plugins/sortable/useTableSortable.test.tsx), [selection](./plugins/selection/useTableSelection.test.tsx), and [expansion](./plugins/rowExpansion/useTableRowExpansion.test.tsx) cover structure, controls, state, and ARIA; delegated glyph/target placement remains source-inspected. |
| FR3-FR4, ORD1-ORD4 | [types.ts](./types.ts), [BaseTable.tsx](./BaseTable.tsx), [useBaseTablePlugins.ts](./useBaseTablePlugins.ts), and [Table.test.tsx](./Table.test.tsx) bind composition; complete known-name/phase/context order and exception continuation remain source-inspected.                                                                      |
| FR5                | [useTableRowExpansion.tsx](./plugins/rowExpansion/useTableRowExpansion.tsx) and its [tests](./plugins/rowExpansion/useTableRowExpansion.test.tsx) bind captured-count behavior; later column transforms remain an uncovered stale-`colSpan` gap.                                                                                        |
| PR1-PR2            | [Table.perf.test.tsx](./Table.perf.test.tsx) binds representative no-op row budgets; named-record identity and module-specific resources retain their stated owners.                                                                                                                                                                    |
| Target map         | [Table.doc.mjs](./Table.doc.mjs), [check-knowledge.mjs](../../../../scripts/check-knowledge.mjs), and the target tests in `verified_by` bind parent ownership; section target placement remains source-inspected.                                                                                                                       |
| Module backlink    | [check-knowledge.mjs](../../../../scripts/check-knowledge.mjs) rejects a missing, duplicate, mis-parented, misnamed, or undiscovered module record.                                                                                                                                                                                     |

## Decision log

None. This current record preserves existing aggregate ownership and shared plugin behavior without adding a component-local decision.

## Open questions

None.

## Content boundary

Consumer props/examples, module-local behavior, shared rules, audit results, and implementation detail remain with their linked owners.
