# useXDSTableColumnResize — Plugin Specification

## 1. WWW Reference Analysis

### API Surface

```ts
hook useXDSTableColumnResize<TItem, TColumnKey>(
  config: XDSTableColumnResizeConfig<TColumnKey>
): XDSTableColumnResize<TItem, TColumnKey>
```

**Config type:**

```ts
interface XDSTableColumnResizeConfig<TColumnKey> {
  /** Map of column keys to their current size specs */
  columnSizes: XDSColumnSizeSpecMap<TColumnKey>;
  /** Callback when a column resize operation completes */
  onColumnResizeEnd?: XDSTableOnColumnResizeEnd<TColumnKey>;
}

type XDSColumnSizeSpecMap<TColumnKey> = Map<TColumnKey, XDSTableColumnSizeSpec>;
type XDSTableColumnSizeSpec = { width: number };
type XDSTableOnColumnResizeEnd<TColumnKey> = (event: {
  columnKey: TColumnKey;
  newColumnWidth: number;
}) => void;
```

### Interaction Model (WWW)

- **Resize handle**: 6px invisible hit area positioned at the right edge of each header cell
- **Hover**: `cursor: ew-resize`, handle opacity transitions from 0 to 1
- **Dragging**: 1px colored line indicator visible during drag, uses theme colors via `useXDSTheme()`
- **StyleX**: Handle is `position: absolute`, `right: 0`, full height, `opacity: 0 → 1` on hover/active

### State Flow (WWW)

1. User hovers header cell right edge → handle becomes visible
2. `mousedown` on handle → begin drag, capture pointer
3. `mousemove` → update column width in real-time (pixel-based delta)
4. `mouseup` → finalize width, fire `onColumnResizeEnd` callback
5. During resize, proportional columns convert to pixel widths

---

## 2. XDS OSS Plugin API

### Hook Signature

```ts
function useXDSTableColumnResize<T extends Record<string, unknown>>(
  config: UseXDSTableColumnResizeConfig
): TablePlugin<T>
```

### Config Type

```ts
interface UseXDSTableColumnResizeConfig {
  /**
   * Column width overrides from resize operations.
   * Keys are column `key` strings. Values are pixel widths.
   * When a column key is present here, it overrides the column's
   * declared `width` (proportional or pixel).
   *
   * Controlled: consumer owns this state and persists as needed.
   */
  columnWidths?: Record<string, number>;

  /**
   * Called when a resize operation completes (mouseup / pointerup).
   * Consumer updates their `columnWidths` state here.
   */
  onColumnResizeEnd?: (event: {
    columnKey: string;
    newWidth: number;
  }) => void;

  /**
   * Minimum column width in pixels during resize.
   * @default 50
   */
  minWidth?: number;

  /**
   * Maximum column width in pixels during resize.
   * @default Infinity (no max)
   */
  maxWidth?: number;
}
```

### Design Decisions

**Why `Record<string, number>` instead of `Map`?**
XDS OSS uses plain objects for config throughout (see selection plugin). Maps add serialization friction and don't match the existing API patterns. Column keys are already `string` in `XDSTableColumn`.

**Why controlled state?**
The selection plugin pattern uses controlled state (`getIsItemSelected`, `onSelectItem`). Column resize follows the same principle — the consumer owns `columnWidths` in their state and updates it via `onColumnResizeEnd`. This makes persistence (localStorage, URL params, server) trivial.

**Proportional → Pixel Conversion on Resize:**
When a user starts resizing a proportional column, the plugin must resolve its current rendered pixel width (via `getBoundingClientRect()` on the `<th>`) and operate in pixel space from that point forward. The `onColumnResizeEnd` callback reports the final pixel width. The consumer's `columnWidths` state then overrides the original proportional width for that column.

Columns that are never resized keep their original `proportional()` or `pixel()` width — only resized columns get pixel overrides.

**Double-Click Auto-Fit:**
Double-clicking the resize handle should auto-size the column to fit its content. Implementation approach:
1. On `dblclick`, measure the natural content width of all visible cells in the column
2. Create an off-screen measurement element, render cell content, read `scrollWidth`
3. Clamp to `[minWidth, maxWidth]`, fire `onColumnResizeEnd` with the result

This is a P1 follow-up, not required for initial implementation.

### Plugin Transforms Used

| Transform | Purpose |
|---|---|
| `transformHeaderCell` | Inject resize handle element into each header cell; apply `position: relative` so handle can be absolutely positioned; apply `width` style override from `columnWidths` |
| `transformTable` | Add `user-select: none` to `<table>` during active drag to prevent text selection |

The plugin does NOT use:
- `transformHeaderRow` — no row-level changes needed
- `transformBodyRow` — body rows don't need modification
- `transformBodyCell` — column widths are controlled via `<th>` with `table-layout: fixed`
- `transformTableContext` — no context provider needed (resize state is internal to the hook)

### Colgroup Strategy

The current `XDSBaseTable` uses `table-layout: fixed` and sets widths via `<th>` `minWidth` styles. The resize plugin continues this pattern: overridden widths are applied as inline `width` + `minWidth` + `maxWidth` (all set to the same pixel value) on the `<th>` via `transformHeaderCell`. This locks the column to the resized width under `table-layout: fixed`.

No `<colgroup>` is introduced. This keeps the plugin self-contained and avoids structural changes to `XDSBaseTable`.

### Persist Model

The plugin is **stateless** — it receives `columnWidths` and reports changes via `onColumnResizeEnd`. Persistence is the consumer's responsibility:

```tsx
// Example: useState persistence
const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

const resizePlugin = useXDSTableColumnResize({
  columnWidths,
  onColumnResizeEnd: ({ columnKey, newWidth }) => {
    setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
  },
});

// Example: localStorage persistence
const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
  const saved = localStorage.getItem('table-widths');
  return saved ? JSON.parse(saved) : {};
});

const resizePlugin = useXDSTableColumnResize({
  columnWidths,
  onColumnResizeEnd: ({ columnKey, newWidth }) => {
    setColumnWidths(prev => {
      const next = { ...prev, [columnKey]: newWidth };
      localStorage.save('table-widths', JSON.stringify(next));
      return next;
    });
  },
});
```

### Reset API

Consumers can reset column widths by clearing their state:

```tsx
// Reset single column
setColumnWidths(prev => {
  const { [columnKey]: _, ...rest } = prev;
  return rest;
});

// Reset all
setColumnWidths({});
```

No special reset API is needed in the plugin.

---

## 3. Behavioral Spec

### 3.1 Hover

| State | Visual |
|---|---|
| Mouse not near right edge of `<th>` | No resize indicator visible |
| Mouse enters 6px hit area at right edge | `cursor: ew-resize`; resize handle fades in (1px vertical line, theme accent color) |
| Mouse leaves hit area | Handle fades out |

The hit area extends 3px inside and 3px outside the cell border to make it easy to target.

### 3.2 Drag (Pointer-Based Resize)

| Step | Behavior |
|---|---|
| `pointerdown` on handle | Capture pointer (`setPointerCapture`). Record initial column width and pointer X. Add `user-select: none` to table. |
| `pointermove` | Calculate delta = `currentX - startX`. New width = `max(minWidth, min(maxWidth, initialWidth + delta))`. Apply width to `<th>` via inline style (live preview). |
| `pointerup` | Release pointer capture. Remove `user-select: none`. Fire `onColumnResizeEnd({ columnKey, newWidth })`. |
| Drag below `minWidth` | Column clamps to `minWidth`; cursor continues tracking but width doesn't decrease further. |
| Drag above `maxWidth` | Column clamps to `maxWidth`. |
| `pointercancel` / blur | Abort resize; revert to width before drag started. |

**Why pointer events, not mouse events?**
Pointer events provide `setPointerCapture`, which ensures `pointermove`/`pointerup` fire on the handle element even when the pointer moves outside the element or the window. This eliminates the need for document-level event listeners and works correctly with touch input.

### 3.3 Release

- On `pointerup`, the final width is committed via `onColumnResizeEnd`.
- The `<th>` inline style applied during drag remains in place (it matches the committed width).
- Adjacent columns reflow naturally under `table-layout: fixed` — their proportional widths redistribute within remaining space.

### 3.4 Double-Click (Auto-Fit) — P1 Follow-Up

| Step | Behavior |
|---|---|
| `dblclick` on resize handle | Measure natural content width of all visible cells in the column. Clamp to `[minWidth, maxWidth]`. Fire `onColumnResizeEnd`. |

### 3.5 Keyboard Accessibility

| Key | Behavior |
|---|---|
| `Tab` | Resize handle is focusable (rendered as a `<div role="separator" tabIndex={0}>`) |
| `Enter` / `Space` | Activate resize mode (equivalent to pointerdown) |
| `ArrowLeft` | Decrease column width by 10px (clamped to minWidth) |
| `ArrowRight` | Increase column width by 10px (clamped to maxWidth) |
| `Shift+ArrowLeft/Right` | Decrease/increase by 50px |
| `Escape` | Cancel resize, revert to width before activation |
| `Enter` (while active) | Commit current width, exit resize mode |

**ARIA attributes on the handle:**
```tsx
<div
  role="separator"
  aria-orientation="vertical"
  aria-valuenow={currentWidth}
  aria-valuemin={minWidth}
  aria-valuemax={maxWidth}
  aria-label={`Resize column ${columnHeader}`}
  tabIndex={0}
/>
```

### 3.6 RTL Support

In RTL layouts, the resize handle appears at the left edge of the header cell (logical "end" edge). Drag direction is inverted: dragging left increases width, dragging right decreases.

Use CSS logical properties (`inset-inline-end: 0`) for handle positioning so RTL works automatically.

### 3.7 Touch Support

Pointer events handle touch natively. The 6px hit area may be too small for touch — consider increasing to 16px on touch devices via `@media (pointer: coarse)`.

---

## 4. Competitive Analysis

### 4.1 WWW XDS Internal (`useXDSTableColumnResize`)

- **Architecture**: Wraps `useWebTableColumnResize` with XDS theming
- **Width model**: `Map<TColumnKey, { width: number }>` — pixel-only after resize
- **Handle**: 6px absolute-positioned div, opacity animation
- **Callback**: `onColumnResizeEnd({ columnKey, newColumnWidth })`
- **Strengths**: Proven in production, theme-integrated
- **Gaps**: No keyboard a11y, no auto-fit, no RTL consideration documented

### 4.2 AG Grid

- **Architecture**: Built into column definition; `resizable: true` per column
- **Width model**: Pixel widths with `minWidth`/`maxWidth` per column
- **Handle**: Appears between column headers
- **Auto-fit**: `autoSizeColumn()` / `autoSizeAllColumns()` API
- **Callback**: `onColumnResized` event with `{ column, finished, source }`
- **Strengths**: `source` field distinguishes user vs API resize; auto-size API; `suppressAutoSize` per column
- **Gaps**: Heavy abstraction, not composable as a plugin

### 4.3 Mantine Table

- **Architecture**: `columnSizing` state in `useReactTable` (TanStack-based)
- **Width model**: `columnSizingInfo` tracks delta during drag
- **Handle**: CSS class on th, styled separator
- **Callback**: `onColumnSizingChange` state updater
- **Strengths**: TanStack integration, declarative state
- **Gaps**: Tightly coupled to TanStack table internals

### 4.4 TanStack Table

- **Architecture**: `columnResizing` feature; `enableResizing` per column
- **Width model**: Tracks `deltaOffset` during drag, `columnSizingInfo` state
- **Resize modes**: `onChange` (live) and `onEnd` (commit on release)
- **Handle**: Consumer renders using `header.getResizeHandler()`
- **Callback**: `onColumnSizingChange`, `onColumnSizingInfoChange`
- **Strengths**: Headless — complete rendering control; two resize modes; works with any framework
- **Gaps**: Consumer responsible for all rendering; no built-in a11y

### Summary

| Feature | WWW | AG Grid | Mantine | TanStack | XDS OSS (proposed) |
|---|---|---|---|---|---|
| Plugin/composable | Yes | No (built-in) | No (TanStack) | Yes (headless) | Yes |
| Controlled state | Yes | Partial | Yes | Yes | Yes |
| Min/max constraints | No | Yes | No | No | Yes |
| Keyboard a11y | No | Yes | No | No | Yes |
| Auto-fit | No | Yes | No | No | P1 |
| RTL | Unknown | Yes | Unknown | No | Yes |
| Live preview | Yes | Yes | Optional | Optional | Yes |
| Persist model | Consumer | Built-in | Consumer | Consumer | Consumer |

---

## 5. Component Dependencies

### Required (exist in XDS OSS)

| Dependency | Location | Purpose |
|---|---|---|
| `TablePlugin<T>` | `Table/types.ts` | Plugin interface — hook return type |
| `HeaderCellRenderProps` | `Table/types.ts` | Transform target for header cells |
| `TableRenderProps` | `Table/types.ts` | Transform target for table element |
| `XDSTableColumn<T>` | `Table/types.ts` | Column definition (passed to `transformHeaderCell`) |
| `colorVars` | `theme/tokens.stylex.ts` | Theme color tokens for handle styling |
| `spacingVars` | `theme/tokens.stylex.ts` | Theme spacing tokens |
| `stylex` | `@stylexjs/stylex` | Style definitions |

### Used from Platform

| Dependency | Purpose |
|---|---|
| `React.useRef` | Track drag state, store refs |
| `React.useMemo` | Stable plugin object |
| `React.useCallback` | Stable event handlers |
| `PointerEvent` | Cross-platform drag handling |

### Not Required

- No new components needed — the resize handle is a plain `<div>` rendered inside the existing `<th>`
- No context provider needed — drag state is local to the hook
- No external libraries — pointer events are sufficient for drag handling

---

## 6. Test Specification

### 6.1 Unit Tests — Hook Behavior

| # | Test | Assertion |
|---|---|---|
| 1 | Returns a stable `TablePlugin` object across re-renders | `plugin` reference identity does not change when config callbacks change |
| 2 | `transformHeaderCell` adds resize handle to each header cell | Rendered header cell contains a `[role="separator"]` element |
| 3 | `transformHeaderCell` applies width override when `columnWidths` has entry | `<th>` has inline `width` style matching the override value |
| 4 | `transformHeaderCell` does not override width when `columnWidths` is empty | `<th>` has no inline `width` style from the plugin |
| 5 | `transformTable` does not add `user-select: none` when not dragging | Table element has normal `user-select` |

### 6.2 Integration Tests — Resize Interaction

| # | Test | Assertion |
|---|---|---|
| 6 | Pointer drag resizes column | Simulate `pointerdown` → `pointermove(+100px)` → `pointerup` on handle. `onColumnResizeEnd` called with `{ columnKey, newWidth: initialWidth + 100 }` |
| 7 | Drag respects `minWidth` | Drag left past `minWidth`. `onColumnResizeEnd` reports `minWidth`, not a smaller value |
| 8 | Drag respects `maxWidth` | Drag right past `maxWidth`. `onColumnResizeEnd` reports `maxWidth` |
| 9 | Live preview during drag | During `pointermove`, the `<th>` inline style updates to reflect current drag position |
| 10 | Cancel on Escape during drag | Press `Escape` during drag. Width reverts to pre-drag value. `onColumnResizeEnd` is NOT called |
| 11 | Cancel on pointer cancel | Fire `pointercancel` during drag. Width reverts. No callback |
| 12 | Double-click calls onColumnResizeEnd (P1) | `dblclick` on handle fires callback with auto-fit width |

### 6.3 Integration Tests — Table Rendering

| # | Test | Assertion |
|---|---|---|
| 13 | Plugin composes with selection plugin | Table with both `useXDSTableSelection` and `useXDSTableColumnResize` renders correctly — selection checkbox column and resize handles both present |
| 14 | Proportional columns get correct initial pixel width | Render table with `proportional(2)` and `proportional(1)` columns. Start resize on the 2:1 column. Initial width captured via `getBoundingClientRect` is approximately 2/3 of table width |
| 15 | Resized column persists across re-renders | Set `columnWidths` state, trigger parent re-render. Column retains pixel width |
| 16 | Reset column width | Remove a key from `columnWidths`. Column reverts to its declared `proportional()` or `pixel()` width |

### 6.4 Keyboard Accessibility Tests

| # | Test | Assertion |
|---|---|---|
| 17 | Handle is focusable via Tab | `Tab` to resize handle. Element receives focus |
| 18 | Enter activates resize mode | Focus handle, press `Enter`. Resize mode is active (aria state updates) |
| 19 | Arrow keys adjust width | In resize mode, `ArrowRight` increases width by 10px. `ArrowLeft` decreases by 10px |
| 20 | Shift+Arrow for large steps | `Shift+ArrowRight` increases by 50px |
| 21 | Escape cancels keyboard resize | Activate resize, press `ArrowRight` twice, then `Escape`. Width reverts to original |
| 22 | Enter commits keyboard resize | Activate resize, press `ArrowRight` three times, press `Enter`. `onColumnResizeEnd` called with `+30px` |

### 6.5 ARIA Tests

| # | Test | Assertion |
|---|---|---|
| 23 | Handle has `role="separator"` | Resize handle element has `role="separator"` |
| 24 | Handle has `aria-orientation="vertical"` | Attribute present |
| 25 | Handle has `aria-valuenow` | Value matches current column width |
| 26 | Handle has `aria-label` | Label includes column header text |

### 6.6 Edge Cases

| # | Test | Assertion |
|---|---|---|
| 27 | No columns → no crash | Plugin with empty columns array renders without error |
| 28 | Single column resize | Table with one column can be resized (doesn't collapse table) |
| 29 | Rapid sequential resizes | Multiple quick resize operations don't produce stale state |
| 30 | Column reorder after resize | If columns prop changes (reorder), `columnWidths` keys still map correctly |
| 31 | `user-select: none` is cleaned up | After drag ends (including cancel), `user-select` is removed from table |
| 32 | Touch drag works | `pointerdown` with `pointerType: "touch"` works the same as mouse |
