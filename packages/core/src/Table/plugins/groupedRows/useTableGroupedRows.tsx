// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableGroupedRows.tsx
 * @input React, StyleX, Icon, Table types + the flat data array
 * @output Exports useTableGroupedRows hook + config/result types
 * @position Grouped-rows plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  spacingVars,
  colorVars,
  fontWeightVars,
} from '../../../theme/tokens.stylex';
import {Icon} from '../../../Icon';
import type {TablePlugin} from '../../types';

// A synthetic group-header row injected into the flattened data. Real rows
// never carry this marker.
const GROUP_HEADER = Symbol('tableGroupHeader');

interface GroupHeader {
  [GROUP_HEADER]: true;
  groupKey: string;
  count: number;
}

function isGroupHeader(item: unknown): item is GroupHeader {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as Record<symbol, unknown>)[GROUP_HEADER] === true
  );
}

// Proxy handler: any field access beyond the marker fields resolves to `''`
// so user cell renderers (`item.name.toUpperCase()`) never throw on a header.
const HEADER_PROXY_HANDLER: ProxyHandler<Record<string | symbol, unknown>> = {
  // eslint-disable-next-line @typescript-eslint/promise-function-async -- Proxy get trap, not a promise-returning fn
  get(t: Record<string | symbol, unknown>, prop: string | symbol): unknown {
    if (prop === GROUP_HEADER || prop === 'groupKey' || prop === 'count') {
      return t[prop];
    }
    return prop in t ? t[prop] : '';
  },
};

/**
 * Build a synthetic header row wrapped in a Proxy so arbitrary field access
 * from user cell renderers (e.g. `item.name.toUpperCase()`) resolves to `''`
 * instead of throwing — BaseTable evaluates `col.renderCell(item)` on every
 * row (including synthetic headers) before `transformBodyRow` can replace the
 * row's cells. `transformBodyRow` then discards those cells and renders a
 * single full-width header cell.
 */
function makeHeader<T extends Record<string, unknown>>(
  groupKey: string,
  count: number,
): T {
  const target: Record<string | symbol, unknown> = {
    [GROUP_HEADER]: true,
    groupKey,
    count,
  };
  return new Proxy(target, HEADER_PROXY_HANDLER) as unknown as T;
}

/** Configuration for {@link useTableGroupedRows}. */
export interface UseTableGroupedRowsConfig<T extends Record<string, unknown>> {
  /** The flat data to group. */
  data: T[];
  /** Derive the group key for a row. Rows with the same key share a section. */
  groupBy: (item: T) => string;
  /** Set of currently-collapsed group keys. */
  collapsedGroups: Set<string>;
  /** Called with a group key when its header is toggled. */
  onToggleGroup: (groupKey: string) => void;
  /**
   * Custom renderer for a group header's content (right of the chevron).
   * Defaults to `<groupKey> (<count>)`.
   */
  renderGroupHeader?: (
    groupKey: string,
    count: number,
    collapsed: boolean,
  ) => ReactNode;
  /** Stable key for a real row. Falls back to a positional key when omitted. */
  getRowKey?: (item: T) => string;
  /** Explicit group ordering; groups not listed keep first-seen order after these. */
  groupOrder?: string[];
}

export interface UseTableGroupedRowsResult<T extends Record<string, unknown>> {
  /** Ready-to-use plugin for `<Table plugins>`. */
  plugin: TablePlugin<T>;
  /** Flattened rows: `[header, ...visibleRows, header, ...visibleRows]`. */
  data: T[];
  /**
   * Row-key resolver (also keys synthetic headers as `__group_<key>`). Pass to
   * `<Table idKey>` — named for parallelism with the Table prop:
   * `<Table idKey={grouped.idKey} />`.
   */
  idKey: (item: T) => string;
}

const styles = stylex.create({
  headerRow: {
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: colorVars['--color-background-muted'],
    // Divider beneath each group header row (Ernest review #2).
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  headerCell: {
    paddingBlock: spacingVars['--spacing-2'],
    // No inline start padding so the chevron aligns with the table's leading
    // edge (Ernest review #1).
    paddingInlineStart: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-3'],
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  // Standalone chevron button with no heavy chrome (transparent, borderless,
  // zero padding) so the icon sits flush with the start of the table
  // (Ernest review #1) while staying keyboard-operable.
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    padding: 0,
    margin: 0,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: {
      default: colorVars['--color-icon-secondary'],
      ':hover': colorVars['--color-icon-primary'],
    },
  },
  chevronIcon: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
  },
  chevronExpanded: {
    transform: 'rotate(90deg)',
  },
  // Emphasized body text — same size as body, heavier weight (Ernest #3).
  label: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  count: {
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
});

/**
 * Groups a flat data array into collapsible section rows. Each distinct
 * `groupBy` value becomes a full-width section-header row with a chevron
 * toggle, the group label, and a member count; collapsing hides that group's
 * data rows while keeping the header visible.
 *
 * Mirrors {@link useTableRowExpansionState}: the consumer owns the
 * `collapsedGroups` set and this hook returns `{data, plugin, idKey}` —
 * pass all three to `<Table>`.
 *
 * @example
 * ```tsx
 * const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
 * const grouped = useTableGroupedRows({
 *   data: rows,
 *   groupBy: r => r.team,
 *   collapsedGroups: collapsed,
 *   onToggleGroup: key =>
 *     setCollapsed(prev => {
 *       const next = new Set(prev);
 *       next.has(key) ? next.delete(key) : next.add(key);
 *       return next;
 *     }),
 *   getRowKey: r => r.id,
 * });
 * <Table
 *   data={grouped.data}
 *   columns={columns}
 *   idKey={grouped.idKey}
 *   plugins={{grouped: grouped.plugin}}
 * />;
 * ```
 */
export function useTableGroupedRows<T extends Record<string, unknown>>(
  config: UseTableGroupedRowsConfig<T>,
): UseTableGroupedRowsResult<T> {
  const {
    data,
    groupBy,
    collapsedGroups,
    onToggleGroup,
    renderGroupHeader,
    getRowKey: getRowKeyProp,
    groupOrder,
  } = config;

  const flattened = useMemo((): T[] => {
    if (data.length === 0) {
      return [];
    }

    // Group preserving first-seen order.
    const groups = new Map<string, T[]>();
    for (const item of data) {
      const key = groupBy(item);
      const bucket = groups.get(key);
      if (bucket) {
        bucket.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    // Determine iteration order.
    let keys = [...groups.keys()];
    if (groupOrder && groupOrder.length > 0) {
      const ordered = groupOrder.filter(k => groups.has(k));
      const rest = keys.filter(k => !groupOrder.includes(k));
      keys = [...ordered, ...rest];
    }

    const out: T[] = [];
    for (const key of keys) {
      const rows = groups.get(key) ?? [];
      out.push(makeHeader<T>(key, rows.length));
      if (!collapsedGroups.has(key)) {
        out.push(...rows);
      }
    }
    return out;
  }, [data, groupBy, collapsedGroups, groupOrder]);

  // Positional fallback index, built once per flattened array so key lookup
  // stays O(1) instead of O(n) per row (which would make table keying O(n²)).
  const positionByItem = useMemo(() => {
    if (getRowKeyProp) {
      return null;
    }
    const map = new Map<T, number>();
    for (let i = 0; i < flattened.length; i++) {
      map.set(flattened[i], i);
    }
    return map;
  }, [flattened, getRowKeyProp]);

  const idKey = useCallback(
    (item: T): string => {
      if (isGroupHeader(item)) {
        return `__group_${item.groupKey}`;
      }
      if (getRowKeyProp) {
        return getRowKeyProp(item);
      }
      return String(positionByItem?.get(item) ?? -1);
    },
    [getRowKeyProp, positionByItem],
  );

  const plugin = useMemo(
    (): TablePlugin<T> => ({
      // Replace a header row's pre-rendered cells with one full-width cell.
      transformBodyRow(props, item) {
        if (!isGroupHeader(item)) {
          return props;
        }
        const header = item as unknown as GroupHeader;
        const collapsed = collapsedGroups.has(header.groupKey);
        const toggle = () => onToggleGroup(header.groupKey);
        const content: ReactNode = renderGroupHeader ? (
          renderGroupHeader(header.groupKey, header.count, collapsed)
        ) : (
          <span {...stylex.props(styles.label)}>
            {header.groupKey}{' '}
            <span {...stylex.props(styles.count)}>({header.count})</span>
          </span>
        );
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            // Convenience: clicking anywhere on the row toggles it. The chevron
            // button below is the accessible, keyboard-operable control, so the
            // row keeps its implicit `row` role (no role override here).
            onClick: toggle,
            'aria-expanded': !collapsed,
          },
          styles: [...props.styles, styles.headerRow],
          children: (
            // colSpan larger than the column count is clamped by the browser
            // to the actual number of columns, so the header always spans the
            // full width without the plugin knowing the column count.
            <td colSpan={999} {...stylex.props(styles.headerCell)}>
              <span {...stylex.props(styles.headerInner)}>
                {/* Standalone chevron button, flush with the table's start
                    edge (no heavy button chrome) — the keyboard control. */}
                <button
                  type="button"
                  {...stylex.props(styles.chevron)}
                  onClick={e => {
                    e.stopPropagation();
                    toggle();
                  }}
                  aria-label={
                    collapsed
                      ? `Expand group ${header.groupKey}`
                      : `Collapse group ${header.groupKey}`
                  }
                  aria-expanded={!collapsed}>
                  <span
                    {...stylex.props(
                      styles.chevronIcon,
                      !collapsed && styles.chevronExpanded,
                    )}>
                    <Icon icon="chevronRight" size="xsm" />
                  </span>
                </button>
                {content}
              </span>
            </td>
          ),
        };
      },
    }),
    [collapsedGroups, onToggleGroup, renderGroupHeader],
  );

  return {plugin, data: flattened, idKey};
}
