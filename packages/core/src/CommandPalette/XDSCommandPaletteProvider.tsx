/**
 * @file XDSCommandPaletteProvider.tsx
 * @input Uses React, XDSCommandPaletteContext, XDSCommandPalette, fuzzySearch, types
 * @output Exports XDSCommandPaletteProvider component and XDSCommandPaletteProviderProps
 * @position Provider component; wraps application to enable command palette
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md (props table, features)
 * - /packages/core/src/CommandPalette/XDSCommandPalette.test.tsx
 * - /packages/core/src/CommandPalette/index.ts (exports if types change)
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import {CommandPaletteContext} from './XDSCommandPaletteContext';
import {XDSCommandPalette} from './XDSCommandPalette';
import {fuzzySearch} from './fuzzySearch';
import type {XDSCommand, HistoryEntry, ScoredCommand} from './types';

const STORAGE_KEY = 'xds-command-palette-history';

export interface XDSCommandPaletteProviderProps {
  /**
   * Application content.
   */
  children: ReactNode;

  /**
   * Keyboard shortcut to open the palette.
   * @default "mod+k"
   */
  shortcut?: string;

  /**
   * Whether to persist command history to localStorage.
   * @default false
   */
  isPersistHistory?: boolean;

  /**
   * Maximum number of history entries to keep.
   * @default 10
   */
  maxHistory?: number;

  /**
   * Placeholder text for the search input.
   */
  placeholder?: string;

  /**
   * Content displayed when no results match.
   */
  emptyContent?: ReactNode;

  /**
   * Footer content displayed at the bottom of the palette.
   */
  footer?: ReactNode;

  /**
   * StyleX overrides for the palette container.
   */
  xstyle?: StyleXStyles;

  /**
   * Async function to fetch additional commands based on the search query.
   * Fetched commands are merged with locally registered commands.
   */
  commandFetcher?: (query: string) => Promise<XDSCommand[]>;

  /**
   * Debounce delay in ms before calling commandFetcher.
   * @default 200
   */
  fetchDebounceMs?: number;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

/**
 * Parse a shortcut string like "mod+k" into modifier flags and a key.
 */
function parseShortcut(shortcut: string): {
  meta: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const mods = new Set(parts.slice(0, -1));
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);

  return {
    meta: mods.has('mod') ? isMac : mods.has('meta'),
    ctrl: mods.has('mod') ? !isMac : mods.has('ctrl'),
    shift: mods.has('shift'),
    alt: mods.has('alt'),
    key,
  };
}

/**
 * Provider that enables the command palette for its children.
 *
 * Manages command registration, keyboard shortcut listening,
 * open/close state, history tracking, and async command fetching.
 *
 * @example
 * ```tsx
 * <XDSCommandPaletteProvider>
 *   <App />
 * </XDSCommandPaletteProvider>
 * ```
 */
export function XDSCommandPaletteProvider({
  children,
  shortcut = 'mod+k',
  isPersistHistory = false,
  maxHistory = 10,
  placeholder,
  emptyContent,
  footer,
  xstyle,
  commandFetcher,
  fetchDebounceMs = 200,
  'data-testid': testId,
}: XDSCommandPaletteProviderProps) {
  const registryRef = useRef<Map<string, XDSCommand>>(new Map());
  const [isOpen, setIsOpen] = useState(false);
  const [pageStack, setPageStack] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [fetchedCommands, setFetchedCommands] = useState<XDSCommand[]>([]);
  const [isFetchPending, startFetchTransition] = useTransition();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Initialize history from localStorage if persisting
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (isPersistHistory && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Ignore parse errors
      }
    }
    return [];
  });

  // Persist history to localStorage when it changes
  useEffect(() => {
    if (isPersistHistory && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch {
        // Ignore write errors
      }
    }
  }, [history, isPersistHistory]);

  const register = useCallback((commands: XDSCommand[]) => {
    const registry = registryRef.current;
    for (const cmd of commands) {
      registry.set(cmd.id, cmd);
    }
    return () => {
      for (const cmd of commands) {
        registry.delete(cmd.id);
      }
    };
  }, []);

  const open = useCallback((page?: string) => {
    setIsOpen(true);
    setQuery('');
    setFetchedCommands([]);
    if (page) {
      setPageStack([page]);
    } else {
      setPageStack([]);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPageStack([]);
    setQuery('');
    setFetchedCommands([]);
  }, []);

  const recordHistory = useCallback(
    (commandId: string) => {
      setHistory(prev => {
        const existing = prev.find(h => h.id === commandId);
        const filtered = prev.filter(h => h.id !== commandId);
        const entry: HistoryEntry = {
          id: commandId,
          timestamp: Date.now(),
          count: (existing?.count ?? 0) + 1,
        };
        const next = [entry, ...filtered].slice(0, maxHistory);
        return next;
      });
    },
    [maxHistory],
  );

  const clearHistoryEntry = useCallback((commandId: string) => {
    setHistory(prev => prev.filter(h => h.id !== commandId));
  }, []);

  const getCommands = useCallback(() => {
    return Array.from(registryRef.current.values()).filter(
      cmd => cmd.isEnabled !== false,
    );
  }, []);

  const getHistory = useCallback(() => {
    return history;
  }, [history]);

  // Debounced async command fetching
  useEffect(() => {
    if (!commandFetcher) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length === 0) {
      setFetchedCommands([]);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      const currentQuery = query;
      startFetchTransition(() => {
        commandFetcher(currentQuery).then(commands => {
          setFetchedCommands(commands);
        });
      });
    }, fetchDebounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, commandFetcher, fetchDebounceMs]);

  // Compute scored commands: merge local + fetched, filter by page, run fuzzySearch
  const currentPage =
    pageStack.length > 0 ? pageStack[pageStack.length - 1] : null;
  const localCommands = getCommands();

  // Deduplicate: local commands take precedence over fetched ones
  const localIds = new Set(localCommands.map(c => c.id));
  const uniqueFetched = fetchedCommands.filter(c => !localIds.has(c.id));
  const allCommands = [...localCommands, ...uniqueFetched];

  const pageCommands = currentPage
    ? allCommands.filter(cmd => cmd.group === currentPage)
    : allCommands;

  const scoredCommands: ScoredCommand[] = fuzzySearch(
    pageCommands,
    query,
    history,
  );

  // Global keyboard shortcut
  useEffect(() => {
    const parsed = parseShortcut(shortcut);

    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesMods =
        e.metaKey === parsed.meta &&
        e.ctrlKey === parsed.ctrl &&
        e.shiftKey === parsed.shift &&
        e.altKey === parsed.alt;

      if (matchesMods && e.key.toLowerCase() === parsed.key) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsOpen(prev => {
          if (prev) {
            // Closing
            setQuery('');
            setFetchedCommands([]);
            setPageStack([]);
          }
          return !prev;
        });
      }
    };

    // Use capture phase so we fire before Storybook's own Cmd+K handler
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [shortcut]);

  const contextValue = useMemo(
    () => ({
      register,
      open,
      close,
      isOpen,
      recordHistory,
      clearHistoryEntry,
      getCommands,
      getHistory,
    }),
    [
      register,
      open,
      close,
      isOpen,
      recordHistory,
      clearHistoryEntry,
      getCommands,
      getHistory,
    ],
  );

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <XDSCommandPalette
        isOpen={isOpen}
        onClose={close}
        scoredCommands={scoredCommands}
        isLoading={isFetchPending}
        query={query}
        onQueryChange={setQuery}
        getHistory={getHistory}
        recordHistory={recordHistory}
        clearHistoryEntry={clearHistoryEntry}
        pageStack={pageStack}
        onPageStackChange={setPageStack}
        placeholder={placeholder}
        emptyContent={emptyContent}
        footer={footer}
        xstyle={xstyle}
        data-testid={testId}
      />
    </CommandPaletteContext.Provider>
  );
}

XDSCommandPaletteProvider.displayName = 'XDSCommandPaletteProvider';
