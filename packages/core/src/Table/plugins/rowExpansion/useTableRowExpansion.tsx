// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowExpansion.tsx
 * @input React, StyleX, Icon, Table types
 * @output Exports useTableRowExpansion hook + config/state types
 * @position Row-expansion plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, colorVars, radiusVars} from '../../../theme/tokens.stylex';
import {Icon} from '../../../Icon';
import {resolveContextActions} from '../../tableContextMenu';
import {useTranslator} from '../../../i18n';
import type {
  TablePlugin,
  TableColumn,
  BodyCellRenderProps,
  BodyRowRenderProps,
  HeaderCellRenderProps,
} from '../../types';

// =============================================================================
// Config
// =============================================================================

/**
 * Configuration for useTableRowExpansion (inherited-columns mode).
 *
 * Child rows use the same columns as their parents, with indentation on the
 * first content column. The consumer provides a **flat** data array (use
 * {@link useTableRowExpansionState} to flatten a tree) and a `getDepth`
 * function so the plugin knows each row's nesting level.
 */
export interface UseTableRowExpansionConfig<T extends Record<string, unknown>> {
  /** Set of currently-expanded row keys. */
  expandedKeys: Set<string>;
  /** Called when a row's expansion is toggled. */
  onToggle: (key: string) => void;
  /** Derive a stable unique key from a row item. */
  getRowKey: (item: T) => string;
  /** Return the children of a row (used to determine expandability). */
  getChildren: (item: T) => T[];
  /** Return the depth of a row in the hierarchy (0 = top-level). */
  getDepth?: (item: T) => number;
  /** Optionally control which rows are expandable. @default checks getChildren length */
  getIsItemExpandable?: (item: T) => boolean;
  /**
   * When true, clicking anywhere on the row toggles expansion (in addition to
   * the chevron button). @default false — only the chevron triggers expansion.
   */
  hasRowClickExpansion?: boolean;
  /**
   * State of the expand-all toggle in the header. `true` = all expanded,
   * `false` = all collapsed, `'indeterminate'` = mixed. When provided
   * (together with `onToggleExpandAll`), the header cell shows a toggle button.
   */
  isAllExpanded?: boolean | 'indeterminate';
  /** Called when the expand-all header toggle is clicked. */
  onToggleExpandAll?: (expand: boolean) => void;
}

/**
 * Configuration for {@link useTableRowExpansionState}.
 *
 * Mirrors the shape of {@link useTableSelectionState}: you own the
 * `expandedKeys` set (via `useState`), and the hook derives everything the
 * plugin needs — the flattened `data`, per-row depth, expand/collapse
 * handlers, and the expand-all toggle state.
 */
export interface UseTableRowExpansionStateConfig<
  T extends Record<string, unknown>,
> {
  /** The full, un-flattened tree. */
  baseData: T[];
  /** Return the children of a row. Leaf rows return an empty array. */
  getChildren: (item: T) => T[];
  /** Derive a stable unique key from a row item. */
  getRowKey: (item: T) => string;
  /**
   * Should this row be expandable? Rows that return `false` never show a
   * chevron and are skipped by expand-all. @default rows with children
   */
  getIsItemExpandable?: (item: T) => boolean;
  /** Controlled set of currently-expanded row keys. */
  expandedKeys: Set<string>;
  /** Setter for the controlled expanded keys. */
  setExpandedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface UseTableRowExpansionStateResult<
  T extends Record<string, unknown>,
> {
  /** The flattened, currently-visible rows. Pass to `<Table data>`. */
  data: T[];
  /** Ready-to-use config for {@link useTableRowExpansion}. */
  expansionConfig: UseTableRowExpansionConfig<T>;
}

/**
 * Manages row-expansion state and derives the config for
 * {@link useTableRowExpansion}. This is the recommended entry point — it
 * removes the boilerplate of flattening the tree, tracking depth, and
 * computing the expand-all state.
 *
 * @example
 * ```
 * const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
 * const {data, expansionConfig} = useTableRowExpansionState({
 *   baseData: tree,
 *   getChildren: item => item.children ?? [],
 *   getRowKey: item => item.id,
 *   expandedKeys,
 *   setExpandedKeys,
 * });
 * const expansion = useTableRowExpansion(expansionConfig);
 * <Table data={data} columns={columns} idKey="id" plugins={{expansion}} />;
 * ```
 */
export function useTableRowExpansionState<T extends Record<string, unknown>>({
  baseData,
  getChildren,
  getRowKey,
  getIsItemExpandable,
  expandedKeys,
  setExpandedKeys,
}: UseTableRowExpansionStateConfig<T>): UseTableRowExpansionStateResult<T> {
  const isExpandable = useCallback(
    (item: T): boolean =>
      getIsItemExpandable
        ? getIsItemExpandable(item)
        : getChildren(item).length > 0,
    [getIsItemExpandable, getChildren],
  );

  const depthMap = useMemo(() => {
    const map = new Map<string, number>();
    function walk(items: T[], depth: number) {
      for (const item of items) {
        const key = getRowKey(item);
        map.set(key, depth);
        if (expandedKeys.has(key)) {
          walk(getChildren(item), depth + 1);
        }
      }
    }
    walk(baseData, 0);
    return map;
  }, [baseData, getChildren, getRowKey, expandedKeys]);

  const data = useMemo(() => {
    const result: T[] = [];
    function walk(items: T[]) {
      for (const item of items) {
        result.push(item);
        const key = getRowKey(item);
        if (expandedKeys.has(key)) {
          walk(getChildren(item));
        }
      }
    }
    walk(baseData);
    return result;
  }, [baseData, getChildren, getRowKey, expandedKeys]);

  // Every expandable key across the whole tree (drives expand-all).
  const allExpandableKeys = useMemo(() => {
    const keys: string[] = [];
    function walk(items: T[]) {
      for (const item of items) {
        if (isExpandable(item)) {
          keys.push(getRowKey(item));
          walk(getChildren(item));
        }
      }
    }
    walk(baseData);
    return keys;
  }, [baseData, getChildren, getRowKey, isExpandable]);

  const getDepth = useCallback(
    (item: T) => depthMap.get(getRowKey(item)) ?? 0,
    [depthMap, getRowKey],
  );

  const onToggle = useCallback(
    (key: string) => {
      setExpandedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [setExpandedKeys],
  );

  const isAllExpanded: boolean | 'indeterminate' = useMemo(() => {
    if (allExpandableKeys.length === 0) {
      return false;
    }
    const expandedCount = allExpandableKeys.filter(k =>
      expandedKeys.has(k),
    ).length;
    if (expandedCount === 0) {
      return false;
    }
    if (expandedCount === allExpandableKeys.length) {
      return true;
    }
    return 'indeterminate';
  }, [allExpandableKeys, expandedKeys]);

  const onToggleExpandAll = useCallback(
    (expand: boolean) => {
      setExpandedKeys(expand ? new Set(allExpandableKeys) : new Set());
    },
    [setExpandedKeys, allExpandableKeys],
  );

  const expansionConfig = useMemo(
    (): UseTableRowExpansionConfig<T> => ({
      expandedKeys,
      onToggle,
      getRowKey,
      getChildren,
      getDepth,
      getIsItemExpandable,
      isAllExpanded,
      onToggleExpandAll,
    }),
    [
      expandedKeys,
      onToggle,
      getRowKey,
      getChildren,
      getDepth,
      getIsItemExpandable,
      isAllExpanded,
      onToggleExpandAll,
    ],
  );

  return {data, expansionConfig};
}

// =============================================================================
// Styles
// =============================================================================

const EXPANSION_COLUMN_WIDTH = {type: 'pixel' as const, value: 40};

/** Indentation applied per depth level, in pixels. */
const INDENT_PER_DEPTH = 24;

const expansionStyles = stylex.create({
  chevronButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: radiusVars['--radius-inner'],
    cursor: 'pointer',
    color: colorVars['--color-icon-secondary'],
    transitionProperty: 'transform, color, background-color',
    transitionDuration: '150ms',
    padding: 0,
    flexShrink: '0',
    // Match IconButton ghost hover: subtle overlay background
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
    },
    ':hover': {
      color: colorVars['--color-icon-primary'],
    },
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  chevronIcon: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
  },
  indentedCell: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  indent: (px: number) => ({
    paddingInlineStart: `${px}px`,
  }),
  placeholder: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    flexShrink: '0',
  },
  clickableRow: {
    cursor: 'pointer',
  },
});

// =============================================================================
// Chevron
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
      {...stylex.props(expansionStyles.chevronButton)}
      onClick={e => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={ariaLabel}
      aria-expanded={isExpanded}>
      <span
        {...stylex.props(
          expansionStyles.chevronIcon,
          isExpanded && expansionStyles.chevronExpanded,
        )}>
        <Icon icon="chevronRight" size="xsm" />
      </span>
    </button>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useTableRowExpansion<T extends Record<string, unknown>>(
  config: UseTableRowExpansionConfig<T>,
): TablePlugin<T> {
  const t = useTranslator();
  const {
    expandedKeys,
    onToggle,
    getRowKey,
    getChildren,
    getDepth,
    getIsItemExpandable,
    hasRowClickExpansion = false,
    isAllExpanded,
    onToggleExpandAll,
  } = config;

  // Track the first non-plugin column key for indentation.
  const firstUserColumnKeyRef = useRef<string | null>(null);

  const expansionColumn = useMemo(
    (): TableColumn<T> => ({
      key: '__expansion',
      header: '',
      width: EXPANSION_COLUMN_WIDTH,
      resizable: false,
      renderCell: (item: T) => {
        // Child rows (depth > 0) show their chevron inline in the first user
        // column instead — don't double up here.
        const depth = getDepth ? getDepth(item) : 0;
        if (depth > 0) {
          return null;
        }

        const key = getRowKey(item);
        const expandable = getIsItemExpandable
          ? getIsItemExpandable(item)
          : getChildren(item).length > 0;
        if (!expandable) {
          return null;
        }
        const isExpanded = expandedKeys.has(key);
        return (
          <ExpansionChevron
            isExpanded={isExpanded}
            onToggle={() => onToggle(key)}
            ariaLabel={isExpanded ? t('@astryx.tableRowExpansion.collapseRow') : t('@astryx.tableRowExpansion.expandRow')}
          />
        );
      },
    }),
    [
      expandedKeys,
      onToggle,
      getRowKey,
      getChildren,
      getIsItemExpandable,
      getDepth,
      t,
    ],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: TableColumn<T>[]) {
        // Track the first user column for indentation.
        const firstUserCol = columns.find(c => !c.key.startsWith('__'));
        firstUserColumnKeyRef.current = firstUserCol?.key ?? null;

        // Wrap the first user column's renderCell to add depth indentation +
        // an inline chevron for child rows. This is the inherited-columns
        // pattern: child rows use the same columns but indent their first
        // content cell.
        const wrappedColumns = columns.map(col => {
          if (col.key !== firstUserColumnKeyRef.current) {
            return col;
          }
          const originalRenderCell = col.renderCell;
          return {
            ...col,
            renderCell: (item: T): ReactNode => {
              const depth = getDepth ? getDepth(item) : 0;
              const originalContent = originalRenderCell
                ? originalRenderCell(item)
                : String(
                    ((item as Record<string, unknown>)[col.key] as
                      string | number | null | undefined) ?? '',
                  );

              if (depth === 0) {
                return originalContent;
              }

              const indent = (depth - 1) * INDENT_PER_DEPTH;
              const key = getRowKey(item);
              const isExpanded = expandedKeys.has(key);
              const expandable = getIsItemExpandable
                ? getIsItemExpandable(item)
                : getChildren(item).length > 0;

              const chevron = expandable ? (
                <ExpansionChevron
                  isExpanded={isExpanded}
                  onToggle={() => onToggle(key)}
                  ariaLabel={isExpanded ? t('@astryx.tableRowExpansion.collapseRow') : t('@astryx.tableRowExpansion.expandRow')}
                />
              ) : (
                <span {...stylex.props(expansionStyles.placeholder)} />
              );

              return (
                <div
                  {...stylex.props(
                    expansionStyles.indentedCell,
                    indent > 0 && expansionStyles.indent(indent),
                  )}>
                  {chevron}
                  {originalContent}
                </div>
              );
            },
          };
        });

        return [expansionColumn, ...wrappedColumns];
      },

      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: TableColumn<T>,
      ): HeaderCellRenderProps {
        if (column.key !== '__expansion') {
          return props;
        }

        // Show expand-all toggle when the consumer provides the state + callback.
        if (isAllExpanded !== undefined && onToggleExpandAll) {
          const allExpanded = isAllExpanded === true;
          return {
            ...props,
            content: (
              <button
                type="button"
                {...stylex.props(expansionStyles.chevronButton)}
                onClick={() => onToggleExpandAll(!allExpanded)}
                aria-label={
                  allExpanded ? t('@astryx.tableRowExpansion.collapseAllRows') : t('@astryx.tableRowExpansion.expandAllRows')
                }>
                <span
                  {...stylex.props(
                    expansionStyles.chevronIcon,
                    allExpanded && expansionStyles.chevronExpanded,
                  )}>
                  <Icon icon="chevronRight" size="xsm" />
                </span>
              </button>
            ),
          };
        }

        return {...props, content: null};
      },

      transformBodyCell(
        props: BodyCellRenderProps,
        column: TableColumn<T>,
        item: T,
      ): BodyCellRenderProps {
        // Contribute "Expand/Collapse row" context-menu action on every cell
        // so right-clicking anywhere in the row shows the option.
        const expandable = getIsItemExpandable
          ? getIsItemExpandable(item)
          : getChildren(item).length > 0;
        if (!expandable) {
          return props;
        }

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
      },

      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        if (!hasRowClickExpansion) {
          return props;
        }
        const expandable = getIsItemExpandable
          ? getIsItemExpandable(item)
          : getChildren(item).length > 0;
        if (!expandable) {
          return props;
        }
        const key = getRowKey(item);
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: () => onToggle(key),
          },
          xstyle: [...props.xstyle, expansionStyles.clickableRow],
        };
      },
    }),
    [
      expandedKeys,
      getRowKey,
      onToggle,
      getChildren,
      getDepth,
      getIsItemExpandable,
      hasRowClickExpansion,
      isAllExpanded,
      onToggleExpandAll,
      expansionColumn,
      t,
    ],
  );
}
