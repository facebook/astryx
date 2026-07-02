// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useGridFocus.ts
 * @input Uses React useCallback, useRef
 * @output Exports useGridFocus hook for grid keyboard navigation
 * @position Core hook; used by Calendar for date grid navigation
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
   * Selector for cells within the grid. This should match ALL grid cell
   * positions in DOM order (including disabled/empty ones) so the hook can
   * preserve the true grid geometry when computing rows and columns.
   *
   * Use {@link UseGridFocusOptions.isCellFocusable} to distinguish cells that
   * can receive focus from those that cannot (disabled or empty). Navigation
   * moves to a target row/column and, if that cell is not focusable, continues
   * in the same direction to the next focusable cell — the geometry is never
   * collapsed to only-focusable cells.
   *
   * @default 'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
   */
  cellSelector?: string;

  /**
   * Predicate determining whether a cell matched by {@link cellSelector} can
   * receive focus. When omitted, every matched cell is considered focusable
   * (backwards-compatible behavior).
   *
   * @param cell A cell element matched by `cellSelector`.
   */
  isCellFocusable?: (cell: HTMLElement) => boolean;

  /**
   * Resolves the element to focus for a given cell. Useful when the cell is a
   * wrapper element (e.g. a `role="gridcell"` div) whose focusable content is a
   * descendant (e.g. a `<button>`). When omitted, the cell itself is focused.
   *
   * @param cell A cell element matched by `cellSelector`.
   */
  getFocusTarget?: (cell: HTMLElement) => HTMLElement | null;

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
export interface UseGridFocusReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the grid container element.
   */
  gridRef: React.RefObject<T | null>;

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
 * The hook enumerates ALL cells matched by `cellSelector` in DOM order and
 * computes row/column over that full set, preserving the true grid geometry
 * even when some cells are disabled or empty. When a move lands on a
 * non-focusable cell (per `isCellFocusable`), it continues in the same
 * direction to the next focusable cell.
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
export function useGridFocus<T extends HTMLElement = HTMLElement>(
  options: UseGridFocusOptions,
): UseGridFocusReturn<T> {
  const {
    columns,
    cellSelector = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    isCellFocusable,
    getFocusTarget,
    onNavigateBefore,
    onNavigateAfter,
    onPageUp,
    onPageDown,
  } = options;

  const gridRef = useRef<T>(null);

  /**
   * Get all cells in the grid, in DOM order. This includes disabled and empty
   * cells so the true grid geometry is preserved.
   */
  const getCells = useCallback((): HTMLElement[] => {
    if (!gridRef.current) {
      return [];
    }
    return Array.from(
      gridRef.current.querySelectorAll<HTMLElement>(cellSelector),
    );
  }, [cellSelector]);

  /**
   * Whether a cell can receive focus.
   */
  const cellFocusable = useCallback(
    (cell: HTMLElement | undefined): boolean => {
      if (!cell) {
        return false;
      }
      return isCellFocusable ? isCellFocusable(cell) : true;
    },
    [isCellFocusable],
  );

  /**
   * Resolve the element that should actually receive focus for a cell.
   */
  const resolveFocusTarget = useCallback(
    (cell: HTMLElement | undefined): HTMLElement | null => {
      if (!cell) {
        return null;
      }
      return getFocusTarget ? getFocusTarget(cell) : cell;
    },
    [getFocusTarget],
  );

  /**
   * Focus a cell (resolving to its focus target).
   */
  const focusCellElement = useCallback(
    (cell: HTMLElement | undefined): boolean => {
      const target = resolveFocusTarget(cell);
      if (target) {
        target.focus();
        return true;
      }
      return false;
    },
    [resolveFocusTarget],
  );

  /**
   * Get the currently focused cell index within the full cell set.
   */
  const getCurrentIndex = useCallback((): number => {
    const cells = getCells();
    const active = document.activeElement;
    return cells.findIndex(cell => cell === active || cell.contains(active));
  }, [getCells]);

  /**
   * Find the next focusable cell starting at `startIndex`, moving by `step`.
   * Returns the index of the focusable cell, or -1 if none exists in range
   * (i.e. we ran off the start/end of the grid).
   */
  const findFocusableInDirection = useCallback(
    (cells: HTMLElement[], startIndex: number, step: number): number => {
      let index = startIndex;
      while (index >= 0 && index < cells.length) {
        if (cellFocusable(cells[index])) {
          return index;
        }
        index += step;
      }
      return -1;
    },
    [cellFocusable],
  );

  /**
   * Focus a cell by index, clamping to valid range. Skips non-focusable cells
   * toward the nearest edge. Used by public focus helpers (no navigation
   * callbacks).
   */
  const focusCell = useCallback(
    (index: number) => {
      const cells = getCells();
      if (cells.length === 0) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(index, cells.length - 1));
      // Prefer the requested cell; otherwise search forward, then backward.
      let target = findFocusableInDirection(cells, clampedIndex, 1);
      if (target === -1) {
        target = findFocusableInDirection(cells, clampedIndex, -1);
      }
      if (target !== -1) {
        focusCellElement(cells[target]);
      }
    },
    [getCells, findFocusableInDirection, focusCellElement],
  );

  /**
   * Focus the first focusable cell.
   */
  const focusFirst = useCallback(() => {
    const cells = getCells();
    const index = findFocusableInDirection(cells, 0, 1);
    if (index !== -1) {
      focusCellElement(cells[index]);
    }
  }, [getCells, findFocusableInDirection, focusCellElement]);

  /**
   * Focus the last focusable cell.
   */
  const focusLast = useCallback(() => {
    const cells = getCells();
    const index = findFocusableInDirection(cells, cells.length - 1, -1);
    if (index !== -1) {
      focusCellElement(cells[index]);
    }
  }, [getCells, findFocusableInDirection, focusCellElement]);

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const cells = getCells();
      if (cells.length === 0) {
        return;
      }

      const currentIndex = getCurrentIndex();
      if (currentIndex === -1) {
        return;
      }

      const currentRow = Math.floor(currentIndex / columns);
      const currentCol = currentIndex % columns;
      const totalRows = Math.ceil(cells.length / columns);

      let handled = true;

      switch (e.key) {
        case 'ArrowRight': {
          // Move right, skipping non-focusable cells in the same direction.
          const target = findFocusableInDirection(cells, currentIndex + 1, 1);
          if (target !== -1) {
            focusCellElement(cells[target]);
          } else {
            onNavigateAfter?.((currentCol + 1) % columns, 1);
          }
          break;
        }

        case 'ArrowLeft': {
          const target = findFocusableInDirection(cells, currentIndex - 1, -1);
          if (target !== -1) {
            focusCellElement(cells[target]);
          } else {
            onNavigateBefore?.(
              currentCol === 0 ? columns - 1 : currentCol - 1,
              1,
            );
          }
          break;
        }

        case 'ArrowDown': {
          if (currentRow < totalRows - 1) {
            // Move to the same column one row down, then continue downward
            // (by whole rows) to the next focusable cell in that column.
            const target = findFocusableInDirection(
              cells,
              currentIndex + columns,
              columns,
            );
            if (target !== -1) {
              focusCellElement(cells[target]);
            } else {
              onNavigateAfter?.(currentCol, columns);
            }
          } else {
            onNavigateAfter?.(currentCol, columns);
          }
          break;
        }

        case 'ArrowUp': {
          if (currentRow > 0) {
            const target = findFocusableInDirection(
              cells,
              currentIndex - columns,
              -columns,
            );
            if (target !== -1) {
              focusCellElement(cells[target]);
            } else {
              onNavigateBefore?.(currentCol, columns);
            }
          } else {
            onNavigateBefore?.(currentCol, columns);
          }
          break;
        }

        case 'Home':
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+Home: first focusable cell in grid
            focusFirst();
          } else {
            // Home: first focusable cell in current row (searching rightward)
            const rowStart = currentRow * columns;
            const rowEnd = Math.min(rowStart + columns - 1, cells.length - 1);
            const target = findFocusableInDirection(cells, rowStart, 1);
            if (target !== -1 && target <= rowEnd) {
              focusCellElement(cells[target]);
            }
          }
          break;

        case 'End':
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+End: last focusable cell in grid
            focusLast();
          } else {
            // End: last focusable cell in current row (searching leftward)
            const rowStart = currentRow * columns;
            const rowEnd = Math.min(rowStart + columns - 1, cells.length - 1);
            const target = findFocusableInDirection(cells, rowEnd, -1);
            if (target !== -1 && target >= rowStart) {
              focusCellElement(cells[target]);
            }
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
      findFocusableInDirection,
      focusCellElement,
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
