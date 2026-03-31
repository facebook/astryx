# useXDSTableColumnSettings — Plugin Specification

> **Status:** Draft
> **Issue:** #978
> **Author:** spec-page-cols
> **Date:** 2026-03-30

---

## 1. WWW Reference Analysis

### WWW API Surface

WWW has two layers for column customization:

#### Layer 1: `useXDSTableCustomColumns` (Core Logic)

```flow
hook useXDSTableCustomColumns<TItem, TColumnKey>({
  activeColumnKeys: ReadonlyArray<TColumnKey>,
  isColumnDisabled: TColumnKey => boolean,
  setActiveColumnKeys: (ReadonlyArray<TColumnKey>) => void,
  viewConfiguration?: XDSTableViewConfiguration<TColumnKey>,
}): XDSTableCustomColumnsPlugin<TItem, TColumnKey>
```

**Returns:**
```flow
{
  activeColumnKeys: ReadonlyArray<TColumnKey>,
  isColumnDisabled: (TColumnKey) => boolean,
  plugin: TablePlugin<TItem>,           // filters columns to only active ones
  setActiveColumnKeys: (ReadonlyArray<TColumnKey>) => void,
  viewConfiguration?: XDSTableViewConfiguration<TColumnKey>,
}
```

**State flow:**
1. Consumer provides `activeColumnKeys` (which columns are visible) and `setActiveColumnKeys` (state setter)
2. The hook returns a `plugin` that transforms the table's columns to only include active keys
3. `isColumnDisabled` prevents certain columns from being hidden (e.g., "Name" column is always visible)
4. Column order in the table matches the order in `activeColumnKeys`

#### Layer 2: `XDSTableViewConfiguration` (Saved Views / Presets)

```flow
type XDSTableViewConfiguration<TColumnKey> = {
  views: Array<{
    uniqueID: string,
    label: string,
    columnKeys: ReadonlyArray<TColumnKey>,
    isDeleteDisabled?: boolean,
  }>,
  onCreateView: (label: string, columnKeys: ReadonlyArray<TColumnKey>) => void,
  onDeleteView: (uniqueID: string) => void,
  onUpdateInitialView: (uniqueID: string) => void,
  systemDefaultColumns: ReadonlyArray<TColumnKey>,
  initialViewID?: string,
}
```

**State flow:**
1. Views are saved presets (e.g., "Compact View", "Detailed View") with predefined column sets
2. User selects a view → `setActiveColumnKeys` is called with that view's `columnKeys`
3. User can create/delete views; `systemDefaultColumns` provides the "Reset to default" column set
4. `initialViewID` sets which view is active on mount

#### Layer 3: `XDSTableCustomColumnsDropdown` (UI Component)

```flow
component XDSTableCustomColumnsDropdown({
  customColumns: XDSTableCustomColumnsPlugin,  // return value of useXDSTableCustomColumns
  options: Array<{ label: string, value: TColumnKey }>,
  label: string,
  hasSelectAll?: boolean,
})
```

- Uses `XDSMultiSelector` to render a dropdown for toggling columns
- Active columns shown as checked, disabled columns can't be unchecked
- Optional "Select all" toggle

#### Layer 4: `XDSTableColumnSettingsViewOption` (Advanced UI)

```flow
// Used within XDSTableViewOptionsMenu
// Supports:
//   - Column reordering via drag-and-drop
//   - Grouped columns (collapsible sections)
//   - Saved views/presets
//   - URL query param persistence
//   - localStorage fallback
```

### Key Observations from WWW

1. **Headless pattern** — `useXDSTableCustomColumns` is pure logic; UI is separate
2. **Column filtering is a plugin transform** — the plugin filters the `columns` array
3. **Column order = array order** — reordering columns means reordering `activeColumnKeys`
4. **Views are optional** — basic column toggle works without `viewConfiguration`
5. **No drag-and-drop in core** — DnD is in the advanced `ViewOption` component, not the hook

---

## 2. XDS OSS Plugin API (TypeScript)

### Design Decisions

1. **Plugin filters columns** — The plugin uses a new `transformColumns` concept. However, the current `TablePlugin<T>` interface does not have a `transformColumns` method. **Two approaches:**
   - **Option A: Consumer filters columns** — the hook returns `activeColumns` and the consumer passes those to `<XDSTable columns={activeColumns}>`. The plugin is used only for side effects (context, UI). This is simpler and works today.
   - **Option B: Extend TablePlugin with `transformColumns`** — add a new transform to the plugin interface. This is more powerful but requires modifying the core type.

   **Recommendation: Option A** — consumer filters columns. This avoids extending the plugin interface and follows the principle of least surprise. The hook provides the filtered/reordered columns as a convenience.

2. **Views are optional** — basic column toggle should work without views. Views layer on top.

3. **No drag-and-drop in this spec** — DnD for column reordering is out of scope for the core hook. Column order is controlled by `activeColumnKeys` array order; consumers can implement reordering UI on top.

### Config Interface

```typescript
/**
 * Definition of a column for the column settings UI.
 * Separate from XDSTableColumn because the settings UI needs metadata
 * (label, group, disableability) that the table column doesn't carry.
 */
export interface XDSColumnSettingsOption<TColumnKey extends string = string> {
  /** Column key — must match XDSTableColumn.key */
  key: TColumnKey;
  /** Human-readable label for the column settings UI */
  label: string;
  /**
   * Whether this column can be hidden.
   * When true, the column is always visible and its checkbox is disabled.
   * Use for essential columns like "Name" or "ID".
   * @default false
   */
  isAlwaysVisible?: boolean;
  /**
   * Optional group name for organized column lists.
   * Columns with the same group are rendered together under a heading.
   */
  group?: string;
}

/**
 * A saved view preset — a named set of active columns.
 */
export interface XDSColumnSettingsView<TColumnKey extends string = string> {
  /** Unique identifier for this view */
  id: string;
  /** Display label (e.g., "Compact View", "Detailed View") */
  label: string;
  /** Column keys included in this view, in display order */
  columnKeys: ReadonlyArray<TColumnKey>;
  /**
   * Whether the user can delete this view.
   * System-provided views (like "Default") should be non-deletable.
   * @default false
   */
  isDeleteDisabled?: boolean;
}

/**
 * Configuration for saved views / presets.
 * Optional — omit for basic column toggle without views.
 */
export interface XDSColumnSettingsViewConfig<TColumnKey extends string = string> {
  /** Available saved views */
  views: ReadonlyArray<XDSColumnSettingsView<TColumnKey>>;
  /**
   * Called when the user creates a new view.
   * Consumer persists the view and updates the `views` array.
   */
  onCreateView: (label: string, columnKeys: ReadonlyArray<TColumnKey>) => void;
  /**
   * Called when the user deletes a view.
   * Consumer removes the view from persistence and updates the `views` array.
   */
  onDeleteView: (id: string) => void;
  /**
   * Called when the user sets a view as the default/initial view.
   */
  onSetDefaultView?: (id: string) => void;
  /**
   * The system default column set. Used for "Reset to default" functionality.
   * This is the column set used when no view is selected or when the user resets.
   */
  defaultColumnKeys: ReadonlyArray<TColumnKey>;
  /**
   * Which view is active on mount.
   * If not provided, `defaultColumnKeys` are used as the initial active columns.
   */
  initialViewId?: string;
}

/**
 * Configuration for useXDSTableColumnSettings.
 *
 * Headless column visibility and ordering management for XDSTable.
 * The consumer owns all state. The hook provides filtered columns
 * and a plugin for table integration.
 *
 * @template T - The row data type
 * @template TColumnKey - String literal union of column keys
 *
 * @example Basic column toggle
 * ```
 * const allColumns = [
 *   { key: 'name', header: 'Name' },
 *   { key: 'email', header: 'Email' },
 *   { key: 'role', header: 'Role' },
 *   { key: 'status', header: 'Status' },
 *   { key: 'lastLogin', header: 'Last Login' },
 * ];
 *
 * const [activeKeys, setActiveKeys] = useState(['name', 'email', 'role']);
 *
 * const columnSettings = useXDSTableColumnSettings({
 *   columns: [
 *     { key: 'name', label: 'Name', isAlwaysVisible: true },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Role' },
 *     { key: 'status', label: 'Status' },
 *     { key: 'lastLogin', label: 'Last Login' },
 *   ],
 *   activeColumnKeys: activeKeys,
 *   onChangeActiveColumnKeys: setActiveKeys,
 * });
 *
 * <XDSTable
 *   data={data}
 *   columns={columnSettings.activeColumns(allColumns)}
 *   plugins={{ columnSettings: columnSettings.plugin }}
 * />
 * ```
 *
 * @example With saved views
 * ```
 * const columnSettings = useXDSTableColumnSettings({
 *   columns: columnOptions,
 *   activeColumnKeys: activeKeys,
 *   onChangeActiveColumnKeys: setActiveKeys,
 *   viewConfig: {
 *     views: savedViews,
 *     onCreateView: (label, keys) => createView(label, keys),
 *     onDeleteView: (id) => deleteView(id),
 *     defaultColumnKeys: ['name', 'email', 'role'],
 *   },
 * });
 * ```
 *
 * @example With XDSDropdownMenu for column toggle UI
 * ```
 * <XDSDropdownMenu
 *   button={{ label: 'Columns', icon: 'columns' }}
 *   items={columnSettings.dropdownItems}
 * />
 * ```
 */
export interface UseXDSTableColumnSettingsConfig<
  TColumnKey extends string = string,
> {
  /**
   * All available columns with metadata for the settings UI.
   * This defines the universe of columns the user can toggle.
   */
  columns: ReadonlyArray<XDSColumnSettingsOption<TColumnKey>>;

  /**
   * Currently active column keys, in display order.
   * Only columns with keys in this array are shown in the table.
   * The array order determines column display order.
   */
  activeColumnKeys: ReadonlyArray<TColumnKey>;

  /**
   * Called when active columns change (toggle, reorder, view selection).
   * Consumer updates their own state.
   */
  onChangeActiveColumnKeys: (keys: ReadonlyArray<TColumnKey>) => void;

  /**
   * Optional saved views / presets configuration.
   * Enables saving and loading named column configurations.
   */
  viewConfig?: XDSColumnSettingsViewConfig<TColumnKey>;
}
```

### Return Type

```typescript
/**
 * Return value of useXDSTableColumnSettings.
 */
export interface UseXDSTableColumnSettingsReturn<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
> {
  /** The TablePlugin to pass to XDSTable's plugins prop. */
  plugin: TablePlugin<T>;

  /**
   * Filters and reorders the full columns array based on activeColumnKeys.
   * Returns only active columns, in the order specified by activeColumnKeys.
   *
   * @example
   * ```
   * <XDSTable columns={columnSettings.activeColumns(allColumns)} ... />
   * ```
   */
  activeColumns: (columns: XDSTableColumn<T>[]) => XDSTableColumn<T>[];

  /**
   * Toggle a column's visibility.
   * If the column is active, removes it. If inactive, adds it to the end.
   * No-op for columns with `isAlwaysVisible: true`.
   */
  toggleColumn: (key: TColumnKey) => void;

  /**
   * Whether a specific column is currently active (visible).
   */
  isColumnActive: (key: TColumnKey) => boolean;

  /**
   * Whether a specific column can be toggled.
   * Returns false for columns with `isAlwaysVisible: true`.
   */
  isColumnToggleable: (key: TColumnKey) => boolean;

  /**
   * Show all columns.
   */
  showAllColumns: () => void;

  /**
   * Reset to the default column set.
   * Uses `viewConfig.defaultColumnKeys` if views are configured,
   * otherwise shows all columns.
   */
  resetToDefault: () => void;

  /**
   * Pre-built dropdown items for use with XDSDropdownMenu.
   * Each item represents a column with a checkbox indicator.
   * Disabled items represent `isAlwaysVisible` columns.
   *
   * @example
   * ```
   * <XDSDropdownMenu
   *   button={{ label: 'Columns' }}
   *   items={columnSettings.dropdownItems}
   * />
   * ```
   */
  dropdownItems: XDSDropdownMenuOption[];

  /**
   * Currently active column keys (pass-through from config).
   */
  activeColumnKeys: ReadonlyArray<TColumnKey>;

  /**
   * View management methods (only present when viewConfig is provided).
   */
  views?: {
    /** All available views */
    list: ReadonlyArray<XDSColumnSettingsView<TColumnKey>>;
    /** Apply a saved view's column configuration */
    applyView: (viewId: string) => void;
    /** Create a new view from the current active columns */
    createView: (label: string) => void;
    /** Delete a saved view */
    deleteView: (viewId: string) => void;
    /** Set a view as the default */
    setDefaultView?: (viewId: string) => void;
    /** Reset to the system default columns */
    resetToDefault: () => void;
  };
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
| `transformTableContext` | **Yes** | Provides column settings context (for nested components that need access to column state) |

> **Note:** The plugin intentionally does NOT filter columns via a transform. Column filtering is done by the `activeColumns()` helper that the consumer passes to `<XDSTable columns={...}>`. This keeps the plugin interface minimal and avoids needing a `transformColumns` method on `TablePlugin<T>`.

### Implementation Skeleton

```typescript
export function useXDSTableColumnSettings<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
>(
  config: UseXDSTableColumnSettingsConfig<TColumnKey>,
): UseXDSTableColumnSettingsReturn<T, TColumnKey> {
  const { columns, activeColumnKeys, onChangeActiveColumnKeys, viewConfig } = config;

  // Build lookup sets for fast checks
  const activeSet = useMemo(
    () => new Set(activeColumnKeys),
    [activeColumnKeys],
  );

  const alwaysVisibleSet = useMemo(
    () => new Set(columns.filter(c => c.isAlwaysVisible).map(c => c.key)),
    [columns],
  );

  // --- Column operations ---

  const toggleColumn = useCallback((key: TColumnKey) => {
    if (alwaysVisibleSet.has(key)) return; // Can't toggle always-visible columns
    if (activeSet.has(key)) {
      onChangeActiveColumnKeys(activeColumnKeys.filter(k => k !== key));
    } else {
      onChangeActiveColumnKeys([...activeColumnKeys, key]);
    }
  }, [activeColumnKeys, onChangeActiveColumnKeys, activeSet, alwaysVisibleSet]);

  const isColumnActive = useCallback(
    (key: TColumnKey) => activeSet.has(key),
    [activeSet],
  );

  const isColumnToggleable = useCallback(
    (key: TColumnKey) => !alwaysVisibleSet.has(key),
    [alwaysVisibleSet],
  );

  const showAllColumns = useCallback(() => {
    onChangeActiveColumnKeys(columns.map(c => c.key));
  }, [columns, onChangeActiveColumnKeys]);

  const resetToDefault = useCallback(() => {
    if (viewConfig?.defaultColumnKeys) {
      onChangeActiveColumnKeys([...viewConfig.defaultColumnKeys]);
    } else {
      showAllColumns();
    }
  }, [viewConfig, onChangeActiveColumnKeys, showAllColumns]);

  // --- Column filtering helper ---

  const activeColumns = useCallback(
    (allColumns: XDSTableColumn<T>[]): XDSTableColumn<T>[] => {
      const columnMap = new Map(allColumns.map(c => [c.key, c]));
      return activeColumnKeys
        .map(key => columnMap.get(key))
        .filter((c): c is XDSTableColumn<T> => c != null);
    },
    [activeColumnKeys],
  );

  // --- Dropdown items ---

  const dropdownItems = useMemo((): XDSDropdownMenuOption[] => {
    // Group columns if any have a group defined
    const hasGroups = columns.some(c => c.group);

    if (!hasGroups) {
      return columns.map(col => ({
        label: `${activeSet.has(col.key) ? '✓ ' : '  '}${col.label}`,
        onClick: () => toggleColumn(col.key),
        isDisabled: alwaysVisibleSet.has(col.key),
      }));
    }

    // Build grouped sections
    const groups = new Map<string, XDSColumnSettingsOption<TColumnKey>[]>();
    const ungrouped: XDSColumnSettingsOption<TColumnKey>[] = [];

    for (const col of columns) {
      if (col.group) {
        const group = groups.get(col.group) ?? [];
        group.push(col);
        groups.set(col.group, group);
      } else {
        ungrouped.push(col);
      }
    }

    const items: XDSDropdownMenuOption[] = [];

    for (const [groupName, groupCols] of groups) {
      items.push({
        type: 'section',
        title: groupName,
        items: groupCols.map(col => ({
          label: `${activeSet.has(col.key) ? '✓ ' : '  '}${col.label}`,
          onClick: () => toggleColumn(col.key),
          isDisabled: alwaysVisibleSet.has(col.key),
        })),
      });
    }

    if (ungrouped.length > 0) {
      for (const col of ungrouped) {
        items.push({
          label: `${activeSet.has(col.key) ? '✓ ' : '  '}${col.label}`,
          onClick: () => toggleColumn(col.key),
          isDisabled: alwaysVisibleSet.has(col.key),
        });
      }
    }

    return items;
  }, [columns, activeSet, alwaysVisibleSet, toggleColumn]);

  // --- Views ---

  const views = viewConfig ? {
    list: viewConfig.views,
    applyView: (viewId: string) => {
      const view = viewConfig.views.find(v => v.id === viewId);
      if (view) onChangeActiveColumnKeys([...view.columnKeys]);
    },
    createView: (label: string) => {
      viewConfig.onCreateView(label, activeColumnKeys);
    },
    deleteView: (viewId: string) => {
      viewConfig.onDeleteView(viewId);
    },
    setDefaultView: viewConfig.onSetDefaultView
      ? (viewId: string) => viewConfig.onSetDefaultView!(viewId)
      : undefined,
    resetToDefault: () => {
      onChangeActiveColumnKeys([...viewConfig.defaultColumnKeys]);
    },
  } : undefined;

  // --- Plugin (minimal — context provider for nested access) ---

  const plugin = useMemo((): TablePlugin<T> => ({
    // The plugin provides context so that custom header cell renderers
    // or toolbar components nested inside the table can access column state.
    // Column filtering is handled by activeColumns(), not by the plugin.
    transformTableContext(children: ReactNode) {
      return children; // No-op for now; context can be added when needed
    },
  }), []);

  return {
    plugin,
    activeColumns,
    toggleColumn,
    isColumnActive,
    isColumnToggleable,
    showAllColumns,
    resetToDefault,
    dropdownItems,
    activeColumnKeys,
    views,
  };
}
```

---

## 3. Behavioral Specification

### 3.1 Column Toggle

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| User clicks column in dropdown | Column toggles visibility; table re-renders with updated columns | Checkbox role with checked/unchecked state | No-op for `isAlwaysVisible` columns |
| User clicks disabled column | No action | `aria-disabled="true"` on the item | Visual indicator (dimmed) that column can't be toggled |
| All optional columns hidden | Only `isAlwaysVisible` columns remain | — | At least one column should always be visible (enforced by `isAlwaysVisible`) |
| Unknown key in `activeColumnKeys` | `activeColumns()` filters it out silently | — | Does not crash; key is simply not found in column map |

### 3.2 Column Ordering

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| `activeColumnKeys` order changes | Table columns render in new order | Column headers maintain correct labels | Empty `activeColumnKeys` → no columns (only `isAlwaysVisible` should prevent this) |
| Column re-added after removal | Appears at the end of the table | — | Consumer can control position by inserting at specific index |

### 3.3 Show All / Reset

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| "Show all" action | All columns become visible in the order defined by `columns` config | — | No-op if all columns already visible |
| "Reset to default" action | Active columns reset to `defaultColumnKeys` (or all if no views) | — | No-op if already at default |

### 3.4 Saved Views

| Trigger | Render | Accessibility | Edge Cases |
|---|---|---|---|
| User selects a saved view | `activeColumnKeys` updates to the view's `columnKeys` | — | No-op if view not found |
| User creates a view | `onCreateView` called with label and current `activeColumnKeys` | — | Consumer handles persistence (localStorage, server, etc.) |
| User deletes a view | `onDeleteView` called with view ID | — | No-op for views with `isDeleteDisabled: true` |
| User sets default view | `onSetDefaultView` called with view ID | — | Optional — only available if `onSetDefaultView` provided |
| View's columns reference removed columns | `activeColumns()` silently filters out missing columns | — | View may render fewer columns than expected |

### 3.5 Interaction with Other Plugins

| Plugin | Interaction |
|---|---|
| **Selection** | Selection checkbox column is prepended by the selection plugin's `transformHeaderRow`/`transformBodyRow`. Column settings does not affect it — selection column is not in `columns`. |
| **Pagination** | No interaction — pagination operates on data, column settings operates on columns |
| **Sorting (future)** | Sort state should be keyed by column key. Hiding a sorted column should not break sort state. |

### 3.6 Dropdown UI Pattern

The `dropdownItems` return value is designed for use with `XDSDropdownMenu`:

```tsx
<XDSDropdownMenu
  button={{ label: 'Columns', icon: 'settings' }}
  items={columnSettings.dropdownItems}
/>
```

Each item shows a checkmark prefix (`✓` or space) to indicate active state. Disabled items (always-visible columns) show the checkmark but can't be toggled.

**Future enhancement:** When `XDSMultiSelector` or a checkbox-based dropdown exists, the dropdown items could use checkbox rendering instead of text checkmarks. The `dropdownItems` API is forward-compatible — it can be extended to include `isSelected` state.

---

## 4. Competitive Analysis

| Feature | WWW XDS Internal | XDS OSS (this spec) | shadcn/ui | Mantine | AG Grid |
|---|---|---|---|---|---|
| **Integration model** | Hook + separate UI | Hook + dropdown items helper | DataTable column toggle | No built-in | Built-in column API |
| **Column visibility** | ✅ via `activeColumnKeys` | ✅ via `activeColumnKeys` | ✅ via column `isVisible` | ❌ | ✅ `columnApi.setColumnVisible` |
| **Column ordering** | ✅ array order | ✅ array order | ❌ | ❌ | ✅ `columnApi.moveColumn` |
| **Always-visible columns** | ✅ `isColumnDisabled` | ✅ `isAlwaysVisible` | ❌ | ❌ | ✅ `lockVisible` |
| **Grouped columns** | ✅ via `groupedColumns` | ✅ via `group` on options | ❌ | ❌ | ✅ column groups |
| **Saved views** | ✅ `viewConfiguration` | ✅ `viewConfig` (optional) | ❌ | ❌ | ❌ |
| **Drag-and-drop reorder** | ✅ in ViewOption UI | ❌ (out of scope) | ❌ | ❌ | ✅ native |
| **Persistence** | URL params + localStorage | Consumer-owned | ❌ | ❌ | Consumer-owned |
| **UI component** | `XDSTableCustomColumnsDropdown` | `dropdownItems` for `XDSDropdownMenu` | Custom toggle buttons | N/A | Built-in sidebar |
| **Headless** | ✅ | ✅ | Partially | N/A | ❌ (grid-coupled) |

### Key Differentiators

1. **Headless with UI helpers** — Unlike AG Grid's coupled approach, XDS OSS provides the logic headlessly with `dropdownItems` as a convenient bridge to existing UI components
2. **Saved views** — shadcn and Mantine don't support saved view presets; XDS OSS matches WWW capability
3. **`activeColumns()` helper** — Clean separation: the hook provides the filtered/ordered column array, the consumer passes it to the table. No magic transforms.
4. **Grouped columns** — Column groups in the settings UI help organize large column sets

---

## 5. XDS Component Dependencies

| Component | Path | Exists | Usage |
|---|---|---|---|
| `XDSDropdownMenu` | `packages/core/src/DropdownMenu/XDSDropdownMenu.tsx` | ✅ | Renders column toggle dropdown (via `dropdownItems`) |
| `XDSCheckboxInput` | `packages/core/src/CheckboxInput/XDSCheckboxInput.tsx` | ✅ | Potential future use for checkbox-style items in dropdown |
| `XDSText` | `packages/core/src/Text/XDSText.tsx` | ✅ | Labels in dropdown sections |
| `XDSButton` | `packages/core/src/Button/` | ✅ | Trigger button (used by XDSDropdownMenu) |
| `XDSIcon` | `packages/core/src/Icon/` | ✅ | Icons in dropdown trigger |

**Missing (non-blocking):**

| Component | Status | Impact |
|---|---|---|
| `XDSMultiSelector` | ❌ Does not exist | Would improve column toggle UX with proper checkbox items instead of text checkmarks. The `dropdownItems` pattern with `XDSDropdownMenu` is the interim solution. |
| `XDSDragAndDrop` | ❌ Does not exist | Column reordering via drag-and-drop is out of scope. Consumers can implement via `activeColumnKeys` array manipulation. |

**No blocking prerequisites.** All required components exist. The text-checkmark pattern in `dropdownItems` is a pragmatic solution until `XDSMultiSelector` is built.

---

## 6. Test Specification

### Unit Tests (`useXDSTableColumnSettings.test.tsx`)

#### Hook Return Value
- `returns plugin object` — verify the plugin shape has `transformTableContext`
- `returns activeColumns function` — verify it exists and is callable
- `returns toggleColumn function` — verify callable
- `returns isColumnActive function` — verify callable
- `returns isColumnToggleable function` — verify callable
- `returns activeColumnKeys passthrough` — verify it matches config
- `returns views when viewConfig is provided` — verify views object shape
- `returns undefined views when viewConfig is omitted` — verify no views

#### `activeColumns` Helper
- `filters columns to only active keys` — 5 columns, 3 active → returns 3
- `preserves activeColumnKeys order` — keys=['c','a','b'] → columns ordered c, a, b
- `handles unknown keys gracefully` — activeColumnKeys includes key not in columns → filtered out
- `returns empty array for empty activeColumnKeys` — no columns shown
- `returns all columns when all keys active` — full set
- `maintains XDSTableColumn shape` — returned columns have key, header, renderCell, width

#### `toggleColumn`
- `removes active column` — toggles 'email' off → activeColumnKeys excludes 'email'
- `adds inactive column` — toggles 'status' on → activeColumnKeys includes 'status'
- `adds column at end` — newly toggled column appears last
- `no-op for isAlwaysVisible columns` — toggling 'name' does nothing
- `calls onChangeActiveColumnKeys with new array` — verify callback fired

#### `isColumnActive`
- `returns true for active columns` — key in activeColumnKeys
- `returns false for inactive columns` — key not in activeColumnKeys

#### `isColumnToggleable`
- `returns true for normal columns` — no isAlwaysVisible flag
- `returns false for always-visible columns` — isAlwaysVisible: true

#### `showAllColumns`
- `sets all column keys as active` — all keys from columns config
- `preserves columns config order` — order matches columns array, not prior activeColumnKeys

#### `resetToDefault`
- `resets to defaultColumnKeys when viewConfig provided` — uses viewConfig.defaultColumnKeys
- `shows all columns when no viewConfig` — falls back to showAllColumns behavior

#### `dropdownItems`
- `generates one item per column` — columns.length items for ungrouped
- `marks active columns with checkmark prefix` — '✓ Name' vs '  Email'
- `marks always-visible columns as disabled` — isDisabled: true
- `each item onClick calls toggleColumn` — verify toggle fires
- `groups columns by group field` — items with sections
- `ungrouped columns appear after sections` — correct ordering

#### Views
- `applyView sets activeColumnKeys to view's columnKeys` — view selection works
- `applyView no-ops for unknown view ID` — no crash
- `createView calls onCreateView with label and current keys` — passes through
- `deleteView calls onDeleteView with view ID` — passes through
- `setDefaultView calls onSetDefaultView` — passes through when configured
- `resetToDefault uses defaultColumnKeys` — resets to system defaults
- `views.list reflects viewConfig.views` — passthrough

#### Integration with XDSTable
- `table renders only active columns` — 3 of 5 columns visible
- `column order matches activeColumnKeys order` — visual order correct
- `toggling column re-renders table` — column appears/disappears
- `works alongside selection plugin` — selection checkbox column unaffected
- `works alongside pagination plugin` — no conflicts

#### Edge Cases
- `handles empty columns config` — no items, no errors
- `handles single column with isAlwaysVisible` — can't toggle, always shown
- `handles all columns isAlwaysVisible` — all shown, none toggleable
- `handles activeColumnKeys with duplicates` — deduplicated in activeColumns output
- `memoizes dropdownItems` — reference stable when deps unchanged
- `memoizes activeColumns callback` — reference stable when deps unchanged
- `plugin reference is stable` — does not change across renders

### Accessibility Tests
- `dropdown trigger has aria-haspopup` — via XDSDropdownMenu
- `dropdown items have aria-disabled for always-visible columns` — via isDisabled
- `dropdown menu has role="menu"` — via XDSDropdownMenu
- `keyboard navigation works in dropdown` — via XDSDropdownMenu (arrow keys, enter, escape)
