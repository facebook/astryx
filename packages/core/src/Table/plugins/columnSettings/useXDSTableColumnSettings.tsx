'use client';

/**
 * @file useXDSTableColumnSettings.tsx
 * @input React, Table types
 * @output Exports useXDSTableColumnSettings plugin hook and types
 * @position Column settings plugin; consumed by XDSTable via plugins prop
 *
 * Pure plugin hook — takes column settings config, returns a TablePlugin
 * that filters and reorders columns via `transformColumns`.
 *
 * For state management (toggle, reset, visibility checks), use
 * `useXDSTableColumnSettingsState` which produces the config this hook needs.
 *
 * For MultiSelector integration, use `toColumnSelectorOptions` to convert
 * column definitions into XDSMultiSelector-compatible options.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/plugins/columnSettings/index.ts (exports)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, useRef} from 'react';
import type {TablePlugin, XDSTableColumn} from '../../types';
import type {XDSMultiSelectorOptionType} from '../../../MultiSelector/types';
import type {UseXDSTableColumnSettingsStateConfig} from './useXDSTableColumnSettingsState';

// =============================================================================
// Config Types
// =============================================================================

/**
 * Definition of a column for the column settings UI.
 * Separate from XDSTableColumn because the settings UI needs metadata
 * (label, group, disableability) that the table column doesn't carry.
 */
export interface XDSColumnSettingsOption<TColumnKey extends string = string> {
  /** Column key — must match XDSTableColumn.key */
  key: TColumnKey;
  /** Human-readable label for the column settings UI */
  label: string;
  /**
   * Whether this column can be hidden.
   * When true, the column is always visible and its checkbox is disabled.
   * Use for essential columns like "Name" or "ID".
   *
   * @default false
   */
  isAlwaysVisible?: boolean;
  /**
   * Optional group name for organized column lists.
   * Columns with the same group are rendered together under a heading.
   */
  group?: string;
}

/**
 * Configuration for useXDSTableColumnSettings.
 *
 * This is the same shape as UseXDSTableColumnSettingsStateConfig —
 * you can pass `state.columnSettingsConfig` directly, or construct
 * it manually if you don't need the state hook.
 *
 * @template TColumnKey - String literal union of column keys
 */
export type UseXDSTableColumnSettingsConfig<
  TColumnKey extends string = string,
> = UseXDSTableColumnSettingsStateConfig<TColumnKey>;

// =============================================================================
// Plugin Hook
// =============================================================================

/**
 * Column settings table plugin — filters and reorders columns based on
 * the active column keys.
 *
 * Returns a `TablePlugin` directly (same pattern as `useXDSTableSortable`,
 * `useXDSTableSelection`, etc.).
 *
 * @example
 * ```
 * // With the state hook (recommended)
 * const state = useXDSTableColumnSettingsState({ columns, activeColumnKeys, onChangeActiveColumnKeys });
 * const plugin = useXDSTableColumnSettings(state.columnSettingsConfig);
 *
 * <XDSTable columns={allColumns} plugins={{ columnSettings: plugin }} />
 * ```
 *
 * @example
 * ```
 * // Without state hook — manual config
 * const plugin = useXDSTableColumnSettings({
 *   columns: columnDefs,
 *   activeColumnKeys: activeKeys,
 *   onChangeActiveColumnKeys: setActiveKeys,
 * });
 * ```
 */
export function useXDSTableColumnSettings<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
>(config: UseXDSTableColumnSettingsConfig<TColumnKey>): TablePlugin<T> {
  // Keep config in a ref so the plugin reads the latest values
  // without changing plugin identity.
  const configRef = useRef(config);
  configRef.current = config;

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: XDSTableColumn<T>[]): XDSTableColumn<T>[] {
        const cfg = configRef.current;
        const activeSet = new Set(cfg.activeColumnKeys);
        // Build a map for ordering by activeColumnKeys position
        const orderMap = new Map(
          cfg.activeColumnKeys.map((key, index) => [key, index]),
        );
        return columns
          .filter(col => activeSet.has(col.key as TColumnKey))
          .sort((a, b) => {
            const orderA = orderMap.get(a.key as TColumnKey) ?? Infinity;
            const orderB = orderMap.get(b.key as TColumnKey) ?? Infinity;
            return orderA - orderB;
          });
      },
    }),
    [],
  );
}

// =============================================================================
// MultiSelector Adapter
// =============================================================================

/**
 * Convert column settings options to XDSMultiSelector-compatible options.
 *
 * Pure data transform — no React, no hooks. Converts column definitions
 * into the shape XDSMultiSelector expects. Columns with `group` are
 * organized into sections; always-visible columns are marked `disabled`.
 *
 * @example
 * ```
 * const options = toColumnSelectorOptions(columns);
 *
 * <XDSMultiSelector
 *   label="Columns"
 *   options={options}
 *   value={[...state.activeColumnKeys]}
 *   onChange={state.setActiveColumnKeys}
 * />
 * ```
 */
export function toColumnSelectorOptions<TColumnKey extends string = string>(
  columns: ReadonlyArray<XDSColumnSettingsOption<TColumnKey>>,
): XDSMultiSelectorOptionType[] {
  const hasGroups = columns.some(c => c.group);

  if (!hasGroups) {
    return columns.map(col => ({
      value: col.key,
      label: col.label,
      disabled: col.isAlwaysVisible === true,
    }));
  }

  // Build grouped sections
  const groups = new Map<string, XDSColumnSettingsOption<TColumnKey>[]>();
  const ungrouped: XDSColumnSettingsOption<TColumnKey>[] = [];

  for (const col of columns) {
    if (col.group) {
      const group = groups.get(col.group) ?? [];
      group.push(col);
      groups.set(col.group, group);
    } else {
      ungrouped.push(col);
    }
  }

  const items: XDSMultiSelectorOptionType[] = [];

  for (const [groupName, groupCols] of groups) {
    items.push({
      type: 'section' as const,
      title: groupName,
      options: groupCols.map(col => ({
        value: col.key,
        label: col.label,
        disabled: col.isAlwaysVisible === true,
      })),
    });
  }

  for (const col of ungrouped) {
    items.push({
      value: col.key,
      label: col.label,
      disabled: col.isAlwaysVisible === true,
    });
  }

  return items;
}

// =============================================================================
// activeColumns Utility
// =============================================================================

/**
 * Filter and reorder a columns array based on active column keys.
 *
 * Use this when you need the filtered column array outside the table
 * (e.g., for rendering column headers in a toolbar or for data export).
 * Inside XDSTable, the plugin's `transformColumns` handles this automatically.
 *
 * @example
 * ```
 * const visibleColumns = filterActiveColumns(allColumns, activeColumnKeys);
 * ```
 */
export function filterActiveColumns<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
>(
  columns: XDSTableColumn<T>[],
  activeColumnKeys: ReadonlyArray<TColumnKey>,
): XDSTableColumn<T>[] {
  const columnMap = new Map(columns.map(c => [c.key, c]));
  return activeColumnKeys
    .map(key => columnMap.get(key))
    .filter((c): c is XDSTableColumn<T> => c != null);
}
