// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTokenSelection.ts
 * @input Uses React, useAnnounce, useTranslator, Typeahead types
 * @output Exports useTokenSelection — the selection half of Tokenizer
 * @position Internal hook; consumed by Tokenizer.tsx and TouchTokenizerField.tsx
 *
 * Everything about a Tokenizer that is not a surface: which items the search
 * source may still offer, what adding and removing do to `value`, and what a
 * screen reader hears about it.
 *
 * It lives here because `Tokenizer` renders two surfaces — a field with an
 * inline typeahead for a mouse, a sheet of suggestions for a finger — and the
 * rules for what a token IS must not fork between them. The "Create X"
 * sentinel is the sharp edge: a synthetic item that has to be recognised on
 * the way back in and turned into a real one, in exactly the same way on both.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Tokenizer/Tokenizer.tsx
 * - /packages/core/src/Tokenizer/TouchTokenizerField.tsx
 */

import {useCallback, useMemo} from 'react';
import {useAnnounce} from '../hooks/useAnnounce';
import {useTranslator} from '../i18n';
import type {SearchableItem, SearchSource} from '../Typeahead/types';
import type {TokenizerChange} from './Tokenizer';

/**
 * Sentinel prefix for creatable items — used to distinguish
 * "Create: X" suggestions from real search results.
 */
const CREATABLE_ID_PREFIX = '__xds_create__';

/**
 * Whether a suggestion is the synthetic "Create X" entry rather than something
 * the search source returned.
 */
export function isCreatableItem(item: SearchableItem): boolean {
  return typeof item.id === 'string' && item.id.startsWith(CREATABLE_ID_PREFIX);
}

export interface UseTokenSelectionOptions<T extends SearchableItem> {
  /** Currently selected items. */
  value: T[];
  /** Reports a new selection, with the change that produced it. */
  onChange: (items: T[], change: TokenizerChange<T>) => void;
  /** The caller's search source, before selected items are filtered out. */
  searchSource: SearchSource<T>;
  /** Whether free text may be committed as a new token. */
  hasCreate: boolean;
  /** Upper bound on selections, if any. */
  maxEntries?: number;
  /**
   * Called after a removal (single or clear-all), for the surface to put
   * focus back where the user was working.
   */
  onAfterRemove?: () => void;
}

export interface UseTokenSelectionResult<T extends SearchableItem> {
  /** Whether `maxEntries` has been reached. */
  isAtMax: boolean;
  /** The ids already selected — the set the source is filtered against. */
  selectedIds: ReadonlySet<T['id']>;
  /**
   * Turn a source's raw results into the ones worth offering: selected items
   * dropped, plus the synthetic "Create X" entry when `hasCreate` is on and
   * the query is not already an item.
   *
   * A surface that searches for itself calls this on what came back, rather
   * than searching through {@link UseTokenSelectionResult.filteredSource} — a
   * source rebuilt on every selection would re-issue a request per token
   * added.
   */
  decorateResults: (results: T[], query: string) => T[];
  /**
   * The caller's source with {@link UseTokenSelectionResult.decorateResults}
   * applied to everything it returns.
   */
  filteredSource: SearchSource<T>;
  /** A source that returns nothing — what a surface shows at `maxEntries`. */
  emptySource: SearchSource<T>;
  /** Add an item (or recognise and materialise a "Create X" sentinel). */
  addItem: (item: T | null) => void;
  /** Remove one item. */
  removeItem: (item: T) => void;
  /** Remove every item. */
  clearAll: () => void;
}

/**
 * The selection engine behind both Tokenizer surfaces.
 *
 * @example
 * ```
 * const {filteredSource, addItem, removeItem} = useTokenSelection({
 *   value,
 *   onChange,
 *   searchSource,
 *   hasCreate,
 *   maxEntries,
 *   onAfterRemove: () => inputRef.current?.focus(),
 * });
 * ```
 */
export function useTokenSelection<T extends SearchableItem>({
  value,
  onChange,
  searchSource,
  hasCreate,
  maxEntries,
  onAfterRemove,
}: UseTokenSelectionOptions<T>): UseTokenSelectionResult<T> {
  const t = useTranslator();

  const isAtMax = maxEntries != null && value.length >= maxEntries;

  // Filter out already-selected items from search results
  const selectedIds = useMemo(
    () => new Set(value.map(item => item.id)),
    [value],
  );

  const decorateResults = useCallback(
    (results: T[], query: string): T[] => {
      const filtered = results.filter(item => !selectedIds.has(item.id));

      // Append a "Create: X" synthetic item when hasCreate is true,
      // the user has typed something, and it doesn't exactly match an
      // existing result.
      if (hasCreate && query.trim()) {
        const trimmed = query.trim();
        const alreadyExists =
          selectedIds.has(trimmed) ||
          filtered.some(
            item => item.label.toLowerCase() === trimmed.toLowerCase(),
          );
        if (!alreadyExists) {
          const creatableItem = {
            id: `${CREATABLE_ID_PREFIX}${trimmed}`,
            label: `Create "${trimmed}"`,
            auxiliaryData: {__createdValue: trimmed},
          } as unknown as T;
          filtered.push(creatableItem);
        }
      }

      return filtered;
    },
    [selectedIds, hasCreate],
  );

  const filteredSource: SearchSource<T> = useMemo(
    () => ({
      search: async (query: string) =>
        decorateResults(await searchSource.search(query), query),
      bootstrap: async () =>
        decorateResults(await searchSource.bootstrap(), ''),
    }),
    [searchSource, decorateResults],
  );

  const emptySource: SearchSource<T> = useMemo(
    () => ({
      search: async () => [],
      bootstrap: async () => [],
    }),
    [],
  );

  // Announce token add/remove politely via the persistent live region.
  // Tokens previously appeared and disappeared silently — Backspace on an
  // empty input removes the trailing token, and the per-token remove buttons
  // gave no audible feedback either.
  const announce = useAnnounce();

  // Handle adding an item — detect creatable synthetic items
  const addItem = useCallback(
    (item: T | null) => {
      if (!item) {
        return;
      }
      if (isAtMax) {
        return;
      }

      // Detect "Create: X" synthetic items from the creatable source
      if (hasCreate && isCreatableItem(item)) {
        const createdValue = item.id.slice(CREATABLE_ID_PREFIX.length);
        if (selectedIds.has(createdValue)) {
          return;
        }
        const base = {id: createdValue, label: createdValue};
        const realItem = base as T;
        const newItems = [...value, realItem];
        onChange(newItems, {item: realItem, type: 'create'});
        announce(t('@astryx.tokenizer.tokenAdded', {label: createdValue}));
        return;
      }

      if (selectedIds.has(item.id)) {
        return;
      }
      const newItems = [...value, item];
      onChange(newItems, {item, type: 'add'});
      announce(t('@astryx.tokenizer.tokenAdded', {label: item.label}));
    },
    [value, onChange, isAtMax, selectedIds, hasCreate, announce, t],
  );

  // Handle removing an item. Single removal path: Backspace on an empty input,
  // the per-token remove buttons, and the touch surface's chips all route
  // through here, so the announcement covers every one of them.
  const removeItem = useCallback(
    (item: T) => {
      const newItems = value.filter(v => v.id !== item.id);
      onChange(newItems, {item, type: 'remove'});
      announce(t('@astryx.tokenizer.tokenRemoved', {label: item.label}));
      onAfterRemove?.();
    },
    [value, onChange, announce, t, onAfterRemove],
  );

  // Handle clearing all items
  const clearAll = useCallback(() => {
    if (value.length === 0) {
      return;
    }
    // Report the last item as removed (convention)
    const lastItem = value[value.length - 1];
    onChange([], {item: lastItem, type: 'remove'});
    onAfterRemove?.();
  }, [value, onChange, onAfterRemove]);

  return {
    isAtMax,
    selectedIds,
    decorateResults,
    filteredSource,
    emptySource,
    addItem,
    removeItem,
    clearAll,
  };
}
