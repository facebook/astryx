# useXDSTableFiltering — Plugin Specification

> **Status:** Draft · **Target:** XDS OSS · **Issue:** #978
> **Author:** spec-generated · **Date:** 2026-03-30

---

## Table of Contents

1. [WWW Reference Analysis](#1-www-reference-analysis)
2. [XDS OSS Plugin API (TypeScript)](#2-xds-oss-plugin-api-typescript)
3. [Behavioral Specification](#3-behavioral-specification)
4. [Competitive Analysis](#4-competitive-analysis)
5. [XDS Component Dependencies](#5-xds-component-dependencies)
6. [Test Specification](#6-test-specification)

---

## 1. WWW Reference Analysis

### WWW API Surface

```flow
hook useXDSTableFiltering<TColumnKey, TValue>({
  getValue: TColumnKey => TValue | null,
  onChange: (TColumnKey, TValue) => unknown,
  variant?: 'default' | 'always-visible' | 'always-visible-compact',
}): XDSTableFiltering<any, TColumnKey>
```

**Plugin integration:** Uses `transformHeaderCell` to inject filter UI into or below header cells.

**Variant modes:**

| Variant | Behavior |
|---|---|
| `'default'` | Funnel icon in header; clicking opens dropdown/popover with filter controls |
| `'always-visible'` | Filter input rendered directly below header text (inline in header cell) |
| `'always-visible-compact'` | Same as always-visible but with compact sizing |

**Filter types (configured per-column via `filtering_EXPERIMENTAL`):**

| Type | Control | Description |
|---|---|---|
| `'selector'` | Single-select dropdown | Pick one value from a list |
| `'multi-selector'` | Multi-select checkboxes | Pick multiple values; optional select-all |
| `'searchable-selector'` | Typeahead single-select | Search + pick one |
| `'searchable-multi-selector'` | Typeahead multi-select | Search + pick multiple |
| `'text-input'` | Free text field | Free-form text search |
| `'number-search-input'` | Numeric field | Search by exact number |
| `'number-min-max-input'` | Two numeric fields | Range filter (min/max) |
| `'date-range'` | Date range picker | Temporal filter (dates) |
| `'datetime-range'` | Datetime range picker | Temporal filter (datetime) |
| `'time-range'` | Time range picker | Temporal filter (times) |

**State management:**

- Consumer provides `getValue(columnKey)` to read current filter value for a column
- Consumer provides `onChange(columnKey, value)` to handle filter changes
- `value` is `null` when filter is cleared
- Filter TYPE is on the column definition, not the plugin config

**Visual behaviors:**

- Default variant: funnel icon in header cell; icon is accent-colored when filter has a value
- Clicking active funnel icon calls `onChange(key, null)` to clear the filter
- Always-visible variant: filter input rendered below header text
- Columns without filter config: render empty placeholder in always-visible mode

### XDS OSS Approach vs. WWW

1. **Phase 1 scope:** Support `'text'`, `'number'`, `'number-range'`, `'selector'`, `'multi-selector'` filter types. Date/time filters deferred (XDS OSS lacks date picker component).
2. **Typed filter values:** Each filter type has a specific TypeScript value type (string, number, range object, string[], etc.) rather than generic `TValue`.
3. **Variant naming:** `'popover'` (instead of `'default'`) and `'inline'` (instead of `'always-visible'`). Clearer intent.
4. **Options source:** Selector filter options provided per-column, not derived from data. Consumer controls options.

---

## 2. XDS OSS Plugin API (TypeScript)

### Type Definitions

```typescript
// =============================================================================
// Filter Value Types
// =============================================================================

/**
 * Value types for each filter kind.
 * Each filter type has a specific value shape — no generic `unknown`.
 */

/** Text filter: free-form string search */
export type XDSTableFilterTextValue = string;

/** Number filter: exact numeric match */
export type XDSTableFilterNumberValue = number;

/** Number range filter: min/max bounds (either or both may be set) */
export interface XDSTableFilterNumberRangeValue {
  min?: number;
  max?: number;
}

/** Selector filter: single selected value */
export type XDSTableFilterSelectorValue = string;

/** Multi-selector filter: set of selected values */
export type XDSTableFilterMultiSelectorValue = string[];

/** Union of all filter value types */
export type XDSTableFilterValue =
  | XDSTableFilterTextValue
  | XDSTableFilterNumberValue
  | XDSTableFilterNumberRangeValue
  | XDSTableFilterSelectorValue
  | XDSTableFilterMultiSelectorValue;

// =============================================================================
// Filter Type Discriminated Union (per-column config)
// =============================================================================

/**
 * Option for selector-based filters.
 */
export interface XDSTableFilterOption {
  /** The value stored when this option is selected */
  value: string;
  /** Display label. Defaults to `value` if omitted. */
  label?: string;
  /** Optional icon component */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/**
 * Text filter — free-form text input.
 */
export interface XDSTableFilterTypeText {
  type: 'text';
  /** Placeholder text for the input. @default 'Filter...' */
  placeholder?: string;
}

/**
 * Number filter — numeric input for exact match.
 */
export interface XDSTableFilterTypeNumber {
  type: 'number';
  /** Placeholder text. @default 'Filter...' */
  placeholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
}

/**
 * Number range filter — two numeric inputs for min/max bounds.
 */
export interface XDSTableFilterTypeNumberRange {
  type: 'number-range';
  /** Placeholder for min input. @default 'Min' */
  minPlaceholder?: string;
  /** Placeholder for max input. @default 'Max' */
  maxPlaceholder?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
}

/**
 * Selector filter — single-select dropdown.
 */
export interface XDSTableFilterTypeSelector {
  type: 'selector';
  /** Available options */
  options: XDSTableFilterOption[];
  /** Placeholder when no value is selected. @default 'All' */
  placeholder?: string;
}

/**
 * Multi-selector filter — multi-select checkboxes.
 */
export interface XDSTableFilterTypeMultiSelector {
  type: 'multi-selector';
  /** Available options */
  options: XDSTableFilterOption[];
  /** Show a "Select all" option. @default true */
  hasSelectAll?: boolean;
  /** Enable typeahead search within options. @default false */
  isSearchable?: boolean;
  /** Placeholder when no values are selected. @default 'All' */
  placeholder?: string;
}

/**
 * Discriminated union of all filter type configs.
 */
export type XDSTableFilterType =
  | XDSTableFilterTypeText
  | XDSTableFilterTypeNumber
  | XDSTableFilterTypeNumberRange
  | XDSTableFilterTypeSelector
  | XDSTableFilterTypeMultiSelector;

// =============================================================================
// Column Extension
// =============================================================================

/**
 * Added to XDSTableColumn<T> in types.ts.
 */
export interface XDSTableColumn<T extends Record<string, unknown>> {
  // ... existing fields ...

  /**
   * Filter configuration for this column.
   * Defines the filter type, options, and constraints.
   * Omit to make the column non-filterable.
   *
   * @example
   * ```
   * // Text filter
   * { key: 'name', header: 'Name', filter: { type: 'text' } }
   *
   * // Selector filter
   * { key: 'status', header: 'Status', filter: {
   *   type: 'selector',
   *   options: [
   *     { value: 'active', label: 'Active' },
   *     { value: 'inactive', label: 'Inactive' },
   *   ],
   * }}
   *
   * // Number range filter
   * { key: 'age', header: 'Age', filter: { type: 'number-range', min: 0, max: 120 } }
   * ```
   */
  filter?: XDSTableFilterType;
}

// =============================================================================
// Filter State Map
// =============================================================================

/**
 * Complete filter state — a map from column key to filter value.
 * Missing keys or `undefined` values mean "no filter applied" for that column.
 *
 * The value type depends on the filter type configured on the column:
 * - `'text'` → `string`
 * - `'number'` → `number`
 * - `'number-range'` → `{ min?: number; max?: number }`
 * - `'selector'` → `string`
 * - `'multi-selector'` → `string[]`
 *
 * @example
 * ```
 * const filters: XDSTableFilterState = {
 *   name: 'alice',                    // text filter
 *   status: 'active',                 // selector filter
 *   age: { min: 18, max: 65 },        // number-range filter
 *   tags: ['admin', 'user'],          // multi-selector filter
 * };
 * ```
 */
export type XDSTableFilterState = Record<string, XDSTableFilterValue | undefined>;

// =============================================================================
// Hook Config
// =============================================================================

/**
 * Display variant for the filter UI.
 *
 * - `'popover'` — filter icon in header; clicking opens a popover with the filter control
 * - `'inline'` — filter control rendered directly below header text inside the header cell
 * - `'inline-compact'` — same as inline but with compact-sized controls
 */
export type XDSTableFilterVariant = 'popover' | 'inline' | 'inline-compact';

/**
 * Configuration for useXDSTableFiltering.
 *
 * Follows XDS headless plugin conventions: the consumer owns all filter state
 * and provides callbacks. The plugin never holds internal filter state.
 *
 * @example
 * ```
 * const [filters, setFilters] = useState<XDSTableFilterState>({});
 *
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange: (columnKey, value) => {
 *     setFilters(prev => {
 *       const next = { ...prev };
 *       if (value == null) {
 *         delete next[columnKey];
 *       } else {
 *         next[columnKey] = value;
 *       }
 *       return next;
 *     });
 *   },
 * });
 *
 * <XDSTable plugins={{ filter: filterPlugin }} ... />
 * ```
 */
export interface UseXDSTableFilteringConfig {
  /**
   * Current filter state — map from column key to filter value.
   * Missing/undefined keys = no filter applied for that column.
   */
  filters: XDSTableFilterState;

  /**
   * Called when the user changes a filter value.
   *
   * @param columnKey - The column key whose filter changed
   * @param value - The new filter value, or `null` to clear the filter
   */
  onFilterChange: (columnKey: string, value: XDSTableFilterValue | null) => void;

  /**
   * Display variant for filter controls.
   *
   * - `'popover'` — icon button in header; filter opens in popover (default)
   * - `'inline'` — filter rendered below header text directly in the cell
   * - `'inline-compact'` — inline with compact-sized controls
   *
   * @default 'popover'
   */
  variant?: XDSTableFilterVariant;
}
```

### Hook Signature

```typescript
/**
 * useXDSTableFiltering — table plugin for column filtering.
 *
 * Returns a stable TablePlugin<T> that transforms header cells to add
 * filter controls. Follows the headless pattern: consumer owns filter state,
 * plugin provides UI and interaction.
 *
 * Filter types are configured per-column via the `filter` field on
 * XDSTableColumn<T>. The plugin reads filter config from columns and
 * renders the appropriate control (text input, selector, etc.).
 *
 * @template T - Row data type
 *
 * @example
 * ```
 * const [filters, setFilters] = useState<XDSTableFilterState>({});
 *
 * const filterPlugin = useXDSTableFiltering({
 *   filters,
 *   onFilterChange: (key, value) => {
 *     setFilters(prev => ({
 *       ...prev,
 *       [key]: value ?? undefined,
 *     }));
 *   },
 *   variant: 'popover',
 * });
 *
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', filter: { type: 'text' } },
 *     { key: 'status', header: 'Status', filter: {
 *       type: 'selector',
 *       options: [{ value: 'active' }, { value: 'inactive' }],
 *     }},
 *     { key: 'age', header: 'Age', filter: { type: 'number-range', min: 0 } },
 *   ]}
 *   plugins={{ filter: filterPlugin }}
 * />
 * ```
 */
export function useXDSTableFiltering<
  T extends Record<string, unknown>,
>(
  config: UseXDSTableFilteringConfig,
): TablePlugin<T>;
```

### Plugin Transform Strategy

| Transform Method | Used? | Purpose |
|---|---|---|
| `transformTable` | No | — |
| `transformHeaderRow` | No | — |
| `transformHeaderCell` | **Yes** | Injects filter UI (icon/popover or inline controls) into header cells |
| `transformBodyRow` | No | — |
| `transformBodyCell` | No | — |
| `transformTableContext` | **Yes** | Provides filter context so popover filter components can read config without prop drilling |

**Why `transformTableContext`?** The popover variant renders filter controls inside a `<XDSPopover>`. These popover-rendered components need access to `filters` state and `onFilterChange` callback. Rather than closing over stale config, a context provider (backed by a ref, as in the selection plugin) ensures filter components always read the latest config.

### Internal Architecture

```
useXDSTableFiltering(config)
  │
  ├── configRef ← useRef(config)          // Always-fresh config
  │
  ├── filterStoreRef ← useRef(store)      // External store for popover components
  │
  └── useMemo(() => plugin, [store])      // Stable plugin object
        │
        ├── transformTableContext(children)
        │     └── <FilterStoreContext.Provider value={store}>
        │           {children}
        │         </FilterStoreContext.Provider>
        │
        └── transformHeaderCell(props, column)
              │
              ├── column.filter undefined? → return props unchanged
              │     (except in inline variant: render empty placeholder div)
              │
              ├── Read filter value: configRef.current.filters[column.key]
              │
              ├── variant === 'popover'?
              │     └── Inject filter icon button after header content
              │         ├── No active filter → muted funnel icon
              │         ├── Active filter → accent funnel icon (click to clear)
              │         └── Click muted icon → open popover with filter control
              │
              └── variant === 'inline' | 'inline-compact'?
                    └── Append filter control below header content
                        └── <div> with appropriate filter component
```

---

## 3. Behavioral Specification

### 3.1 Popover Variant (`variant: 'popover'`)

#### Filter icon — no active filter

- **Trigger:** Column has `filter` config, `filters[column.key]` is `undefined`/missing.
- **Render:** Muted funnel icon (`color="secondary"`) after header text. Icon visible on hover.
- **Click:** Opens popover anchored to the header cell with the filter control inside.
- **Accessibility:** `<button aria-label="Filter {header}" aria-haspopup="dialog">`.

#### Filter icon — active filter

- **Trigger:** Column has `filter` config, `filters[column.key]` has a value.
- **Render:** Accent-colored funnel icon (`color="accent"`) — always visible (not just hover).
- **Click:** Clears the filter by calling `onFilterChange(column.key, null)`.
- **Accessibility:** `<button aria-label="Clear filter for {header}">`.

#### Popover content

- **Trigger:** Click on muted funnel icon (no active filter) or long-press/right-click on active icon (TBD — initial implementation: click inactive icon only).
- **Render:** `<XDSPopover>` positioned below the header cell, containing the appropriate filter control based on `column.filter.type`.
- **Dismiss:** Click outside, Escape key, or applying a filter value.
- **Accessibility:** `role="dialog"`, `aria-label="Filter {header}"`, focus trapped within popover.

### 3.2 Inline Variant (`variant: 'inline'` or `'inline-compact'`)

#### Filter control — below header text

- **Trigger:** Column has `filter` config.
- **Render:** Filter control rendered directly below the header text inside the `<th>`. Header cell layout becomes vertical (flex-direction: column).
- **Compact:** `'inline-compact'` uses `size="sm"` on all input components.
- **Accessibility:** Input has `aria-label="Filter {header}"`.

#### Non-filterable column in inline mode

- **Trigger:** Column has no `filter` config, variant is `'inline'` or `'inline-compact'`.
- **Render:** Empty placeholder `<div>` with matching height to keep headers aligned.
- **Accessibility:** Placeholder is `aria-hidden="true"`.

### 3.3 Filter Controls by Type

#### `'text'` filter

- **Component:** `XDSTextInput`
- **Props:** `label="Filter {header}"`, `isLabelHidden`, `value={filters[key] ?? ''}`, `placeholder`, `size` (sm for compact, md for inline, sm for popover), `startIcon={searchIcon}`.
- **Behavior:** Calls `onFilterChange(key, value)` on every keystroke. Calls `onFilterChange(key, null)` when cleared to empty string.
- **Debounce:** Not built into plugin. Consumer can debounce in `onFilterChange` if needed.

#### `'number'` filter

- **Component:** `XDSNumberInput`
- **Props:** `label="Filter {header}"`, `isLabelHidden`, `value={filters[key] ?? null}`, `placeholder`, `min`, `max`, `step`, `size`.
- **Behavior:** Calls `onFilterChange(key, value)` on valid number input. Calls `onFilterChange(key, null)` when cleared.

#### `'number-range'` filter

- **Components:** Two `XDSNumberInput` side by side.
- **Layout:** `display: flex; gap: spacing-2`. Labels: "Min" and "Max" (hidden, used as aria-labels).
- **Behavior:** Calls `onFilterChange(key, { min, max })` when either input changes. If both are empty, calls `onFilterChange(key, null)`.

#### `'selector'` filter

- **Component:** `XDSSelector`
- **Props:** `label="Filter {header}"`, `isLabelHidden`, `options`, `value={filters[key] ?? ''}`, `placeholder`, `size`.
- **Behavior:** Calls `onFilterChange(key, selectedValue)` on selection. Selecting placeholder/empty calls `onFilterChange(key, null)`.

#### `'multi-selector'` filter

- **Component:** Custom multi-select built with `XDSPopover` + `XDSCheckboxInput` list.
- **Reason:** `XDSSelector` is single-select only. Multi-select requires a custom control.
- **Layout:**
  - Trigger: button showing selected count or "All" (e.g., "3 selected").
  - Popover content: optional search input (if `isSearchable`), optional "Select all" checkbox (if `hasSelectAll`), list of `XDSCheckboxInput` for each option.
- **Behavior:**
  - Toggling checkbox adds/removes value from array.
  - "Select all" toggles all options on/off.
  - Search filters the visible options (does not affect selection).
  - Calls `onFilterChange(key, selectedValues)` on every toggle. Empty array calls `onFilterChange(key, null)`.
- **Accessibility:** Trigger has `aria-haspopup="dialog"`. Popover has `role="dialog"` with `aria-label="Filter {header}"`. Checkboxes are standard form controls.

### 3.4 Header Cell DOM Structure

#### Popover variant — inactive filter

```html
<th scope="col">
  <div class="xds-filter-header" style="display: flex; align-items: center; justify-content: space-between;">
    <span>Name</span>
    <button
      type="button"
      class="xds-filter-trigger"
      aria-label="Filter Name"
      aria-haspopup="dialog"
    >
      <XDSIcon icon={funnelIcon} size="xsm" color="secondary" />
    </button>
  </div>
</th>
```

#### Popover variant — active filter

```html
<th scope="col">
  <div class="xds-filter-header" style="display: flex; align-items: center; justify-content: space-between;">
    <span>Name</span>
    <button
      type="button"
      class="xds-filter-trigger"
      aria-label="Clear filter for Name"
    >
      <XDSIcon icon={funnelIcon} size="xsm" color="accent" />
    </button>
  </div>
</th>
```

#### Inline variant

```html
<th scope="col">
  <div class="xds-filter-header-inline" style="display: flex; flex-direction: column; gap: 4px;">
    <span>Name</span>
    <XDSTextInput
      label="Filter Name"
      isLabelHidden
      value="alice"
      placeholder="Filter..."
      size="sm"
    />
  </div>
</th>
```

#### Inline variant — non-filterable column placeholder

```html
<th scope="col">
  <div class="xds-filter-header-inline" style="display: flex; flex-direction: column; gap: 4px;">
    <span>Avatar</span>
    <div class="xds-filter-placeholder" aria-hidden="true" style="height: 32px;" />
  </div>
</th>
```

### 3.5 Styling Details

**Popover variant filter icon button:**

- No visible button chrome (transparent background, no border)
- `cursor: pointer`
- `display: inline-flex; align-items: center; justify-content: center`
- `padding: spacing-1` (small clickable area)
- Inactive: icon visible on header hover only (`opacity: 0` → `opacity: 1` on `th:hover`)
- Active: icon always visible
- Focus-visible: standard XDS focus ring

**Inline variant header cell:**

- `display: flex; flex-direction: column; gap: spacing-1`
- Filter control takes full width of header cell
- Compact variant: inputs use `size="sm"`; standard inline: inputs use `size="md"`

**Popover content:**

- `width: 240px` (default, overridable via future config)
- `padding: spacing-3`
- Contains a single filter control, no title/header (column name is context enough)
- For multi-selector: list is scrollable if >8 options, `max-height: 320px`

### 3.6 Interaction with Sort Plugin

When both `sortable` and `filter` plugins are active on the same column:

**Popover variant:** Sort button wraps header text. Filter icon button is adjacent (after the sort icon). DOM order: `[sort-button: [header-text, sort-icon], filter-icon-button]`.

**Inline variant:** Sort button wraps header text (top). Filter control is below. DOM order: `[sort-button: [header-text, sort-icon], filter-control]`.

**Plugin composition:** The sort plugin transforms first (it's registered first in the plugins record). The filter plugin then receives the already-transformed header cell props and wraps/appends to the existing children. This works because `transformHeaderCell` receives the current `props` (including children from prior plugins) and can wrap/augment them.

**Recommendation:** Document recommended plugin registration order: `{ sort: sortPlugin, filter: filterPlugin }`. Sort transforms header content (wraps in button), filter adds adjacent/below controls.

### 3.7 Edge Cases

| Scenario | Behavior |
|---|---|
| No columns have `filter` config | Plugin is a no-op in popover mode; renders empty placeholders in inline mode (for alignment) |
| `filters` has key not matching any column | Ignored — no visual indicator. State is preserved. |
| Column removed but filter state persists | No crash. Consumer should clean up state. |
| All filter values are empty/undefined | No active filter indicators. All icons muted (popover) or inputs empty (inline). |
| `filters` has wrong value type for column's filter type | Best-effort rendering. Type mismatch may cause input to show unexpected value. Consumer responsibility to match types. |
| Popover variant with empty options for selector | Selector shows placeholder only. No options to select. |
| Multi-selector with all options selected | "Select all" checkbox shows checked. Trigger button shows "All" or full count. |
| Multi-selector with `isSearchable` + search query | Only matching options visible in list. Selection state of hidden options preserved. |
| Inline variant with very long filter placeholder | Text truncated with ellipsis (input has `overflow: hidden; text-overflow: ellipsis`). |
| data is empty or undefined | Filter controls still render in headers. |

---

## 4. Competitive Analysis

### Comparison Matrix

| Feature | WWW XDS | XDS OSS (this spec) | TanStack Table | Mantine DataTable | AG Grid |
|---|---|---|---|---|---|
| **Filter types** | 10 types | 5 types (Phase 1) | Custom (user-defined) | Text only | 20+ built-in |
| **Display modes** | 3 variants | 3 variants | N/A (headless) | Header only | Header + sidebar |
| **State ownership** | External | External | Internal (managed) | Internal | Internal |
| **Plugin architecture** | Transform pipeline | Transform pipeline | Feature system | Monolithic | Monolithic |
| **Multi-select filter** | ✅ | ✅ | User-defined | ❌ | ✅ |
| **Searchable filter** | ✅ | ✅ (multi-selector) | User-defined | ❌ | ✅ |
| **Number range** | ✅ | ✅ | User-defined | ❌ | ✅ |
| **Date filters** | ✅ | ❌ (Phase 2) | User-defined | ❌ | ✅ |
| **Active filter indicator** | Funnel icon | Funnel icon | N/A | N/A | Icon + badge |
| **Clear individual filter** | Click icon | Click icon | User-defined | Clear button | Click icon |
| **Typed filter values** | Generic TValue | Discriminated union | Generic | string | Internal |

### Key Differentiators

**vs. TanStack Table:**
TanStack is headless — it provides sort/filter *state management* but no UI. Consumers must build all filter inputs from scratch. XDS OSS provides both the headless state model AND ready-made filter controls via the plugin. This is a higher-level abstraction: declare `filter: { type: 'selector', options }` on a column, and the plugin renders the entire filter UI.

**vs. Mantine DataTable:**
Mantine only supports basic text filtering via `textFilter` prop. No multi-select, no number range, no popover variant. XDS provides 5 filter types with 3 display variants.

**vs. AG Grid:**
AG Grid has the most comprehensive filtering (20+ filter types, floating filters, filter sidebar). However, it's a monolithic component with a large bundle. XDS achieves the most common filter patterns through a lightweight plugin that tree-shakes unused filter types.

**vs. WWW XDS:**
WWW has more filter types (date ranges, datetime, time) but uses generic `TValue`. XDS OSS uses discriminated union types for type safety — each filter type has a specific value shape. The `'popover'` / `'inline'` naming is clearer than `'default'` / `'always-visible'`.

**XDS OSS advantage:** Composable plugin architecture where filtering, sorting, and selection are independent plugins. Each plugin only touches `transformHeaderCell` (and optionally `transformTableContext`), so they compose cleanly. Type-safe filter values via discriminated unions prevent runtime type mismatches.

---

## 5. XDS Component Dependencies

### Required Components

| Component | Import | Usage | Props Used |
|---|---|---|---|
| `XDSIcon` | `@xds/core` | Filter indicator (funnel icon) | `icon`, `size="xsm"`, `color="secondary"\|"accent"` |
| `XDSPopover` | `@xds/core` | Popover variant filter container | `content`, `placement="below"`, `alignment="start"`, `label`, `width` |
| `XDSTextInput` | `@xds/core` | Text filter control | `label`, `isLabelHidden`, `value`, `onChange`, `placeholder`, `size`, `startIcon` |
| `XDSNumberInput` | `@xds/core` | Number and number-range filter controls | `label`, `isLabelHidden`, `value`, `onChange`, `placeholder`, `min`, `max`, `step`, `size` |
| `XDSSelector` | `@xds/core` | Selector (single-select) filter control | `label`, `isLabelHidden`, `options`, `value`, `onChange`, `placeholder`, `size` |
| `XDSCheckboxInput` | `@xds/core` | Multi-selector filter option checkboxes | `label`, `value` (boolean), `onChange`, `size="sm"` |
| `XDSButton` | `@xds/core` | Multi-selector trigger button (shows count) | `label`, `variant="secondary"`, `size`, `endContent` (chevron icon) |

### Required Icons

| Icon | Purpose | Status |
|---|---|---|
| Funnel / Filter | Filter indicator in popover variant | **MISSING** — needs to be added to XDS icon set |
| Search | `startIcon` for text filter and searchable multi-selector | **EXISTS** — `'search'` in XDSIconName registry |

**Recommendation:** Add `'funnel'` (or `'filter'`) to the XDS icon registry. This is a standard UI icon used widely for filter affordances. Bundle as private SVG if adding to the public icon set is not desired.

### Required Theme Tokens

| Token | Source | Usage |
|---|---|---|
| `spacingVars['--spacing-1']` | `theme/tokens.stylex` | Gap in header layout, icon button padding |
| `spacingVars['--spacing-2']` | `theme/tokens.stylex` | Number-range input gap |
| `spacingVars['--spacing-3']` | `theme/tokens.stylex` | Popover content padding |
| `colorVars['--color-text-secondary']` | `theme/tokens.stylex` | Inactive filter icon color |
| `colorVars['--color-accent']` | `theme/tokens.stylex` | Active filter icon color |

### Missing Prerequisites

| Prerequisite | Impact | Mitigation |
|---|---|---|
| Funnel/filter icon SVG | Blocker for popover variant | Add to icon set or bundle privately |
| Multi-select component | Multi-selector filter needs custom implementation | Build within plugin using XDSPopover + XDSCheckboxInput |
| Sort icon SVGs (arrowUp, arrowDown, arrowUpDown) | Blocker for sort plugin (co-dependency) | See sortable SPEC.md §5 |

### Component Availability Verification

All components listed above exist in `packages/core/src/`:

- `XDSIcon` — ✅ verified at `Icon/XDSIcon.tsx`
- `XDSPopover` — ✅ verified at `Popover/XDSPopover.tsx`
- `XDSTextInput` — ✅ verified at `TextInput/XDSTextInput.tsx`
- `XDSNumberInput` — ✅ verified at `NumberInput/XDSNumberInput.tsx`
- `XDSSelector` — ✅ verified at `Selector/XDSSelector.tsx` (single-select only)
- `XDSCheckboxInput` — ✅ verified at `CheckboxInput/XDSCheckboxInput.tsx`
- `XDSButton` — ✅ verified at `Button/XDSButton.tsx`

---

## 6. Test Specification

### Rendering Tests — Popover Variant

| Test | What It Verifies |
|---|---|
| `renders filter icon for filterable columns (popover)` | Filterable columns show funnel icon; non-filterable do not |
| `renders muted icon when no active filter` | Inactive funnel icon uses secondary color |
| `renders accent icon when filter has value` | Active funnel icon uses accent color |
| `does not render filter UI for columns without filter config` | Non-filterable columns unchanged |
| `renders filter icons when data is empty` | Headers show filter UI with empty/undefined data |

### Rendering Tests — Inline Variant

| Test | What It Verifies |
|---|---|
| `renders text input below header for text filter (inline)` | XDSTextInput appears below header text |
| `renders selector below header for selector filter (inline)` | XDSSelector appears below header text |
| `renders number input below header for number filter (inline)` | XDSNumberInput appears below header text |
| `renders two number inputs for number-range filter (inline)` | Min and max XDSNumberInput rendered side by side |
| `renders placeholder for non-filterable columns (inline)` | Empty div with matching height rendered for alignment |
| `uses compact size for inline-compact variant` | Filter controls use size="sm" |

### Rendering Tests — Filter Controls

| Test | What It Verifies |
|---|---|
| `text filter shows current value from filters state` | XDSTextInput value matches `filters[key]` |
| `number filter shows current value from filters state` | XDSNumberInput value matches `filters[key]` |
| `number-range filter shows min and max from filters state` | Both inputs match `filters[key].min` and `filters[key].max` |
| `selector filter shows selected value from filters state` | XDSSelector value matches `filters[key]` |
| `multi-selector shows selected count on trigger` | Button shows "N selected" based on `filters[key].length` |

### Interaction Tests — Popover Variant

| Test | What It Verifies |
|---|---|
| `clicking inactive filter icon opens popover` | Popover with filter control appears |
| `clicking active filter icon clears filter` | `onFilterChange(key, null)` called |
| `popover closes on Escape` | Popover dismissed, focus returns to icon |
| `popover closes on click outside` | Popover dismissed |

### Interaction Tests — Text Filter

| Test | What It Verifies |
|---|---|
| `typing in text filter calls onFilterChange` | Each keystroke calls `onFilterChange(key, value)` |
| `clearing text filter calls onFilterChange with null` | Empty string → `onFilterChange(key, null)` |

### Interaction Tests — Number Filter

| Test | What It Verifies |
|---|---|
| `entering number calls onFilterChange` | Valid number → `onFilterChange(key, number)` |
| `clearing number filter calls onFilterChange with null` | Empty → `onFilterChange(key, null)` |
| `respects min/max constraints` | Input constrained to configured bounds |

### Interaction Tests — Number Range Filter

| Test | What It Verifies |
|---|---|
| `changing min calls onFilterChange with updated range` | `onFilterChange(key, { min: newMin, max: existingMax })` |
| `changing max calls onFilterChange with updated range` | `onFilterChange(key, { min: existingMin, max: newMax })` |
| `clearing both inputs calls onFilterChange with null` | Both empty → `onFilterChange(key, null)` |

### Interaction Tests — Selector Filter

| Test | What It Verifies |
|---|---|
| `selecting option calls onFilterChange` | `onFilterChange(key, selectedValue)` |
| `selecting placeholder/empty clears filter` | `onFilterChange(key, null)` |

### Interaction Tests — Multi-Selector Filter

| Test | What It Verifies |
|---|---|
| `toggling checkbox adds value to selection` | `onFilterChange(key, [...existing, newValue])` |
| `toggling checkbox removes value from selection` | `onFilterChange(key, existing.filter(...))` |
| `select all checks all options` | `onFilterChange(key, allValues)` |
| `deselect all unchecks all options` | `onFilterChange(key, null)` |
| `search filters visible options but preserves selection` | Hidden options remain in `filters[key]` |
| `clearing all values calls onFilterChange with null` | Empty array → `onFilterChange(key, null)` |

### Accessibility Tests

| Test | What It Verifies |
|---|---|
| `filter icon button has aria-label (popover)` | `aria-label="Filter {header}"` on inactive; `"Clear filter for {header}"` on active |
| `filter icon button has aria-haspopup (popover)` | `aria-haspopup="dialog"` on inactive filter button |
| `popover has role="dialog" and aria-label` | Correct dialog semantics |
| `inline filter input has aria-label` | `aria-label="Filter {header}"` |
| `placeholder div is aria-hidden (inline)` | Non-filterable column placeholder has `aria-hidden="true"` |
| `focus trapped in popover when open` | Tab cycles within popover content |
| `Escape closes popover and returns focus` | Focus returns to trigger button |
| `filter controls are keyboard accessible` | Tab into inline filters; Enter/Space on selector options |

### Edge Case Tests

| Test | What It Verifies |
|---|---|
| `handles filters state with key not matching any column` | No crash; unmatched key ignored |
| `handles empty filters state` | All filter controls show empty/default state |
| `plugin object is referentially stable across renders` | useMemo returns same object when config changes |
| `works with no filterable columns` | Plugin is no-op (popover) or renders only placeholders (inline) |
| `composes correctly with sort plugin` | Both sort and filter UI appear on same column |
| `works when column.filter.options is empty array` | Selector renders with placeholder only |
| `multi-selector with hasSelectAll=false hides select all` | No select all checkbox rendered |
| `inline variant header cells align vertically` | All headers same height regardless of filter presence |
