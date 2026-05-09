'use client';

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
 * - /packages/cli/templates/blocks/components/Table/ (showcase blocks)
 */

import {useMemo, type ReactElement, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {XDSBaseTable} from './XDSBaseTable';
import {XDSTableContext} from './XDSTableContext';
import {useXDSBaseTablePlugins} from './useXDSBaseTablePlugins';
import {xdsClassName, mergeProps} from '../utils';
import type {
  XDSBaseTableProps,
  XDSTableVerticalAlign,
  TablePlugin,
  TableRenderProps,

} from './types';

// =============================================================================
// XDSTable Types
// =============================================================================

/** Row density controlling padding and font size */

export type XDSTableDensity = 'compact' | 'balanced' | 'spacious';

/** Divider style between cells */

export type XDSTableDividers = 'rows' | 'columns' | 'grid' | 'none';

/** How body cell text behaves when it exceeds column width */

export type XDSTableTextOverflow = 'wrap' | 'truncate';

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
  /**
   * Vertical alignment for body row cells.
   * Controls `vertical-align` on `<td>` elements.
   *
   * @default 'middle'
   *
   * @example
   * ```
   * <XDSTable data={items} columns={columns} verticalAlign="top" />
   * ```
   */
  verticalAlign?: XDSTableVerticalAlign;
  /**
   * How body cell text behaves when it exceeds the column width.
   *
   * - `'wrap'` — text wraps and the row grows taller. No content is hidden.
   * - `'truncate'` — text is clipped with an ellipsis. Default-rendered cells
   *   show a tooltip on hover when truncated.
   *
   * Header cells always truncate regardless of this setting.
   *
   * @default 'wrap'
   *
   * @example
   * ```
   * <XDSTable data={logs} columns={columns} textOverflow="wrap" />
   * ```
   */
  textOverflow?: 'wrap' | 'truncate';
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

const scrollWrapperStyles = stylex.create({
  base: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  containerBleed: {
    marginInlineStart: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    marginInlineEnd: 'calc(-1 * var(--container-padding-inline-end, 0px))',
    width:
      'calc(100% + var(--container-padding-inline-start, 0px) + var(--container-padding-inline-end, 0px))',
    marginTop: {
      default: null,
      ':first-child': 'calc(-1 * var(--container-padding-block-start, 0px))',
    },
    marginBottom: {
      default: null,
      ':last-child': 'calc(-1 * var(--container-padding-block-end, 0px))',
    },
  },
});

function TableScrollWrapper({children}: {children: React.ReactNode}) {
  return (
    <div
      {...mergeProps(
        xdsClassName('table-scroll-wrapper'),
        stylex.props(
          scrollWrapperStyles.base,
          scrollWrapperStyles.containerBleed,
        ),
      )}>
      {children}
    </div>
  );
}

// =============================================================================
// Table-level styling plugin (only transforms the <table> element)
// =============================================================================

function buildTableStylePlugin<
  T extends Record<string, unknown>,
>(): TablePlugin<T> {
  return {
    transformTable(props: TableRenderProps): TableRenderProps {
      const existingClass = props.htmlProps.className ?? '';
      const tableClass = xdsClassName('table');
      return {
        ...props,
        htmlProps: {
          ...props.htmlProps,
          className: existingClass
            ? `${existingClass} ${tableClass}`
            : tableClass,
        },
        styles: [...props.styles, tableStyles.base],
      };
    },
  };
}



// =============================================================================
// XDSTable Component
// =============================================================================

function XDSTableInner<T extends Record<string, unknown>>({
  density = 'balanced',
  dividers = 'rows',
  isStriped = false,
  hasHover = false,
  verticalAlign = 'middle',
  textOverflow = 'wrap',
  plugins: userPlugins,
  columns,
  data,
  ref,
  ...rest
}: XDSTableProps<T> & {ref?: Ref<HTMLTableElement>}): ReactElement {
  // Table-level styling plugin (just adds font/color to <table>)
  const tablePlugin = useMemo(() => buildTableStylePlugin<T>(), []);
  const basePlugins = useMemo(() => [tablePlugin], [tablePlugin]);

  // Convert named plugin record to stable memoized array
  const mergedPlugins = useXDSBaseTablePlugins<T>(basePlugins, userPlugins);

  const contextValue = useMemo(
    () => ({
      density,
      dividers,
      isStriped,
      hasHover,
      verticalAlign,
      textOverflow,
    }),
    [density, dividers, isStriped, hasHover, verticalAlign, textOverflow],
  );

  return (
    <XDSTableContext.Provider value={contextValue}>
      <XDSBaseTable<T>
        ref={ref}
        data={data}
        columns={columns}
        plugins={mergedPlugins}
        textOverflow={textOverflow}
        scrollWrapper={TableScrollWrapper}
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
 * Always set explicit width on columns using proportional() or pixel() — omitting
 * width skips the minimum width floor, which can cause columns to collapse on mobile.
 *
 * @example
 * ```
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', width: proportional(1), renderCell: (u) => (
 *       <XDSHStack gap={2} align="center">
 *         <XDSAvatar name={u.name} size="small" />
 *         <XDSText weight="semibold">{u.name}</XDSText>
 *       </XDSHStack>
 *     )},
 *     { key: 'status', header: 'Status', width: proportional(1), renderCell: (u) => (
 *       <XDSBadge variant={u.active ? 'success' : 'error'} label={u.active ? 'Active' : 'Inactive'} />
 *     )},
 *   ]}
 *   density="compact"
 *   dividers="grid"
 *   hasHover
 * />
 * ```
 */
export const XDSTable = XDSTableInner as <T extends Record<string, unknown>>(
  props: XDSTableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(XDSTable as any).displayName = 'XDSTable';
