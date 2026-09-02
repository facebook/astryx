---
schema_version: 3
template_version: 1
kind: module
id: module:Table/useTableRowStatus
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-01
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  - packages/core/src/Table/plugins/rowStatus/useTableRowStatus.test.tsx
  - scripts/check-knowledge.mjs
parent_component: component:Table
references:
  - component:Icon
  - architecture:component-theming-surface
  - architecture:icon-resolution-and-component-slots
  - architecture:public-component-api
  - architecture:knowledge-contracts
  - spec:AST-002/DEC-6
---

# useTableRowStatus module contract

## Intent

`useTableRowStatus` adds an optional generated status gutter with one semantic outcome or caller-defined marker per Table row. This current contract owns that module behavior; runtime, public types, consumer docs, and implementation evidence remain pending and must conform when they land.

## Compatibility and migration

- Released default preserved: `yes`; stable `0.5.2` `{color, label}` dots and `{color, icon, label}` caller-selected glyphs keep their source and behavior.
- Compatibility class: additive `TableSemanticRowStatus` at `getStatus`; exported `TableRowStatus` remains byte-for-byte unchanged.
- Migration decision: no stable-consumer edit or codemod. Canary adopters of [#5671](https://github.com/facebook/astryx/pull/5671)'s implicit glyph migrate manually from `color` to `status`.

If semantic implementation misses the next stable cut, restore stable custom-marker behavior first. This documentation-only compaction changes no runtime, API, consumer docs, or package version and has no Changeset.

## Ownership boundary

**Owns**

- The hook/config, unchanged custom interface, separate semantic interface, callback-only exclusive union, and `icon | dot` resolution.
- The 28px generated column, semantic mapping, invalid-input precedence, accessibility, migration, and implementation evidence.

**Does not own / non-goals**

- Parent plugin protocol/order/identity — owned by [Table](../../Table.spec.md).
- Icon artwork/resolution/target, theme token values, or shared accessibility/platform evidence rules — owned by linked records.
- Public `variant`/`presentation`, reflected variant axis, component-icon slot, direct `table-row-status` target, product meaning for custom paint or glyph, or shared design-feedback vocabulary; a Table row outcome is not feedback-component authority.

## Public API and concepts

```ts
export interface TableRowStatus {
  color: TableRowStatusColor | (string & {});
  icon?: IconName;
  label: string;
}

export interface TableSemanticRowStatus {
  status: 'success' | 'warning' | 'error';
  color?: never;
  icon?: never;
  label: string;
}

export interface UseTableRowStatusConfig<T extends Record<string, unknown>> {
  getStatus: (
    item: T,
  ) => (TableRowStatus & {status?: never}) | TableSemanticRowStatus | null;
}
```

`TableRowStatusColor` and its `string & {}` escape hatch remain unchanged and are not newly exported. The standalone interface stays extendable and augmentation-compatible; exclusivity exists only at `getStatus`.

| Concept          | Contract                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Semantic outcome | `success`, `warning`, or `error` derives one matching shared glyph and semantic tone.                |
| Custom marker    | `color` controls paint only; absent `icon` means dot and present `icon` means caller-selected glyph. |
| Resolved variant | Internal `icon` or `dot`, derived by the module and never caller- or theme-selected.                 |
| Label/presence   | Required `label` names every marker; `null` leaves the generated cell empty.                         |

## Behavioral contract

| ID   | Invariant                                                                                                                                                                                                 |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1  | Stable `getStatus` returns one stable `TablePlugin` contributing only `transformColumns`.                                                                                                                 |
| FR2  | At its parent-owned position, the module prepends one fixed 28 CSS-pixel, non-resizable column with a localized visually hidden header name; `null` renders an empty cell.                                |
| FR3  | Stable custom `color` is paint-only, including `success`, `warning`, and `error`; no `icon` renders the dot and explicit `icon` renders that glyph with caller-selected paint.                            |
| FR4  | Semantic status derives the matching shared Icon name and active-theme semantic tone; custom `color` and `icon` are forbidden.                                                                            |
| FR5  | Internal variant is `icon` for semantic status or explicit custom icon and `dot` for custom color without icon; it is not public or theme API.                                                            |
| FR6  | Only the callback boundary intersects the custom branch with `{status?: never}`; the exported stable interface is not narrowed.                                                                           |
| FR7  | For untyped supported `status` plus `color` and/or `icon`, status wins, custom fields are ignored, development warns once per loaded module instance, and production renders identically without warning. |
| FR8  | The outer indicator has one accessible image name from `label`; nested Icon is decorative and tooltip text is supplemental.                                                                               |
| FR9  | Semantic statuses provide distinguishable glyphs as a non-color cue. A custom dot promises paint and a programmatic label, not a shared semantic outcome or visual non-color cue.                         |
| FR10 | The module prepends to columns received at its resolved parent position and composes with selection, expansion, grouping, empty data, and custom plugins without defining or depending on another order.  |

### Transformation and precedence order

- `null` means no marker; supported `status` resolves before custom fields. Invalid untyped mixtures keep the semantic result and deduped warning; otherwise custom `color` chooses paint and `icon` presence chooses glyph or dot.
- Semantic names use shared Icon/theme resolution. The theme supplies artwork and tokens, not internal variant.

### Performance and resources

- **PR1 — Constant row work.** Resolution is constant per row and adds no measurement, listener, observer, timer, or asynchronous resource.
- **PR2 — Stable identity.** Stable `getStatus` preserves plugin identity; semantic resolution MUST NOT rerender unchanged rows solely because input moved from `color` to `status`.
- **PR3 — Existing theme path.** Semantic glyph/tone resolution uses the synchronous shared Icon/theme path, not a parallel registry or per-row subscription.
- **PR4 — Warning bound.** Diagnostics retain only module-level boolean-equivalent dedupe state and warn at most once per loaded module instance.

## Accessibility contract

- **AR1 — Named gutter.** The visually blank generated column header MUST keep one localized accessible name.
- **AR2 — One indicator name.** Every non-null result MUST expose exactly one image name from `label`; nested Icon remains decorative.
- **AR3 — Semantic non-color cue.** Semantic outcomes MUST use distinguishable shared glyphs plus tone across supported themes and forced-colors behavior.
- **AR4 — Honest custom contract.** A custom dot promises caller-selected paint and a programmatic label, not visual meaning without color.
- **AR5 — Supplemental tooltip.** Tooltip may repeat `label`, but the indicator name MUST suffice without opening it; the current non-focusable tooltip is not keyboard evidence.
- **AR6 — Row context.** AT verification MUST encounter the named status in row context without duplicate announcements.

Browser, forced-colors, tooltip-modality, and AT evidence follow the shared [Accessibility Checklist](https://github.com/facebook/astryx/wiki/Accessibility-Checklist) and remain pending with implementation.

## Design relationships

| Anatomy/state                        | Representation authority                                                   |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Generated column and outer indicator | This module; relative order belongs to `component:Table`.                  |
| Semantic `icon`                      | This module selects status meaning; `component:Icon` renders the glyph.    |
| Custom `icon`                        | Caller selects glyph and meaning; this module delegates rendering to Icon. |
| Custom `dot`                         | This module renders caller-selected paint only.                            |
| Invalid untyped mixture              | This module preserves semantic cohesion and bounds diagnostics.            |

No direct target or variant selector is approved, so this record has no `anatomy-theming:v1` block. [#5754](https://github.com/facebook/astryx/pull/5754) remains held outside this contract; any direct target needs a separate AST-002 proposal proving theme-author need, painter placement, and exact guarantees.

## Parent and system relationships

- [Table](../../Table.spec.md) owns the shared plugin protocol and aggregate order.
- [Icon](../../../Icon/Icon.spec.md) and [icon resolution](../../../../../../docs/architecture/icon-resolution-and-component-slots.md) own glyph presentation and shared-name artwork resolution; this module creates no Table-specific slot.
- [AST-002 DEC-6](../../../../../../docs/specs/AST-002/spec.md#dec-6--public-inputs-keep-one-semantic-responsibility) and [public API](../../../../../../docs/architecture/public-component-api.md) own input coherence and released compatibility.
- [Component theming](../../../../../../docs/architecture/component-theming-surface.md) owns target admission; [knowledge contracts](../../../../../../docs/architecture/knowledge-contracts.md) own this module/parent split and current authority.

## Verification map

| Contract             | Binding implementation evidence                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1-FR2, FR10        | Extend [useTableRowStatus.test.tsx](./useTableRowStatus.test.tsx) for fixed metadata, `null`, empty/grouped rows, selection/expansion, and parent-order permutations.                                                                                                                                                                                                       |
| FR3-FR6              | Add public-subpath compile fixtures for unchanged interface extension/merging, semantic exports, callback exclusivity, required labels, unknown statuses, and forbidden mixtures.                                                                                                                                                                                           |
| FR3-FR5              | Extend [useTableRowStatus.test.tsx](./useTableRowStatus.test.tsx) for semantic-looking custom colors, raw/palette dots, custom icons, all semantic statuses, and theme substitution.                                                                                                                                                                                        |
| FR7, precedence, PR4 | Test repeated mixed objects in development and production: status wins, custom fields do not affect output, and only development warns once per loaded module.                                                                                                                                                                                                              |
| AR1-AR6              | Keep current role/name assertions, then add browser axe, forced-colors, tooltip-modality, and VoiceOver row-navigation evidence across semantic glyphs, custom glyph/dot, `null`, light/dark, and shipped themes.                                                                                                                                                           |
| PR1-PR3              | Extend [Table.perf.test.tsx](../../Table.perf.test.tsx) with semantic/custom initial and no-op updates; fail on new resources, a parallel registry, or representative budget regression.                                                                                                                                                                                    |
| Ownership            | Current [source](./useTableRowStatus.tsx) and [tests](./useTableRowStatus.test.tsx) prove the canary baseline, including the color overload FR3/DEC-3 require reverting; they do not prove the approved target behavior. [check-knowledge.mjs](../../../../../../scripts/check-knowledge.mjs) binds record identity. Implementation and browser/AT evidence remain pending. |

## Decision log

| Decision                               | Approved direction                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module:Table/useTableRowStatus/DEC-1` | **Preserve the custom interface; union only at the callback boundary.** Owner cixzhang, 2026-09-01. Keep `TableRowStatus` byte-for-byte stable and extendable; export the semantic interface and form the exclusive union only in `getStatus`. |
| `module:Table/useTableRowStatus/DEC-2` | **Derive variant and delegate semantic artwork.** Owner cixzhang, 2026-09-01. Derive internal `icon` or `dot`; status selects shared meaning/tone, theme supplies artwork/tokens, and custom markers keep caller paint/glyph.                  |
| `module:Table/useTableRowStatus/DEC-3` | **Stable behavior wins over the canary overload.** Owner cixzhang, 2026-09-01. Preserve stable `0.5.2` markers without codemod; revert #5671's color overload before stable and migrate only canary adopters.                                  |
| `module:Table/useTableRowStatus/DEC-4` | **Direct row-status theming is not approved.** Owner cixzhang, 2026-09-01. Use Icon's existing target/theme paths and hold #5754 until a separate AST-002 proposal justifies a target and guarantees.                                          |
| `module:Table/useTableRowStatus/DEC-5` | **Supported semantic status wins invalid untyped mixtures.** Owner cixzhang, 2026-09-01. Resolve status, ignore custom fields, warn once per loaded module in development, and render identically without warning in production.               |

## Open questions

None. All module-local judgments are approved; implementation and evidence remain pending.

## Content boundary

Consumer syntax/examples, parent protocol, shared Icon/theme/accessibility rules, audit history, and implementation steps remain with linked owners.
