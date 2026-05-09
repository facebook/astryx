'use client';

/**
 * @file XDSCommonCommandPaletteProvider.tsx
 * @input Uses React context, XDSCommandPalette, XDSSearchSource
 * @output Exports XDSCommonCommandPaletteProvider, hooks, and common action types
 * @position Convenience provider for app-wide command palette integrations
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/XDSCommandPalette.doc.mjs
 * - /packages/core/src/CommandPalette/XDSCommonCommandPaletteProvider.test.tsx
 * - /packages/core/src/CommandPalette/index.ts
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

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
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead';
import {createStaticSource} from '../Typeahead';
import {
  XDSCommandPalette,
  type XDSCommandPaletteProps,
} from './XDSCommandPalette';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';

export interface XDSCommonCommandPaletteAction<
  TAuxData = unknown,
> extends XDSSearchableItem<TAuxData> {
  /**
   * Callback executed when the action is selected from the palette.
   */
  onSelect?: () => void;

  /**
   * Optional group heading. Mirrored to auxiliaryData.group so
   * XDSCommandPalette can auto-group results.
   */
  group?: string;

  /**
   * Additional client-side search terms for static action arrays.
   */
  keywords?: string[];
}

export type XDSCommonCommandPaletteSource<
  T extends XDSCommonCommandPaletteAction = XDSCommonCommandPaletteAction,
> = XDSSearchSource<T>;

export interface XDSCommonCommandPaletteContextValue {
  /** Open the command palette. */
  open: () => void;
  /** Close the command palette. */
  close: () => void;
  /** Toggle the command palette. */
  toggle: () => void;
  /** Whether the command palette is currently open. */
  isOpen: boolean;
}

export type UseCommandSourceInput<
  T extends XDSCommonCommandPaletteAction = XDSCommonCommandPaletteAction,
> =
  | readonly T[]
  | XDSCommonCommandPaletteSource<T>
  | {
      actions?: readonly T[];
      searchSource?: XDSCommonCommandPaletteSource<T>;
    };

export interface XDSCommonCommandPaletteProviderProps<
  T extends XDSCommonCommandPaletteAction = XDSCommonCommandPaletteAction,
> extends Pick<
  XDSCommandPaletteProps<T>,
  | 'footer'
  | 'renderItem'
  | 'emptySearchText'
  | 'emptyBootstrapText'
  | 'label'
  | 'width'
  | 'maxHeight'
> {
  /** Application content. */
  children: ReactNode;

  /**
   * Static actions for local, client-side command palette search.
   * For server-side filtering, pass searchSource instead.
   */
  actions?: readonly T[];

  /**
   * Search source for sync or async command loading.
   * The user's query is passed through to searchSource.search(query).
   */
  searchSource?: XDSCommonCommandPaletteSource<T>;

  /**
   * Controlled open state.
   */
  isOpen?: boolean;

  /**
   * Initial open state for uncontrolled usage.
   * @default false
   */
  defaultIsOpen?: boolean;

  /** Called when the palette visibility changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Keyboard shortcut to toggle the palette.
   * @default 'mod+k'
   */
  shortcut?: string | null;

  /**
   * Placeholder text for the default search input.
   * @default 'Search commands...'
   */
  placeholder?: string;
}

const XDSCommonCommandPaletteContext =
  createContext<XDSCommonCommandPaletteContextValue | null>(null);

function isSearchSource<T extends XDSCommonCommandPaletteAction>(
  value: UseCommandSourceInput<T> | undefined,
): value is XDSCommonCommandPaletteSource<T> {
  return (
    value != null &&
    !Array.isArray(value) &&
    'search' in value &&
    typeof value.search === 'function' &&
    'bootstrap' in value &&
    typeof value.bootstrap === 'function'
  );
}

function getAuxiliaryObject(
  auxiliaryData: unknown,
): Record<string, unknown> | undefined {
  if (auxiliaryData == null || typeof auxiliaryData !== 'object') {
    return undefined;
  }
  return auxiliaryData as Record<string, unknown>;
}

function normalizeAction<T extends XDSCommonCommandPaletteAction>(
  action: T,
): T {
  if (action.group == null) {
    return action;
  }

  return {
    ...action,
    auxiliaryData: {
      ...getAuxiliaryObject(action.auxiliaryData),
      group: action.group,
    },
  };
}

function normalizeActions<T extends XDSCommonCommandPaletteAction>(
  actions: readonly T[],
): T[] {
  return actions.map(normalizeAction);
}

/**
 * Create an XDSSearchSource from a static action array.
 */
export function createCommandPaletteActionSource<
  T extends XDSCommonCommandPaletteAction,
>(actions: readonly T[]): XDSCommonCommandPaletteSource<T> {
  const normalizedActions = normalizeActions(actions);

  return createStaticSource(normalizedActions, {
    keywords: action => [
      ...(action.keywords ?? []),
      ...(action.group != null ? [action.group] : []),
    ],
  });
}

/**
 * Convert static actions or an existing XDSSearchSource into the source shape
 * consumed by XDSCommandPalette. Existing sources are returned as-is so async
 * search(query) implementations receive the user's current query.
 */
export function useCommandSource<
  T extends XDSCommonCommandPaletteAction = XDSCommonCommandPaletteAction,
>(input?: UseCommandSourceInput<T>): XDSCommonCommandPaletteSource<T> {
  return useMemo(() => {
    if (isSearchSource(input)) {
      return input;
    }

    if (Array.isArray(input)) {
      return createCommandPaletteActionSource(input);
    }

    const config = input as
      | {
          actions?: readonly T[];
          searchSource?: XDSCommonCommandPaletteSource<T>;
        }
      | undefined;

    return (
      config?.searchSource ??
      createCommandPaletteActionSource(config?.actions ?? [])
    );
  }, [input]);
}

/**
 * Access the app-wide common command palette controls.
 */
export function useXDSCommonCommandPalette(): XDSCommonCommandPaletteContextValue {
  const context = useContext(XDSCommonCommandPaletteContext);
  if (context == null) {
    throw new Error(
      'useXDSCommonCommandPalette must be used within XDSCommonCommandPaletteProvider',
    );
  }
  return context;
}

function parseShortcut(shortcut: string): {
  meta: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1] ?? '';
  const modifiers = new Set(parts.slice(0, -1));
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);

  return {
    meta: modifiers.has('mod') ? isMac : modifiers.has('meta'),
    ctrl: modifiers.has('mod') ? !isMac : modifiers.has('ctrl'),
    shift: modifiers.has('shift'),
    alt: modifiers.has('alt'),
    key,
  };
}

export function XDSCommonCommandPaletteProvider<
  T extends XDSCommonCommandPaletteAction = XDSCommonCommandPaletteAction,
>({
  children,
  actions,
  searchSource,
  isOpen: controlledIsOpen,
  defaultIsOpen = false,
  onOpenChange,
  shortcut = 'mod+k',
  placeholder = 'Search commands...',
  footer,
  renderItem,
  emptySearchText,
  emptyBootstrapText,
  label,
  width,
  maxHeight,
}: XDSCommonCommandPaletteProviderProps<T>) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultIsOpen);
  const actionMapRef = useRef<Map<string, T>>(new Map());
  const sourceInput = useMemo(
    () =>
      searchSource ?? {
        actions,
      },
    [actions, searchSource],
  );
  const baseSearchSource = useCommandSource(sourceInput);

  const isOpen = controlledIsOpen ?? uncontrolledIsOpen;

  const setIsOpen = useCallback(
    (nextIsOpen: boolean) => {
      if (controlledIsOpen === undefined) {
        setUncontrolledIsOpen(nextIsOpen);
      }
      onOpenChange?.(nextIsOpen);
    },
    [controlledIsOpen, onOpenChange],
  );

  const rememberActions = useCallback((nextActions: readonly T[]): T[] => {
    const normalized = normalizeActions(nextActions);
    actionMapRef.current = new Map(
      normalized.map(action => [action.id, action]),
    );
    return normalized;
  }, []);

  const trackedSearchSource = useMemo<XDSCommonCommandPaletteSource<T>>(
    () => ({
      search(query: string) {
        return Promise.resolve(baseSearchSource.search(query)).then(
          rememberActions,
        );
      },
      bootstrap() {
        return Promise.resolve(baseSearchSource.bootstrap()).then(
          rememberActions,
        );
      },
      cancel() {
        baseSearchSource.cancel?.();
      },
    }),
    [baseSearchSource, rememberActions],
  );

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (shortcut == null) {
      return;
    }

    const parsedShortcut = parseShortcut(shortcut);

    const handleKeyDown = (event: KeyboardEvent) => {
      const hasModifiers =
        event.metaKey === parsedShortcut.meta &&
        event.ctrlKey === parsedShortcut.ctrl &&
        event.shiftKey === parsedShortcut.shift &&
        event.altKey === parsedShortcut.alt;

      if (hasModifiers && event.key.toLowerCase() === parsedShortcut.key) {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [shortcut, toggle]);

  const contextValue = useMemo(
    () => ({
      open,
      close,
      toggle,
      isOpen,
    }),
    [open, close, toggle, isOpen],
  );

  return (
    <XDSCommonCommandPaletteContext.Provider value={contextValue}>
      {children}
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={trackedSearchSource}
        input={<XDSCommandPaletteInput placeholder={placeholder} />}
        footer={footer}
        renderItem={renderItem}
        emptySearchText={emptySearchText}
        emptyBootstrapText={emptyBootstrapText}
        label={label}
        width={width}
        maxHeight={maxHeight}
        onValueChange={value => {
          actionMapRef.current.get(value)?.onSelect?.();
        }}
      />
    </XDSCommonCommandPaletteContext.Provider>
  );
}

XDSCommonCommandPaletteProvider.displayName = 'XDSCommonCommandPaletteProvider';
