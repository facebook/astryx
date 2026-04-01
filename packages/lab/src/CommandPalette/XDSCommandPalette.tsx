/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, XDSDialog, XDSLayout, CommandPaletteContext, XDSSearchSource
 * @output Exports XDSCommandPalette root component and props
 * @position Core root component; dialog shell with searchSource-driven items
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CommandPalette/README.md
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {XDSDialog} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import type {XDSSearchSource, XDSSearchableItem} from '@xds/core/Typeahead';
import {CommandPaletteContext} from './CommandPaletteContext';
import {XDSCommandPaletteList} from './XDSCommandPaletteList';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';
import {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';

export interface XDSCommandPaletteProps<
  T extends XDSSearchableItem = XDSSearchableItem,
> {
  /** Whether the command palette is open. */
  isOpen: boolean;

  /** Called when the command palette visibility changes. */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Search source providing items. Implements `search(query)` and `bootstrap()`.
   * Same interface as XDSTypeahead's searchSource.
   * Use `createStaticSource` for simple static lists.
   */
  searchSource: XDSSearchSource<T>;

  /**
   * The search input slot. Pass XDSCommandPaletteInput here.
   */
  input?: ReactNode;

  /**
   * The footer slot. Pass XDSCommandPaletteFooter here.
   */
  footer?: ReactNode;

  /**
   * Custom render function for items. Receives the filtered items array.
   * When omitted, items are rendered with default rendering:
   * - Each item shows its `label` text
   * - Items with `auxiliaryData.group` are auto-grouped
   */
  children?: (items: T[]) => ReactNode;

  /** Controlled selected value (for picker mode). */
  value?: string;

  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;

  /**
   * Accessible label for the command palette dialog.
   * @default 'Command palette'
   */
  label?: string;

  /**
   * Width of the command palette dialog.
   * @default 640
   */
  width?: number | string;

  /**
   * Maximum height of the command palette dialog.
   * @default 480
   */
  maxHeight?: number | string;
}

/**
 * Default renderer for search results.
 * Renders items as XDSCommandPaletteItem with label text.
 * Auto-groups items by auxiliaryData.group when present.
 */
function DefaultRenderer({items}: {items: XDSSearchableItem[]}) {
  // Check if any items have a group
  const hasGroups = items.some(
    item => (item.auxiliaryData as any)?.group != null,
  );

  if (!hasGroups) {
    return (
      <>
        {items.map(item => (
          <XDSCommandPaletteItem key={item.id} value={item.id}>
            {item.label}
          </XDSCommandPaletteItem>
        ))}
      </>
    );
  }

  // Group items preserving insertion order of groups
  const groupOrder: string[] = [];
  const groups = new Map<string, XDSSearchableItem[]>();
  const ungrouped: XDSSearchableItem[] = [];

  for (const item of items) {
    const group = (item.auxiliaryData as any)?.group;
    if (group != null) {
      if (!groups.has(group)) {
        groupOrder.push(group);
        groups.set(group, []);
      }
      groups.get(group)!.push(item);
    } else {
      ungrouped.push(item);
    }
  }

  return (
    <>
      {groupOrder.map(heading => (
        <XDSCommandPaletteGroup key={heading} heading={heading}>
          {groups.get(heading)!.map(item => (
            <XDSCommandPaletteItem key={item.id} value={item.id}>
              {item.label}
            </XDSCommandPaletteItem>
          ))}
        </XDSCommandPaletteGroup>
      ))}
      {ungrouped.map(item => (
        <XDSCommandPaletteItem key={item.id} value={item.id}>
          {item.label}
        </XDSCommandPaletteItem>
      ))}
    </>
  );
}

/**
 * Command palette root component.
 *
 * Uses `searchSource` for all search logic — same interface as XDSTypeahead.
 * For static lists, use `createStaticSource` from `@xds/core/Typeahead`.
 *
 * Progressive disclosure:
 * - No children: default rendering (label text, auto-groups by auxiliaryData.group)
 * - Children render function: full control over item layout and grouping
 *
 * @compositionHint
 *   - `input` slot: XDSCommandPaletteInput
 *   - `children`: optional render function `(items) => ReactNode`
 *   - `footer` slot: XDSCommandPaletteFooter
 *
 * @example
 * ```
 * // Simplest — no children, default rendering
 * <XDSCommandPalette
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   searchSource={createStaticSource(commands)}
 *   input={<XDSCommandPaletteInput placeholder="Search..." />}
 *   footer={<XDSCommandPaletteFooter />}
 * />
 *
 * // Custom rendering
 * <XDSCommandPalette
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   searchSource={source}
 *   input={<XDSCommandPaletteInput placeholder="Search..." />}>
 *   {(items) => items.map(item => (
 *     <XDSCommandPaletteItem key={item.id} value={item.id}>
 *       {item.label}
 *     </XDSCommandPaletteItem>
 *   ))}
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPalette<
  T extends XDSSearchableItem = XDSSearchableItem,
>({
  isOpen,
  onOpenChange,
  searchSource,
  input,
  children,
  footer,
  value: controlledValue,
  onValueChange,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
}: XDSCommandPaletteProps<T>) {
  const listId = useId();
  const [search, setSearch] = useState('');
  const [internalValue, setInternalValue] = useState('');
  const [highlightedValue, setHighlightedValue] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const itemsRef = useRef<Array<{value: string; isDisabled?: boolean}>>([]);
  const searchVersionRef = useRef(0);

  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange],
  );

  const registerItem = useCallback(
    (itemValue: string, isDisabled?: boolean) => {
      itemsRef.current = [...itemsRef.current, {value: itemValue, isDisabled}];
      return () => {
        itemsRef.current = itemsRef.current.filter(
          item => item.value !== itemValue,
        );
      };
    },
    [],
  );

  const selectItem = useCallback(
    (itemValue: string) => {
      setValue(itemValue);
    },
    [setValue],
  );

  const handleClose = useCallback(() => {
    setSearch('');
    setHighlightedValue('');
    searchSource.cancel?.();
    onOpenChange(false);
  }, [onOpenChange, searchSource]);

  // Bootstrap on open
  useEffect(() => {
    if (!isOpen) return;
    const result = searchSource.bootstrap();
    if (result instanceof Promise) {
      setIsBusy(true);
      result.then(items => {
        setSearchResults(items);
        setIsBusy(false);
      });
    } else {
      setSearchResults(result);
    }
  }, [isOpen, searchSource]);

  // Search on query change
  useEffect(() => {
    if (!isOpen) return;

    searchSource.cancel?.();
    const version = ++searchVersionRef.current;

    if (search === '') {
      const result = searchSource.bootstrap();
      if (result instanceof Promise) {
        setIsBusy(true);
        result.then(items => {
          if (searchVersionRef.current === version) {
            setSearchResults(items);
            setIsBusy(false);
          }
        });
      } else {
        setSearchResults(result);
        setIsBusy(false);
      }
      return;
    }

    const result = searchSource.search(search);
    if (result instanceof Promise) {
      setIsBusy(true);
      result.then(items => {
        if (searchVersionRef.current === version) {
          setSearchResults(items);
          setIsBusy(false);
        }
      });
    } else {
      setSearchResults(result);
      setIsBusy(false);
    }
  }, [search, isOpen, searchSource]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedValue('');
  }, [searchResults]);

  const contextValue = useMemo(
    () => ({
      search,
      setSearch,
      value,
      setValue,
      listId,
      highlightedValue,
      setHighlightedValue,
      items: itemsRef.current,
      registerItem,
      selectItem,
      onClose: handleClose,
      isOpen,
      isBusy,
    }),
    [
      search,
      value,
      setValue,
      listId,
      highlightedValue,
      registerItem,
      selectItem,
      handleClose,
      isOpen,
      isBusy,
    ],
  );

  const listContent = children ? (
    children(searchResults)
  ) : (
    <DefaultRenderer items={searchResults} />
  );

  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
        else onOpenChange(true);
      }}
      width={width}
      maxHeight={maxHeight}
      purpose="info"
      aria-label={label}>
      <CommandPaletteContext.Provider value={contextValue}>
        <XDSLayout
          defaultHasDividers
          header={
            input != null ? (
              <XDSLayoutHeader hasDivider padding={0}>
                {input}
              </XDSLayoutHeader>
            ) : undefined
          }
          content={
            <XDSLayoutContent padding={0}>
              <XDSCommandPaletteList>{listContent}</XDSCommandPaletteList>
            </XDSLayoutContent>
          }
          footer={
            footer != null ? (
              <XDSLayoutFooter hasDivider padding={0}>
                {footer}
              </XDSLayoutFooter>
            ) : undefined
          }
        />
      </CommandPaletteContext.Provider>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
