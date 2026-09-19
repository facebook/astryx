// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableSelection.tsx
 * @input React, types, CheckboxInput, theme tokens
 * @output Exports useTableSelection hook and UseTableSelectionConfig type
 * @position Selection plugin; consumed by Table via plugins prop
 *
 * ## Architecture (v2 — transformColumns + ref-based row styling)
 *
 * Selection checkboxes are implemented as a synthetic column prepended via
 * `transformColumns`. The checkbox column flows through the normal cell
 * component pipeline, so it automatically respects component overrides
 * (components prop on BaseTable).
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
 * The selected state is published on the `astryx-table-row` theming target
 * (state class + data attribute, derived from themeProps) on the same
 * imperative path, so a theme can key off it. The wash itself resolves
 * through the `--table-row-selected-background` var, so a theme can
 * retint it. Because the background is an inline style it still outranks
 * anything userland can layer on with StyleX — `hasRowHighlight: false`
 * remains the way to reclaim the row background entirely; `aria-selected`
 * is unaffected by it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/useTableSelection.doc.mjs (config prop table)
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
import {CheckboxInput} from '../../../CheckboxInput';
import {mergeRefs, themeProps} from '../../../utils';
import type {TablePlugin, TableColumn, BodyRowRenderProps} from '../../types';
import {pixel} from '../../columnUtils';
import {useTranslator} from '../../../i18n';

// =============================================================================
// Config Type
// =============================================================================

export interface UseTableSelectionConfig<T extends Record<string, unknown>> {
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
  /**
   * Derive a human-readable identity for a row, used in the row checkbox's
   * hidden label as `Select ${getRowLabel(item)}`. Without it, every row
   * checkbox announces an undifferentiated "Select row" to screen readers.
   * With `getRowLabel: item => item.name`, checkbox accessible names become
   * "Select Alice", "Select Bob", and so on.
   *
   * @example
   * ```
   * getRowLabel: item => item.name
   * ```
   */
  getRowLabel?: (item: T) => string;
  /**
   * Paint checked rows with the accent wash. Set false when the surrounding
   * UI already uses row background to mean something else — a row that is
   * open in a detail panel, for instance. The wash is an inline style, so
   * it cannot be overridden from userland; this flag is the way off it. A
   * theme that only wants a different colour can retint the wash in place
   * by setting `--table-row-selected-background` on the `table-row`
   * selected target, without turning it off.
   *
   * Only the background is dropped. `aria-selected` is still set on checked
   * rows either way, so the selection stays legible to screen readers.
   *
   * @default true
   * @example
   * ```
   * useTableSelection({...config, hasRowHighlight: false})
   * ```
   */
  hasRowHighlight?: boolean;
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
  getConfig: () => UseTableSelectionConfig<T>;
}

function createSelectionStore<T extends Record<string, unknown>>(
  configRef: React.RefObject<UseTableSelectionConfig<T>>,
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
 *
 * `aria-selected` tracks selection on its own: it is the semantic half of
 * the state and stays correct whether or not the row is painted. The
 * `selected` class and `data-selected` attribute are the theming half —
 * same imperative path, same conditions — so a theme can key off a checked
 * row (`table-row` + `selected`) whether or not it is painted.
 */
function applyRowSelectionStyle(
  el: HTMLTableRowElement,
  isSelected: boolean,
  hasRowHighlight: boolean,
): void {
  if (isSelected) {
    el.setAttribute('aria-selected', 'true');
  } else {
    el.removeAttribute('aria-selected');
  }
  // The theming surface comes from themeProps so it stays in step with how
  // every other component publishes state (class token + data attribute),
  // never a hand-authored one. Toggling imperatively keeps the fine-grained
  // path: no row re-renders to carry it.
  for (const className of selectedRowStateClasses) {
    el.classList.toggle(className, isSelected);
  }
  if (isSelected && selectedRowDataAttribute != null) {
    el.setAttribute('data-selected', selectedRowDataAttribute);
  } else {
    el.removeAttribute('data-selected');
  }
  // Written on every pass, not just when painting: the flag can flip while a
  // row is already selected, and the wash has to come back off.
  const wash = isSelected && hasRowHighlight ? selectedBgColor : '';
  if (el.style.backgroundColor !== wash) {
    el.style.backgroundColor = wash;
  }
  // A pinned column paints its own opaque background over the row, so the
  // wash alone stops at the freeze line. Publishing it as the row overlay is
  // what lets useTableStickyColumns replay it on those cells — the same
  // contract TableRow honours for striping and hover.
  const currentOverlay = el.style.getPropertyValue(ROW_OVERLAY_VAR);
  if (wash === '') {
    if (currentOverlay !== '') {
      el.style.removeProperty(ROW_OVERLAY_VAR);
    }
  } else {
    if (currentOverlay !== wash) {
      el.style.setProperty(ROW_OVERLAY_VAR, wash);
    }
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
  const t = useTranslator();
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
    <CheckboxInput
      label={t('@astryx.table.selection.selectAllRows')}
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
  const t = useTranslator();
  const config = store.getConfig();
  const isSelected = useIsItemSelected(store, item);
  const selectable = config.getIsItemSelectable?.(item) ?? true;
  const enabled = config.getIsItemEnabled?.(item) ?? true;
  const rowLabel = config.getRowLabel?.(item);

  if (!selectable) {
    return null;
  }

  return (
    <CheckboxInput
      label={
        rowLabel != null
          ? t('@astryx.table.selection.selectRowNamed', {label: rowLabel})
          : t('@astryx.table.selection.selectRow')
      }
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

/**
 * The wash painted on checked rows. Resolves through a themeable var — the
 * same contract as `--table-sticky-background` in useTableStickyColumns — so
 * a theme can retint the selection (`table-row` + `selected` sets
 * `--table-row-selected-background`) instead of only opting out of it. The
 * same value publishes as the row overlay, so a themed wash runs under
 * pinned columns too. Defaults to the accent token.
 */
const selectedBgColor = `var(--table-row-selected-background, ${colorVars['--color-accent-muted']})`;

/**
 * The selected state as published on the row's theming target. Selection is
 * runtime state, so it rides the one `astryx-table-row` target (class token
 * + data attribute from themeProps, like `calendar-day`'s selected) rather
 * than a separate `-selected` element or a hand-authored attribute. Derived
 * once here; the per-row ref writes the delta on top of the stable base.
 */
const SELECTED_ROW_STATE = 'selected';
const tableRowBaseClassName = themeProps('table-row').className;
const selectedRowStateProps = themeProps('table-row', {
  selected: SELECTED_ROW_STATE,
});
/** The state classes `selected` adds on top of the stable base class. */
const selectedRowStateClasses = selectedRowStateProps.className
  .split(' ')
  .filter(className => className !== tableRowBaseClassName);
/** The `data-selected` value themeProps reflects for the selected state. */
const selectedRowDataAttribute = selectedRowStateProps['data-selected'];

/**
 * The row's current fill, republished for pinned cells to read. Declared as a
 * literal rather than imported because StyleX needs the same name as a static
 * key on the reading side, so there is no one constant both ends can share.
 */
const ROW_OVERLAY_VAR = '--table-row-overlay';

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

export function useTableSelection<T extends Record<string, unknown>>(
  config: UseTableSelectionConfig<T>,
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
    (): TableColumn<T> => ({
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

      transformColumns(columns: TableColumn<T>[]) {
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
          const applyStyle = () => {
            const config = store.getConfig();
            applyRowSelectionStyle(
              el,
              config.getIsItemSelected(item),
              config.hasRowHighlight ?? true,
            );
          };
          // Apply initial style
          applyStyle();
          // Subscribe for future changes
          const unsub = store.subscribe(() => {
            if (!el.isConnected) {
              unsub();
              return;
            }
            applyStyle();
          });
          return () => {
            unsub();
          };
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
