/**
 * @file useXDSTableSelection.tsx
 * @input React, types, XDSCheckboxInput, XDSTableCell, XDSTableHeaderCell, theme tokens
 * @output Exports useXDSTableSelection hook and UseXDSTableSelectionConfig type
 * @position Selection plugin; consumed by XDSTable via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/README.md (selection documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {createContext, useContext, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../../../theme/tokens.stylex';
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
// Selection Context (for checkbox components to re-render independently)
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
  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode) {
        return (
          <SelectionContext.Provider value={config}>
            {children}
          </SelectionContext.Provider>
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
        const isSelected = config.getIsItemSelected(item);
        return {
          htmlProps: {
            ...props.htmlProps,
            'aria-selected': isSelected || undefined,
          },
          styles: isSelected
            ? [...props.styles, selectedRowStyles.row]
            : props.styles,
          children: (
            <>
              <XDSTableCell xstyle={selectionCellStyles.base}>
                <SelectionRowCheckbox item={item} />
              </XDSTableCell>
              {props.children}
            </>
          ),
        };
      },
    }),
    [config],
  );
}
