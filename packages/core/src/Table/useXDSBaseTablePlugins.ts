'use client';

/**
 * @file useXDSBaseTablePlugins.ts
 * @input React, types.ts
 * @output Exports useXDSBaseTablePlugins hook
 * @position Utility hook; used by XDSTable to convert named plugin records to stable arrays
 *
 * ## Plugin Ordering
 *
 * First-party plugins are sorted into a canonical order so that plugin
 * interactions are deterministic regardless of how the consumer writes
 * their `plugins={{ ... }}` record. Unknown/custom plugin names are
 * appended after the known set in their original record order.
 *
 * Canonical order:
 *   1. columnSettings — column filtering (future: transformColumns)
 *   2. sort           — header cell sort controls
 *   3. selection      — checkbox column + row selection
 *   4. pagination     — pagination controls around the table
 *
 * Rationale:
 * - columnSettings filters columns before sort/selection see them
 * - sort adds header cell UI before selection adds its header column
 * - selection adds its column after sort so the checkbox header
 *   doesn't get a sort button
 * - pagination wraps the table in context last (outermost provider)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 * - /packages/core/src/Table/XDSTable.tsx (primary consumer)
 */

import {useRef} from 'react';
import type {TablePlugin} from './types';

// =============================================================================
// Canonical Plugin Order
// =============================================================================

/**
 * Canonical ordering for first-party plugin names.
 * Plugins are sorted by their position in this array.
 * Unknown names are appended after the known set.
 */
const PLUGIN_ORDER: readonly string[] = [
  'columnSettings',
  'sort',
  'selection',
  'pagination',
];

/** Lookup map for O(1) ordering checks. */
const PLUGIN_ORDER_MAP = new Map(
  PLUGIN_ORDER.map((name, index) => [name, index]),
);

/**
 * Sort plugin entries into canonical order.
 * Known plugins are sorted by PLUGIN_ORDER; unknown plugins preserve
 * their original record insertion order and appear after all known plugins.
 */
function sortPluginEntries<T extends Record<string, unknown>>(
  entries: [string, TablePlugin<T>][],
): [string, TablePlugin<T>][] {
  // Sentinel value for unknown plugins — higher than any known index
  const unknownBase = PLUGIN_ORDER.length;

  return entries.sort(([a], [b]) => {
    const orderA = PLUGIN_ORDER_MAP.get(a) ?? unknownBase;
    const orderB = PLUGIN_ORDER_MAP.get(b) ?? unknownBase;

    // If both are unknown, preserve original order (sort is stable)
    return orderA - orderB;
  });
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Converts a named plugin record (`Record<string, TablePlugin>`) to a stable
 * memoized array for `XDSBaseTable`. Compares plugin values by identity so
 * that inline `plugins={{ selection: stablePlugin }}` doesn't break row
 * memoization — only produces a new array when a plugin value actually changes.
 *
 * Plugins are sorted into a canonical order (see PLUGIN_ORDER) so that
 * interactions between first-party plugins are deterministic.
 *
 * @param basePlugins - Stable array of built-in plugins (e.g. XDS style plugin)
 * @param userPlugins - Named plugin record from the consumer
 * @returns Stable array of plugins suitable for XDSBaseTable
 *
 * @example
 * ```
 * const plugins = useXDSBaseTablePlugins([tablePlugin], userPlugins);
 * <XDSBaseTable plugins={plugins} ... />
 * ```
 */
export function useXDSBaseTablePlugins<T extends Record<string, unknown>>(
  basePlugins: TablePlugin<T>[],
  userPlugins: Record<string, TablePlugin<T>> | undefined,
): TablePlugin<T>[] {
  const prevRef = useRef<{
    basePlugins: TablePlugin<T>[];
    userPlugins: Record<string, TablePlugin<T>> | undefined;
    result: TablePlugin<T>[];
  } | null>(null);

  // Check if we can reuse the previous result
  if (prevRef.current != null) {
    const prev = prevRef.current;

    // Fast path: same references
    if (prev.basePlugins === basePlugins && prev.userPlugins === userPlugins) {
      return prev.result;
    }

    // Deep identity comparison: check if all plugin values are the same
    if (
      prev.basePlugins === basePlugins &&
      arePluginRecordsEqual(prev.userPlugins, userPlugins)
    ) {
      // Update stored reference but return same result array
      prev.userPlugins = userPlugins;
      return prev.result;
    }
  }

  // Sort user plugins into canonical order
  const sortedUserPlugins = userPlugins
    ? sortPluginEntries(Object.entries(userPlugins)).map(([, plugin]) => plugin)
    : [];

  const result = [...basePlugins, ...sortedUserPlugins];

  prevRef.current = {basePlugins, userPlugins, result};
  return result;
}

/**
 * Compares two plugin records by checking that they have the same keys
 * and each key maps to the same plugin instance (by reference).
 */
function arePluginRecordsEqual<T extends Record<string, unknown>>(
  a: Record<string, TablePlugin<T>> | undefined,
  b: Record<string, TablePlugin<T>> | undefined,
): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
