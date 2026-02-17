/**
 * @file useXDSTableSelection.tsx
 * @input React, types.ts, XDSCheckboxInput, XDSTableCell, XDSTableHeaderCell, theme tokens
 * @output Exports useXDSTableSelection hook and UseXDSTableSelectionConfig type
 * @position Selection plugin; consumed by XDSTable via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/README.md (selection documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {XDSCheckboxInput} from '../CheckboxInput';
import {XDSTableCell} from './XDSTableCell';
import {XDSTableHeaderCell} from './XDSTableHeaderCell';
import type {TablePlugin, BodyRowRenderProps} from './types';

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
// Selection Context
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SelectionContextValue<T = any> {
  getIsItemSelected: (item: T) => boolean;
  onSelectItem: (event: {item: T; isSelected: boolean}) => void;
  onSelectAll: (event: {isAllSelected: boolean}) => void;
  getIsAllSelected: () => boolean;
  getIsIndeterminate?: () => boolean;
  getIsItemSelectable?: (item: T) => boolean;
  getIsItemEnabled?: (item: T) => boolean;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

// =============================================================================
// Checkbox Components
// =============================================================================

function SelectAllCheckbox() {
  const ctx = useContext(SelectionContext);
  if (!ctx) return null;
  const allSelected = ctx.getIsAllSelected();
  const indeterminate = ctx.getIsIndeterminate?.() ?? false;
  return (
    <XDSCheckboxInput
      label="Select all rows"
      isLabelHidden
      value={allSelected ? true : indeterminate ? 'indeterminate' : false}
      onChange={() => ctx.onSelectAll({isAllSelected: !allSelected})}
      size="sm"
    />
  );
}

function SelectionRowCheckbox<T>({item}: {item: T}) {
  const ctx = useContext(SelectionContext);
  if (!ctx) return null;
  const selectable = ctx.getIsItemSelectable?.(item) ?? true;
  if (!selectable) return null;
  const selected = ctx.getIsItemSelected(item);
  const enabled = ctx.getIsItemEnabled?.(item) ?? true;
  return (
    <XDSCheckboxInput
      label="Select row"
      isLabelHidden
      value={selected}
      onChange={() => ctx.onSelectItem({item, isSelected: !selected})}
      isDisabled={!enabled}
      size="sm"
    />
  );
}

/**
 * Reads selection state from context and imperatively applies
 * `aria-selected` to the parent `<tr>`.
 * This ensures selection attributes stay reactive even when the
 * row is memoized and doesn't re-render.
 */
function SelectionRowAttributes<T>({item}: {item: T}) {
  const ctx = useContext(SelectionContext);
  const ref = useRef<HTMLTableCellElement | null>(null);

  const isSelected = ctx?.getIsItemSelected(item) ?? false;

  useEffect(() => {
    const tr = ref.current?.parentElement;
    if (!tr) return;
    if (isSelected) {
      tr.setAttribute('aria-selected', 'true');
    } else {
      tr.removeAttribute('aria-selected');
    }
  }, [isSelected]);

  // Hidden <td> to get a DOM reference for finding the parent <tr>
  return <td ref={ref} style={{display: 'none'}} aria-hidden="true" />;
}

// =============================================================================
// Styles
// =============================================================================

const selectedRowStyles = stylex.create({
  row: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },
});

const selectionCellStyles = stylex.create({
  base: {
    width: '48px',
    boxSizing: 'border-box',
  },
});

// =============================================================================
// Hook
// =============================================================================

export function useXDSTableSelection<T extends Record<string, unknown>>(
  config: UseXDSTableSelectionConfig<T>,
): TablePlugin<T> {
  const configRef = useRef(config);
  configRef.current = config;

  // Return a stable plugin object via ref to avoid unnecessary re-renders
  // of XDSBaseTable when only selection state changes. The plugin functions
  // read from configRef.current so they always use the latest config.
  const pluginRef = useRef<TablePlugin<T> | null>(null);
  if (pluginRef.current == null) {
    pluginRef.current = {
      transformTableContext(children: ReactNode) {
        return (
          <SelectionContext.Provider value={configRef.current}>
            {children}
          </SelectionContext.Provider>
        );
      },

      transformHeaderRow(props) {
        return {
          ...props,
          children: (
            <>
              <XDSTableHeaderCell {...stylex.props(selectionCellStyles.base)}>
                <SelectAllCheckbox />
              </XDSTableHeaderCell>
              {props.children}
            </>
          ),
        };
      },

      transformBodyRow(props: BodyRowRenderProps, item: T) {
        return {
          htmlProps: props.htmlProps,
          styles: props.styles,
          children: (
            <>
              <SelectionRowAttributes item={item} />
              <XDSTableCell {...stylex.props(selectionCellStyles.base)}>
                <SelectionRowCheckbox item={item} />
              </XDSTableCell>
              {props.children}
            </>
          ),
        };
      },
    };
  }

  return pluginRef.current;
}
