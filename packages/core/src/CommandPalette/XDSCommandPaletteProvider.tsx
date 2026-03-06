/**
 * @file XDSCommandPaletteProvider.tsx
 * @input Uses React, CommandPalette composable components
 * @output Exports XDSCommandPaletteProvider, useXDSCommandPaletteRegister, useXDSCommandPalette
 * @position Layer 2 convenience wrapper; composes Layer 1 primitives
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {XDSCommandPalette} from './XDSCommandPalette';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
import {XDSCommandPaletteList} from './XDSCommandPaletteList';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';
import {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';
import {XDSCommandPaletteEmpty} from './XDSCommandPaletteEmpty';
import {XDSCommandPaletteShortcut} from './XDSCommandPaletteShortcut';
import {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
import {XDSCommandPaletteLoading} from './XDSCommandPaletteLoading';
import * as stylex from '@stylexjs/stylex';
import {colorVars, textSizeVars} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import type {XDSCommand, CommandPaletteFilterFn} from './types';

// =============================================================================
// Provider context
// =============================================================================

interface ProviderContextValue {
  /** Open the command palette. */
  open: () => void;
  /** Close the command palette. */
  close: () => void;
  /** Whether the palette is currently open. */
  isOpen: boolean;
  /** Register commands. Returns unregister function. */
  register: (commands: XDSCommand[]) => () => void;
}

const ProviderContext = createContext<ProviderContextValue | null>(null);

// =============================================================================
// Hooks
// =============================================================================

/**
 * Imperative control for the command palette.
 *
 * @example
 * ```
 * function SearchButton() {
 *   const { open, isOpen } = useXDSCommandPalette();
 *   return <XDSButton label="Search" onClick={open} />;
 * }
 * ```
 */
export function useXDSCommandPalette() {
  const context = useContext(ProviderContext);
  if (context == null) {
    throw new Error(
      'useXDSCommandPalette must be used within <XDSCommandPaletteProvider>',
    );
  }
  return {
    open: context.open,
    close: context.close,
    isOpen: context.isOpen,
  };
}

/**
 * Register commands from any component in the tree.
 * Commands are automatically unregistered when the component unmounts.
 *
 * @example
 * ```
 * function Navigation() {
 *   useXDSCommandPaletteRegister([
 *     { id: 'home', label: 'Go Home', icon: 'home', onSelect: () => navigate('/') },
 *     { id: 'settings', label: 'Settings', shortcut: 'mod+,', onSelect: () => navigate('/settings') },
 *   ]);
 *   return <nav>...</nav>;
 * }
 * ```
 */
export function useXDSCommandPaletteRegister(
  commands: XDSCommand[],
  deps?: React.DependencyList,
) {
  const context = useContext(ProviderContext);
  if (context == null) {
    throw new Error(
      'useXDSCommandPaletteRegister must be used within <XDSCommandPaletteProvider>',
    );
  }

  // Use a ref to avoid the deps footgun from PR #304
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  useEffect(() => {
    const unregister = context.register(commandsRef.current);
    return unregister;
  }, deps ?? []);
}

// =============================================================================
// Provider
// =============================================================================

export interface XDSCommandPaletteProviderProps {
  /** App content. */
  children: ReactNode;

  /**
   * Keyboard shortcut to open the palette.
   * @default "mod+k"
   */
  shortcut?: string;

  /**
   * Placeholder text for the search input.
   * @default "Search commands..."
   */
  placeholder?: string;

  /**
   * Content shown when no results match.
   * @default "No results found"
   */
  emptyContent?: ReactNode;

  /**
   * Footer content.
   */
  footer?: ReactNode;

  /**
   * Custom filter function.
   */
  filter?: CommandPaletteFilterFn;

  /**
   * Async command source. Called when the search query changes.
   * Results are merged with registered commands.
   */
  commandFetcher?: (query: string) => Promise<XDSCommand[]>;

  /**
   * Debounce delay for commandFetcher in ms.
   * @default 200
   */
  fetchDebounceMs?: number;
}

/**
 * Provider for distributed command registration.
 *
 * Wraps the app and renders the command palette dialog.
 * Components anywhere in the tree can register commands via useXDSCommandPaletteRegister.
 *
 * @example
 * ```
 * <XDSCommandPaletteProvider shortcut="mod+k">
 *   <App />
 * </XDSCommandPaletteProvider>
 * ```
 */
export function XDSCommandPaletteProvider({
  children,
  shortcut = 'mod+k',
  placeholder = 'Search commands...',
  emptyContent = 'No results found',
  footer,
  filter,
  commandFetcher,
  fetchDebounceMs = 200,
}: XDSCommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<XDSCommand[]>([]);
  const [fetchedCommands, setFetchedCommands] = useState<XDSCommand[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState('');
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setFetchedCommands([]);
  }, []);

  const register = useCallback((newCommands: XDSCommand[]) => {
    setCommands(prev => [...prev, ...newCommands]);
    return () => {
      setCommands(prev =>
        prev.filter(cmd => !newCommands.some(nc => nc.id === cmd.id)),
      );
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const parts = shortcut.split('+').map(p => p.trim().toLowerCase());
    const key = parts[parts.length - 1];
    const needsMod = parts.includes('mod');
    const needsShift = parts.includes('shift');
    const needsAlt = parts.includes('alt');

    const handleKeyDown = (e: KeyboardEvent) => {
      const modPressed = e.metaKey || e.ctrlKey;
      if (
        e.key.toLowerCase() === key &&
        (!needsMod || modPressed) &&
        (!needsShift || e.shiftKey) &&
        (!needsAlt || e.altKey)
      ) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);

  // Async command fetching with debounce
  useEffect(() => {
    if (!commandFetcher || !isOpen) return;

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (search.length === 0) {
      setFetchedCommands([]);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await commandFetcher(search);
        setFetchedCommands(results);
      } catch {
        setFetchedCommands([]);
      } finally {
        setIsFetching(false);
      }
    }, fetchDebounceMs);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [search, commandFetcher, fetchDebounceMs, isOpen]);

  // Merge registered + fetched commands, sort by priority and group
  const allCommands = useMemo(() => {
    const merged = [...commands, ...fetchedCommands];
    return merged.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [commands, fetchedCommands]);

  // Group commands
  const groupedCommands = useMemo(() => {
    const groups = new Map<string, XDSCommand[]>();
    const ungrouped: XDSCommand[] = [];

    for (const cmd of allCommands) {
      // Only show root-level commands (no parent)
      if (cmd.parent) continue;

      if (cmd.group) {
        const group = groups.get(cmd.group) ?? [];
        group.push(cmd);
        groups.set(cmd.group, group);
      } else {
        ungrouped.push(cmd);
      }
    }

    return {groups, ungrouped};
  }, [allCommands]);

  const contextValue = useMemo(
    () => ({open, close, isOpen, register}),
    [open, close, isOpen, register],
  );

  const handleValueChange = useCallback(
    (value: string) => {
      const cmd = allCommands.find(c => c.id === value);
      if (cmd && !cmd.isDisabled) {
        cmd.onSelect();
        close();
      }
    },
    [allCommands, close],
  );

  // Default footer with keyboard hints
  const defaultFooter = (
    <XDSCommandPaletteFooter>
      <span>↑↓ Navigate</span>
      <span>↵ Select</span>
      <span>Esc Close</span>
    </XDSCommandPaletteFooter>
  );

  return (
    <ProviderContext.Provider value={contextValue}>
      {children}
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={open => {
          if (!open) close();
        }}
        onValueChange={handleValueChange}
        filter={filter}>
        <XDSCommandPaletteInput placeholder={placeholder} />
        <XDSCommandPaletteList>
          {groupedCommands.ungrouped.map(cmd => (
            <CommandItem key={cmd.id} command={cmd} />
          ))}
          {Array.from(groupedCommands.groups.entries()).map(
            ([groupName, cmds]) => (
              <XDSCommandPaletteGroup key={groupName} heading={groupName}>
                {cmds.map(cmd => (
                  <CommandItem key={cmd.id} command={cmd} />
                ))}
              </XDSCommandPaletteGroup>
            ),
          )}
          {isFetching && <XDSCommandPaletteLoading />}
          {!isFetching && allCommands.length === 0 && (
            <XDSCommandPaletteEmpty>{emptyContent}</XDSCommandPaletteEmpty>
          )}
        </XDSCommandPaletteList>
        {footer ?? defaultFooter}
      </XDSCommandPalette>
    </ProviderContext.Provider>
  );
}

XDSCommandPaletteProvider.displayName = 'XDSCommandPaletteProvider';

// =============================================================================
// Default command item renderer
// =============================================================================

const commandItemStyles = stylex.create({
  label: {
    flex: 1,
  },
  description: {
    color: colorVars['--color-text-secondary'],
    fontSize: textSizeVars['--text-sm'],
  },
});

function CommandItem({command}: {command: XDSCommand}) {
  if (command.renderItem) {
    // Custom render — still wrap in Item for registration/keyboard/filtering
    return (
      <XDSCommandPaletteItem
        value={command.id}
        onSelect={command.onSelect}
        keywords={command.keywords}
        isDisabled={command.isDisabled}>
        {command.renderItem({command, isHighlighted: false})}
      </XDSCommandPaletteItem>
    );
  }

  return (
    <XDSCommandPaletteItem
      value={command.id}
      onSelect={command.onSelect}
      keywords={command.keywords}
      isDisabled={command.isDisabled}>
      {command.icon && <XDSIcon icon={command.icon} size="sm" />}
      <span {...stylex.props(commandItemStyles.label)}>{command.label}</span>
      {command.description && (
        <span {...stylex.props(commandItemStyles.description)}>
          {command.description}
        </span>
      )}
      {command.shortcut && (
        <XDSCommandPaletteShortcut keys={command.shortcut} />
      )}
    </XDSCommandPaletteItem>
  );
}
