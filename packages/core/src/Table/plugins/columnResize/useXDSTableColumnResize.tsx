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
} from '../../types';

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

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MIN_WIDTH = 50;
const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

// =============================================================================
// Styles
// =============================================================================

const handleStyles = stylex.create({
  base: {
    position: 'absolute',
    insetInlineEnd: '-3px',
    top: 0,
    bottom: 0,
    width: '6px',
    cursor: 'ew-resize',
    zIndex: 1,
    touchAction: 'none',
    userSelect: 'none',
    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineStart: '2.5px',
      width: '1px',
      backgroundColor: colorVars['--color-accent'],
      opacity: {
        default: 0,
        ':hover': 1,
        ':focus-visible': 1,
      },
      transition: 'opacity 150ms ease',
    },
    '@media (pointer: coarse)': {
      width: '16px',
      insetInlineEnd: '-8px',
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

interface DragState {
  columnKey: string;
  startX: number;
  initialWidth: number;
  thElement: HTMLTableCellElement;
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
  configRef,
  dragStateRef,
  isDraggingRef,
  tableRef,
}: ResizeHandleProps) {
  const keyboardActiveRef = useRef(false);
  const keyboardInitialWidthRef = useRef(0);

  const resolveCurrentWidth = useCallback(
    (handle: HTMLElement): number => {
      if (currentWidth != null) return currentWidth;
      const th = handle.closest('th');
      if (th) return th.getBoundingClientRect().width;
      return minWidth;
    },
    [currentWidth, minWidth],
  );

  const clamp = useCallback(
    (value: number) => Math.max(minWidth, Math.min(maxWidth, value)),
    [minWidth, maxWidth],
  );

  const applyWidth = useCallback(
    (th: HTMLTableCellElement, width: number) => {
      const clamped = clamp(width);
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

      dragStateRef.current = {columnKey, startX: e.clientX, initialWidth, thElement: th};
      isDraggingRef.current = true;
      handle.setAttribute('data-resizing', 'true');

      applyWidth(th, initialWidth);
      setTableDragging(true);
    },
    [columnKey, resolveCurrentWidth, dragStateRef, isDraggingRef, tableRef, applyWidth, setTableDragging],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || !isDraggingRef.current) return;

      const delta = (e.clientX - drag.startX) * getRTLMultiplier(drag.thElement);
      applyWidth(drag.thElement, drag.initialWidth + delta);
    },
    [dragStateRef, isDraggingRef, getRTLMultiplier, applyWidth],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || !isDraggingRef.current) return;

      e.currentTarget.removeAttribute('data-resizing');
      const delta = (e.clientX - drag.startX) * getRTLMultiplier(drag.thElement);
      const newWidth = clamp(drag.initialWidth + delta);

      isDraggingRef.current = false;
      dragStateRef.current = null;
      setTableDragging(false);

      configRef.current.onColumnResizeEnd?.({columnKey, newWidth});
    },
    [columnKey, dragStateRef, isDraggingRef, getRTLMultiplier, clamp, setTableDragging, configRef],
  );

  const handlePointerCancel = useCallback(
    () => {
      const drag = dragStateRef.current;
      if (!drag || !isDraggingRef.current) return;

      // Revert to width before drag
      clearWidth(drag.thElement, drag.columnKey);

      isDraggingRef.current = false;
      dragStateRef.current = null;
      setTableDragging(false);
    },
    [dragStateRef, isDraggingRef, clearWidth, setTableDragging],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const handle = e.currentTarget;
      const th = handle.closest('th') as HTMLTableCellElement | null;
      if (!th) return;

      // Activate keyboard resize mode
      if (!keyboardActiveRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          keyboardActiveRef.current = true;
          keyboardInitialWidthRef.current = resolveCurrentWidth(handle);
          handle.setAttribute('data-resizing', 'true');

          const table = th.closest('table');
          if (table) tableRef.current = table;

          applyWidth(th, keyboardInitialWidthRef.current);
          return;
        }
        return;
      }

      const step = e.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      const rtl = getRTLMultiplier(th);

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          const cur = parseFloat(th.style.width) || keyboardInitialWidthRef.current;
          applyWidth(th, cur + step * rtl);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const cur = parseFloat(th.style.width) || keyboardInitialWidthRef.current;
          applyWidth(th, cur - step * rtl);
          break;
        }
        case 'Escape':
          e.preventDefault();
          clearWidth(th, columnKey);
          keyboardActiveRef.current = false;
          handle.removeAttribute('data-resizing');
          break;
        case 'Enter': {
          e.preventDefault();
          const finalWidth = parseFloat(th.style.width) || keyboardInitialWidthRef.current;
          keyboardActiveRef.current = false;
          handle.removeAttribute('data-resizing');
          configRef.current.onColumnResizeEnd?.({
            columnKey,
            newWidth: clamp(finalWidth),
          });
          break;
        }
      }
    },
    [columnKey, resolveCurrentWidth, getRTLMultiplier, clamp, applyWidth, clearWidth, configRef, tableRef],
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

export function useXDSTableColumnResize<
  T extends Record<string, unknown>,
>(config: UseXDSTableColumnResizeConfig): TablePlugin<T> {
  const configRef = useRef(config);
  configRef.current = config;

  const dragStateRef = useRef<DragState | null>(null);
  const isDraggingRef = useRef(false);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const minWidth = config.minWidth ?? DEFAULT_MIN_WIDTH;
  const maxWidth = config.maxWidth ?? Infinity;
  const columnWidths = config.columnWidths;

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: XDSTableColumn<T>,
      ): HeaderCellRenderProps {
        const overrideWidth = columnWidths?.[column.key];

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
            minWidth={minWidth}
            maxWidth={maxWidth}
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
    [columnWidths, minWidth, maxWidth],
  );
}
