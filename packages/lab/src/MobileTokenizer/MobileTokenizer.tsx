// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MobileTokenizer.tsx
 * @input Uses public @astryxdesign/core components only (AlertDialog,
 *   BottomSheet, BottomSheetSwitcher, Button, EmptyState, Field, Heading, Icon,
 *   IconButton, Text, TextInput, Token)
 * @output Exports MobileTokenizer — Lab prototype of the touch Tokenizer
 *   flow with stacked Selected/Available sections and progressive rendering
 * @position Lab (canary) stack layer 1: validates the design before the
 *   Core promotion (Tokenizer presentation="bottom-sheet").
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
  type SVGProps,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field} from '@astryxdesign/core/Field';
import {Heading} from '@astryxdesign/core/Heading';
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

type SheetId = 'manage';
const CREATABLE_ID_PREFIX = '__xds_create__';
const LIST_RENDER_BATCH_SIZE = 50;
const LIST_LOAD_MORE_THRESHOLD_PX = 200;

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

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      {...props}>
      <path d="M5 12h14M12 5v14" />
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
    paddingBlockStart: spacingVars['--spacing-8'],
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  // The manage sheet intentionally has no dedicated close button; the sheet
  // keeps its standard gesture, scrim, and Escape dismissal paths.
  list: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
    minHeight: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sectionDivider: {
    marginBlockStart: spacingVars['--spacing-3'],
  },
  sectionHeader: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-1'],
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    minHeight: sizeVars['--size-element-lg'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
  },
  rowLabel: {
    flexGrow: 1,
    minWidth: 0,
  },
  emptySection: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-1'],
  },
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
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  // TextInput renders Field (block, shrink-to-fit); xstyle lands on that
  // root, so it must fill the available search row width.
  filterInput: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: sizeVars['--size-element-lg'],
    minHeight: sizeVars['--size-element-lg'],
  },
  empty: {
    flexGrow: 1,
  },
});

export function MobileTokenizer<T extends SearchableItem>({
  label,
  searchSource,
  value,
  onChange,
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
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
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

  // ---- sheet search ----
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [renderedItemCount, setRenderedItemCount] = useState(
    LIST_RENDER_BATCH_SIZE,
  );
  const seqRef = useRef(0);
  const lastLoadScrollHeightRef = useRef<number | null>(null);
  const isSheetOpen = activeSheet === 'manage';
  useEffect(() => {
    if (!isSheetOpen) {
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
    isSheetOpen,
    query,
    searchSource,
    minQueryLength,
    maxMenuItems,
    debounceMs,
  ]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedMatches = value.filter(
      item =>
        normalizedQuery === '' ||
        item.label.toLowerCase().includes(normalizedQuery),
    );
    const selectedMatchIds = new Set(selectedMatches.map(item => item.id));
    return [
      ...selectedMatches,
      ...results.filter(item => !selectedMatchIds.has(item.id)),
    ];
  }, [query, results, value]);

  const renderedItems = visibleItems.slice(0, renderedItemCount);
  const renderedSelectedItems = renderedItems.filter(item =>
    selectedIds.has(item.id),
  );
  const renderedAvailableItems = renderedItems.filter(
    item => !selectedIds.has(item.id),
  );
  const hasSelectedItems = visibleItems.some(item => selectedIds.has(item.id));
  const hasAvailableItems = visibleItems.some(
    item => !selectedIds.has(item.id),
  );

  const createItem = useMemo<T | null>(() => {
    const trimmed = query.trim();
    if (!hasCreate || trimmed === '' || isAtMax) {
      return null;
    }
    if (
      selectedIds.has(trimmed) ||
      value.some(item => item.label.toLowerCase() === trimmed.toLowerCase()) ||
      results.some(r => r.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      return null;
    }
    return {
      id: `${CREATABLE_ID_PREFIX}${trimmed}`,
      label: `Create "${trimmed}"`,
    } as unknown as T;
  }, [hasCreate, query, results, selectedIds, isAtMax, value]);

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
        onClick={() => {
          lastLoadScrollHeightRef.current = null;
          setRenderedItemCount(LIST_RENDER_BATCH_SIZE);
          setActiveSheet('manage');
        }}
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
          <BottomSheet sheetId="manage" label={label} height="tall">
            <div {...stylex.props(styles.sheetBody)}>
              <div {...stylex.props(styles.filterRow)}>
                <TextInput
                  label={`Search ${label}`}
                  isLabelHidden
                  placeholder="Search..."
                  startIcon="search"
                  value={query}
                  size="lg"
                  width="100%"
                  hasClear
                  onChange={next => {
                    lastLoadScrollHeightRef.current = null;
                    setRenderedItemCount(LIST_RENDER_BATCH_SIZE);
                    setQuery(next);
                    onChangeQuery?.(next);
                  }}
                  xstyle={styles.filterInput}
                />
              </div>
              <div
                {...stylex.props(styles.list)}
                role="group"
                aria-label={label}
                data-testid="mobile-tokenizer-list"
                data-rendered-count={renderedItems.length}
                data-total-count={visibleItems.length}
                onScroll={event => {
                  const list = event.currentTarget;
                  const distanceFromBottom =
                    list.scrollHeight - list.scrollTop - list.clientHeight;
                  if (
                    distanceFromBottom <= LIST_LOAD_MORE_THRESHOLD_PX &&
                    lastLoadScrollHeightRef.current !== list.scrollHeight
                  ) {
                    lastLoadScrollHeightRef.current = list.scrollHeight;
                    setRenderedItemCount(current =>
                      Math.min(
                        current + LIST_RENDER_BATCH_SIZE,
                        visibleItems.length,
                      ),
                    );
                  }
                }}>
                {!isSearching &&
                visibleItems.length === 0 &&
                createItem == null ? (
                  <EmptyState
                    icon={
                      <Icon
                        icon={query.trim() === '' ? ListBulletIcon : 'search'}
                        size="lg"
                        color="secondary"
                      />
                    }
                    title={
                      query.trim() === ''
                        ? 'No items available'
                        : emptySearchResultsText
                    }
                    description={
                      query.trim() === ''
                        ? 'There are no items to choose from.'
                        : 'Try a different search.'
                    }
                    isCompact
                    xstyle={styles.empty}
                  />
                ) : (
                  <>
                    <div
                      data-testid="mobile-tokenizer-selected-section"
                      {...stylex.props(styles.section)}>
                      <div {...stylex.props(styles.sectionHeader)}>
                        <Heading level={3}>Selected</Heading>
                      </div>
                      {renderedSelectedItems.map(item => (
                        <div
                          key={item.id}
                          data-testid="mobile-tokenizer-selected-row"
                          {...stylex.props(styles.row)}>
                          <span {...stylex.props(styles.rowLabel)}>
                            <Text type="body">{item.label}</Text>
                          </span>
                          <IconButton
                            label={`Remove ${item.label}`}
                            icon={<Icon icon="close" />}
                            variant="ghost"
                            size="lg"
                            onClick={() => handleRemove(item)}
                          />
                        </div>
                      ))}
                      {!hasSelectedItems && (
                        <EmptyState
                          icon={
                            <Icon
                              icon={
                                query.trim() === '' ? ListBulletIcon : 'search'
                              }
                              size="lg"
                              color="secondary"
                            />
                          }
                          title={
                            query.trim() === ''
                              ? 'No selected items'
                              : 'No selected matches'
                          }
                          description={
                            query.trim() === ''
                              ? 'Items you add will appear here.'
                              : 'Try a different search.'
                          }
                          isCompact
                          xstyle={styles.emptySection}
                        />
                      )}
                    </div>

                    <div
                      data-testid="mobile-tokenizer-available-section"
                      {...stylex.props(styles.section, styles.sectionDivider)}>
                      <div {...stylex.props(styles.sectionHeader)}>
                        <Heading level={3}>Available</Heading>
                      </div>
                      {createItem != null && (
                        <div
                          data-testid="mobile-tokenizer-create-row"
                          {...stylex.props(styles.row)}>
                          <span {...stylex.props(styles.rowLabel)}>
                            <Text type="body">{createItem.label}</Text>
                          </span>
                          <IconButton
                            label={`Add ${query.trim()}`}
                            icon={<Icon icon={PlusIcon} />}
                            variant="ghost"
                            size="lg"
                            onClick={() => {
                              handleAdd(createItem);
                              lastLoadScrollHeightRef.current = null;
                              setRenderedItemCount(LIST_RENDER_BATCH_SIZE);
                              setQuery('');
                            }}
                          />
                        </div>
                      )}
                      {renderedAvailableItems.map(item => (
                        <div
                          key={item.id}
                          data-testid="mobile-tokenizer-available-row"
                          {...stylex.props(styles.row)}>
                          <span {...stylex.props(styles.rowLabel)}>
                            <Text type="body">{item.label}</Text>
                          </span>
                          <IconButton
                            label={`Add ${item.label}`}
                            icon={<Icon icon={PlusIcon} />}
                            variant="ghost"
                            size="lg"
                            isDisabled={isAtMax}
                            onClick={() => handleAdd(item)}
                          />
                        </div>
                      ))}
                      {!hasAvailableItems && createItem == null && (
                        <EmptyState
                          icon={
                            <Icon
                              icon={query.trim() === '' ? 'check' : 'search'}
                              size="lg"
                              color="secondary"
                            />
                          }
                          title={
                            query.trim() === ''
                              ? 'No available items'
                              : 'No available matches'
                          }
                          description={
                            query.trim() === ''
                              ? 'All available items have been selected.'
                              : 'Try a different search.'
                          }
                          isCompact
                          xstyle={styles.emptySection}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
              {query.trim() === '' && (
                <div {...stylex.props(styles.footer)}>
                  <Button
                    label="Clear all"
                    variant="secondary"
                    size="lg"
                    isDisabled={value.length === 0}
                    onClick={() => setIsClearConfirmationOpen(true)}
                    xstyle={styles.footerAction}
                  />
                  <Button
                    label="Done"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setQuery('');
                      setActiveSheet(null);
                    }}
                    xstyle={styles.footerAction}
                  />
                </div>
              )}
              <AlertDialog
                isOpen={isClearConfirmationOpen}
                onOpenChange={setIsClearConfirmationOpen}
                title="Clear all selected items?"
                description={`This removes all selected items from ${label}.`}
                actionLabel="Clear selection"
                onAction={() => {
                  handleClearAll();
                  setIsClearConfirmationOpen(false);
                }}
              />
            </div>
          </BottomSheet>
        </BottomSheetSwitcher>
      )}
    </Field>
  );
}

MobileTokenizer.displayName = 'MobileTokenizer';
