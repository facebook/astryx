// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowExpansion.tsx
 * @input React, StyleX, Icon, Table types
 * @output Exports useTableRowExpansion hook + config type
 * @position Row-expansion plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, colorVars, radiusVars} from '../../../theme/tokens.stylex';
import {Icon} from '../../../Icon';
import {resolveContextActions} from '../../tableContextMenu';
import type {
  TablePlugin,
  TableColumn,
  BodyRowRenderProps,
  BodyCellRenderProps,
  TableContextAction,
} from '../../types';

// =============================================================================
// Config
// =============================================================================

/**
 * Configuration for useTableRowExpansion (legacy/full-width mode).
 *
 * The consumer owns expansion state; the plugin provides the chevron UI,
 * the expanded-content row, and a right-click "Expand/Collapse row" action.
 */
export interface UseTableRowExpansionConfig<T extends Record<string, unknown>> {
  /** Set of currently-expanded row keys. */
  expandedKeys: Set<string>;
  /** Called when a row's expansion is toggled. */
  onToggle: (key: string) => void;
  /** Derive a stable unique key from a row item. */
  getRowKey: (item: T) => string;
  /**
   * Render the expanded content shown below the row when expanded.
   * Receives the row's item.
   */
  renderExpanded: (item: T) => ReactNode;
  /**
   * Optionally control which rows are expandable. Non-expandable rows show no
   * chevron and no context-menu action. Defaults to all expandable.
   */
  getIsItemExpandable?: (item: T) => boolean;
}

// =============================================================================
// Styles
// =============================================================================

const EXPANSION_COLUMN_WIDTH = {type: 'pixel' as const, value: 40};

const expansionStyles = stylex.create({
  chevronButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-6'],
    height: spacingVars['--spacing-6'],
    background: 'transparent',
    border: 'none',
    borderRadius: radiusVars['--radius-inner'],
    cursor: 'pointer',
    color: colorVars['--color-icon-secondary'],
    transitionProperty: 'transform, color',
    transitionDuration: '150ms',
    padding: 0,
    ':hover': {
      color: colorVars['--color-icon-primary'],
    },
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  expandedRow: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  expandedCell: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-5'],
  },
});

// =============================================================================
// Chevron Cell
// =============================================================================

function ExpansionChevron({
  isExpanded,
  onToggle,
  ariaLabel,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      {...stylex.props(
        expansionStyles.chevronButton,
        isExpanded && expansionStyles.chevronExpanded,
      )}
      onClick={e => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={ariaLabel}
      aria-expanded={isExpanded}>
      <Icon icon="chevronRight" size="xsm" />
    </button>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useTableRowExpansion<T extends Record<string, unknown>>(
  config: UseTableRowExpansionConfig<T>,
): TablePlugin<T> {
  const {expandedKeys, onToggle, getRowKey, renderExpanded, getIsItemExpandable} =
    config;

  // Stable expansion column definition with a renderCell that creates a
  // subscribing chevron per row (follows selection plugin's pattern).
  const expansionColumn = useMemo(
    (): TableColumn<T> => ({
      key: '__expansion',
      header: '',
      width: EXPANSION_COLUMN_WIDTH,
      resizable: false,
      renderCell: (item: T) => {
        const key = getRowKey(item);
        const expandable = getIsItemExpandable ? getIsItemExpandable(item) : true;
        if (!expandable) return null;
        const isExpanded = expandedKeys.has(key);
        return (
          <ExpansionChevron
            isExpanded={isExpanded}
            onToggle={() => onToggle(key)}
            ariaLabel={isExpanded ? 'Collapse row' : 'Expand row'}
          />
        );
      },
    }),
    [expandedKeys, onToggle, getRowKey, getIsItemExpandable],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: TableColumn<T>[]) {
        return [expansionColumn, ...columns];
      },

      transformBodyCell(
        props: BodyCellRenderProps,
        column: TableColumn<T>,
        item: T,
      ): BodyCellRenderProps {
        // Contribute a context-menu action on the first cell (once per row).
        if (props.columnIndex === 0) {
          const expandable = getIsItemExpandable
            ? getIsItemExpandable(item)
            : true;
          if (expandable) {
            const key = getRowKey(item);
            const isExpanded = expandedKeys.has(key);
            return {
              ...props,
              contextMenuActions: () => [
                ...resolveContextActions(props.contextMenuActions),
                {
                  id: 'row-expansion-toggle',
                  group: 'row-expansion',
                  label: isExpanded ? 'Collapse row' : 'Expand row',
                  icon: (
                    <Icon
                      icon={isExpanded ? 'chevronDown' : 'chevronRight'}
                      size="xsm"
                      aria-hidden
                    />
                  ),
                  onSelect: () => onToggle(key),
                },
              ],
            };
          }
        }
        return props;
      },

      transformBodyRow(
        props: BodyRowRenderProps,
        item: T,
      ): BodyRowRenderProps {
        const key = getRowKey(item);
        const isExpanded = expandedKeys.has(key);
        if (!isExpanded) return props;

        // Determine column count for colSpan (columns array is on the cells
        // but not on the row — use a generous default that colSpan handles).
        const expandedContent = (
          <tr key={`${key}-expanded`} {...stylex.props(expansionStyles.expandedRow)}>
            <td colSpan={999} {...stylex.props(expansionStyles.expandedCell)}>
              {renderExpanded(item)}
            </td>
          </tr>
        );

        return {
          ...props,
          afterRow: props.afterRow ? (
            <>
              {props.afterRow}
              {expandedContent}
            </>
          ) : (
            expandedContent
          ),
        };
      },
    }),
    [expandedKeys, getRowKey, renderExpanded, getIsItemExpandable, onToggle, expansionColumn],
  );
}
