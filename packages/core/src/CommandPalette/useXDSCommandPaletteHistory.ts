/**
 * @file useXDSCommandPaletteHistory.ts
 * @input Uses React hooks, localStorage
 * @output Exports useXDSCommandPaletteHistory hook
 * @position Layer 3 optional enhancement; not baked into core
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

import {useCallback, useState} from 'react';

export interface CommandPaletteHistoryOptions {
  /**
   * Whether to persist history to localStorage.
   * @default false
   */
  persist?: boolean;

  /**
   * Maximum number of history entries.
   * @default 10
   */
  maxEntries?: number;

  /**
   * localStorage key for persistence.
   * @default "xds-command-palette-history"
   */
  storageKey?: string;
}

export interface CommandPaletteHistoryEntry {
  /** The command ID that was selected. */
  id: string;
  /** When the command was last selected. */
  timestamp: number;
}

function loadHistory(
  storageKey: string,
  persist: boolean,
): CommandPaletteHistoryEntry[] {
  if (!persist || typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(
  storageKey: string,
  persist: boolean,
  entries: CommandPaletteHistoryEntry[],
) {
  if (!persist || typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Optional history tracking for the command palette.
 * Not baked into the core — consumers opt in when they need it.
 *
 * @example
 * ```
 * const { history, record, clear } = useXDSCommandPaletteHistory({
 *   persist: true,
 *   maxEntries: 10,
 * });
 *
 * // Record when a command is selected
 * const handleSelect = (id: string) => {
 *   record(id);
 *   // ... execute command
 * };
 *
 * // Show recent commands
 * <XDSCommandPaletteGroup heading="Recent">
 *   {history.map(entry => (
 *     <XDSCommandPaletteItem key={entry.id} value={entry.id} onSelect={...}>
 *       {entry.id}
 *     </XDSCommandPaletteItem>
 *   ))}
 * </XDSCommandPaletteGroup>
 * ```
 */
export function useXDSCommandPaletteHistory({
  persist = false,
  maxEntries = 10,
  storageKey = 'xds-command-palette-history',
}: CommandPaletteHistoryOptions = {}) {
  const [history, setHistory] = useState<CommandPaletteHistoryEntry[]>(() =>
    loadHistory(storageKey, persist),
  );

  const record = useCallback(
    (id: string) => {
      setHistory((prev) => {
        // Remove existing entry for this id (will be re-added at top)
        const filtered = prev.filter((entry) => entry.id !== id);
        const updated = [
          {id, timestamp: Date.now()},
          ...filtered,
        ].slice(0, maxEntries);
        saveHistory(storageKey, persist, updated);
        return updated;
      });
    },
    [maxEntries, persist, storageKey],
  );

  const clear = useCallback(() => {
    setHistory([]);
    saveHistory(storageKey, persist, []);
  }, [persist, storageKey]);

  const clearEntry = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((entry) => entry.id !== id);
        saveHistory(storageKey, persist, updated);
        return updated;
      });
    },
    [persist, storageKey],
  );

  return {history, record, clear, clearEntry};
}
