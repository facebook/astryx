// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useXDSTableSelection.tsx
 * @input React, types, XDSCheckboxInput, theme tokens
 * @output Exports useXDSTableSelection hook and UseXDSTableSelectionConfig type
 * @position Selection plugin; consumed by XDSTable via plugins prop
 *
 * ## Architecture (v2 — transformColumns + ref-based row styling)
 *
 * Selection checkboxes are implemented as a synthetic column prepended via
 * `transformColumns`. The checkbox column flows through the normal cell
 * component pipeline, so it automatically respects component overrides
 * (components prop on XDSBaseTable).
 *
 * Selection state is managed via an external store (SelectionStore) for
 * fine-grained row subscriptions. Each row's checkbox subscribes
 * independently — when selection changes, only that row's checkbox
 * re-renders, not the entire table body.
 *
 * Row-level styling (aria-selected, background) uses imperative DOM
 * updates via a ref callback on each <tr>. The ref subscribes to the
 * store and applies/removes styles when selection changes — no extra
 * DOM elements and no central element tracking. Each subscription
 * self-cleans when the row disconnects.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (selection documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../../../theme/tokens.stylex';
import {XDSCheckboxInput} from '../../../CheckboxInput';
import {mergeRefs} from '../../../utils';
import type {
  TablePlugin,
  XDSTableColumn,
  BodyRowRenderProps,
} from '../../types';
import {pixel} from '../../columnUtils';

// =============================================================================
// Config Type
// =============================================================================

export interface UseXDSTableSelectionConfig<T extends Record<string, unknown>> {
  /** Is this item currently selected? */
  getIsItemSelected: (item: T) => boolean;
  /** Called when a row checkbox is toggled. isSelected = new desired state. */
  onSelectItem: (event: {item: T; isSelected: boolean}) => void;
  /** Called when select-all checkbox is toggled. */
  onSelectAll: (event: {isAllSelected: boolean}) => void;
  /** Are all selectable items currently selected? */
  getIsAllSelected: () => boolean;
  /** Is the selection partial (some but not all)? Shows indeterminate checkbox. */
  getIsIndeterminate?: () => boolean;
  /** Should this row show a checkbox? Non-selectable rows render nothing. @default () => true */
  getIsItemSelectable?: (item: T) => boolean;
  /** Is this row's checkbox interactive? Disabled rows show disabled checkbox. @default () => true */
  getIsItemEnabled?: (item: T) => boolean;
}

// =============================================================================
// Selection Store (external store for fine-grained row subscriptions)
// =============================================================================

/**
 * Lightweight external store that lets each row subscribe to selection
 * changes independently. Row styling is handled by per-row ref callbacks
 * that subscribe to this store — the store itself holds no DOM references.
 */
interface SelectionStore<T extends Record<string, unknown>> {
  subscribe: (listener: () => void) => () => void;
  notify: () => void;
  getConfig: () => UseXDSTableSelectionConfig<T>;
}

function createSelectionStore<T extends Record<string, unknown>>(
  configRef: React.RefObject<UseXDSTableSelectionConfig<T>>,
): SelectionStore<T> {
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify() {
      for (const listener of listeners) {
        listener();
      }
    },
    getConfig() {
      return configRef.current;
    },
  };
}

/**
 * Apply or remove selection styling on a <tr> element.
 */
function applyRowSelectionStyle(
  el: HTMLTableRowElement,
  isSelected: boolean,
): void {
  if (isSelected) {
    el.setAttribute('aria-selected', 'true');
    el.style.backgroundColor = selectedBgColor;
  } else {
    el.removeAttribute('aria-selected');
    el.style.backgroundColor = '';
  }
}

// =============================================================================
// Selection Context
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectionStoreContext = createContext<SelectionStore<any> | null>(null);
SelectionStoreContext.displayName = 'SelectionStoreContext';

// =============================================================================
// Hooks for subscribing to selection state
// =============================================================================

function useIsItemSelected<T extends Record<string, unknown>>(
  store: SelectionStore<T>,
  item: T,
): boolean {
  const getSnapshot = useCallback(
    () => store.getConfig().getIsItemSelected(item),
    [store, item],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

// =============================================================================
// Checkbox Components
// =============================================================================

function SelectAllCheckbox() {
  const store = use(SelectionStoreContext);
  if (!store) {
    return null;
  }

  return <SelectAllCheckboxInner store={store} />;
}

/**
 * Encode select-all state as a number for useSyncExternalStore.
 * Avoids string encoding + splitting — the snapshot is a cheap numeric
 * comparison. Values: 0 = none, 1 = indeterminate, 2 = all selected.
 */
const SELECT_NONE = 0;
const SELECT_INDETERMINATE = 1;
const SELECT_ALL = 2;

/**
 * Inner component that subscribes to all-selected/indeterminate state.
 * Separated so the useCallback/useSyncExternalStore hooks are not
 * called conditionally (after the null guard).
 */
function SelectAllCheckboxInner<T extends Record<string, unknown>>({
  store,
}: {
  store: SelectionStore<T>;
}) {
  const getSnapshot = useCallback(() => {
    const config = store.getConfig();
    const allSelected = config.getIsAllSelected();
    if (allSelected) {
      return SELECT_ALL;
    }
    const indeterminate = config.getIsIndeterminate?.() ?? false;
    return indeterminate ? SELECT_INDETERMINATE : SELECT_NONE;
  }, [store]);

  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  const allSelected = state === SELECT_ALL;
  const indeterminate = state === SELECT_INDETERMINATE;

  return (
    <XDSCheckboxInput
      label="Select all rows"
      isLabelHidden
      value={allSelected ? true : indeterminate ? 'indeterminate' : false}
      onChange={() =>
        store.getConfig().onSelectAll({isAllSelected: !allSelected})
      }
      size="sm"
    />
  );
}

/**
 * Row checkbox component — used as renderCell for the synthetic selection column.
 * Subscribes to this item's selection state independently.
 */
function SelectionCellContent<T extends Record<string, unknown>>({
  item,
}: {
  item: T;
}) {
  const store = use(SelectionStoreContext);
  if (!store) {
    return null;
  }

  return <SelectionCellContentInner store={store} item={item} />;
}

function SelectionCellContentInner<T extends Record<string, unknown>>({
  store,
  item,
}: {
  store: SelectionStore<T>;
  item: T;
}) {
  const config = store.getConfig();
  const isSelected = useIsItemSelected(store, item);
  const selectable = config.getIsItemSelectable?.(item) ?? true;
  const enabled = config.getIsItemEnabled?.(item) ?? true;

  if (!selectable) {
    return null;
  }

  return (
    <XDSCheckboxInput
      label="Select row"
      isLabelHidden
      value={isSelected}
      onChange={() =>
        store.getConfig().onSelectItem({item, isSelected: !isSelected})
      }
      isDisabled={!enabled}
      size="sm"
    />
  );
}

// =============================================================================
// Styles
// =============================================================================

const selectedBgColor = colorVars['--color-accent-muted'];

const selectionColumnStyles = stylex.create({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Selection column key — prefixed to avoid collisions with user columns. */
const SELECTION_COLUMN_KEY = '__xds_selection';

/** Fixed width for the selection column. Content is centered with no horizontal padding. */
const SELECTION_COLUMN_WIDTH = pixel(36);

// =============================================================================
// Hook
// =============================================================================

export function useXDSTableSelection<T extends Record<string, unknown>>(
  config: UseXDSTableSelectionConfig<T>,
): TablePlugin<T> {
  const configRef = useRef(config);
  configRef.current = config;

  const storeRef = useRef<SelectionStore<T> | null>(null);
  if (storeRef.current == null) {
    storeRef.current = createSelectionStore(configRef);
  }
  const store = storeRef.current;

  // Notify subscribers on every render — useSyncExternalStore will only
  // re-render components whose snapshot actually changed. Row ref
  // subscribers apply imperative styling independently.
  useEffect(() => {
    store.notify();
  });

  // Synthetic selection column — uses renderCell with a subscribing
  // component so each row's checkbox re-renders independently.
  const selectionColumn = useMemo(
    (): XDSTableColumn<T> => ({
      key: SELECTION_COLUMN_KEY,
      header: (
        <div {...stylex.props(selectionColumnStyles.center)}>
          <SelectAllCheckbox />
        </div>
      ),
      width: SELECTION_COLUMN_WIDTH,
      resizable: false,
      renderCell: (item: T) => (
        <div {...stylex.props(selectionColumnStyles.center)}>
          <SelectionCellContent item={item} />
        </div>
      ),
    }),
    [],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        return (
          <SelectionStoreContext value={store}>
            {children}
          </SelectionStoreContext>
        );
      },

      transformColumns(columns: XDSTableColumn<T>[]) {
        return [selectionColumn, ...columns];
      },

      transformBodyRow(props: BodyRowRenderProps, item: T) {
        // Attach a ref to the <tr> that subscribes to the store for
        // imperative row styling. Each row manages its own subscription
        // and self-cleans when disconnected — no central element tracking.
        const selectionRef: React.RefCallback<HTMLTableRowElement> = el => {
          if (!el) {
            return;
          }
          // Apply initial style
          applyRowSelectionStyle(el, store.getConfig().getIsItemSelected(item));
          // Subscribe for future changes
          const unsub = store.subscribe(() => {
            if (!el.isConnected) {
              unsub();
              return;
            }
            applyRowSelectionStyle(
              el,
              store.getConfig().getIsItemSelected(item),
            );
          });
        };

        return {
          ...props,
          ref: props.ref ? mergeRefs(props.ref, selectionRef) : selectionRef,
        };
      },
    }),
    [store, selectionColumn],
  );
}
