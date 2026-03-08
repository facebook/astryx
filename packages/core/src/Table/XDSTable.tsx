/**
 * @file XDSTable.tsx
 * @input React, StyleX, XDSBaseTable, theme tokens, types, components
 * @output Exports XDSTable component, XDSTableProps, XDSTableDensity, XDSTableDividers types
 * @position Styled wrapper; the primary table API for consumers
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (props table, features, usage examples)
 * - /packages/core/src/Table/XDSTable.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Table/index.ts (exports if types change)
 * - /apps/storybook/stories/Table.stories.tsx (storybook stories)
 */

'use client';

import {forwardRef, useMemo, type ReactElement, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {XDSBaseTable} from './XDSBaseTable';
import {XDSTableRow} from './XDSTableRow';
import {XDSTableCell} from './XDSTableCell';
import {XDSTableHeaderCell} from './XDSTableHeaderCell';
import {XDSTableContext} from './XDSTableContext';
import {useXDSBaseTablePlugins} from './useXDSBaseTablePlugins';
import type {XDSBaseTableProps, TablePlugin, TableRenderProps} from './types';

// =============================================================================
// XDSTable Types
// =============================================================================

/** Row density controlling padding and font size */

export type XDSTableDensity = 'compact' | 'balanced' | 'spacious';

/** Divider style between cells */

export type XDSTableDividers = 'rows' | 'columns' | 'grid' | 'none';

/**
 * Props for the styled XDSTable component.
 * Supports both data-driven mode and children mode with XDSTableRow/Cell.
 *
 * @template T - The row data type
 */

export interface XDSTableProps<T extends Record<string, unknown>> extends Omit<
  XDSBaseTableProps<T>,
  'plugins' | 'components'
> {
  /** Row density. @default 'balanced' */
  density?: XDSTableDensity;
  /** Divider style. @default 'rows' */
  dividers?: XDSTableDividers;
  /** Striped even rows. @default false */
  isStriped?: boolean;
  /** Hover highlight on rows. @default false */
  hasHover?: boolean;
  /** Named plugins to extend table behavior */
  plugins?: Record<string, TablePlugin<T>>;
}

// =============================================================================
// StyleX Styles (table-level only; cell/row/header styles owned by components)
// =============================================================================

const tableStyles = stylex.create({
  base: {
    fontFamily: 'inherit',
    color: colorVars['--color-text-primary'],
  },
});

// =============================================================================
// Table-level styling plugin (only transforms the <table> element)
// =============================================================================

function buildTableStylePlugin<
  T extends Record<string, unknown>,
>(): TablePlugin<T> {
  return {
    transformTable(props: TableRenderProps): TableRenderProps {
      return {
        ...props,
        styles: [...props.styles, tableStyles.base],
      };
    },
  };
}

// Stable component references for the components prop
const xdsComponents = {
  Row: XDSTableRow,
  Cell: XDSTableCell,
  HeaderCell: XDSTableHeaderCell,
};

// =============================================================================
// XDSTable Component
// =============================================================================

function XDSTableInner<T extends Record<string, unknown>>(
  {
    density = 'balanced',
    dividers = 'rows',
    isStriped = false,
    hasHover = false,
    plugins: userPlugins,
    columns,
    data,
    ...rest
  }: XDSTableProps<T>,
  ref: Ref<HTMLTableElement>,
): ReactElement {
  // Table-level styling plugin (just adds font/color to <table>)
  const tablePlugin = useMemo(() => buildTableStylePlugin<T>(), []);
  const basePlugins = useMemo(() => [tablePlugin], [tablePlugin]);

  // Convert named plugin record to stable memoized array
  const mergedPlugins = useXDSBaseTablePlugins<T>(basePlugins, userPlugins);

  const contextValue = useMemo(
    () => ({density, dividers, isStriped, hasHover}),
    [density, dividers, isStriped, hasHover],
  );

  return (
    <XDSTableContext.Provider value={contextValue}>
      <XDSBaseTable<T>
        ref={ref}
        data={data}
        columns={columns}
        plugins={mergedPlugins}
        components={xdsComponents}
        {...rest}
      />
    </XDSTableContext.Provider>
  );
}

/**
 * XDSTable — a styled, data-driven table component.
 *
 * Wraps XDSBaseTable with styled components (XDSTableRow, XDSTableCell,
 * XDSTableHeaderCell) that read appearance configuration from XDSTableContext.
 * Density, dividers, striped rows, and hover effects are applied via
 * design tokens in the component styles.
 *
 * @compositionHint Use renderCell on columns to compose rich cell content.
 * Combine with XDSBadge (status labels), XDSStatusDot (colored indicators),
 * XDSText (formatted values), XDSAvatar (user cells), and XDSHStack/XDSVStack
 * (multi-element cell layouts). Without renderCell, cells render as plain text.
 *
 * @example
 * ```
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', renderCell: (u) => (
 *       <XDSHStack gap="space2" align="center">
 *         <XDSAvatar name={u.name} size="small" />
 *         <XDSText weight="semibold">{u.name}</XDSText>
 *       </XDSHStack>
 *     )},
 *     { key: 'status', header: 'Status', renderCell: (u) => (
 *       <XDSBadge variant={u.active ? 'success' : 'error'}>
 *         {u.active ? 'Active' : 'Inactive'}
 *       </XDSBadge>
 *     )},
 *   ]}
 *   density="compact"
 *   dividers="grid"
 *   hasHover
 * />
 * ```
 */
export const XDSTable = forwardRef(XDSTableInner) as <
  T extends Record<string, unknown>,
>(
  props: XDSTableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(XDSTable as any).displayName = 'XDSTable';
