// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowExpansion.tsx
 * @input React, StyleX, Icon, Table types, table context (dividers), i18n
 *   (useTranslator)
 * @output Exports useTableRowExpansion hook + config type
 * @position Row-expansion plugin (detail panel); consumed by Table via plugins prop
 *
 * Expands a full-width detail panel below a row, rendered by the consumer's
 * `renderExpanded(item)`. For hierarchical/tree tables (child rows that reuse
 * the parent columns) use `useTableTreeData` + `useTableTreeState` instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 * - /packages/core/src/Table/useTableRowExpansion.doc.mjs
 */

import {useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  spacingVars,
  colorVars,
  radiusVars,
  borderVars,
  durationVars,
  easeVars,
} from '../../../theme/tokens.stylex';
import {tableRowMarker} from '../../table.stylex';
import {Icon} from '../../../Icon';
import {VisuallyHidden} from '../../../VisuallyHidden';
import {resolveContextActions} from '../../tableContextMenu';
import {useTableContext} from '../../useTableCellStyles';
import {useTranslator} from '../../../i18n';
import {rtlStyles} from '../../../utils';
import type {
  TablePlugin,
  TableColumn,
  BodyRowRenderProps,
  BodyCellRenderProps,
} from '../../types';

// =============================================================================
// Config
// =============================================================================

/**
 * Configuration for useTableRowExpansion (detail-panel mode).
 *
 * The consumer owns expansion state; the plugin provides the chevron UI, the
 * full-width detail panel rendered below an expanded row, and a right-click
 * "Expand/Collapse row" action.
 */
export interface UseTableRowExpansionConfig<T extends Record<string, unknown>> {
  /** Set of currently-expanded row keys. */
  expandedKeys: Set<string>;
  /** Called with a row key when its expansion is toggled. */
  onToggle: (key: string) => void;
  /** Derive a stable unique key from a row item. */
  getRowKey: (item: T) => string;
  /**
   * Render the detail content shown in a full-width panel below the row when
   * it is expanded. Receives the row's item.
   */
  renderExpanded: (item: T) => ReactNode;
  /**
   * Control which rows are expandable. Non-expandable rows show no chevron, no
   * context-menu action, and never render a panel. @default all rows expandable
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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    color: colorVars['--color-icon-secondary'],
    // Colour only. The rotation belongs to the glyph, not to the button: the
    // button is the hit target and carries the hover chip, and turning that
    // swings the rounded rectangle and its highlight around with the arrow.
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    padding: 0,
    // Match IconButton ghost hover: subtle overlay background.
    backgroundImage: {
      default: null,
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
    },
    ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
      color: colorVars['--color-icon-primary'],
    },
  },
  chevron: {
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  // The RTL mirror is folded into each state's transform rather than living
  // on a parent span, matching TreeListItem's chevron (both are `transform`,
  // so on one element the later value would win).
  chevronExpanded: {
    transform: {
      default: 'rotate(90deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(90deg)',
    },
  },
  chevronCollapsed: {
    transform: {
      default: 'rotate(0deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(0deg)',
    },
  },
  expandedRow: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  expandedCell: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-5'],
  },
});

/**
 * An expanded row and its panel are one unit, so the row divider belongs after
 * the pair rather than between them — left alone, the row's own bottom border
 * draws a line cutting it off from the detail it just opened, and the panel
 * then runs flush into the next row, which is the wrong way round.
 *
 * So the row gives up its border and the panel takes one. On a table with no
 * row dividers the suppression is a no-op (there was no border to remove) and
 * the panel's is never applied, so neither needs to consult the divider mode.
 */
const dividerStyles = stylex.create({
  expandedRowCell: {
    borderBottomWidth: 0,
  },
  panelCell: {
    borderBottomWidth: {
      default: borderVars['--border-width'],
      // Same rule TableCell uses: no trailing line under the last row of the
      // table. Scoped to the marker so <tbody>, also a :last-child, does not
      // match and suppress every panel's border.
      [stylex.when.ancestor(':last-child', tableRowMarker)]: '0',
    },
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
});

// =============================================================================
// Chevron Cell
// =============================================================================

function ExpansionChevron({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const t = useTranslator();
  return (
    <button
      type="button"
      {...stylex.props(expansionStyles.chevronButton)}
      onClick={e => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={
        isExpanded
          ? t('@astryx.tableRowExpansion.collapseRow')
          : t('@astryx.tableRowExpansion.expandRow')
      }
      aria-expanded={isExpanded}>
      <Icon
        icon="chevronRight"
        size="xsm"
        xstyle={[
          expansionStyles.chevron,
          isExpanded
            ? expansionStyles.chevronExpanded
            : expansionStyles.chevronCollapsed,
        ]}
      />
    </button>
  );
}

/**
 * The detail panel's cell. A component rather than a bare `<td>` so it can read
 * the table's divider mode off the context and carry the row divider its own
 * row gave up. The plugin builds this row outside the Table's own render, where
 * that context is not otherwise in hand.
 */
function ExpansionPanelCell({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  const ctx = useTableContext();
  const hasRowDividers = ctx?.dividers === 'rows' || ctx?.dividers === 'grid';
  return (
    <td
      colSpan={colSpan}
      {...stylex.props(
        expansionStyles.expandedCell,
        hasRowDividers && dividerStyles.panelCell,
      )}>
      {children}
    </td>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Returns a TablePlugin that expands a full-width detail panel below a row.
 *
 * The consumer owns the `expandedKeys` set (via `useState`); the plugin adds
 * a leading chevron column, a right-click expand/collapse action, and renders
 * `renderExpanded(item)` in a full-width panel below each expanded row.
 *
 * For hierarchical data (child rows sharing the parent columns) use
 * `useTableTreeData` + `useTableTreeState` instead.
 *
 * @example
 * ```
 * const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
 * const expansion = useTableRowExpansion({
 *   expandedKeys,
 *   onToggle: key =>
 *     setExpandedKeys(prev => {
 *       const next = new Set(prev);
 *       next.has(key) ? next.delete(key) : next.add(key);
 *       return next;
 *     }),
 *   getRowKey: item => item.id,
 *   renderExpanded: item => <OrderDetails order={item} />,
 * });
 * <Table data={data} columns={columns} idKey="id" plugins={{expansion}} />;
 * ```
 */
export function useTableRowExpansion<T extends Record<string, unknown>>(
  config: UseTableRowExpansionConfig<T>,
): TablePlugin<T> {
  const {
    expandedKeys,
    onToggle,
    getRowKey,
    renderExpanded,
    getIsItemExpandable,
  } = config;

  const t = useTranslator();

  // Final rendered column count, captured in transformColumns (pipeline step
  // 1) and read in transformBodyRow for the detail panel's colSpan.
  const columnCountRef = useRef(1);

  const expansionColumn = useMemo(
    (): TableColumn<T> => ({
      key: '__expansion',
      // A `<th>` with no discernible text is announced as an unlabelled
      // column; the label is hidden because the column shows only chevrons.
      header: (
        <VisuallyHidden>
          {t('@astryx.tableRowExpansion.columnHeader')}
        </VisuallyHidden>
      ),
      width: EXPANSION_COLUMN_WIDTH,
      resizable: false,
      renderCell: (item: T) => {
        const expandable = getIsItemExpandable
          ? getIsItemExpandable(item)
          : true;
        if (!expandable) {
          return null;
        }
        const key = getRowKey(item);
        return (
          <ExpansionChevron
            isExpanded={expandedKeys.has(key)}
            onToggle={() => onToggle(key)}
          />
        );
      },
    }),
    [expandedKeys, onToggle, getRowKey, getIsItemExpandable, t],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: TableColumn<T>[]) {
        const withExpansion = [expansionColumn, ...columns];
        columnCountRef.current = withExpansion.length;
        return withExpansion;
      },

      transformBodyCell(
        props: BodyCellRenderProps,
        _column: TableColumn<T>,
        item: T,
      ): BodyCellRenderProps {
        // Contribute the expand/collapse action on every cell; BaseTable
        // aggregates them into one menu per row. Skip non-expandable rows.
        const expandable = getIsItemExpandable
          ? getIsItemExpandable(item)
          : true;
        if (!expandable) {
          return props;
        }
        const key = getRowKey(item);
        const isExpanded = expandedKeys.has(key);
        return {
          ...props,
          // Hand the row divider to the panel below, so the line closes the
          // row-plus-panel pair instead of splitting it.
          xstyle: isExpanded
            ? [...props.xstyle, dividerStyles.expandedRowCell]
            : props.xstyle,
          contextMenuActions: () => [
            ...resolveContextActions(props.contextMenuActions),
            {
              id: 'row-expansion-toggle',
              group: 'row-expansion',
              label: isExpanded
                ? t('@astryx.tableRowExpansion.collapseRow')
                : t('@astryx.tableRowExpansion.expandRow'),
              icon: (
                <Icon
                  icon={isExpanded ? 'chevronDown' : 'chevronRight'}
                  size="xsm"
                  aria-hidden
                  // chevronDown needs no mirroring; chevronRight (collapsed,
                  // pointing toward the reveal direction) does.
                  xstyle={!isExpanded && rtlStyles.mirror}
                />
              ),
              onSelect: () => onToggle(key),
            },
          ],
        };
      },

      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        const expandable = getIsItemExpandable
          ? getIsItemExpandable(item)
          : true;
        if (!expandable) {
          return props;
        }
        const key = getRowKey(item);
        if (!expandedKeys.has(key)) {
          return props;
        }

        const panel = (
          <tr
            key={`${key}-expanded`}
            // A panel is its row's continuation, not a row of its own. Striping
            // counts `:nth-child(even of :not([data-expansion-panel]))`, so this
            // attribute is what keeps an open panel from inverting the zebra of
            // every row beneath it. Load-bearing, not diagnostic.
            data-expansion-panel=""
            {...stylex.props(
              // Carries the marker so the panel cell's divider can ask whether
              // this row is the table's last, the same way TableCell does.
              tableRowMarker,
              expansionStyles.expandedRow,
            )}>
            <ExpansionPanelCell colSpan={columnCountRef.current}>
              {renderExpanded(item)}
            </ExpansionPanelCell>
          </tr>
        );

        return {
          ...props,
          afterRow: props.afterRow ? (
            <>
              {props.afterRow}
              {panel}
            </>
          ) : (
            panel
          ),
        };
      },
    }),
    [
      expandedKeys,
      getRowKey,
      renderExpanded,
      getIsItemExpandable,
      onToggle,
      t,
      expansionColumn,
    ],
  );
}
