// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableRowStatus.tsx
 * @input React, StyleX, Icon, i18n, dev warnings, VisuallyHidden, Table types
 * @output Exports useTableRowStatus hook + config type
 * @position Row-status plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 * - /packages/core/src/Table/useTableRowStatus.doc.mjs
 * - /packages/core/src/Table/plugins/rowStatus/useTableRowStatus.test.tsx
 * - /apps/storybook/stories/TableRowStatus.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Table/TableRowStatusTable.tsx
 */

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon, type IconColor, type IconName} from '../../../Icon';
import {Tooltip} from '../../../Tooltip';
import {useTranslator} from '../../../i18n';
import {warnOnce} from '../../../utils/devWarning';
import {VisuallyHidden} from '../../../VisuallyHidden';
import type {TableColumn, TablePlugin} from '../../types';

/**
 * Named colors supported by the custom row-status marker. These resolve to the
 * design system's icon color tokens; raw CSS colors remain an escape hatch.
 */
export type TableRowStatusColor =
  | 'accent'
  | 'success'
  | 'error'
  | 'warning'
  | 'red'
  | 'orange'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'gray';

type TableRowSemanticStatus = 'success' | 'warning' | 'error';

const NAMED_COLORS: Record<TableRowStatusColor, string> = {
  accent: 'var(--color-icon-accent)',
  success: 'var(--color-icon-green)',
  error: 'var(--color-icon-red)',
  warning: 'var(--color-icon-orange)',
  red: 'var(--color-icon-red)',
  orange: 'var(--color-icon-orange)',
  green: 'var(--color-icon-green)',
  yellow: 'var(--color-icon-yellow)',
  blue: 'var(--color-icon-blue)',
  gray: 'var(--color-icon-gray)',
};

/**
 * Stable custom row-status marker contract. `color` controls paint only; omit
 * `icon` for the 8px dot or provide a caller-selected glyph.
 *
 * This remains an interface so existing consumer extensions stay compatible.
 */
export interface TableRowStatus {
  /** Named design-system color or raw CSS color for the custom marker. */
  color: TableRowStatusColor | (string & {});
  /** Optional caller-selected glyph. Omit it to render the stable 8px dot. */
  icon?: IconName;
  /** Accessible name announced by assistive technology and shown in a tooltip. */
  label: string;
}

/** Semantic row outcome resolved through the active theme's registry and tokens. */
export interface TableSemanticRowStatus {
  status: TableRowSemanticStatus;
  color?: never;
  icon?: never;
  /** Accessible name announced by assistive technology and shown in a tooltip. */
  label: string;
}

/**
 * Additive row-status value accepted by {@link useTableRowStatus}. Semantic and
 * custom-marker inputs are mutually exclusive.
 */
export type TableRowStatusValue =
  TableSemanticRowStatus | (TableRowStatus & {status?: never});

/** Configuration for {@link useTableRowStatus}. */
export interface UseTableRowStatusConfig<T extends Record<string, unknown>> {
  /**
   * Derive the status indicator for a row. Return `null` for no indicator.
   * Memoize with `useCallback` for a stable plugin identity across renders.
   *
   * @example
   * ```
   * getStatus: row =>
   *   row.hasError ? {status: 'error', label: 'Error'} : null
   * ```
   */
  getStatus: (item: T) => TableRowStatusValue | null;
}

// The status column holds a small centered dot or icon. A fixed narrow width
// keeps every row's indicator aligned in one gutter.
const STATUS_COLUMN_WIDTH = {type: 'pixel' as const, value: 28};

/** Resolve a named color to a token, or pass a raw CSS color through. */
function resolveColor(color: string): string {
  return (NAMED_COLORS as Record<string, string>)[color] ?? color;
}

function isTableRowSemanticStatus(
  value: unknown,
): value is TableRowSemanticStatus {
  return value === 'success' || value === 'warning' || value === 'error';
}

type ResolvedTableRowStatus =
  | {variant: 'dot'; color: string}
  | {variant: 'icon'; icon: TableRowSemanticStatus; iconColor: IconColor}
  | {variant: 'icon'; icon: IconName; customColor: string};

function resolveTableRowStatus(
  value: TableRowStatusValue,
): ResolvedTableRowStatus | null {
  const untypedValue = value as {
    status?: unknown;
    color?: unknown;
    icon?: unknown;
  };

  if (untypedValue.status !== undefined) {
    if (!isTableRowSemanticStatus(untypedValue.status)) {
      if (process.env.NODE_ENV !== 'production') {
        warnOnce(
          'useTableRowStatus:unsupported-status',
          'useTableRowStatus',
          'Received an unsupported status. No row status indicator was rendered.',
        );
      }
      return null;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      (Object.prototype.hasOwnProperty.call(untypedValue, 'color') ||
        Object.prototype.hasOwnProperty.call(untypedValue, 'icon'))
    ) {
      warnOnce(
        'useTableRowStatus:semantic-custom-conflict',
        'useTableRowStatus',
        'status cannot be combined with color or icon. The semantic status takes precedence and the custom marker fields are ignored.',
      );
    }

    return {
      variant: 'icon',
      icon: untypedValue.status,
      iconColor: untypedValue.status,
    };
  }

  if (typeof untypedValue.color !== 'string') {
    if (process.env.NODE_ENV !== 'production') {
      warnOnce(
        'useTableRowStatus:missing-color',
        'useTableRowStatus',
        'A custom row status requires color. No row status indicator was rendered.',
      );
    }
    return null;
  }

  if (typeof untypedValue.icon === 'string') {
    return {
      variant: 'icon',
      icon: untypedValue.icon as IconName,
      customColor: resolveColor(untypedValue.color),
    };
  }

  return {variant: 'dot', color: resolveColor(untypedValue.color)};
}

const styles = stylex.create({
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIcon: (color: string) => ({color}),
  dot: (color: string) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  }),
});

/**
 * Returns a {@link TablePlugin} that prepends a narrow column signaling per-row
 * status. A semantic `status` resolves a themed glyph and tone; a custom
 * `color` renders the stable dot unless the caller also provides an `icon`.
 *
 * @example
 * ```
 * const rowStatus = useTableRowStatus<Row>({
 *   getStatus: row =>
 *     row.state === 'error'
 *       ? {status: 'error', label: 'Error'}
 *       : {color: 'blue', icon: 'info', label: 'Informational'},
 * });
 * <Table data={data} columns={columns} idKey="id" plugins={{rowStatus}} />;
 * ```
 */
export function useTableRowStatus<T extends Record<string, unknown>>(
  config: UseTableRowStatusConfig<T>,
): TablePlugin<T> {
  const t = useTranslator();
  const {getStatus} = config;

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns) {
        const statusColumn: TableColumn<T> = {
          key: '__rowStatus',
          // The gutter stays visually blank, but the th needs a discernible
          // name for assistive technology (axe: empty-table-header).
          header: (
            <VisuallyHidden>
              {t('@astryx.table.rowStatus.columnHeader')}
            </VisuallyHidden>
          ),
          width: STATUS_COLUMN_WIDTH,
          resizable: false,
          renderCell: (item: T) => {
            const status = getStatus(item);
            if (!status) {
              return null;
            }

            const resolvedStatus = resolveTableRowStatus(status);
            if (!resolvedStatus) {
              return null;
            }

            const signifier =
              resolvedStatus.variant === 'dot' ? (
                <span {...stylex.props(styles.dot(resolvedStatus.color))} />
              ) : (
                <Icon
                  icon={resolvedStatus.icon}
                  size="xsm"
                  color={
                    'iconColor' in resolvedStatus
                      ? resolvedStatus.iconColor
                      : 'inherit'
                  }
                />
              );

            return (
              <Tooltip content={status.label}>
                <span
                  {...stylex.props(
                    styles.wrap,
                    resolvedStatus.variant === 'icon' &&
                      'customColor' in resolvedStatus &&
                      styles.customIcon(resolvedStatus.customColor),
                  )}
                  role="img"
                  aria-label={status.label}>
                  {signifier}
                </span>
              </Tooltip>
            );
          },
        };
        return [statusColumn, ...columns];
      },
    }),
    [getStatus, t],
  );
}
