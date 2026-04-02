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
 * updates via a ref attached directly to the <tr> element through the
 * plugin's `transformBodyRow`. No extra DOM elements are injected —
 * the store tracks row elements in a Set and applies styles during
 * notify(). This scales to multiple plugins since any plugin can
 * attach a ref via the `ref` field on BodyRowRenderProps.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (selection documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../../../theme/tokens.stylex';
import {XDSCheckboxInput} from '../../../CheckboxInput';
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
 * changes independently. Also manages a set of <tr> element refs for
 * imperative row styling — no extra DOM elements needed.
 */
interface SelectionStore<T extends Record<string, unknown>> {
  subscribe: (listener: () => void) => () => void;
  notify: () => void;
  getConfig: () => UseXDSTableSelectionConfig<T>;
  /** Tracked <tr> elements for imperative row styling. */
  rowElements: Set<HTMLTableRowElement>;
  /** Reverse lookup: <tr> element → item, for checking selection state. */
  rowItems: WeakMap<HTMLTableRowElement, T>;
}

function createSelectionStore<T extends Record<string, unknown>>(
  configRef: React.RefObject<UseXDSTableSelectionConfig<T>>,
): SelectionStore<T> {
  const listeners = new Set<() => void>();
  const rowElements = new Set<HTMLTableRowElement>();
  const rowItems = new WeakMap<HTMLTableRowElement, T>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify() {
      // Notify useSyncExternalStore subscribers (checkbox components)
      for (const listener of listeners) {
        listener();
      }

      // Imperative DOM updates for row styling — no React re-render needed.
      const config = configRef.current;
      for (const el of rowElements) {
        if (!el.isConnected) {
          rowElements.delete(el);
          continue;
        }
        const item = rowItems.get(el);
        if (!item) continue;
        const isSelected = config.getIsItemSelected(item);
        if (isSelected) {
          el.setAttribute('aria-selected', 'true');
          el.style.backgroundColor = selectedBgColor;
        } else {
          el.removeAttribute('aria-selected');
          el.style.backgroundColor = '';
        }
      }
    },
    getConfig() {
      return configRef.current;
    },
    rowElements,
    rowItems,
  };
}

// =============================================================================
// Ref Merging Utility
// =============================================================================

/**
 * Compose multiple refs into a single callback ref.
 * Used when multiple plugins need to attach refs to the same row.
 */
function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): React.RefCallback<T> {
  return (el: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = el;
      }
    }
  };
}

// =============================================================================
// Selection Context
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectionStoreContext = createContext<SelectionStore<any> | null>(null);

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
  const store = useContext(SelectionStoreContext);
  if (!store) return null;

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
    if (allSelected) return SELECT_ALL;
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
  const store = useContext(SelectionStoreContext);
  if (!store) return null;

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

  if (!selectable) return null;

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
  cell: {
    textAlign: 'center',
  },
});

/** Selection column key — prefixed to avoid collisions with user columns. */
const SELECTION_COLUMN_KEY = '__xds_selection';

/** Fixed width for the selection column. */
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
  // re-render components whose snapshot actually changed. Also applies
  // imperative row styling via the store's row ref tracking.
  useEffect(() => {
    store.notify();
  });

  // Synthetic selection column — uses renderCell with a subscribing
  // component so each row's checkbox re-renders independently.
  const selectionColumn = useMemo(
    (): XDSTableColumn<T> => ({
      key: SELECTION_COLUMN_KEY,
      header: <SelectAllCheckbox />,
      width: SELECTION_COLUMN_WIDTH,
      renderCell: (item: T) => <SelectionCellContent item={item} />,
    }),
    [],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        return (
          <SelectionStoreContext.Provider value={store}>
            {children}
          </SelectionStoreContext.Provider>
        );
      },

      transformColumns(columns: XDSTableColumn<T>[]) {
        return [selectionColumn, ...columns];
      },

      transformHeaderCell(props, column) {
        if (column.key === SELECTION_COLUMN_KEY) {
          return {
            ...props,
            styles: [...props.styles, selectionColumnStyles.cell],
          };
        }
        return props;
      },

      transformBodyCell(props, column) {
        if (column.key === SELECTION_COLUMN_KEY) {
          return {
            ...props,
            styles: [...props.styles, selectionColumnStyles.cell],
          };
        }
        return props;
      },

      transformBodyRow(props: BodyRowRenderProps, item: T) {
        // Attach a ref to the <tr> for imperative row styling.
        // The store tracks all row elements and applies aria-selected /
        // backgroundColor on notify() — no extra DOM elements needed.
        const selectionRef: React.RefCallback<HTMLTableRowElement> = el => {
          if (el) {
            store.rowElements.add(el);
            store.rowItems.set(el, item);
          }
        };

        return {
          ...props,
          // Merge with any existing ref from other plugins
          ref: props.ref ? mergeRefs(props.ref, selectionRef) : selectionRef,
        };
      },
    }),
    [store, selectionColumn],
  );
}
