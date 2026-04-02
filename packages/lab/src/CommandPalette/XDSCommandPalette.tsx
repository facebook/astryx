/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, XDSDialog, XDSLayout, CommandPaletteContext, XDSSearchSource, useCombobox
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
import {useCombobox} from '@xds/core/Selector';
import type {XDSSelectorOptionData} from '@xds/core/Selector';
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

function getGroup(item: XDSSearchableItem): string | undefined {
  const aux = item.auxiliaryData as Record<string, unknown> | undefined;
  return typeof aux?.group === 'string' ? aux.group : undefined;
}

/**
 * Build a flat list of selectable items in DOM order from search results.
 * When groups are present, items are ordered by group (preserving insertion order),
 * with ungrouped items at the end — matching the DefaultRenderer layout.
 */
function buildSelectableItems(
  items: XDSSearchableItem[],
): XDSSelectorOptionData[] {
  const hasGroups = items.some(item => getGroup(item) != null);

  if (!hasGroups) {
    return items.map(item => ({
      value: item.id,
      label: item.label,
    }));
  }

  // Group items preserving insertion order of groups
  const groupOrder: string[] = [];
  const groups = new Map<string, XDSSearchableItem[]>();
  const ungrouped: XDSSearchableItem[] = [];

  for (const item of items) {
    const group = getGroup(item);
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

  const result: XDSSelectorOptionData[] = [];
  for (const heading of groupOrder) {
    for (const item of groups.get(heading)!) {
      result.push({value: item.id, label: item.label});
    }
  }
  for (const item of ungrouped) {
    result.push({value: item.id, label: item.label});
  }
  return result;
}

/**
 * Default renderer for search results.
 * Renders items as XDSCommandPaletteItem with label text.
 * Auto-groups items by auxiliaryData.group when present.
 */
function DefaultRenderer({items}: {items: XDSSearchableItem[]}) {
  const hasGroups = items.some(item => getGroup(item) != null);

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
    const group = getGroup(item);
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
 * Keyboard navigation is handled by `useCombobox` from XDSSelector,
 * ensuring consistent arrow key, Home/End, Enter, and Escape behavior
 * across all combobox-pattern components.
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
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isBusy, setIsBusy] = useState(false);
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

  // Build flat selectable items in DOM order from search results.
  // This must match the order that DefaultRenderer (or custom children) renders.
  const selectableItems = useMemo(
    () => buildSelectableItems(searchResults),
    [searchResults],
  );

  const handleClose = useCallback(() => {
    setSearch('');
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    searchSource.cancel?.();
    onOpenChange(false);
  }, [onOpenChange, searchSource, controlledValue]);

  const selectItem = useCallback(
    (itemValue: string) => {
      setValue(itemValue);
    },
    [setValue],
  );

  // useCombobox handles all keyboard navigation and highlight state.
  // We treat the palette as always "open" from the combobox's perspective
  // (since the dialog itself handles open/close), and use onClose as a no-op
  // for the combobox — the palette's own close is handled by handleClose.
  const combobox = useCombobox({
    selectableItems,
    value,
    isOpen: true, // Always "open" from combobox POV — the dialog handles visibility
    onOpen: () => {}, // Dialog handles open
    onClose: () => {}, // We handle close via handleClose
    onSelect: (itemValue: string) => {
      selectItem(itemValue);
      handleClose();
    },
    listboxId: listId,
  });

  // When the dialog opens, set highlight to selected item or first item
  useEffect(() => {
    if (isOpen && selectableItems.length > 0) {
      const selectedIdx = selectableItems.findIndex(
        item => item.value === value,
      );
      combobox.setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, selectableItems, value, combobox]);

  // Unified search effect: bootstrap on open or empty query, search otherwise
  useEffect(() => {
    if (!isOpen) return;

    searchSource.cancel?.();
    const version = ++searchVersionRef.current;

    const result =
      search === '' ? searchSource.bootstrap() : searchSource.search(search);

    if (result instanceof Promise) {
      setIsBusy(true);
      result
        .then(items => {
          if (searchVersionRef.current === version) {
            setSearchResults(items);
            setIsBusy(false);
          }
        })
        .catch(() => {
          if (searchVersionRef.current === version) {
            setIsBusy(false);
          }
        });
    } else {
      setSearchResults(result);
      setIsBusy(false);
    }
  }, [search, isOpen, searchSource]);

  // Wrap combobox's onKeyDown to intercept Escape (close palette) and
  // Enter on highlight (select + close), since we're not using combobox's
  // built-in open/close lifecycle.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (
          combobox.highlightedIndex >= 0 &&
          combobox.highlightedIndex < selectableItems.length
        ) {
          const item = selectableItems[combobox.highlightedIndex];
          if (item && !item.disabled) {
            selectItem(item.value);
            handleClose();
          }
        }
        return;
      }
      // Space should type in the input, not trigger selection
      if (e.key === ' ') return;
      combobox.onKeyDown(e);
    },
    [combobox, handleClose, selectableItems, selectItem],
  );

  const contextValue = useMemo(
    () => ({
      search,
      setSearch,
      value,
      setValue,
      listId,
      highlightedIndex: combobox.highlightedIndex,
      setHighlightedIndex: combobox.setHighlightedIndex,
      getItemId: combobox.getItemId,
      selectableItems,
      searchResults,
      selectItem,
      onKeyDown: handleKeyDown,
      onClose: handleClose,
      isOpen,
      isBusy,
    }),
    [
      search,
      value,
      setValue,
      listId,
      combobox.highlightedIndex,
      combobox.setHighlightedIndex,
      combobox.getItemId,
      selectableItems,
      searchResults,
      selectItem,
      handleKeyDown,
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
