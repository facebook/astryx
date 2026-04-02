'use client';

/**
 * @file useTableCellStyles.ts
 * @input React, StyleX, XDSTableContext, theme tokens
 * @output Exports shared cell styling utilities
 * @position Utility layer; consumed by XDSTableCell and XDSTableHeaderCell
 *
 * Consolidates the shared pattern of building divider style arrays
 * and merging consumer xstyle. Eliminates structural duplication
 * between body cells and header cells.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/XDSTableCell.tsx
 * - /packages/core/src/Table/XDSTableHeaderCell.tsx
 */

import {useContext} from 'react';
import type {StyleXStyles} from '../theme/types';
import {XDSTableContext, type XDSTableContextValue} from './XDSTableContext';

// =============================================================================
// Shared Style Builders
// =============================================================================

/**
 * Build the divider styles array for a cell based on context.
 * Shared between body cells and header cells — both apply row/column
 * dividers the same way.
 */
export function buildDividerStyles(
  ctx: XDSTableContextValue,
  dividerRowStyle: StyleXStyles,
  dividerColumnStyle: StyleXStyles,
): StyleXStyles[] {
  const result: StyleXStyles[] = [];

  if (ctx.dividers === 'rows' || ctx.dividers === 'grid') {
    result.push(dividerRowStyle);
  }

  if (ctx.dividers === 'columns' || ctx.dividers === 'grid') {
    result.push(dividerColumnStyle);
  }

  return result;
}

/**
 * Merge consumer xstyle (single or array) into a styles array.
 * Handles the polymorphic xstyle prop that both cell components accept.
 */
export function mergeXStyle(
  styles: StyleXStyles[],
  xstyle: StyleXStyles | StyleXStyles[] | undefined,
): StyleXStyles[] {
  if (!xstyle) return styles;
  if (Array.isArray(xstyle)) {
    return [...styles, ...xstyle];
  }
  return [...styles, xstyle];
}

/**
 * Read the XDSTableContext. Returns null when outside XDSTable,
 * signaling that the component should render unstyled.
 */
export function useTableContext(): XDSTableContextValue | null {
  return useContext(XDSTableContext);
}
