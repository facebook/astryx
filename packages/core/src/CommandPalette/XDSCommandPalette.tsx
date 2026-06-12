// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, XDSDialog, XDSLayout, CommandPaletteContext, XDSSearchSource, useCombobox
 * @output Exports XDSCommandPalette root component and props
 * @position Core root component; dialog shell with searchSource-driven items
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 * - /packages/cli/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import {XDSDialog} from '../Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '../Layout';
import type {XDSSearchSource, XDSSearchableItem} from '../Typeahead';
import {useCombobox} from '../Selector';
import type {XDSSelectorOptionData} from '../Selector';
import {CommandPaletteContext} from './CommandPaletteContext';
import {XDSCommandPaletteList} from './XDSCommandPaletteList';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';
import {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
import {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
import {XDSCommandPaletteEmpty} from './XDSCommandPaletteEmpty';
import type {XDSBaseProps} from '../XDSBaseProps';

export interface XDSCommandPaletteProps<
  T extends XDSSearchableItem = XDSSearchableItem,
> extends Omit<XDSBaseProps<HTMLDialogElement>, 'onChange'> {
  ref?: React.Ref<HTMLDialogElement>;
  /** Whether the command palette is open. */
  isOpen: boolean;

  /**
   * Renders command palette content inline without modal behavior.
   * For documentation previews and showcases only.
   * @default false
   */
  isInline?: boolean;

  /** Called when the command palette visibility changes. */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Search source providing items. Implements `search(query)` and `bootstrap()`.
   * Same interface as XDSTypeahead's searchSource.
   * Use `createStaticSource` for simple static lists.
   */
  searchSource: XDSSearchSource<T>;

  /**
   * The search input slot.
   * @default <XDSCommandPaletteInput />
   */
  input?: ReactNode;

  /**
   * The footer slot.
   * @default <XDSCommandPaletteFooter />
   */
  footer?: ReactNode;

  /**
   * Per-item render function. Receives the item and whether it is currently selected.
   * Auto-grouping by `auxiliaryData.group` is preserved.
   * When omitted, renders each item's `label` text.
   */
  renderItem?: (item: T, isSelected: boolean) => ReactNode;

  /**
   * Content shown when a search query returns no results.
   * @default 'No results'
   */
  emptySearchText?: ReactNode;

  /**
   * Content shown when there is no search query and bootstrap() returns nothing.
   * @default 'Type to search'
   */
  emptyBootstrapText?: ReactNode;

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
      groups.get(group)?.push(item);
    } else {
      ungrouped.push(item);
    }
  }

  const result: XDSSelectorOptionData[] = [];
  for (const heading of groupOrder) {
    for (const item of groups.get(heading) ?? []) {
      result.push({value: item.id, label: item.label});
    }
  }
  for (const item of ungrouped) {
    result.push({value: item.id, label: item.label});
  }
  return result;
}

interface RendererProps<T extends XDSSearchableItem> {
  items: T[];
  value: string;
  renderItem?: (item: T, isSelected: boolean) => ReactNode;
}

/**
 * Renders items with optional per-item customization.
 * Auto-groups by auxiliaryData.group when present.
 * Passes `isSelected` so renderItem can handle picker-mode visuals.
 */
function ItemRenderer<T extends XDSSearchableItem>({
  items,
  value,
  renderItem,
}: RendererProps<T>) {
  const renderOne = (item: T) => (
    <XDSCommandPaletteItem key={item.id} value={item.id}>
      {renderItem ? renderItem(item, item.id === value) : item.label}
    </XDSCommandPaletteItem>
  );

  const hasGroups = items.some(item => getGroup(item) != null);

  if (!hasGroups) {
    return <>{items.map(renderOne)}</>;
  }

  const groupOrder: string[] = [];
  const groups = new Map<string, T[]>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const group = getGroup(item);
    if (group != null) {
      if (!groups.has(group)) {
        groupOrder.push(group);
        groups.set(group, []);
      }
      groups.get(group)?.push(item);
    } else {
      ungrouped.push(item);
    }
  }

  return (
    <>
      {groupOrder.map(heading => (
        <XDSCommandPaletteGroup key={heading} heading={heading}>
          {(groups.get(heading) ?? []).map(renderOne)}
        </XDSCommandPaletteGroup>
      ))}
      {ungrouped.map(renderOne)}
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
 * Input and footer are rendered by default — only pass them to replace the defaults.
 *
 * @compositionHint
 *   - `input` slot: XDSCommandPaletteInput (default)
 *   - `footer` slot: XDSCommandPaletteFooter (default)
 *   - `renderItem(item, isSelected)`: custom per-item content (grouping preserved)
 *
 * @example
 * ```
 * <XDSCommandPalette
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   searchSource={createStaticSource(commands)}
 * />
 * ```
 */
export function XDSCommandPalette<
  T extends XDSSearchableItem = XDSSearchableItem,
>({
  ref,
  isOpen,
  isInline,
  onOpenChange,
  searchSource,
  input,
  footer,
  renderItem,
  emptySearchText = 'No results',
  emptyBootstrapText = 'Type to search',
  value: controlledValue,
  onValueChange,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
}: XDSCommandPaletteProps<T>) {
  const listId = useId();
  // search: the committed query — only advances when async results arrive.
  // optimisticSearch: updates immediately on keystroke, drives input + empty state.
  // This way optimisticSearch is always what the user sees, and search is what
  // the current results actually correspond to.
  const [search, setSearch] = useState('');
  const [internalValue, setInternalValue] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isPending, startTransition] = useTransition();
  const [optimisticSearch, setOptimisticSearch] = useOptimistic(search);
  const [optimisticResults, setOptimisticResults] =
    useOptimistic(searchResults);
  const isBusy = isPending;
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
  // Must match the render order of ItemRenderer.
  const selectableItems = useMemo(
    () => buildSelectableItems(optimisticResults),
    [optimisticResults],
  );

  const handleClose = useCallback(() => {
    // Reset both committed and optimistic search on close
    setSearch('');
    setSearchResults([]);
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

  // Run a search for the given query and commit results.
  // Called directly when the user types — no effect needed.
  const runSearch = useCallback(
    (query: string) => {
      searchSource.cancel?.();
      const version = ++searchVersionRef.current;

      startTransition(async () => {
        const isBootstrap = query === '';

        // Client-filter previous results for instant narrowing while fetch is in flight
        if (!isBootstrap && searchResults.length > 0) {
          const lower = query.toLowerCase().trim();
          setOptimisticResults(
            searchResults.filter(item =>
              item.label.toLowerCase().includes(lower),
            ),
          );
        }

        const result = isBootstrap
          ? searchSource.bootstrap()
          : searchSource.search(query);

        const items = await Promise.resolve(result);

        if (searchVersionRef.current === version) {
          // Commit query and results together
          setSearch(query);
          setOptimisticResults(items);
          setSearchResults(items);

          // When opening with a preselected value, highlight it once
          // bootstrap results arrive. No value → highlight stays at -1
          // and ArrowDown naturally moves to the first item.
          if (isBootstrap && value != null && value !== '') {
            const selectedIdx = items.findIndex(item => item.id === value);
            if (selectedIdx >= 0) {
              combobox.setHighlightedIndex(selectedIdx);
            }
          }
        }
      });
    },
    [
      searchSource,
      searchResults,
      startTransition,
      value,
      combobox,
      setOptimisticResults,
    ],
  );

  // Bootstrap on open. We use a ref to avoid re-triggering when
  // runSearch's identity changes (it depends on searchResults).
  const runSearchRef = useRef(runSearch);
  runSearchRef.current = runSearch;

  useEffect(() => {
    if (isOpen) {
      runSearchRef.current('');
    }
  }, [isOpen]);

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
      if (e.key === ' ') {
        return;
      }
      combobox.onKeyDown(e);
    },
    [combobox, handleClose, selectableItems, selectItem],
  );

  const contextValue = useMemo(
    () => ({
      // Input uses optimisticSearch — reflects keystrokes immediately.
      // setSearch calls setOptimisticSearch for instant feedback then
      // triggers the async search directly (no effect indirection).
      search: optimisticSearch,
      setSearch: (query: string) => {
        setOptimisticSearch(query);
        runSearch(query);
      },
      value,
      setValue,
      listId,
      highlightedIndex: combobox.highlightedIndex,
      setHighlightedIndex: combobox.setHighlightedIndex,
      getItemId: combobox.getItemId,
      selectableItems,
      searchResults: optimisticResults,
      selectItem,
      onKeyDown: handleKeyDown,
      onClose: handleClose,
      isOpen,
      isBusy,
    }),
    [
      optimisticSearch,
      setOptimisticSearch,
      runSearch,
      value,
      setValue,
      listId,
      combobox.highlightedIndex,
      combobox.setHighlightedIndex,
      combobox.getItemId,
      selectableItems,
      optimisticResults,
      selectItem,
      handleKeyDown,
      handleClose,
      isOpen,
      isBusy,
    ],
  );

  // Empty state uses committed search (= what current results correspond to),
  // not optimisticSearch (= what the user typed).
  // While the transition is pending, search stays at '' so showEmptyBootstrap
  // remains true even after the user has started typing.
  const showEmptyBootstrap = search === '' && optimisticResults.length === 0;
  const showEmptySearch =
    !isPending && search !== '' && optimisticResults.length === 0;

  let listContent: ReactNode;
  if (showEmptyBootstrap) {
    listContent = (
      <XDSCommandPaletteEmpty>{emptyBootstrapText}</XDSCommandPaletteEmpty>
    );
  } else if (showEmptySearch) {
    listContent = (
      <XDSCommandPaletteEmpty>{emptySearchText}</XDSCommandPaletteEmpty>
    );
  } else {
    listContent = (
      <ItemRenderer
        items={optimisticResults}
        value={value}
        renderItem={renderItem}
      />
    );
  }

  return (
    <XDSDialog
      ref={ref}
      isOpen={isOpen}
      isInline={isInline}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
      width={width}
      maxHeight={maxHeight}
      purpose="info"
      aria-label={label}>
      <CommandPaletteContext value={contextValue}>
        <XDSLayout
          defaultHasDividers
          header={
            <XDSLayoutHeader hasDivider padding={0}>
              {input ?? <XDSCommandPaletteInput />}
            </XDSLayoutHeader>
          }
          content={
            <XDSLayoutContent padding={0}>
              <XDSCommandPaletteList>{listContent}</XDSCommandPaletteList>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider padding={0}>
              {footer ?? <XDSCommandPaletteFooter />}
            </XDSLayoutFooter>
          }
        />
      </CommandPaletteContext>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
