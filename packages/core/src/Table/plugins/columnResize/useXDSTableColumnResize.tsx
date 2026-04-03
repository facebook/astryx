'use client';

/**
 * @file useXDSTableColumnResize.tsx
 * @input React, types, StyleX, theme tokens
 * @output Exports useXDSTableColumnResize hook and UseXDSTableColumnResizeConfig type
 * @position Column resize plugin; consumed by XDSTable via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (resize documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useRef, useMemo, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../../../theme/tokens.stylex';
import type {
  TablePlugin,
  HeaderCellRenderProps,
  XDSTableColumn,
  ColumnWidth,
} from '../../types';
import {DEFAULT_MIN_COLUMN_WIDTH} from '../../columnUtils';

// =============================================================================
// Config Type
// =============================================================================

export interface UseXDSTableColumnResizeConfig {
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
   * Called when a resize operation completes (pointerup / Enter key).
   * Consumer updates their `columnWidths` state here.
   */
  /**
   * Called when a resize operation completes (pointerup / Enter key).
   * Receives a map of ALL column keys that changed width — the resized column
   * plus any other columns that were committed to pixel widths to prevent
   * layout shift. Consumer should merge these into their columnWidths state.
   */
  onColumnResizeEnd?: (updates: Record<string, number>) => void;

  /**
   * Global minimum column width in pixels during resize.
   * Overrides per-column defaults when set.
   * @default undefined (uses column-specific minimum)
   */
  minWidth?: number;

  /**
   * Global maximum column width in pixels during resize.
   * @default Infinity (no max)
   */
  maxWidth?: number;

  /**
   * Column definitions — needed to derive per-column min widths
   * and detect proportional vs pixel columns for last-column behavior.
   *
   * When proportional columns are detected, the resize handle
   * automatically adjusts the neighboring column instead of the
   * proportional column itself. The last proportional column has
   * no resize handle (it flexes to fill remaining space).
   *
   * When not provided, all columns are treated as pixel columns
   * and the global minWidth fallback (50px) is used.
   */
  columns?: XDSTableColumn<Record<string, unknown>>[];
}

// =============================================================================
// Constants
// =============================================================================

const FALLBACK_MIN_WIDTH = 50;
const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

// =============================================================================
// Width Helpers
// =============================================================================

/**
 * Derive the effective minimum width for a column based on its width config.
 * - Proportional columns: use their declared minWidth (default 120px)
 * - Pixel columns: use their declared value (you set 200px, min is 200px)
 * - No width / unknown: use DEFAULT_MIN_COLUMN_WIDTH
 *
 * A global override (from config.minWidth) takes precedence when set.
 */
function resolveColumnMinWidth(
  colWidth: ColumnWidth | undefined,
  globalOverride: number | undefined,
): number {
  if (globalOverride != null) return globalOverride;
  if (!colWidth) return DEFAULT_MIN_COLUMN_WIDTH;
  if (colWidth.type === 'proportional') {
    return colWidth.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
  }
  if (colWidth.type === 'pixel') {
    return colWidth.value;
  }
  return FALLBACK_MIN_WIDTH;
}

/**
 * Check whether a column is proportional (or has no explicit width,
 * which defaults to proportional(1) in XDSBaseTable).
 */
function isProportionalColumn(colWidth: ColumnWidth | undefined): boolean {
  return !colWidth || colWidth.type === 'proportional';
}

// =============================================================================
// Central width computation
// =============================================================================

/**
 * Given a drag delta, compute pixel widths for ALL columns.
 * Only the target column (or neighbor in proportional mode) changes;
 * all others stay at their snapshot values. The last column gets the
 * remainder (tableWidth - sum of others).
 *
 * Every width is clamped to its column's min. This is the single source
 * of truth for column widths during drag — no other code path should
 * compute widths independently.
 */
function computeColumnWidths(drag: DragState, delta: number): number[] {
  const {snapshots, resizeIndex, neighborIndex, tableWidth} = drag;
  const widths = snapshots.map(s => s.initialWidth);
  const lastIndex = snapshots.length - 1;

  if (neighborIndex != null) {
    // Proportional-preserving: adjust the neighbor column inversely.
    const neighbor = snapshots[neighborIndex];
    const self = snapshots[resizeIndex];

    // Clamp: neighbor can't go below its min
    const maxDelta = neighbor.initialWidth - neighbor.minWidth;
    // Clamp: self can't go below its min
    const minDelta = self.minWidth - self.initialWidth;
    const clampedDelta = Math.max(minDelta, Math.min(delta, maxDelta));

    widths[neighborIndex] = neighbor.initialWidth - clampedDelta;
    widths[resizeIndex] = self.initialWidth + clampedDelta;
  } else {
    // Direct resize: clamp to min/max
    const self = snapshots[resizeIndex];
    const newWidth = Math.min(
      self.maxWidth,
      Math.max(self.minWidth, self.initialWidth + delta),
    );
    widths[resizeIndex] = newWidth;
  }

  // Last column = remainder (table can grow horizontally if needed)
  if (lastIndex >= 0 && tableWidth > 0) {
    const sumOthers = widths.reduce(
      (sum, w, i) => (i === lastIndex ? sum : sum + w),
      0,
    );
    widths[lastIndex] = Math.max(
      snapshots[lastIndex].minWidth,
      tableWidth - sumOthers,
    );
  }

  return widths;
}

// =============================================================================
// Styles
// =============================================================================

const handleStyles = stylex.create({
  base: {
    position: 'absolute',
    // Keep entirely inside the <th> — extending outside gets clipped by the
    // adjacent <th>'s overflow:hidden.
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    // Wide transparent hit area; the right 1px becomes the visible indicator.
    width: '8px',
    cursor: 'ew-resize',
    zIndex: 1,
    touchAction: 'none',
    userSelect: 'none',
    // The rightmost 1px acts as the resize indicator line.
    // Use a right border rather than ::after so it reliably renders
    // without needing pseudo-element content/dimensions.
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: {
      default: 'transparent',
      ':hover': colorVars['--color-accent'],
      ':focus-visible': colorVars['--color-accent'],
    },
    transition: 'border-color 150ms ease',
    '@media (pointer: coarse)': {
      width: '20px',
    },
  },
});

const headerCellRelative = stylex.create({
  base: {
    position: 'relative',
    overflow: 'visible',
  },
});

// =============================================================================
// Drag State (ref-based, not React state — avoids re-renders during drag)
// =============================================================================

interface ColumnSnapshot {
  key: string;
  th: HTMLTableCellElement;
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
}

interface DragState {
  columnKey: string;
  startX: number;
  /** Index of the column being resized in the snapshots array */
  resizeIndex: number;
  /** When resizing a proportional column, we resize the next column instead */
  neighborIndex: number | null;
  /** Snapshot of ALL columns at drag start */
  snapshots: ColumnSnapshot[];
  /** Table width at drag start — last column fills remainder */
  tableWidth: number;
}

// =============================================================================
// Resize Handle Component
// =============================================================================

interface ResizeHandleProps {
  columnKey: string;
  columnHeader: ReactNode;
  currentWidth: number | undefined;
  minWidth: number;
  maxWidth: number;
  /** For proportional-preserving: the neighbor column to resize instead */
  neighborKey: string | null;
  neighborMinWidth: number;
  configRef: React.RefObject<UseXDSTableColumnResizeConfig>;
  dragStateRef: React.RefObject<DragState | null>;
  isDraggingRef: React.RefObject<boolean>;
  tableRef: React.RefObject<HTMLTableElement | null>;
}

function ResizeHandle({
  columnKey,
  columnHeader,
  currentWidth,
  minWidth,
  maxWidth,
  neighborKey,
  neighborMinWidth,
  configRef,
  dragStateRef,
  isDraggingRef,
  tableRef,
}: ResizeHandleProps) {
  /**
   * Resolve the effective maximum width. When no explicit maxWidth is set,
   * use the table's current width as a natural ceiling — no single column
   * should exceed the table's bounds.
   */
  const clamp = useCallback(
    (value: number, min: number = minWidth, max: number = maxWidth) =>
      Math.max(min, Math.min(max, value)),
    [minWidth, maxWidth],
  );

  const applyWidth = useCallback(
    (th: HTMLTableCellElement, width: number, min?: number, max?: number) => {
      const clamped = clamp(width, min, max);
      const px = `${clamped}px`;
      th.style.width = px;
      th.style.minWidth = px;
      th.style.maxWidth = px;
    },
    [clamp],
  );

  const setTableDragging = useCallback(
    (dragging: boolean) => {
      const table = tableRef.current;
      if (table) {
        table.style.userSelect = dragging ? 'none' : '';
      }
    },
    [tableRef],
  );

  const getRTLMultiplier = useCallback((el: HTMLElement): number => {
    const dir = getComputedStyle(el).direction;
    return dir === 'rtl' ? -1 : 1;
  }, []);

  /**
   * Resolve the neighbor <th> element from the handle's <th>.
   * The neighbor is the next sibling <th> in DOM order.
   */
  const resolveNeighborTh = useCallback(
    (th: HTMLTableCellElement): HTMLTableCellElement | null => {
      if (!neighborKey) return null;
      const row = th.parentElement;
      if (!row) return null;
      return row.querySelector<HTMLTableCellElement>(
        `th[data-column-key="${neighborKey}"]`,
      );
    },
    [neighborKey],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const handle = e.currentTarget;
      const th = handle.closest('th') as HTMLTableCellElement | null;
      if (!th) return;

      const table = th.closest('table');
      if (table) tableRef.current = table;

      const headerRow = th.parentElement;
      if (!headerRow) return;

      const cols = configRef.current.columns;
      const colsByKey = new Map(cols?.map(c => [c.key, c]));
      const allThs = Array.from(
        headerRow.querySelectorAll<HTMLTableCellElement>(':scope > th'),
      );
      const tableWidth = tableRef.current?.getBoundingClientRect().width ?? 0;

      // Snapshot only resizable columns — skip non-resizable synthetic
      // columns (e.g. selection checkbox) so they don't shift indices
      // or participate in width redistribution during drag.
      const currentWidths = configRef.current.columnWidths ?? {};
      const snapshots: ColumnSnapshot[] = [];
      for (const cell of allThs) {
        const key = cell.getAttribute('data-column-key');
        if (!key) continue;
        const col = colsByKey.get(key);
        if (col?.resizable === false) continue;
        const rendered = cell.getBoundingClientRect().width;
        const override = currentWidths[key];
        snapshots.push({
          key,
          th: cell,
          initialWidth: override ?? (rendered > 0 ? rendered : 0),
          minWidth: col
            ? resolveColumnMinWidth(col.width, configRef.current.minWidth)
            : minWidth,
          maxWidth: configRef.current.maxWidth ?? Infinity,
        });
      }

      // Find our column and neighbor in the snapshots by key
      const resizeIndex = snapshots.findIndex(s => s.key === columnKey);
      let neighborIdx: number | null = null;
      if (neighborKey) {
        const idx = snapshots.findIndex(s => s.key === neighborKey);
        if (idx >= 0) neighborIdx = idx;
      }

      const drag: DragState = {
        columnKey,
        startX: e.clientX,
        resizeIndex,
        neighborIndex: neighborIdx,
        snapshots,
        tableWidth,
      };
      dragStateRef.current = drag;
      isDraggingRef.current = true;
      handle.setAttribute('data-resizing', 'true');

      // Apply initial snapshot widths to ALL columns (freezes layout)
      const initialWidths = computeColumnWidths(drag, 0);
      snapshots.forEach((s, i) => {
        const px = `${initialWidths[i]}px`;
        s.th.style.width = px;
        s.th.style.minWidth = px;
        s.th.style.maxWidth = px;
      });
      setTableDragging(true);

      // --- Window-level listeners ---

      function onMove(ev: PointerEvent) {
        const d = dragStateRef.current;
        if (!d || !isDraggingRef.current) return;

        const rawDelta =
          (ev.clientX - d.startX) *
          getRTLMultiplier(d.snapshots[d.resizeIndex].th);
        const widths = computeColumnWidths(d, rawDelta);

        d.snapshots.forEach((s, i) => {
          const px = `${widths[i]}px`;
          s.th.style.width = px;
          s.th.style.minWidth = px;
          s.th.style.maxWidth = px;
        });
      }

      function onUp(ev: PointerEvent) {
        cleanup();
        const d = dragStateRef.current;
        if (!d || !isDraggingRef.current) return;

        handle.removeAttribute('data-resizing');
        isDraggingRef.current = false;
        dragStateRef.current = null;
        setTableDragging(false);

        const rawDelta =
          (ev.clientX - d.startX) *
          getRTLMultiplier(d.snapshots[d.resizeIndex].th);
        const widths = computeColumnWidths(d, rawDelta);

        // Build updates map — all columns except the last
        const updates: Record<string, number> = {};
        const lastIndex = d.snapshots.length - 1;
        d.snapshots.forEach((s, i) => {
          if (i === lastIndex) return;
          updates[s.key] = widths[i];
        });

        // Don't clear inline styles — leave them in place so there's no flash
        // between clearing and React re-rendering with the new columnWidths.
        // The plugin's transformHeaderCell will set the same pixel values on
        // the next render, seamlessly replacing these inline styles.

        if (Object.keys(updates).length > 0) {
          configRef.current.onColumnResizeEnd?.(updates);
        }
      }

      function onCancel() {
        cleanup();
        const d = dragStateRef.current;
        if (!d || !isDraggingRef.current) return;

        handle.removeAttribute('data-resizing');
        isDraggingRef.current = false;
        dragStateRef.current = null;
        setTableDragging(false);

        // Restore to pre-drag state by clearing all inline styles
        d.snapshots.forEach(s => {
          s.th.style.width = '';
          s.th.style.minWidth = '';
          s.th.style.maxWidth = '';
        });
      }

      function cleanup() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    },
    [
      columnKey,
      neighborKey,
      minWidth,
      resolveNeighborTh,
      getRTLMultiplier,
      dragStateRef,
      isDraggingRef,
      tableRef,
      configRef,
      setTableDragging,
    ],
  );

  /**
   * Keyboard resize per WAI-ARIA Window Splitter pattern.
   * Arrow keys resize immediately on focus — no activation step.
   * Each keypress commits the new width directly.
   * Home/End jump to min/max width.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const handle = e.currentTarget;
      const th = handle.closest('th') as HTMLTableCellElement | null;
      if (!th) return;

      const table = th.closest('table');
      if (table) tableRef.current = table;

      const step = e.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      const rtl = getRTLMultiplier(th);

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowLeft': {
          e.preventDefault();
          const direction = e.key === 'ArrowRight' ? 1 : -1;
          const delta = step * direction * rtl;

          if (neighborKey) {
            // Proportional-preserving: adjust neighbor inversely, clamped so
            // it never drops below its min (which also prevents this column
            // from growing into the last column's reserved minimum space).
            const nTh = resolveNeighborTh(th);
            if (nTh) {
              const curNeighbor = nTh.getBoundingClientRect().width;
              const newWidth = Math.max(neighborMinWidth, curNeighbor - delta);
              applyWidth(nTh, newWidth, neighborMinWidth);
              configRef.current.onColumnResizeEnd?.({[neighborKey]: newWidth});
            }
          } else {
            const curWidth = currentWidth ?? th.getBoundingClientRect().width;
            const newWidth = clamp(curWidth + delta);
            applyWidth(th, newWidth);
            configRef.current.onColumnResizeEnd?.({[columnKey]: newWidth});
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (neighborKey) {
            const nTh = resolveNeighborTh(th);
            if (nTh) {
              applyWidth(nTh, neighborMinWidth, neighborMinWidth);
              configRef.current.onColumnResizeEnd?.({
                [neighborKey]: neighborMinWidth,
              });
            }
          } else {
            applyWidth(th, minWidth);
            configRef.current.onColumnResizeEnd?.({[columnKey]: minWidth});
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (maxWidth !== Infinity) {
            applyWidth(th, maxWidth);
            configRef.current.onColumnResizeEnd?.({[columnKey]: maxWidth});
          }
          break;
        }
      }
    },
    [
      columnKey,
      currentWidth,
      neighborKey,
      neighborMinWidth,
      resolveNeighborTh,
      getRTLMultiplier,
      clamp,
      minWidth,
      maxWidth,
      applyWidth,
      configRef,
      tableRef,
    ],
  );

  const ariaLabel =
    typeof columnHeader === 'string'
      ? `Resize column ${columnHeader}`
      : `Resize column ${columnKey}`;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={currentWidth ?? undefined}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth === Infinity ? undefined : maxWidth}
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...stylex.props(handleStyles.base)}
    />
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useXDSTableColumnResize<T extends Record<string, unknown>>(
  config: UseXDSTableColumnResizeConfig,
): TablePlugin<T> {
  const configRef = useRef(config);
  configRef.current = config;

  const dragStateRef = useRef<DragState | null>(null);
  const isDraggingRef = useRef(false);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const globalMinWidth = config.minWidth;
  const maxWidth = config.maxWidth ?? Infinity;
  const columnWidths = config.columnWidths;
  const columns = config.columns;

  // Central list of resizable columns — filters out non-resizable columns
  // (e.g. selection checkbox) once so that all index-based logic (neighbor
  // detection, last-column checks, drag snapshots) operates on a consistent
  // set. Without this, synthetic columns injected by other plugins shift
  // indices and break width computation.
  const resizableColumns = useMemo(
    () => columns?.filter(c => c.resizable !== false),
    [columns],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: XDSTableColumn<T>,
      ): HeaderCellRenderProps {
        // Skip columns that opt out of resizing
        if (column.resizable === false) return props;

        const overrideWidth = columnWidths?.[column.key];

        // Derive per-column min width from the column's own width config
        const effectiveMinWidth = resolveColumnMinWidth(
          column.width,
          globalMinWidth,
        );

        // Determine if this is a proportional column that should
        // delegate resize to its neighbor (the next column).
        // This prevents weird behavior when the table is 100% width
        // and the last column is proportional — it just flexes.
        // Uses resizableColumns so indices aren't shifted by non-resizable
        // synthetic columns (e.g. selection).
        let neighborKey: string | null = null;
        let neighborMinWidth = FALLBACK_MIN_WIDTH;

        if (resizableColumns && isProportionalColumn(column.width)) {
          const colIndex = resizableColumns.findIndex(
            c => c.key === column.key,
          );
          if (colIndex >= 0 && colIndex < resizableColumns.length - 1) {
            const nextCol = resizableColumns[colIndex + 1];
            neighborKey = nextCol.key;
            neighborMinWidth = resolveColumnMinWidth(
              nextCol.width,
              globalMinWidth,
            );
          }
        }

        // If this is the last resizable column and it's proportional, skip
        // the handle. There's no neighbor to resize and resizing a flex
        // column in a full-width table produces unpredictable results.
        if (resizableColumns) {
          const colIndex = resizableColumns.findIndex(
            c => c.key === column.key,
          );
          const isLastResizable = colIndex === resizableColumns.length - 1;
          if (isLastResizable && isProportionalColumn(column.width)) {
            return props;
          }
        }

        const widthStyle: React.CSSProperties | undefined =
          overrideWidth != null
            ? {
                width: `${overrideWidth}px`,
                minWidth: `${overrideWidth}px`,
                maxWidth: `${overrideWidth}px`,
              }
            : undefined;

        const existingStyle = props.htmlProps.style as
          | React.CSSProperties
          | undefined;
        const mergedStyle = widthStyle
          ? existingStyle
            ? {...existingStyle, ...widthStyle}
            : widthStyle
          : existingStyle;

        const handle = (
          <ResizeHandle
            key={`resize-${column.key}`}
            columnKey={column.key}
            columnHeader={column.header ?? column.key}
            currentWidth={overrideWidth}
            minWidth={effectiveMinWidth}
            maxWidth={maxWidth}
            neighborKey={neighborKey}
            neighborMinWidth={neighborMinWidth}
            configRef={configRef}
            dragStateRef={dragStateRef}
            isDraggingRef={isDraggingRef}
            tableRef={tableRef}
          />
        );

        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            style: mergedStyle,
          },
          overlay: (
            <>
              {props.overlay}
              {handle}
            </>
          ),
          styles: [...props.styles, headerCellRelative.base],
        };
      },
    }),
    [columnWidths, globalMinWidth, maxWidth, resizableColumns],
  );
}
