'use client';

/**
 * @file useGridFocus.ts
 * @input Uses React useCallback, useRef
 * @output Exports useGridFocus hook for grid keyboard navigation
 * @position Core hook; used by XDSCalendar for date grid navigation
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/useGridFocus.test.ts
 */


import {useCallback, useRef} from 'react';

/**
 * Configuration for grid focus behavior
 */
export interface UseGridFocusOptions {
  /**
   * Number of columns in the grid.
   * Used for up/down navigation (moves by this many cells).
   */
  columns: number;

  /**
   * Selector for focusable cells within the grid.
   * @default 'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
   */
  cellSelector?: string;

  /**
   * Callback when navigation would go before the first cell.
   * Useful for navigating to previous month in calendars.
   * @param column The column index (0-based) that was focused when navigating
   * @param offset Number of cells to move (1 for horizontal, columns for vertical)
   */
  onNavigateBefore?: (column: number, offset: number) => void;

  /**
   * Callback when navigation would go after the last cell.
   * Useful for navigating to next month in calendars.
   * @param column The column index (0-based) that was focused when navigating
   * @param offset Number of cells to move (1 for horizontal, columns for vertical)
   */
  onNavigateAfter?: (column: number, offset: number) => void;

  /**
   * Callback for Page Up key (e.g., previous month).
   */
  onPageUp?: () => void;

  /**
   * Callback for Page Down key (e.g., next month).
   */
  onPageDown?: () => void;
}

/**
 * Return type for useGridFocus hook
 */
export interface UseGridFocusReturn {
  /**
   * Ref to attach to the grid container element.
   */
  gridRef: React.RefObject<HTMLElement | null>;

  /**
   * Key down handler to attach to the grid container.
   */
  handleKeyDown: (e: React.KeyboardEvent) => void;

  /**
   * Focus a specific cell by index.
   */
  focusCell: (index: number) => void;

  /**
   * Focus the first focusable cell.
   */
  focusFirst: () => void;

  /**
   * Focus the last focusable cell.
   */
  focusLast: () => void;
}

/**
 * Hook for managing keyboard navigation within a grid.
 *
 * Implements WAI-ARIA grid pattern:
 * - Arrow keys: Navigate between cells
 * - Home: Move to first cell in row
 * - End: Move to last cell in row
 * - Ctrl+Home: Move to first cell in grid
 * - Ctrl+End: Move to last cell in grid
 * - Page Up/Down: Custom callbacks (e.g., month navigation)
 *
 * @example
 * ```
 * const {gridRef, handleKeyDown} = useGridFocus({
 *   columns: 7,
 *   onPageUp: () => navigateMonth(-1),
 *   onPageDown: () => navigateMonth(1),
 * });
 *
 * <div ref={gridRef} role="grid" onKeyDown={handleKeyDown}>
 *   {cells.map(cell => <button role="gridcell">{cell}</button>)}
 * </div>
 * ```
 */
export function useGridFocus(options: UseGridFocusOptions): UseGridFocusReturn {
  const {
    columns,
    cellSelector = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    onNavigateBefore,
    onNavigateAfter,
    onPageUp,
    onPageDown,
  } = options;

  const gridRef = useRef<HTMLElement>(null);

  /**
   * Get all focusable cells in the grid.
   */
  const getCells = useCallback((): HTMLElement[] => {
    if (!gridRef.current) return [];
    return Array.from(
      gridRef.current.querySelectorAll<HTMLElement>(cellSelector),
    );
  }, [cellSelector]);

  /**
   * Get the currently focused cell index.
   */
  const getCurrentIndex = useCallback((): number => {
    const cells = getCells();
    const active = document.activeElement;
    return cells.findIndex(
      cell => cell === active || cell.contains(active as Node),
    );
  }, [getCells]);

  /**
   * Focus a cell by index, clamping to valid range.
   * Returns true if focus was successful, false if navigation callback was triggered.
   */
  const focusCellInternal = useCallback(
    (index: number, currentColumn: number, offset: number) => {
      const cells = getCells();
      if (cells.length === 0) return;

      if (index < 0) {
        onNavigateBefore?.(currentColumn, offset);
        return;
      }
      if (index >= cells.length) {
        onNavigateAfter?.(currentColumn, offset);
        return;
      }

      cells[index]?.focus();
    },
    [getCells, onNavigateBefore, onNavigateAfter],
  );

  /**
   * Public focusCell that doesn't trigger navigation callbacks
   */
  const focusCell = useCallback(
    (index: number) => {
      const cells = getCells();
      if (cells.length === 0) return;
      const clampedIndex = Math.max(0, Math.min(index, cells.length - 1));
      cells[clampedIndex]?.focus();
    },
    [getCells],
  );

  /**
   * Focus the first cell.
   */
  const focusFirst = useCallback(() => {
    const cells = getCells();
    cells[0]?.focus();
  }, [getCells]);

  /**
   * Focus the last cell.
   */
  const focusLast = useCallback(() => {
    const cells = getCells();
    cells[cells.length - 1]?.focus();
  }, [getCells]);

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = getCurrentIndex();
      if (currentIndex === -1) return;

      const cells = getCells();
      const currentRow = Math.floor(currentIndex / columns);
      const currentCol = currentIndex % columns;
      const totalRows = Math.ceil(cells.length / columns);

      let handled = true;

      switch (e.key) {
        case 'ArrowRight':
          // Horizontal navigation: offset = 1
          focusCellInternal(currentIndex + 1, (currentCol + 1) % columns, 1);
          break;

        case 'ArrowLeft':
          // Horizontal navigation: offset = 1
          focusCellInternal(
            currentIndex - 1,
            currentCol === 0 ? columns - 1 : currentCol - 1,
            1,
          );
          break;

        case 'ArrowDown':
          // Vertical navigation: offset = columns (7 for calendar)
          if (currentRow < totalRows - 1) {
            const nextIndex = currentIndex + columns;
            if (nextIndex < cells.length) {
              focusCellInternal(nextIndex, currentCol, columns);
            } else {
              // Last row might be partial, focus last cell
              focusCellInternal(cells.length - 1, currentCol, columns);
            }
          } else {
            onNavigateAfter?.(currentCol, columns);
          }
          break;

        case 'ArrowUp':
          // Vertical navigation: offset = columns (7 for calendar)
          if (currentRow > 0) {
            focusCellInternal(currentIndex - columns, currentCol, columns);
          } else {
            onNavigateBefore?.(currentCol, columns);
          }
          break;

        case 'Home':
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+Home: first cell in grid
            focusFirst();
          } else {
            // Home: first cell in current row
            focusCell(currentRow * columns);
          }
          break;

        case 'End':
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+End: last cell in grid
            focusLast();
          } else {
            // End: last cell in current row
            const rowEnd = Math.min(
              (currentRow + 1) * columns - 1,
              cells.length - 1,
            );
            focusCell(rowEnd);
          }
          break;

        case 'PageUp':
          onPageUp?.();
          break;

        case 'PageDown':
          onPageDown?.();
          break;

        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [
      columns,
      focusCell,
      focusCellInternal,
      focusFirst,
      focusLast,
      getCells,
      getCurrentIndex,
      onNavigateAfter,
      onNavigateBefore,
      onPageDown,
      onPageUp,
    ],
  );

  return {
    gridRef,
    handleKeyDown,
    focusCell,
    focusFirst,
    focusLast,
  };
}
