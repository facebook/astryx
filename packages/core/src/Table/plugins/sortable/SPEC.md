# useXDSTableSortable — Plugin Specification

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
hook useXDSTableSortable<TItem, TColumnKey, TSortKey>({
  allowUnsortedState?: boolean,
  setSort: (XDSTableSortableState<TSortKey>) => void,
  sort: XDSTableSortableState<TSortKey>,
}): XDSTableSortable<TItem, TColumnKey>
```

**State types:**

- `XDSTableSortableDirection = 'ascending' | 'descending'`
- `XDSTableSortableState<TSortKey> = { sortKey: TSortKey, direction: XDSTableSortableDirection }`

**Column config:** Each column declares sortability via `sortable?: [{ sortKey: string }]`.

**Plugin integration:** Delegates to `useWebTableStructuredHeadersSortable_EXPERIMENTAL`. Uses `transformHeaderCell` to inject clickable sort indicators into header cells.

**Visual indicators:** Three icon states:

| State | Icon | Meaning |
|-------|------|---------|
| Unsorted | `arrow-up-down` | Column is sortable but not active |
| Ascending | `arrow-up` | Sorted A→Z / low→high |
| Descending | `arrow-down` | Sorted Z→A / high→low |

**Interaction model:** Click header → cycles sort direction. If `allowUnsortedState` is true, cycle is: unsorted → ascending → descending → unsorted. If false, cycle is: ascending → descending → ascending.

**Limitations of WWW:**

- **Single-sort only** — one column active at a time
- Sort key is a separate concept from column key (indirection via `sortable` config)
- State is externally managed via `sort` / `setSort` (headless pattern ✓)

### XDS OSS Improvements Over WWW

1. **Multi-sort support** — state is an ordered array of sort entries; first = primary sort
2. **Simpler column config** — `sortKey` on column definition directly, no nested array
3. **Sort priority indicator** — optional numeric badge showing sort rank in multi-sort mode
4. **Keyboard accessibility** — full keyboard interaction on header cells

---

## 2. XDS OSS Plugin API (TypeScript)

### Type Definitions

```typescript
// =============================================================================
// Sort Direction & State
// =============================================================================

/**
 * Sort direction for a single column.
 */
export type XDSTableSortDirection = 'ascending' | 'descending';

/**
 * A single sort entry in the sort state array.
 * Represents one column being sorted in a specific direction.
 */
export interface XDSTableSortEntry<TSortKey extends string = string> {
  /** The sort key identifying which column (or derived value) to sort by. */
  sortKey: TSortKey;
  /** The sort direction. */
  direction: XDSTableSortDirection;
}

/**
 * Complete sort state — an ordered array of sort entries.
 * The first entry is the primary sort; subsequent entries are tiebreakers.
 *
 * - Single sort: array of length 0 or 1
 * - Multi-sort: array of length 0..N
 * - Empty array: no sort applied (unsorted state)
 *
 * @example
 * ```
 * // Primary sort by name ascending, secondary by age descending
 * const sort: XDSTableSortState = [
 *   { sortKey: 'name', direction: 'ascending' },
 *   { sortKey: 'age', direction: 'descending' },
 * ];
 * ```
 */
export type XDSTableSortState<TSortKey extends string = string> =
  XDSTableSortEntry<TSortKey>[];

// =============================================================================
// Column Extension
// =============================================================================

/**
 * Sortable column configuration.
 * Added to XDSTableColumn<T> via the `sortable` field.
 *
 * When a column has `sortable` set, the plugin renders a sort indicator
 * in the header cell and makes the header clickable.
 */
export interface XDSTableSortableColumnConfig {
  /**
   * The sort key for this column. Must match a key used in XDSTableSortState.
   * Allows decoupling column identity from sort identity (e.g., a "Full Name"
   * column might sort by `'lastName'`).
   *
   * @default column.key — if omitted, uses the column's `key` property
   */
  sortKey?: string;
}

// =============================================================================
// Hook Config
// =============================================================================

/**
 * Configuration for useXDSTableSortable.
 *
 * Follows XDS headless plugin conventions: the consumer owns all state
 * and provides callbacks. The plugin never holds internal sort state.
 *
 * @template TSortKey - Union of valid sort key strings
 *
 * @example
 * ```
 * const [sort, setSort] = useState<XDSTableSortState>([
 *   { sortKey: 'name', direction: 'ascending' },
 * ]);
 *
 * const sortPlugin = useXDSTableSortable({
 *   sort,
 *   onSortChange: setSort,
 * });
 *
 * <XDSTable plugins={{ sort: sortPlugin }} ... />
 * ```
 */
export interface UseXDSTableSortableConfig<
  TSortKey extends string = string,
> {
  /**
   * Current sort state — ordered array of active sort entries.
   * Empty array = unsorted. First entry = primary sort.
   */
  sort: XDSTableSortState<TSortKey>;

  /**
   * Called when the user changes sort via header click.
   * Receives the complete new sort state array.
   *
   * For single-sort mode: array will have 0 or 1 entries.
   * For multi-sort mode: array may have multiple entries.
   */
  onSortChange: (sort: XDSTableSortState<TSortKey>) => void;

  /**
   * Allow returning to unsorted state.
   * When true, clicking a sorted column cycles: asc → desc → unsorted.
   * When false, clicking cycles: asc → desc → asc.
   *
   * @default false
   */
  allowUnsortedState?: boolean;

  /**
   * Enable multi-sort via modifier key (Shift+click).
   * When true, Shift+click adds/toggles a column as a secondary sort.
   * Regular click still replaces the entire sort state (single-sort behavior).
   * When false, only single-sort is available.
   *
   * @default false
   */
  isMultiSortEnabled?: boolean;
}

// =============================================================================
// Hook Return Type
// =============================================================================

// The hook returns TablePlugin<T> — no additional API surface.
// All interaction is through the config callbacks.
```

### Column Definition Extension

The `XDSTableColumn<T>` interface needs a new optional field:

```typescript
// Added to XDSTableColumn<T> in types.ts
export interface XDSTableColumn<T extends Record<string, unknown>> {
  // ... existing fields ...

  /**
   * Sortable configuration for this column.
   * Set to `true` for default behavior (sortKey = column.key),
   * or provide an object with a custom sortKey.
   * Omit or set to `undefined`/`false` to make the column non-sortable.
   *
   * @example
   * ```
   * // Simple: sort key matches column key
   * { key: 'name', header: 'Name', sortable: true }
   *
   * // Custom sort key
   * { key: 'fullName', header: 'Full Name', sortable: { sortKey: 'lastName' } }
   * ```
   */
  sortable?: boolean | XDSTableSortableColumnConfig;
}
```

### Hook Signature

```typescript
/**
 * useXDSTableSortable — table plugin for column sorting.
 *
 * Returns a stable TablePlugin<T> that transforms header cells to add
 * clickable sort indicators. Follows the headless pattern: consumer owns
 * sort state, plugin provides UI and interaction.
 *
 * Supports single-sort (default) and multi-sort (Shift+click) modes.
 *
 * @template T - Row data type
 * @template TSortKey - Union of valid sort key strings
 *
 * @example
 * ```
 * const [sort, setSort] = useState<XDSTableSortState>([]);
 * const sortPlugin = useXDSTableSortable({ sort, onSortChange: setSort });
 *
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'age', header: 'Age', sortable: true },
 *     { key: 'avatar', header: '', sortable: false }, // not sortable
 *   ]}
 *   plugins={{ sort: sortPlugin }}
 * />
 * ```
 */
export function useXDSTableSortable<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
>(
  config: UseXDSTableSortableConfig<TSortKey>,
): TablePlugin<T>;
```

### Plugin Transform Strategy

| Transform Method | Used? | Purpose |
|---|---|---|
| `transformTable` | No | — |
| `transformHeaderRow` | No | — |
| `transformHeaderCell` | **Yes** | Wraps header content with sort button + icon indicator |
| `transformBodyRow` | No | — |
| `transformBodyCell` | No | — |
| `transformTableContext` | No | No context needed — state is fully external |

**Why only `transformHeaderCell`?** Unlike selection (which needs a new column and row-level state), sorting only modifies existing header cells. The sort indicator and click handler are injected into each sortable column's `<th>`. No new columns, rows, or context providers are needed.

### Internal Architecture

```
useXDSTableSortable(config)
  │
  ├── configRef ← useRef(config)     // Always-fresh config without re-creating plugin
  │
  └── useMemo(() => plugin, [])      // Stable plugin object (never changes)
        │
        └── transformHeaderCell(props, column)
              │
              ├── column.sortable falsy? → return props unchanged
              │
              ├── Resolve sortKey: column.sortable.sortKey ?? column.key
              │
              ├── Find entry in configRef.current.sort matching sortKey
              │
              ├── Build onClick handler:
              │     ├── Regular click → single-sort cycle
              │     └── Shift+click (if isMultiSortEnabled) → multi-sort toggle
              │
              ├── Wrap header children in clickable container:
              │     <button> (for accessibility)
              │       {original header content}
              │       <XDSIcon icon={sortIcon} size="xsm" />
              │       {multiSortRank > 0 && <span>{rank}</span>}
              │     </button>
              │
              └── Merge aria-sort onto htmlProps
```

---

## 3. Behavioral Specification

### 3.1 Sort Indicator Rendering

#### Sortable column — unsorted

- **Trigger:** Column has `sortable` config but no matching entry in `sort` state.
- **Render:** Header text + subtle `arrow-up-down` icon (color: `secondary`/muted). Icon only visible on hover by default.
- **Accessibility:** `<th>` has no `aria-sort`. Header content wrapped in `<button>` with `aria-label="Sort by {header}"`.

#### Sortable column — ascending

- **Trigger:** `sort` array contains entry with matching `sortKey` and `direction: 'ascending'`.
- **Render:** Header text + `arrow-up` icon (color: `primary`/accent). Icon always visible.
- **Accessibility:** `<th aria-sort="ascending">`. Button `aria-label="Sort by {header}, sorted ascending"`.

#### Sortable column — descending

- **Trigger:** `sort` array contains entry with matching `sortKey` and `direction: 'descending'`.
- **Render:** Header text + `arrow-down` icon (color: `primary`/accent). Icon always visible.
- **Accessibility:** `<th aria-sort="descending">`. Button `aria-label="Sort by {header}, sorted descending"`.

#### Non-sortable column

- **Trigger:** Column has no `sortable` config (undefined/false).
- **Render:** Header content unchanged. No icon, no button wrapper.
- **Accessibility:** No `aria-sort` attribute.

#### Multi-sort rank indicator

- **Trigger:** `isMultiSortEnabled` is true AND `sort` array has >1 entries AND column is in the array.
- **Render:** Small numeric badge (1-based index) next to the sort icon showing priority. Primary sort = "1", secondary = "2", etc.
- **Accessibility:** `aria-label` includes rank: `"Sort by {header}, sorted ascending, priority 1 of 3"`.

### 3.2 Click Interactions

#### Single-sort click (default behavior)

| Current State | `allowUnsortedState` | Action | New State |
|---|---|---|---|
| Unsorted | any | Click | `[{ sortKey, direction: 'ascending' }]` |
| Ascending | false | Click | `[{ sortKey, direction: 'descending' }]` |
| Ascending | true | Click | `[{ sortKey, direction: 'descending' }]` |
| Descending | false | Click | `[{ sortKey, direction: 'ascending' }]` |
| Descending | true | Click | `[]` (unsorted) |

When clicking a *different* column in single-sort mode, the entire sort array is replaced with the new column ascending.

#### Multi-sort Shift+click

When `isMultiSortEnabled` is true and user Shift+clicks:

| Column in sort array? | Current direction | Result |
|---|---|---|
| No | — | Append `{ sortKey, direction: 'ascending' }` to array |
| Yes, ascending | ascending | Toggle to `descending` in place |
| Yes, descending (allowUnsortedState=true) | descending | Remove from array |
| Yes, descending (allowUnsortedState=false) | descending | Toggle to `ascending` in place |

Sort priority (array order) is preserved. New columns are appended at the end (lowest priority).

### 3.3 Keyboard Navigation

| Key | Context | Action |
|---|---|---|
| `Enter` | Sort button focused | Same as click |
| `Space` | Sort button focused | Same as click |
| `Shift+Enter` | Sort button focused, multi-sort enabled | Same as Shift+click |
| `Tab` | Header row | Move focus between sortable headers (native focus order) |

The sort button inside each `<th>` is a native `<button>`, so keyboard navigation is handled by the browser. No custom key handling needed beyond Shift detection.

### 3.4 Header Cell DOM Structure

```html
<!-- Sortable column, currently ascending, multi-sort rank 1 -->
<th aria-sort="ascending" scope="col">
  <button
    type="button"
    class="xds-sort-button"
    aria-label="Sort by Name, sorted ascending, priority 1 of 2"
    onClick={handleClick}
  >
    <span class="xds-sort-label">Name</span>
    <XDSIcon icon="arrow-up" size="xsm" color="accent" />
    <span class="xds-sort-rank" aria-hidden="true">1</span>
  </button>
</th>

<!-- Non-sortable column -->
<th scope="col">
  Status
</th>
```

### 3.5 Styling Details

The sort button must:

- Fill the entire header cell (full width/height clickable area)
- Use `display: flex; align-items: center; gap: spacing-1`
- Have no visible button chrome (background: transparent, border: none)
- Show `cursor: pointer`
- Inherit header cell typography (font-weight, color, size from XDSTableHeaderCell)
- Show hover state: sort icon becomes visible (for unsorted columns)
- Show focus-visible outline (standard XDS focus ring)

The sort icon:

- Uses `XDSIcon` with `size="xsm"` (12px)
- Unsorted: `color="secondary"`, `opacity: 0` by default, `opacity: 1` on header hover/focus
- Active sort: `color="accent"`, always visible

The rank badge (multi-sort only):

- Tiny inline text (`font-size: 10px`, `line-height: 1`)
- Color: `accent`
- Positioned as flex child after the icon

### 3.6 Edge Cases

| Scenario | Behavior |
|---|---|
| No columns have `sortable` config | Plugin is a no-op; no headers are transformed |
| `sort` contains a key not matching any column | Ignored — no visual indicator. `onSortChange` may still include it. |
| Column removed from table but still in `sort` | No crash. Entry is invisible but preserved in state. Consumer should clean up. |
| Empty `sort` array | All sortable columns show unsorted indicators |
| `sort` has one entry + `isMultiSortEnabled=false` | Single-sort mode; rank badge not shown |
| Header content is ReactNode (not string) | Wrapped in sort button as-is. `aria-label` should still be provided via column config or fallback to `column.key`. |
| `data` is empty or undefined | Sort indicators still render in headers |

---

## 4. Competitive Analysis

### Comparison Matrix

| Feature | WWW XDS | XDS OSS (this spec) | TanStack Table | Mantine DataTable | AG Grid |
|---|---|---|---|---|---|
| **Single sort** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Multi-sort** | ❌ | ✅ (Shift+click) | ✅ (built-in) | ❌ | ✅ |
| **Unsorted state** | Optional | Optional | ✅ | ✅ | ✅ |
| **State ownership** | External | External | Internal (managed) | Internal | Internal |
| **Plugin architecture** | Transform pipeline | Transform pipeline | Feature system | Monolithic | Monolithic |
| **Sort indicators** | 3 icons | 3 icons + rank badge | CSS classes | Icons | Icons + rank |
| **Accessibility** | Basic | Full (aria-sort, labels) | Partial | Partial | Full |
| **Framework coupling** | React (FB internal) | React | Framework-agnostic core | React | Framework-agnostic |

### Key Differentiators

**vs. TanStack Table (used by shadcn/NDS):**
TanStack owns sort state internally via `useReactTable({ state: { sorting } })`. Columns declare `enableSorting`. The sort model is tightly coupled to TanStack's column definition system. XDS OSS uses a transform pipeline where the sort plugin is composed alongside other plugins without knowledge of each other. XDS's headless callbacks (`onSortChange`) are simpler than TanStack's `onSortingChange` which uses an updater function pattern.

**vs. Mantine DataTable:**
Mantine provides `sortStatus` + `onSortStatusChange` props directly on the table component — not a plugin. No multi-sort. XDS keeps sorting as a composable plugin, avoiding prop bloat on the table component.

**vs. AG Grid:**
AG Grid has comprehensive built-in sorting with multi-sort, custom comparators, and sort priority indicators. However, it's a monolithic component. XDS achieves similar multi-sort UX through a lightweight plugin that composes with the existing transform pipeline.

**XDS OSS advantage:** The plugin transform pipeline allows sort, selection, and filtering to compose independently without awareness of each other. Each plugin only touches the render props it needs. This is architecturally cleaner than monolithic approaches where sort/filter/select are all baked into one component API.

---

## 5. XDS Component Dependencies

### Required Components

| Component | Import | Usage | Props Used |
|---|---|---|---|
| `XDSIcon` | `@xds/core` | Sort direction indicators | `icon` (component), `size="xsm"`, `color="secondary"\|"accent"` |
| `XDSTableHeaderCell` | `../XDSTableHeaderCell` | Not consumed directly — plugin transforms props passed *to* it | — |

### Required Icons

The plugin needs three sort icon SVG components. These are **not** in the `XDSIconName` registry (which only has `'chevronDown'`, `'close'`, `'search'`, etc.).

| Icon | Purpose | Status |
|---|---|---|
| Arrow Up | Ascending sort indicator | **MISSING** — needs to be added to XDS icon set or bundled with plugin |
| Arrow Down | Descending sort indicator | **MISSING** — needs to be added to XDS icon set or bundled with plugin |
| Arrow Up-Down | Unsorted/sortable indicator | **MISSING** — needs to be added to XDS icon set or bundled with plugin |

**Recommendation:** Add `'arrowUp'`, `'arrowDown'`, and `'arrowUpDown'` to the XDS icon registry (`packages/core/src/Icon/icons/`). These are general-purpose icons useful beyond just table sorting. Alternatively, bundle them as private SVG components within the sortable plugin directory.

### Required Theme Tokens

| Token | Source | Usage |
|---|---|---|
| `spacingVars['--spacing-1']` | `theme/tokens.stylex` | Gap between header text and sort icon |
| `colorVars['--color-text-secondary']` | `theme/tokens.stylex` | Unsorted icon color |
| `colorVars['--color-accent']` | `theme/tokens.stylex` | Active sort icon color |

### No Missing Prerequisites (Beyond Icons)

All other dependencies (StyleX, React hooks, `TablePlugin<T>` interface) exist. The `XDSTableColumn<T>` interface in `types.ts` needs the `sortable` field added (see §2).

---

## 6. Test Specification

### Rendering Tests

| Test | What It Verifies |
|---|---|
| `renders sort icon for sortable columns` | Sortable columns show sort indicator; non-sortable columns do not |
| `renders ascending icon when sort state is ascending` | Arrow-up icon appears for ascending sort entry |
| `renders descending icon when sort state is descending` | Arrow-down icon appears for descending sort entry |
| `renders unsorted icon when column is sortable but not in sort state` | Arrow-up-down icon appears for inactive sortable columns |
| `renders no sort UI for columns without sortable config` | Non-sortable columns have no button wrapper or icon |
| `renders sort button wrapping header content` | Header content is inside a `<button>` element |
| `renders rank badge in multi-sort mode` | When isMultiSortEnabled and sort has >1 entry, rank numbers appear |
| `does not render rank badge in single-sort mode` | Even with sort state, no rank badge when isMultiSortEnabled=false |
| `renders sort indicators when data is empty` | Headers still show sort UI with empty/undefined data |
| `uses custom sortKey from column config` | Column with `sortable: { sortKey: 'custom' }` matches sort state by 'custom', not column key |
| `uses column key as default sortKey` | Column with `sortable: true` matches sort state by column.key |

### Interaction Tests

| Test | What It Verifies |
|---|---|
| `clicking unsorted column calls onSortChange with ascending` | First click on unsorted column produces `[{ sortKey, direction: 'ascending' }]` |
| `clicking ascending column toggles to descending` | Click on ascending column produces descending |
| `clicking descending column toggles to ascending (allowUnsortedState=false)` | Default cycle wraps to ascending |
| `clicking descending column clears sort (allowUnsortedState=true)` | With allowUnsortedState, third click produces `[]` |
| `clicking different column replaces sort in single-sort mode` | Clicking column B while A is sorted produces `[{ sortKey: B, ... }]` |
| `shift+click adds column to multi-sort` | With isMultiSortEnabled, Shift+click appends to sort array |
| `shift+click toggles existing column in multi-sort` | Shift+click on already-sorted column toggles direction in place |
| `shift+click removes descending column in multi-sort (allowUnsortedState=true)` | Shift+click on descending column removes it from array |
| `regular click in multi-sort mode replaces entire sort` | Non-shift click replaces array even when isMultiSortEnabled |
| `clicking non-sortable column header does nothing` | No onSortChange call for non-sortable columns |

### Accessibility Tests

| Test | What It Verifies |
|---|---|
| `sets aria-sort="ascending" on sorted ascending th` | `<th>` has correct aria-sort |
| `sets aria-sort="descending" on sorted descending th` | `<th>` has correct aria-sort |
| `does not set aria-sort on unsorted columns` | No aria-sort attribute on inactive columns |
| `does not set aria-sort on non-sortable columns` | Non-sortable columns have no aria-sort |
| `sort button has accessible aria-label` | Button includes column name and current sort state |
| `sort button is keyboard accessible (Enter)` | Enter key triggers sort change |
| `sort button is keyboard accessible (Space)` | Space key triggers sort change |
| `focus-visible outline appears on sort button` | Visual focus indicator present |

### Edge Case Tests

| Test | What It Verifies |
|---|---|
| `handles sort state with key not matching any column` | No crash; unmatched key is ignored visually |
| `handles empty sort array` | All sortable columns show unsorted state |
| `plugin object is referentially stable across renders` | useMemo returns same object reference when config changes |
| `works with no sortable columns` | Plugin is no-op; no errors |
| `works with ReactNode header content` | Non-string headers wrapped correctly in sort button |
| `preserves plugin pipeline order with other plugins` | Sort transforms compose with selection plugin without conflict |
| `sort state with multiple entries but isMultiSortEnabled=false` | Renders all entries (state is source of truth) but click behavior is single-sort |
