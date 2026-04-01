'use client';

/**
 * @file useXDSTableColumnSettings.tsx
 * @input React, Table types, MultiSelector types
 * @output Exports useXDSTableColumnSettings hook and config/return types
 * @position Column settings plugin; consumed by XDSTable via plugins prop
 *
 * Headless column visibility and ordering management for XDSTable.
 * The consumer owns all state — the hook provides filtered columns,
 * toggle helpers, and pre-built XDSMultiSelector options.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, useRef, type ReactNode} from 'react';
import type {TablePlugin, XDSTableColumn} from '../../types';
import type {XDSMultiSelectorOptionType} from '../../../MultiSelector/types';

// =============================================================================
// Config Types
// =============================================================================

/**
 * Definition of a column for the column settings UI.
 * Separate from XDSTableColumn because the settings UI needs metadata
 * (label, group, disableability) that the table column doesn't carry.
 */
export interface XDSColumnSettingsOption<
  TColumnKey extends string = string,
> {
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
 * Headless column visibility and ordering management for XDSTable.
 * The consumer owns all state. The hook provides filtered columns
 * and a plugin for table integration.
 *
 * @template TColumnKey - String literal union of column keys
 *
 * @example
 * ```
 * const allColumns = [
 *   { key: 'name', header: 'Name' },
 *   { key: 'email', header: 'Email' },
 *   { key: 'role', header: 'Role' },
 *   { key: 'status', header: 'Status' },
 * ];
 *
 * const [activeKeys, setActiveKeys] = useState(['name', 'email', 'role']);
 *
 * const columnSettings = useXDSTableColumnSettings({
 *   columns: [
 *     { key: 'name', label: 'Name', isAlwaysVisible: true },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Role' },
 *     { key: 'status', label: 'Status' },
 *   ],
 *   activeColumnKeys: activeKeys,
 *   onChangeActiveColumnKeys: setActiveKeys,
 * });
 *
 * <XDSTable
 *   data={data}
 *   columns={columnSettings.activeColumns(allColumns)}
 *   plugins={[columnSettings.plugin]}
 * />
 * ```
 *
 * @example
 * ```
 * <XDSMultiSelector
 *   label="Columns"
 *   options={columnSettings.columnOptions}
 *   value={[...columnSettings.activeColumnKeys]}
 *   onChange={columnSettings.setActiveColumnKeys}
 *   hasSelectAll
 * />
 * ```
 */
export interface UseXDSTableColumnSettingsConfig<
  TColumnKey extends string = string,
> {
  /**
   * All available columns with metadata for the settings UI.
   * This defines the universe of columns the user can toggle.
   */
  columns: ReadonlyArray<XDSColumnSettingsOption<TColumnKey>>;

  /**
   * Currently active column keys, in display order.
   * Only columns with keys in this array are shown in the table.
   * The array order determines column display order.
   */
  activeColumnKeys: ReadonlyArray<TColumnKey>;

  /**
   * Called when active columns change (toggle, reorder).
   * Consumer updates their own state.
   */
  onChangeActiveColumnKeys: (keys: ReadonlyArray<TColumnKey>) => void;

  /**
   * The default column set for "Reset to default" functionality.
   * When omitted, resetToDefault shows all columns.
   */
  defaultColumnKeys?: ReadonlyArray<TColumnKey>;
}

// =============================================================================
// Return Type
// =============================================================================

/**
 * Return value of useXDSTableColumnSettings.
 */
export interface UseXDSTableColumnSettingsReturn<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
> {
  /** The TablePlugin to pass to XDSTable's plugins prop. */
  plugin: TablePlugin<T>;

  /**
   * Filters and reorders the full columns array based on activeColumnKeys.
   * Returns only active columns, in the order specified by activeColumnKeys.
   *
   * @example
   * ```
   * <XDSTable columns={columnSettings.activeColumns(allColumns)} />
   * ```
   */
  activeColumns: (columns: XDSTableColumn<T>[]) => XDSTableColumn<T>[];

  /**
   * Toggle a column's visibility.
   * If the column is active, removes it. If inactive, adds it to the end.
   * No-op for columns with `isAlwaysVisible: true`.
   */
  toggleColumn: (key: TColumnKey) => void;

  /**
   * Whether a specific column is currently active (visible).
   */
  isColumnActive: (key: TColumnKey) => boolean;

  /**
   * Whether a specific column can be toggled.
   * Returns false for columns with `isAlwaysVisible: true`.
   */
  isColumnToggleable: (key: TColumnKey) => boolean;

  /**
   * Show all columns.
   */
  showAllColumns: () => void;

  /**
   * Reset to the default column set.
   * Uses `defaultColumnKeys` if provided, otherwise shows all columns.
   */
  resetToDefault: () => void;

  /**
   * Column options formatted for XDSMultiSelector.
   * Each option represents a column; always-visible columns are disabled.
   * Columns with a `group` are rendered as sections.
   *
   * @example
   * ```
   * <XDSMultiSelector
   *   label="Columns"
   *   options={columnSettings.columnOptions}
   *   value={[...columnSettings.activeColumnKeys]}
   *   onChange={columnSettings.setActiveColumnKeys}
   * />
   * ```
   */
  columnOptions: XDSMultiSelectorOptionType[];

  /**
   * Set active column keys from a list of key strings.
   * Enforces that `isAlwaysVisible` columns remain in the active set.
   * Pass directly as `onChange` to XDSMultiSelector.
   */
  setActiveColumnKeys: (keys: string[]) => void;

  /** Currently active column keys (pass-through from config). */
  activeColumnKeys: ReadonlyArray<TColumnKey>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Headless column visibility and ordering management for XDSTable.
 *
 * Manages which columns are visible and in what order, provides a table plugin
 * for integration, and generates pre-built items for XDSMultiSelector.
 * The consumer owns all state — the hook provides helpers and a stable plugin.
 *
 * @example
 * ```
 * const columnSettings = useXDSTableColumnSettings({
 *   columns: [
 *     { key: 'name', label: 'Name', isAlwaysVisible: true },
 *     { key: 'email', label: 'Email' },
 *   ],
 *   activeColumnKeys: activeKeys,
 *   onChangeActiveColumnKeys: setActiveKeys,
 * });
 * ```
 */
export function useXDSTableColumnSettings<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
>(
  config: UseXDSTableColumnSettingsConfig<TColumnKey>,
): UseXDSTableColumnSettingsReturn<T, TColumnKey> {
  const {columns, activeColumnKeys} = config;

  // Keep config in a ref so the plugin and callbacks always read
  // the latest version without forcing new object identity.
  const configRef = useRef(config);
  configRef.current = config;

  // Build lookup sets for fast checks
  const activeSet = useMemo(
    () => new Set(activeColumnKeys),
    [activeColumnKeys],
  );

  const alwaysVisibleSet = useMemo(
    () => new Set(columns.filter((c) => c.isAlwaysVisible).map((c) => c.key)),
    [columns],
  );

  // --- Column operations ---

  const toggleColumn = useCallback(
    (key: TColumnKey) => {
      const cfg = configRef.current;
      const avSet = new Set(
        cfg.columns.filter((c) => c.isAlwaysVisible).map((c) => c.key),
      );
      if (avSet.has(key)) return;

      const currentKeys = cfg.activeColumnKeys;
      const currentSet = new Set(currentKeys);
      if (currentSet.has(key)) {
        cfg.onChangeActiveColumnKeys(currentKeys.filter((k) => k !== key));
      } else {
        cfg.onChangeActiveColumnKeys([...currentKeys, key]);
      }
    },
    // configRef is stable — no deps needed beyond the ref
    [],
  );

  const isColumnActive = useCallback(
    (key: TColumnKey) => activeSet.has(key),
    [activeSet],
  );

  const isColumnToggleable = useCallback(
    (key: TColumnKey) => !alwaysVisibleSet.has(key),
    [alwaysVisibleSet],
  );

  const showAllColumns = useCallback(() => {
    const cfg = configRef.current;
    cfg.onChangeActiveColumnKeys(cfg.columns.map((c) => c.key));
  }, []);

  const resetToDefault = useCallback(() => {
    const cfg = configRef.current;
    if (cfg.defaultColumnKeys) {
      cfg.onChangeActiveColumnKeys([...cfg.defaultColumnKeys]);
    } else {
      cfg.onChangeActiveColumnKeys(cfg.columns.map((c) => c.key));
    }
  }, []);

  // --- Column filtering helper ---

  const activeColumns = useCallback(
    (allColumns: XDSTableColumn<T>[]): XDSTableColumn<T>[] => {
      const columnMap = new Map(allColumns.map((c) => [c.key, c]));
      return activeColumnKeys
        .map((key) => columnMap.get(key))
        .filter((c): c is XDSTableColumn<T> => c != null);
    },
    [activeColumnKeys],
  );

  // --- Column options for XDSMultiSelector ---

  const columnOptions = useMemo((): XDSMultiSelectorOptionType[] => {
    const hasGroups = columns.some((c) => c.group);

    if (!hasGroups) {
      return columns.map((col) => ({
        value: col.key,
        label: col.label,
        disabled: col.isAlwaysVisible === true,
      }));
    }

    // Build grouped sections
    const groups = new Map<
      string,
      XDSColumnSettingsOption<TColumnKey>[]
    >();
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
        options: groupCols.map((col) => ({
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
  }, [columns]);

  // --- Set active column keys ---

  const setActiveColumnKeys = useCallback(
    (value: string[]) => {
      const cfg = configRef.current;
      const avSet = new Set(
        cfg.columns.filter((c) => c.isAlwaysVisible).map((c) => c.key),
      );
      // Ensure always-visible columns remain in the set
      const valueSet = new Set(value);
      for (const key of avSet) {
        valueSet.add(key);
      }
      cfg.onChangeActiveColumnKeys(
        Array.from(valueSet) as unknown as TColumnKey[],
      );
    },
    [],
  );

  // --- Plugin (stable ref via configRef) ---

  const plugin = useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        return children;
      },
    }),
    [],
  );

  return {
    plugin,
    activeColumns,
    toggleColumn,
    isColumnActive,
    isColumnToggleable,
    showAllColumns,
    resetToDefault,
    columnOptions,
    setActiveColumnKeys,
    activeColumnKeys,
  };
}
