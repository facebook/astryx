/**
 * @file useXDSTableSelection.tsx
 * @input React, types, XDSCheckboxInput, XDSTableCell, XDSTableHeaderCell, theme tokens
 * @output Exports useXDSTableSelection hook and UseXDSTableSelectionConfig type
 * @position Selection plugin; consumed by XDSTable via plugins prop
 *
 * ## Performance Architecture
 *
 * Selection state is managed via an external store (SelectionStore) so that
 * individual rows can subscribe to their own selection state independently.
 * When a row is selected/deselected, only that row re-renders — not the
 * entire table body.
 *
 * The plugin object returned by useXDSTableSelection is referentially stable
 * across renders. Selection-dependent rendering (aria-selected, background
 * highlight, checkbox state) is handled by context-subscribing components
 * (SelectionRowContent, SelectAllCheckbox) rather than in the plugin
 * transform functions.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/README.md (selection documentation)
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
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../../../theme/tokens.stylex';
import {XDSCheckboxInput} from '../../../CheckboxInput';
import {XDSTableCell} from '../../XDSTableCell';
import {XDSTableHeaderCell} from '../../XDSTableHeaderCell';
import type {TablePlugin, BodyRowRenderProps} from '../../types';

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
 * A lightweight external store that lets each row subscribe to selection
 * changes independently. When selection state changes, all subscribers are
 * notified but only components whose snapshot actually changed will re-render
 * (thanks to useSyncExternalStore's built-in equality check on the snapshot).
 */
interface SelectionStore<T extends Record<string, unknown>> {
  subscribe: (listener: () => void) => () => void;
  notify: () => void;
  getConfig: () => UseXDSTableSelectionConfig<T>;
}

function createSelectionStore<T extends Record<string, unknown>>(
  initialConfig: UseXDSTableSelectionConfig<T>,
): SelectionStore<T> {
  const listeners = new Set<() => void>();
  const currentConfig = initialConfig;

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
      return currentConfig;
    },
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

/**
 * Subscribe to whether a specific item is selected.
 * Only triggers re-render when this item's selected state changes.
 */
function useIsItemSelected<T extends Record<string, unknown>>(
  store: SelectionStore<T>,
  item: T,
): boolean {
  const getSnapshot = useCallback(
    () => store.getConfig().getIsItemSelected(item),
    [store, item],
  );

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

// =============================================================================
// Checkbox Components
// =============================================================================

function SelectAllCheckbox() {
  const store = useContext(SelectionStoreContext);
  if (!store) return null;

  const getSnapshot = useCallback(() => {
    const config = store.getConfig();
    const allSelected = config.getIsAllSelected();
    const indeterminate = config.getIsIndeterminate?.() ?? false;
    return `${allSelected}:${indeterminate}`;
  }, [store]);

  const key = useSyncExternalStore(store.subscribe, getSnapshot);
  const [allSelectedStr, indeterminateStr] = key.split(':');
  const allSelected = allSelectedStr === 'true';
  const indeterminate = indeterminateStr === 'true';
  const config = store.getConfig();

  return (
    <XDSCheckboxInput
      label="Select all rows"
      isLabelHidden
      value={allSelected ? true : indeterminate ? 'indeterminate' : false}
      onChange={() => config.onSelectAll({isAllSelected: !allSelected})}
      size="sm"
    />
  );
}

/**
 * Row content component that subscribes to this item's selection state.
 * Handles the checkbox cell, aria-selected attribute, and selected row styling.
 * Only re-renders when this specific item's selection state changes.
 */
function SelectionRowContent<T extends Record<string, unknown>>({
  item,
  children,
}: {
  item: T;
  children: ReactNode;
}) {
  const store = useContext(SelectionStoreContext)!;
  const config = store.getConfig();
  const isSelected = useIsItemSelected(store, item);
  const selectable = config.getIsItemSelectable?.(item) ?? true;
  const enabled = config.getIsItemEnabled?.(item) ?? true;

  // Manage aria-selected and background color on the parent <tr> via a ref + effect.
  // This avoids needing to re-render the entire memoized row component.
  const cellRef = useRef<HTMLTableCellElement>(null);
  useEffect(() => {
    const tr = cellRef.current?.parentElement;
    if (!tr) return;
    if (isSelected) {
      tr.setAttribute('aria-selected', 'true');
      tr.style.backgroundColor = selectedBgColor;
    } else {
      tr.removeAttribute('aria-selected');
      tr.style.backgroundColor = '';
    }
  }, [isSelected]);

  return (
    <>
      <XDSTableCell ref={cellRef} xstyle={selectionCellStyles.base}>
        {selectable && (
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
        )}
      </XDSTableCell>
      {children}
    </>
  );
}

// =============================================================================
// Styles
// =============================================================================

/**
 * Raw CSS variable reference for imperative style updates on the <tr>.
 * Used by SelectionRowContent to set background color without re-rendering
 * the memoized row component.
 */
const selectedBgColor = 'var(--color-accent-deemphasized)';

const selectionCellStyles = stylex.create({
  base: {
    width: '36px',
    minWidth: '36px',
    maxWidth: '36px',
    paddingInline: spacingVars['--spacing-2'],
    textAlign: 'center',
  },
});

// =============================================================================
// Hook
// =============================================================================

export function useXDSTableSelection<T extends Record<string, unknown>>(
  config: UseXDSTableSelectionConfig<T>,
): TablePlugin<T> {
  // Keep config in a ref so the store always reads the latest version
  const configRef = useRef(config);
  configRef.current = config;

  // Create the store once
  const storeRef = useRef<SelectionStore<T> | null>(null);
  if (storeRef.current == null) {
    storeRef.current = createSelectionStore(config);
  }
  const store = storeRef.current;

  // Patch getConfig to always return latest config via ref
  store.getConfig = () => configRef.current;

  // Notify subscribers when config changes (selection state may have changed).
  // useSyncExternalStore will only re-render components whose snapshot changed.
  useEffect(() => {
    store.notify();
  });

  // Return a stable plugin object — never changes after mount.
  // Selection-dependent rendering is handled by SelectionRowContent
  // and SelectAllCheckbox which subscribe to the store independently.
  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        return (
          <SelectionStoreContext.Provider value={store}>
            {children}
          </SelectionStoreContext.Provider>
        );
      },

      transformHeaderRow(props) {
        return {
          ...props,
          children: (
            <>
              <XDSTableHeaderCell xstyle={selectionCellStyles.base}>
                <SelectAllCheckbox />
              </XDSTableHeaderCell>
              {props.children}
            </>
          ),
        };
      },

      transformBodyRow(props: BodyRowRenderProps, item: T) {
        // Don't read selection state here — that would cause all rows
        // to re-render when any selection changes. Instead, delegate to
        // SelectionRowContent which subscribes to the store and only
        // re-renders when this specific item's selection state changes.
        return {
          ...props,
          children: (
            <SelectionRowContent item={item}>
              {props.children}
            </SelectionRowContent>
          ),
        };
      },
    }),
    [store],
  );
}
