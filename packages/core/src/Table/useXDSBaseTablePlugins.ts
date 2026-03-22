'use client';

/**
 * @file useXDSBaseTablePlugins.ts
 * @input React, types.ts
 * @output Exports useXDSBaseTablePlugins hook
 * @position Utility hook; used by XDSTable to convert named plugin records to stable arrays
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/index.ts (exports)
 * - /packages/core/src/Table/XDSTable.tsx (primary consumer)
 */


import {useRef} from 'react';
import type {TablePlugin} from './types';

/**
 * Converts a named plugin record (`Record<string, TablePlugin>`) to a stable
 * memoized array for `XDSBaseTable`. Compares plugin values by identity so
 * that inline `plugins={{ selection: stablePlugin }}` doesn't break row
 * memoization — only produces a new array when a plugin value actually changes.
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

  // Compute new result
  const userValues = userPlugins ? Object.values(userPlugins) : [];
  const result = [...basePlugins, ...userValues];

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
