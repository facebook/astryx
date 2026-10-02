// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MobileTokenizer.tsx
 * @input Uses public @astryxdesign/core components only (BottomSheet,
 *   BottomSheetSwitcher, Button, EmptyState, Field, Icon, IconButton, Text,
 *   TextInput, Token)
 * @output Exports MobileTokenizer — Lab prototype of the touch Tokenizer
 *   flow (stacked manage + add sheets)
 * @position Lab (canary) stack layer 1: validates the design before the
 *   Core promotion (Tokenizer presentation="bottom-sheet") stacked after it.
 *
 * API mirrors Core Tokenizer (label/searchSource/value/onChange/change,
 * hasCreate, maxEntries) so graduation is an import swap. Differences from
 * Core are the Lab deltas: the filter is a bordered TextInput (Core's
 * PanelSearchInput is not exported), strings are literals (no i18n keys),
 * and there is no theming/spec contract yet.
 */

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field} from '@astryxdesign/core/Field';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {
  colorVars,
  radiusVars,
  sizeVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

export type MobileTokenizerChange<T extends SearchableItem> =
  | {item: T; type: 'add'}
  | {item: T; type: 'create'}
  | {item: T; type: 'remove'}
  | {type: 'reorder'};

export interface MobileTokenizerProps<T extends SearchableItem> extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  label: string;
  searchSource: SearchSource<T>;
  value: T[];
  onChange: (items: T[], change: MobileTokenizerChange<T>) => void;
  renderItem?: (item: T) => ReactNode;
  placeholder?: string;
  description?: string;
  isOptional?: boolean;
  isDisabled?: boolean;
  hasCreate?: boolean;
  maxEntries?: number;
  maxMenuItems?: number;
  minQueryLength?: number;
  debounceMs?: number;
  emptySearchResultsText?: string;
  onChangeQuery?: (query: string) => void;
}

type SheetId = 'manage' | 'add';
const CREATABLE_ID_PREFIX = '__xds_create__';

function ListBulletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8.5 6h11M8.5 12h11M8.5 18h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

const styles = stylex.create({
  trigger: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    width: '100%',
    minHeight: 44,
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: 'transparent',
    textAlign: 'start',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  triggerPlaceholder: {
    color: colorVars['--color-text-secondary'],
  },
  sheetBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    paddingInline: spacingVars['--spacing-3'],
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  // The manage sheet intentionally has no dedicated close button; the sheet
  // keeps its standard gesture, scrim, and Escape dismissal paths.
  list: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    minHeight: 0,
  },
  addList: {
    flexGrow: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    minHeight: 44,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-1'],
    textAlign: 'start',
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: colorVars['--color-text-primary'],
  },
  rowDisabled: {opacity: 0.5},
  rowLabel: {flexGrow: 1, minWidth: 0},
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-3'],
    marginTop: 'auto',
  },
  footerAction: {
    flexGrow: 1,
    flexBasis: 0,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-2'],
    marginTop: 'auto',
  },
  // TextInput renders Field (block, shrink-to-fit); xstyle lands on that
  // root, so it must flex — the filter takes all row space minus Done+gap.
  filterInput: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: sizeVars['--size-element-lg'],
    minHeight: sizeVars['--size-element-lg'],
  },
  empty: {paddingBlock: spacingVars['--spacing-4']},
  searchEmpty: {
    flexGrow: 1,
  },
});

export function MobileTokenizer<T extends SearchableItem>({
  label,
  searchSource,
  value,
  onChange,
  renderItem,
  placeholder,
  description,
  isOptional,
  isDisabled = false,
  hasCreate = false,
  maxEntries,
  maxMenuItems = 10,
  minQueryLength = 1,
  debounceMs = 150,
  emptySearchResultsText = 'No results found',
  onChangeQuery,
  xstyle,
}: MobileTokenizerProps<T>) {
  const triggerId = useId();
  const [activeSheet, setActiveSheet] = useState<SheetId | null>(null);
  const selectedIds = useMemo(() => new Set(value.map(v => v.id)), [value]);
  const isAtMax = maxEntries != null && value.length >= maxEntries;

  const handleAdd = (item: T) => {
    if (isAtMax || selectedIds.has(item.id)) {
      return;
    }
    if (
      hasCreate &&
      typeof item.id === 'string' &&
      item.id.startsWith(CREATABLE_ID_PREFIX)
    ) {
      const created = item.id.slice(CREATABLE_ID_PREFIX.length);
      if (selectedIds.has(created)) {
        return;
      }
      const createdItem: SearchableItem = {id: created, label: created};
      const real = createdItem as T;
      onChange([...value, real], {item: real, type: 'create'});
      return;
    }
    onChange([...value, item], {item, type: 'add'});
  };
  const handleRemove = (item: T) =>
    onChange(
      value.filter(v => v.id !== item.id),
      {item, type: 'remove'},
    );
  const handleClearAll = () => {
    if (value.length > 0) {
      onChange([], {item: value[value.length - 1], type: 'remove'});
    }
  };

  // ---- add-sheet search ----
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const seqRef = useRef(0);
  const isAddOpen = activeSheet === 'add';
  useEffect(() => {
    if (!isAddOpen) {
      return;
    }
    const seq = ++seqRef.current;
    const run = async () => {
      setIsSearching(true);
      try {
        const trimmed = query.trim();
        let items: T[];
        if (trimmed === '') {
          items = searchSource.bootstrap
            ? await searchSource.bootstrap()
            : await searchSource.search('');
        } else if (trimmed.length < minQueryLength) {
          items = [];
        } else {
          items = await searchSource.search(query);
        }
        if (seqRef.current === seq) {
          setResults(items.slice(0, maxMenuItems));
        }
      } finally {
        if (seqRef.current === seq) {
          setIsSearching(false);
        }
      }
    };
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        void run();
      }, debounceMs);
      return () => clearTimeout(timer);
    }
    void run();
  }, [
    isAddOpen,
    query,
    searchSource,
    minQueryLength,
    maxMenuItems,
    debounceMs,
  ]);

  const createItem = useMemo<T | null>(() => {
    const trimmed = query.trim();
    if (!hasCreate || trimmed === '' || isAtMax) {
      return null;
    }
    if (
      selectedIds.has(trimmed) ||
      results.some(r => r.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      return null;
    }
    return {
      id: `${CREATABLE_ID_PREFIX}${trimmed}`,
      label: `Create "${trimmed}"`,
    } as unknown as T;
  }, [hasCreate, query, results, selectedIds, isAtMax]);

  return (
    <Field
      label={label}
      description={description}
      isOptional={isOptional}
      isDisabled={isDisabled}
      inputID={triggerId}
      xstyle={xstyle}>
      <button
        type="button"
        id={triggerId}
        aria-haspopup="dialog"
        aria-expanded={activeSheet != null}
        aria-label={label}
        disabled={isDisabled}
        onClick={() => setActiveSheet('manage')}
        {...stylex.props(styles.trigger)}>
        {value.length > 0 ? (
          value.map(item => (
            <Token key={item.id} label={item.label} isDisabled={isDisabled} />
          ))
        ) : (
          <span {...stylex.props(styles.triggerPlaceholder)}>
            {placeholder ?? ''}
          </span>
        )}
      </button>

      {!isDisabled && (
        <BottomSheetSwitcher
          activeSheet={activeSheet}
          onActiveSheetChange={id => setActiveSheet(id as SheetId | null)}>
          <BottomSheet sheetId="manage" label={label} height="hug" padding={0}>
            <div {...stylex.props(styles.sheetBody)}>
              <div
                {...stylex.props(styles.list)}
                data-testid="mobile-tokenizer-manage-list">
                {value.length === 0 ? (
                  <EmptyState
                    icon={
                      <Icon icon={ListBulletIcon} size="lg" color="secondary" />
                    }
                    title="No items yet"
                    description="Add an item to get started."
                    isCompact
                    xstyle={styles.empty}
                  />
                ) : (
                  value.map(item => (
                    <div key={item.id}>
                      <div {...stylex.props(styles.row)}>
                        <span {...stylex.props(styles.rowLabel)}>
                          <Text type="body">{item.label}</Text>
                        </span>
                        <IconButton
                          label={`Remove ${item.label}`}
                          icon={<Icon icon="close" />}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div {...stylex.props(styles.footer)}>
                <Button
                  label="Clear all"
                  variant="secondary"
                  size="lg"
                  isDisabled={value.length === 0}
                  onClick={handleClearAll}
                  xstyle={styles.footerAction}
                />
                <Button
                  label="Add item"
                  variant="primary"
                  size="lg"
                  isDisabled={isAtMax}
                  onClick={() => setActiveSheet('add')}
                  xstyle={styles.footerAction}
                />
              </div>
            </div>
          </BottomSheet>

          <BottomSheet sheetId="add" label="Add item" height="tall" padding={0}>
            <div {...stylex.props(styles.sheetBody)}>
              <div
                {...stylex.props(styles.list, styles.addList)}
                role="list"
                aria-label={label}
                data-testid="mobile-tokenizer-add-list">
                {createItem != null && (
                  <div role="listitem" {...stylex.props(styles.row)}>
                    <span {...stylex.props(styles.rowLabel)}>
                      <Text type="body">{createItem.label}</Text>
                    </span>
                    <IconButton
                      label={createItem.label}
                      icon={<span aria-hidden="true">+</span>}
                      variant="secondary"
                      onClick={() => {
                        handleAdd(createItem);
                        setQuery('');
                      }}
                    />
                  </div>
                )}
                {!isSearching && results.length === 0 && createItem == null ? (
                  <EmptyState
                    icon={<Icon icon="search" size="lg" color="secondary" />}
                    title={emptySearchResultsText}
                    description="Try a different search."
                    isCompact
                    xstyle={styles.searchEmpty}
                  />
                ) : (
                  results.map(item => {
                    const isSelected = selectedIds.has(item.id);
                    const rowDisabled = !isSelected && isAtMax;
                    return (
                      <div
                        key={item.id}
                        role="listitem"
                        {...stylex.props(
                          styles.row,
                          rowDisabled && styles.rowDisabled,
                        )}>
                        <span {...stylex.props(styles.rowLabel)}>
                          {renderItem ? (
                            renderItem(item)
                          ) : (
                            <Text type="body">{item.label}</Text>
                          )}
                        </span>
                        <IconButton
                          label={`${isSelected ? 'Remove' : 'Add'} ${item.label}`}
                          icon={
                            isSelected ? (
                              <Icon icon="close" size="sm" />
                            ) : (
                              <span aria-hidden="true">+</span>
                            )
                          }
                          variant={isSelected ? 'ghost' : 'secondary'}
                          isDisabled={rowDisabled}
                          onClick={() =>
                            isSelected ? handleRemove(item) : handleAdd(item)
                          }
                        />
                      </div>
                    );
                  })
                )}
              </div>
              <div {...stylex.props(styles.filterRow)}>
                <TextInput
                  label={`Search ${label}`}
                  isLabelHidden
                  placeholder="Search..."
                  value={query}
                  size="lg"
                  width="100%"
                  hasClear
                  onChange={next => {
                    setQuery(next);
                    onChangeQuery?.(next);
                  }}
                  xstyle={styles.filterInput}
                />
                <Button
                  label="Done"
                  variant="primary"
                  size="lg"
                  onClick={() => setActiveSheet('manage')}
                />
              </div>
            </div>
          </BottomSheet>
        </BottomSheetSwitcher>
      )}
    </Field>
  );
}

MobileTokenizer.displayName = 'MobileTokenizer';
