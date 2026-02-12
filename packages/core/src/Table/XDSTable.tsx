/**
 * @file XDSTable.tsx
 * @input React, StyleX, XDSBaseTable, theme tokens, types
 * @output Exports XDSTable component, XDSTableProps, XDSTableDensity, XDSTableDividers types
 * @position Styled wrapper; the primary table API for consumers
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/README.md (props table, features, usage examples)
 * - /packages/core/src/Table/XDSTable.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Table/index.ts (exports if types change)
 * - /apps/storybook/stories/Table.stories.tsx (storybook stories)
 */

import {forwardRef, useMemo, type ReactElement, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {XDSBaseTable} from './XDSBaseTable';
import {XDSTableContext} from './XDSTableContext';
import type {
  XDSBaseTableProps,
  TablePlugin,
  TableRenderProps,
  HeaderCellRenderProps,
} from './types';

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
export interface XDSTableProps<
  T extends Record<string, unknown>,
> extends XDSBaseTableProps<T> {
  /** Row density. @default 'balanced' */
  density?: XDSTableDensity;
  /** Divider style. @default 'rows' */
  dividers?: XDSTableDividers;
  /** Striped even rows. @default false */
  striped?: boolean;
  /** Hover highlight on rows. @default false */
  hover?: boolean;
}

// =============================================================================
// StyleX Styles
// =============================================================================

const tableStyles = stylex.create({
  base: {
    fontFamily: 'inherit',
    color: colorVars['--color-text-primary'],
  },
});

// Density: padding + font size for header cells
const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontSize: textSizeVars['--text-xsm'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: textSizeVars['--text-sm'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: textSizeVars['--text-base'],
  },
});

// Header cell styles
const headerStyles = stylex.create({
  cell: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'start',
  },
});

// Column divider styles for headers
const dividerColumnStyles = stylex.create({
  cell: {
    borderRightWidth: {
      default: '1px',
      ':last-child': '0',
    },
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-divider'],
  },
});

// Header divider (bottom border on header row)
const headerDividerStyles = stylex.create({
  cell: {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
  },
});

// =============================================================================
// Build XDS Styling Plugin
// =============================================================================

function buildXDSStylePlugin<T extends Record<string, unknown>>(
  density: XDSTableDensity,
  dividers: XDSTableDividers,
): TablePlugin<T> {
  return {
    transformTable(props: TableRenderProps): TableRenderProps {
      return {
        ...props,
        styles: [...props.styles, tableStyles.base],
      };
    },

    transformHeaderCell(
      props: HeaderCellRenderProps,
      _column,
    ): HeaderCellRenderProps {
      const cellStyles = [
        ...props.styles,
        headerStyles.cell,
        densityStyles[density],
        headerDividerStyles.cell,
      ];

      // Column dividers on header cells
      if (dividers === 'columns' || dividers === 'grid') {
        cellStyles.push(dividerColumnStyles.cell);
      }

      return {...props, styles: cellStyles};
    },

    // Body row/cell styling handled by XDSTableRow/Cell via context
  };
}

// =============================================================================
// XDSTable Component
// =============================================================================

// Stable empty array to avoid creating new reference on each render
const EMPTY_PLUGINS: TablePlugin<Record<string, unknown>>[] = [];

function XDSTableInner<T extends Record<string, unknown>>(
  {
    density = 'balanced',
    dividers = 'rows',
    striped = false,
    hover = false,
    plugins: userPlugins,
    columns,
    data,
    ...rest
  }: XDSTableProps<T>,
  ref: Ref<HTMLTableElement>,
): ReactElement {
  // Use stable empty array when no plugins provided
  const stableUserPlugins = userPlugins ?? (EMPTY_PLUGINS as TablePlugin<T>[]);

  // Build the internal XDS styling plugin (table + header styling only)
  const xdsPlugin = useMemo(
    () => buildXDSStylePlugin<T>(density, dividers),
    [density, dividers],
  );

  // XDS plugin runs first, user plugins can override/extend
  const mergedPlugins = useMemo(
    () => [xdsPlugin, ...stableUserPlugins],
    [xdsPlugin, stableUserPlugins],
  );

  const contextValue = useMemo(
    () => ({density, dividers, striped, hover}),
    [density, dividers, striped, hover],
  );

  return (
    <XDSTableContext.Provider value={contextValue}>
      <XDSBaseTable<T>
        ref={ref}
        data={data}
        columns={columns}
        plugins={mergedPlugins}
        {...rest}
      />
    </XDSTableContext.Provider>
  );
}

/**
 * XDSTable — a styled, data-driven table component.
 *
 * Wraps XDSBaseTable with an XDS styling plugin that applies density,
 * dividers, striped rows, and hover effects using design tokens.
 *
 * @example
 * ```tsx
 * <XDSTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *   ]}
 *   density="compact"
 *   dividers="grid"
 *   striped
 *   hover
 * />
 * ```
 */
export const XDSTable = forwardRef(XDSTableInner) as <
  T extends Record<string, unknown>,
>(
  props: XDSTableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;
