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
  onColumnResizeEnd?: (event: {columnKey: string; newWidth: number}) => void;

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
// Styles
// =============================================================================

const handleStyles = stylex.create({
  base: {
    position: 'absolute',
    // Keep entirely inside the <th> — extending outside gets clipped by the
    // adjacent <th>'s overflow:hidden. The ::after line sits at the right edge.
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    width: '8px',
    cursor: 'ew-resize',
    zIndex: 1,
    touchAction: 'none',
    userSelect: 'none',
    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineEnd: 0,
      width: '1px',
      backgroundColor: colorVars['--color-accent'],
      // Faint resting state so the divider boundary is always subtly visible.
      // Full opacity on hover or focus.
      opacity: {
        default: 0.25,
        ':hover': 1,
        ':focus-visible': 1,
      },
      transition: 'opacity 150ms ease',
    },
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

interface FrozenSibling {
  th: HTMLTableCellElement;
  /** The inline width style before we froze it (so we can restore on cancel) */
  prevWidth: string;
}

interface DragState {
  columnKey: string;
  startX: number;
  initialWidth: number;
  thElement: HTMLTableCellElement;
  /** When resizing a proportional column, we resize the next column instead */
  neighborKey: string | null;
  neighborTh: HTMLTableCellElement | null;
  neighborInitialWidth: number;
  /**
   * Preceding <th> elements that were frozen at their rendered widths
   * on drag start so they don't shift when we resize a later column.
   */
  frozenSiblings: FrozenSibling[];
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
  const resolveCurrentWidth = useCallback(
    (handle: HTMLElement): number => {
      if (currentWidth != null) return currentWidth;
      const th = handle.closest('th');
      if (th) return th.getBoundingClientRect().width;
      return minWidth;
    },
    [currentWidth, minWidth],
  );

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

  const clearWidth = useCallback(
    (th: HTMLTableCellElement, key: string) => {
      const override = configRef.current.columnWidths?.[key];
      if (override != null) {
        const px = `${override}px`;
        th.style.width = px;
        th.style.minWidth = px;
        th.style.maxWidth = px;
      } else {
        th.style.width = '';
        th.style.minWidth = '';
        th.style.maxWidth = '';
      }
    },
    [configRef],
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
      const next = th.nextElementSibling;
      return next instanceof HTMLTableCellElement ? next : null;
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

      const initialWidth = resolveCurrentWidth(handle);
      if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);

      // Resolve neighbor for proportional-preserving resize
      const nTh = resolveNeighborTh(th);
      const nInitialWidth = nTh ? nTh.getBoundingClientRect().width : 0;

      // Freeze all preceding <th> elements at their current rendered widths
      // so proportional columns to the left don't shift when we resize.
      const frozenSiblings: FrozenSibling[] = [];
      let sibling = th.previousElementSibling;
      while (sibling instanceof HTMLTableCellElement) {
        const renderedWidth = sibling.getBoundingClientRect().width;
        frozenSiblings.push({th: sibling, prevWidth: sibling.style.width});
        const px = `${renderedWidth}px`;
        sibling.style.width = px;
        sibling.style.minWidth = px;
        sibling.style.maxWidth = px;
        sibling = sibling.previousElementSibling;
      }

      dragStateRef.current = {
        columnKey,
        startX: e.clientX,
        initialWidth,
        thElement: th,
        neighborKey,
        neighborTh: nTh,
        neighborInitialWidth: nInitialWidth,
        frozenSiblings,
      };
      isDraggingRef.current = true;
      handle.setAttribute('data-resizing', 'true');

      applyWidth(th, initialWidth);
      if (nTh) applyWidth(nTh, nInitialWidth, neighborMinWidth);
      setTableDragging(true);
    },
    [
      columnKey,
      neighborKey,
      neighborMinWidth,
      resolveCurrentWidth,
      resolveNeighborTh,
      dragStateRef,
      isDraggingRef,
      tableRef,
      applyWidth,
      setTableDragging,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || !isDraggingRef.current) return;

      const delta =
        (e.clientX - drag.startX) * getRTLMultiplier(drag.thElement);

      if (drag.neighborTh && drag.neighborKey) {
        // Proportional-preserving: resize the neighbor column inversely.
        // Clamp from below (neighbor can't go below neighborMinWidth), which
        // also implicitly caps the second-to-last column from eating into
        // the last column's minimum reserved space.
        const newNeighborWidth = drag.neighborInitialWidth - delta;
        const clampedNeighbor = Math.max(neighborMinWidth, newNeighborWidth);
        applyWidth(drag.neighborTh, clampedNeighbor, neighborMinWidth);

        // Also cap the second-to-last column: it can't grow beyond
        // (tableWidth - neighborMinWidth), i.e. can't squeeze last column below min.
        const tableWidth =
          tableRef.current?.getBoundingClientRect().width ?? Infinity;
        const maxSecondToLast =
          tableWidth > 0 ? tableWidth - neighborMinWidth : Infinity;
        applyWidth(
          drag.thElement,
          drag.initialWidth + delta,
          minWidth,
          maxSecondToLast,
        );
      } else {
        applyWidth(drag.thElement, drag.initialWidth + delta);
      }
    },
    [
      dragStateRef,
      isDraggingRef,
      getRTLMultiplier,
      neighborMinWidth,
      minWidth,
      tableRef,
      applyWidth,
    ],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || !isDraggingRef.current) return;

      e.currentTarget.removeAttribute('data-resizing');
      const delta =
        (e.clientX - drag.startX) * getRTLMultiplier(drag.thElement);

      isDraggingRef.current = false;
      dragStateRef.current = null;
      setTableDragging(false);

      if (drag.neighborTh && drag.neighborKey) {
        // Proportional-preserving: report the neighbor column's new width,
        // clamped so it never goes below its minimum.
        const newNeighborWidth = Math.max(
          neighborMinWidth,
          drag.neighborInitialWidth - delta,
        );
        configRef.current.onColumnResizeEnd?.({
          columnKey: drag.neighborKey,
          newWidth: newNeighborWidth,
        });
      } else {
        const newWidth = clamp(drag.initialWidth + delta);
        configRef.current.onColumnResizeEnd?.({columnKey, newWidth});
      }
    },
    [
      columnKey,
      dragStateRef,
      isDraggingRef,
      getRTLMultiplier,
      clamp,
      neighborMinWidth,
      setTableDragging,
      configRef,
    ],
  );

  const handlePointerCancel = useCallback(() => {
    const drag = dragStateRef.current;
    if (!drag || !isDraggingRef.current) return;

    // Revert to width before drag
    clearWidth(drag.thElement, drag.columnKey);
    if (drag.neighborTh && drag.neighborKey) {
      clearWidth(drag.neighborTh, drag.neighborKey);
    }

    isDraggingRef.current = false;
    dragStateRef.current = null;
    setTableDragging(false);
  }, [dragStateRef, isDraggingRef, clearWidth, setTableDragging]);

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
              configRef.current.onColumnResizeEnd?.({
                columnKey: neighborKey,
                newWidth,
              });
            }
          } else {
            const curWidth = currentWidth ?? th.getBoundingClientRect().width;
            const newWidth = clamp(curWidth + delta);
            applyWidth(th, newWidth);
            configRef.current.onColumnResizeEnd?.({columnKey, newWidth});
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
                columnKey: neighborKey,
                newWidth: neighborMinWidth,
              });
            }
          } else {
            applyWidth(th, minWidth);
            configRef.current.onColumnResizeEnd?.({
              columnKey,
              newWidth: minWidth,
            });
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (maxWidth !== Infinity) {
            applyWidth(th, maxWidth);
            configRef.current.onColumnResizeEnd?.({
              columnKey,
              newWidth: maxWidth,
            });
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
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: XDSTableColumn<T>,
      ): HeaderCellRenderProps {
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
        let neighborKey: string | null = null;
        let neighborMinWidth = FALLBACK_MIN_WIDTH;

        if (columns && isProportionalColumn(column.width)) {
          const colIndex = columns.findIndex(c => c.key === column.key);
          if (colIndex >= 0 && colIndex < columns.length - 1) {
            const nextCol = columns[colIndex + 1];
            neighborKey = nextCol.key;
            neighborMinWidth = resolveColumnMinWidth(
              nextCol.width,
              globalMinWidth,
            );
          }
        }

        // If this is the last column and it's proportional, skip the handle.
        // There's no neighbor to resize and resizing a flex column in a
        // full-width table produces unpredictable results.
        if (columns) {
          const colIndex = columns.findIndex(c => c.key === column.key);
          const isLastColumn = colIndex === columns.length - 1;
          if (isLastColumn && isProportionalColumn(column.width)) {
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
    [columnWidths, globalMinWidth, maxWidth, columns],
  );
}
