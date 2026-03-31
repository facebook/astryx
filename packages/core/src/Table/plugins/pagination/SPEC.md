# useXDSTablePagination — Plugin Specification

> **Status:** Draft
> **Issue:** #978
> **Author:** spec-page-cols
> **Date:** 2026-03-30

---

## 1. WWW Reference Analysis

### WWW API Surface

In WWW, pagination is a **prop** on `XDSTable`, not a plugin:

```flow
pagination?: XDSTablePagination (= WebTablePaginationConfig)
```

The table renders pagination controls internally when this prop is provided. The config object contains:

- `page` / `onPageChange` — current page and callback
- `pageSize` / `onPageSizeChange` — items per page and callback
- `totalItems` — total count for calculating page range
- `variant` — display style ('pages' | 'count' | 'compact')

**State flow in WWW:**
1. Consumer passes `pagination` prop to `XDSTable`
2. Table internally slices `data` to `data.slice(start, end)` for the current page
3. Table renders `<XDSPagination>` below the `<table>` element
4. User clicks next/prev → `onPageChange` fires → consumer updates state → table re-renders with new slice

**Key observations:**
- WWW couples pagination to the table — it's not composable with other layouts
- The table owns data slicing logic
- Pagination controls are always rendered below the table
- No support for server-side pagination where the consumer controls data fetching

### Design Decision: Plugin vs. Prop

#### Option A: Prop (like WWW)

```tsx
<XDSTable pagination={{ page, onPageChange, totalItems, pageSize }} ... />
```

**Pros:**
- Matches WWW API — easier migration
- Single declaration point — less boilerplate
- Table can own data slicing internally

**Cons:**
- Not composable — pagination is locked to the table's render tree
- Can't place pagination controls elsewhere (e.g., in a toolbar above the table)
- Breaks the plugin architecture pattern
- Mixes data concerns (slicing) with display concerns (controls)

#### Option B: Plugin (recommended) ✅

```tsx
const pagination = useXDSTablePagination({ page, onChange, totalItems, pageSize });
<XDSTable plugins={{ pagination: pagination.plugin }} data={pagination.paginatedData(data)} ... />
<XDSPagination {...pagination.paginationProps} />
```

**Pros:**
- Composable — pagination controls can be placed anywhere
- Follows established plugin pattern (like `useXDSTableSelection`)
- Separation of concerns — consumer controls data slicing
- Works for both client-side (full data) and server-side (pre-sliced data) pagination
- Plugin can still use `transformTableContext` to render controls in a default position

**Cons:**
- More boilerplate than a single prop
- Consumer must wire up `paginatedData()` or handle slicing themselves

#### Recommendation: **Plugin (Option B)**

The plugin approach is more aligned with XDS OSS's composable architecture. The slight verbosity is offset by flexibility. A convenience `<XDSTableWithPagination>` wrapper could be added later if demand warrants it.

---

## 2. XDS OSS Plugin API (TypeScript)

### Config Interface

```typescript
/**
 * Configuration for useXDSTablePagination.
 *
 * Headless pagination state management for XDSTable. The consumer owns all
 * state — this hook provides data helpers and a plugin that integrates with
 * the table's plugin pipeline.
 *
 * @template T - The row data type
 *
 * @example Basic client-side pagination
 * ```
 * const [page, setPage] = useState(1);
 * const [pageSize, setPageSize] = useState(20);
 *
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   totalItems: data.length,
 *   pageSize,
 * });
 *
 * <XDSTable
 *   data={pagination.paginatedData(data)}
 *   columns={columns}
 *   plugins={{ pagination: pagination.plugin }}
 * />
 * <XDSPagination {...pagination.paginationProps} />
 * ```
 *
 * @example Server-side pagination
 * ```
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: (p) => fetchPage(p),
 *   totalItems: serverTotal,
 *   pageSize: 25,
 * });
 *
 * // Data is already sliced by the server — don't use paginatedData()
 * <XDSTable
 *   data={serverData}
 *   columns={columns}
 *   plugins={{ pagination: pagination.plugin }}
 * />
 * <XDSPagination {...pagination.paginationProps} />
 * ```
 *
 * @example With page size selector
 * ```
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   totalItems: data.length,
 *   pageSize,
 *   onPageSizeChange: setPageSize,
 *   pageSizeOptions: [10, 25, 50, 100],
 * });
 * ```
 *
 * @example Cursor-based (infinite) pagination
 * ```
 * const pagination = useXDSTablePagination({
 *   page,
 *   onPageChange: setPage,
 *   hasMore: cursor != null,
 *   pageSize: 20,
 * });
 * ```
 */
export interface UseXDSTablePaginationConfig {
  // --- Core (required) ---

  /** Current page number (1-based). */
  page: number;

  /** Called when the page changes. Consumer updates their own state. */
  onPageChange: (page: number) => void;

  // --- Data shape (provide one) ---

  /**
   * Total number of items across all pages.
   * Used to calculate total page count and "X–Y of Z" display.
   * Takes precedence over `totalPages` if both are provided.
   */
  totalItems?: number;

  /**
   * Total number of pages. Use when you know the page count but not item count.
   */
  totalPages?: number;

  /**
   * Whether more pages exist after the current one.
   * Use for cursor-based pagination where the total is unknown.
   * Mutually exclusive with totalItems/totalPages.
   */
  hasMore?: boolean;

  // --- Page size ---

  /**
   * Number of items per page.
   * @default 10
   */
  pageSize?: number;

  /**
   * Called when the user changes the page size via the page size selector.
   * When provided alongside `pageSizeOptions`, a page size dropdown is shown.
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Available page size options. Shows a page size selector when provided.
   * @example [10, 25, 50, 100]
   */
  pageSizeOptions?: number[];

  // --- Display ---

  /**
   * Visual variant for the pagination controls.
   * Passed through to XDSPagination.
   * @default 'pages'
   */
  variant?: 'pages' | 'count' | 'compact' | 'dots' | 'none';

  /**
   * Size of the pagination controls.
   * @default 'md'
   */
  size?: 'sm' | 'md';

  /**
   * Where to render the pagination controls relative to the table.
   * - 'below' — renders pagination after the table (default)
   * - 'above' — renders pagination before the table
   * - 'both' — renders pagination above and below the table
   * - 'none' — does not auto-render; use `paginationProps` manually
   *
   * Only applies when using the plugin's `transformTableContext`.
   * @default 'below'
   */
  position?: 'below' | 'above' | 'both' | 'none';

  // --- Accessibility ---

  /**
   * Accessible label for the pagination nav landmark.
   * @default 'Table pagination'
   */
  label?: string;
}
```

### Return Type

```typescript
/**
 * Return value of useXDSTablePagination.
 */
export interface UseXDSTablePaginationReturn<T extends Record<string, unknown>> {
  /** The TablePlugin to pass to XDSTable's plugins prop. */
  plugin: TablePlugin<T>;

  /**
   * Props to spread onto an XDSPagination component.
   * Use this when `position` is 'none' and you want to render
   * pagination controls in a custom location.
   *
   * @example
   * ```
   * <div className="toolbar">
   *   <XDSPagination {...pagination.paginationProps} />
   * </div>
   * ```
   */
  paginationProps: XDSPaginationProps;

  /**
   * Slices the full data array for the current page.
   * Use for client-side pagination where you have all the data.
   * For server-side pagination (data already sliced), pass data directly.
   *
   * @example
   * ```
   * <XDSTable data={pagination.paginatedData(allData)} ... />
   * ```
   */
  paginatedData: (data: T[]) => T[];

  /** Current page number (1-based). */
  page: number;

  /** Computed total number of pages (undefined for cursor-based). */
  totalPages: number | undefined;

  /** Current page size. */
  pageSize: number;
}
```

### Plugin Transform Methods Used

| Transform Method | Used | Purpose |
|---|---|---|
| `transformTable` | No | — |
| `transformHeaderRow` | No | — |
| `transformHeaderCell` | No | — |
| `transformBodyRow` | No | — |
| `transformBodyCell` | No | — |
| `transformTableContext` | **Yes** | Wraps the table with pagination controls above/below based on `position` config |

### Implementation Skeleton

```typescript
export function useXDSTablePagination<T extends Record<string, unknown>>(
  config: UseXDSTablePaginationConfig,
): UseXDSTablePaginationReturn<T> {
  const {
    page,
    onPageChange,
    totalItems,
    totalPages: totalPagesProp,
    hasMore,
    pageSize = 10,
    onPageSizeChange,
    pageSizeOptions,
    variant = 'pages',
    size = 'md',
    position = 'below',
    label = 'Table pagination',
  } = config;

  const computedTotalPages = totalPagesProp ??
    (totalItems != null ? Math.ceil(totalItems / pageSize) : undefined);

  // Build XDSPagination props from config
  const paginationProps: XDSPaginationProps = {
    page,
    onChange: onPageChange,
    totalItems,
    totalPages: computedTotalPages,
    hasMore,
    pageSize,
    onPageSizeChange,
    pageSizeOptions,
    variant,
    size,
    label,
  };

  // Client-side data slicing helper
  const paginatedData = useCallback((data: T[]): T[] => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [page, pageSize]);

  // Stable plugin via useMemo
  const plugin = useMemo((): TablePlugin<T> => ({
    transformTableContext(children: ReactNode) {
      if (position === 'none') return children;

      const paginationElement = <XDSPagination {...paginationProps} />;

      return (
        <>
          {(position === 'above' || position === 'both') && paginationElement}
          {children}
          {(position === 'below' || position === 'both') && paginationElement}
        </>
      );
    },
  }), [/* deps: paginationProps, position */]);

  return { plugin, paginationProps, paginatedData, page, totalPages: computedTotalPages, pageSize };
}
```

> **Note:** The plugin reference will change when pagination state changes. This is acceptable because pagination state changes require a full table re-render anyway (new data slice). This differs from the selection plugin, which needs a stable reference to avoid re-rendering all rows.

---

## 3. Behavioral Specification

### 3.1 Page Navigation

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| User clicks page number button | Table re-renders with new data slice; active page button shows `variant='primary'` | `aria-current="page"` on active button; `aria-label="Go to page N"` | No-op if clicking current page |
| User clicks "Previous" | Navigates to `page - 1` | `aria-label="Go to previous page"` | Button disabled when `page === 1` |
| User clicks "Next" | Navigates to `page + 1` | `aria-label="Go to next page"` | Button disabled when `page === totalPages` or `hasMore === false` |
| User clicks ellipsis | No action (decorative) | `aria-hidden="true"` | — |

### 3.2 Page Size Change

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| User selects new page size from dropdown | `onPageSizeChange` fires; page resets to 1; table re-renders | `aria-label="Items per page"` on selector (hidden label) | If current page would exceed new total, reset to page 1 |
| `pageSizeOptions` not provided | No page size selector rendered | — | — |

### 3.3 Client-Side Data Slicing (`paginatedData`)

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| `paginatedData(data)` called | Returns `data.slice(start, start + pageSize)` | — | Empty array if `data` is empty |
| Page beyond data range | Returns empty array `[]` | — | Consumer should prevent this via `totalItems` |
| `data` changes while on page > 1 | Consumer must handle — if new data is shorter, consumer should reset page | — | Page may be out of bounds if consumer doesn't handle |

### 3.4 Position Rendering

| `position` | Behavior |
|---|---|
| `'below'` (default) | `<table>` then `<XDSPagination>` |
| `'above'` | `<XDSPagination>` then `<table>` |
| `'both'` | `<XDSPagination>` then `<table>` then `<XDSPagination>` |
| `'none'` | No auto-rendering; consumer uses `paginationProps` to place controls manually |

### 3.5 Interaction with Selection Plugin

When both pagination and selection plugins are active:
- Selection state should be scoped to the current page (consumer's responsibility)
- "Select all" applies to visible (current page) rows only
- Changing pages does NOT clear selection — consumer decides this behavior
- The `transformTableContext` ordering matters: selection's context provider should wrap pagination's context wrapper. Plugin order in the `plugins` record determines this.

### 3.6 Empty / Loading States

| State | Behavior |
|---|---|
| `totalItems === 0` | `XDSPagination` returns `null` (built-in behavior) |
| `totalPages === 0` | `XDSPagination` returns `null` |
| `totalPages === 1` | Pagination renders but prev/next are both disabled; only page 1 shown |
| Data loading (no items yet) | Consumer should set `totalItems` to trigger null render or show a loading state |

---

## 4. Competitive Analysis

| Feature | WWW XDS Internal | XDS OSS (this spec) | shadcn/ui | Mantine | AG Grid |
|---|---|---|---|---|---|
| **Integration model** | Table prop | Table plugin | Standalone component | Table prop | Built-in grid feature |
| **Data slicing** | Table owns | Consumer owns (helper provided) | Consumer owns | Table owns | Grid owns |
| **Control placement** | Fixed (below table) | Configurable (`position`) | Consumer places | Fixed (below table) | Fixed (grid footer) |
| **Server-side pagination** | Yes (via callbacks) | Yes (skip `paginatedData`) | Yes | Yes | Yes (datasource API) |
| **Cursor-based (infinite)** | Limited | Yes (`hasMore` prop) | No | No | Yes (infinite row model) |
| **Page size selector** | Yes | Yes (via `pageSizeOptions`) | Yes | Yes | Yes |
| **Variants** | Limited | 5 variants (pages/count/compact/dots/none) | Pages only | Pages only | Pages only |
| **Selection interaction** | Coupled | Decoupled (consumer decides) | N/A | Coupled | Coupled |
| **React transitions** | No | Yes (via `onChangeAction`) | No | No | No |
| **Composability** | Low (locked to table) | High (plugin + manual placement) | High (standalone) | Low (table prop) | Low (built-in) |

### Key Differentiators

1. **Plugin model** — Unlike WWW/Mantine/AG Grid which couple pagination to the table, XDS OSS uses a composable plugin that can be used standalone or integrated
2. **Variant support** — 5 display variants vs. competitors' 1-2
3. **`paginatedData` helper** — Bridges client-side slicing convenience with server-side flexibility
4. **Position control** — No competitor offers `above`/`both`/`none` placement options

---

## 5. XDS Component Dependencies

| Component | Path | Exists | Usage |
|---|---|---|---|
| `XDSPagination` | `packages/core/src/Pagination/XDSPagination.tsx` | ✅ | Renders pagination controls |
| `XDSButton` | `packages/core/src/Button/` | ✅ | Used internally by XDSPagination |
| `XDSIcon` | `packages/core/src/Icon/` | ✅ | Chevron icons in XDSPagination |
| `XDSSelector` | `packages/core/src/Selector/XDSSelector.tsx` | ✅ | Page size dropdown in XDSPagination |
| `XDSText` | `packages/core/src/Text/XDSText.tsx` | ✅ | Count/compact variant text |

**No missing prerequisites.** All components used by this plugin already exist. The plugin itself is a thin hook that composes `XDSPagination` — no new UI components needed.

---

## 6. Test Specification

### Unit Tests (`useXDSTablePagination.test.tsx`)

#### Hook Return Value
- `returns plugin object with transformTableContext` — verify the plugin shape
- `returns paginationProps matching config` — verify all config props flow through
- `returns paginatedData function` — verify it exists and is callable
- `returns computed totalPages from totalItems and pageSize` — verify `Math.ceil(100 / 25) === 4`
- `returns totalPages directly when totalPagesProp is provided` — verify passthrough
- `returns undefined totalPages when using hasMore` — cursor-based mode
- `defaults pageSize to 10` — verify default
- `defaults variant to 'pages'` — verify default
- `defaults position to 'below'` — verify default

#### `paginatedData` Helper
- `slices data for page 1` — `data.slice(0, pageSize)`
- `slices data for page 2` — `data.slice(pageSize, pageSize * 2)`
- `slices data for last page with partial data` — e.g., 23 items, page 3, pageSize 10 → 3 items
- `returns empty array for empty data` — `paginatedData([])` → `[]`
- `returns empty array when page exceeds data` — page 5 of 10-item dataset with pageSize 10
- `updates slice when page changes` — re-render with new page → new slice
- `updates slice when pageSize changes` — re-render with new pageSize → new slice

#### Plugin Behavior
- `transformTableContext renders XDSPagination below table by default` — position='below'
- `transformTableContext renders XDSPagination above table` — position='above'
- `transformTableContext renders XDSPagination above and below` — position='both'
- `transformTableContext does not render XDSPagination when position is none` — passthrough
- `paginationProps include pageSizeOptions when provided` — verify selector appears
- `paginationProps exclude pageSizeOptions when not provided` — no selector

#### Integration with XDSTable
- `renders table with paginated data` — full integration: hook + XDSTable + data slicing
- `page change re-renders table with new data` — verify rows update
- `page size change resets to page 1` — XDSPagination built-in behavior
- `works alongside selection plugin` — both plugins active, no conflicts
- `plugin order does not break rendering` — pagination before/after selection
- `empty data renders pagination as null` — totalItems=0

#### Props Passthrough to XDSPagination
- `passes variant prop` — verify each variant renders correctly
- `passes size prop` — verify sm/md sizing
- `passes label prop` — verify aria-label on nav element
- `passes hasMore for cursor-based pagination` — next button enabled/disabled
- `passes onPageSizeChange and pageSizeOptions` — selector appears with options

#### Edge Cases
- `handles totalItems=0 gracefully` — no pagination rendered
- `handles totalPages=1` — pagination renders, both nav buttons disabled
- `handles page=1 with no totalItems or totalPages` — cursor mode, prev disabled
- `handles rapid page changes` — no stale closures
- `memoizes paginatedData callback` — reference stability when deps unchanged
- `handles data shorter than pageSize` — single page, no slicing artifacts

### Accessibility Tests
- `pagination nav has correct aria-label` — default "Table pagination"
- `page buttons have aria-label "Go to page N"` — via XDSPagination
- `current page has aria-current="page"` — via XDSPagination
- `disabled prev/next buttons have aria-disabled` — via XDSButton
