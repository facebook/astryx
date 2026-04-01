/**
 * @file useXDSTableSelectionState.test.tsx
 * @input useXDSTableSelectionState, useXDSTableSelection, XDSTable, React testing utilities
 * @output Tests for the selection state helper
 * @position Test file; validates disabled/selectable filtering in select-all
 */

import {describe, it, expect} from 'vitest';
import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTable} from '../../XDSTable';
import {useXDSTableSelection} from './useXDSTableSelection';
import {useXDSTableSelectionState} from './useXDSTableSelectionState';
import type {XDSTableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface TestItem extends Record<string, unknown> {
  id: string;
  name: string;
  isLocked: boolean;
  isHidden: boolean;
}

const testData: TestItem[] = [
  {id: '1', name: 'Alice', isLocked: false, isHidden: false},
  {id: '2', name: 'Bob', isLocked: false, isHidden: false},
  {id: '3', name: 'Charlie', isLocked: true, isHidden: false},
  {id: '4', name: 'Diana', isLocked: false, isHidden: true},
];

const columns: XDSTableColumn<TestItem>[] = [{key: 'name', header: 'Name'}];

// =============================================================================
// Helper
// =============================================================================

function StateHelperTable({
  data = testData,
  getIsItemEnabled,
  getIsItemSelectable,
  initialSelected = new Set<string>(),
}: {
  data?: TestItem[];
  getIsItemEnabled?: (item: TestItem) => boolean;
  getIsItemSelectable?: (item: TestItem) => boolean;
  initialSelected?: Set<string>;
}) {
  const [selectedKeys, setSelectedKeys] =
    useState<Set<string>>(initialSelected);

  const {selectionConfig} = useXDSTableSelectionState<TestItem>({
    data,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
    getIsItemEnabled,
    getIsItemSelectable,
  });

  const plugin = useXDSTableSelection<TestItem>(selectionConfig);

  return (
    <XDSTable
      data={data}
      columns={columns}
      idKey="id"
      plugins={{selection: plugin}}
    />
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('useXDSTableSelectionState', () => {
  it('select-all selects only enabled items', async () => {
    const user = userEvent.setup();
    render(<StateHelperTable getIsItemEnabled={item => !item.isLocked} />);

    await user.click(screen.getByLabelText('Select all rows'));

    const rows = screen.getAllByRole('row');
    // Alice, Bob, Diana selected (enabled)
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    // Charlie disabled — NOT selected
    expect(rows[3]).not.toHaveAttribute('aria-selected');
    // Diana enabled
    expect(rows[4]).toHaveAttribute('aria-selected', 'true');
  });

  it('select-all preserves disabled-but-selected items', async () => {
    const user = userEvent.setup();
    // Charlie (id: 3) starts selected but is disabled
    render(
      <StateHelperTable
        getIsItemEnabled={item => !item.isLocked}
        initialSelected={new Set(['3'])}
      />,
    );

    const rows = screen.getAllByRole('row');
    // Charlie should be selected (was selected before becoming disabled)
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');

    // Select all — Charlie should stay selected, others get selected
    await user.click(screen.getByLabelText('Select all rows'));

    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true'); // preserved
    expect(rows[4]).toHaveAttribute('aria-selected', 'true');
  });

  it('deselect-all preserves disabled-but-selected items', async () => {
    const user = userEvent.setup();
    // Charlie (id: 3) starts selected but is disabled
    // Alice (id: 1) also starts selected
    render(
      <StateHelperTable
        getIsItemEnabled={item => !item.isLocked}
        initialSelected={new Set(['1', '3'])}
      />,
    );

    // Click select-all first to select all enabled
    await user.click(screen.getByLabelText('Select all rows'));
    // Now deselect all
    await user.click(screen.getByLabelText('Select all rows'));

    const rows = screen.getAllByRole('row');
    // Enabled items deselected
    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    // Charlie (disabled) stays selected
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
    expect(rows[4]).not.toHaveAttribute('aria-selected');
  });

  it('non-selectable items are excluded from select-all', async () => {
    const user = userEvent.setup();
    render(<StateHelperTable getIsItemSelectable={item => !item.isHidden} />);

    await user.click(screen.getByLabelText('Select all rows'));

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
    // Diana (non-selectable) — NOT selected
    expect(rows[4]).not.toHaveAttribute('aria-selected');
  });

  it('deselect-all does not affect non-selectable items', async () => {
    const user = userEvent.setup();
    // Diana (id: 4, hidden/non-selectable) starts selected somehow
    render(
      <StateHelperTable
        getIsItemSelectable={item => !item.isHidden}
        initialSelected={new Set(['4'])}
      />,
    );

    // Select all enabled+selectable
    await user.click(screen.getByLabelText('Select all rows'));
    // Deselect all
    await user.click(screen.getByLabelText('Select all rows'));

    const rows = screen.getAllByRole('row');
    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    expect(rows[3]).not.toHaveAttribute('aria-selected');
    // Diana (non-selectable) stays selected — frozen
    expect(rows[4]).toHaveAttribute('aria-selected', 'true');
  });

  it('handles both non-selectable and disabled rows together', async () => {
    const user = userEvent.setup();
    // Charlie is disabled, Diana is non-selectable, both start selected
    render(
      <StateHelperTable
        getIsItemEnabled={item => !item.isLocked}
        getIsItemSelectable={item => !item.isHidden}
        initialSelected={new Set(['3', '4'])}
      />,
    );

    const rows = screen.getAllByRole('row');
    // Both frozen items start selected
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
    expect(rows[4]).toHaveAttribute('aria-selected', 'true');

    // Select all — only Alice and Bob are actionable
    await user.click(screen.getByLabelText('Select all rows'));

    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true'); // frozen
    expect(rows[4]).toHaveAttribute('aria-selected', 'true'); // frozen

    // Deselect all — only Alice and Bob deselected
    await user.click(screen.getByLabelText('Select all rows'));

    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true'); // still frozen
    expect(rows[4]).toHaveAttribute('aria-selected', 'true'); // still frozen
  });

  it('individual selection works normally', async () => {
    const user = userEvent.setup();
    render(<StateHelperTable />);

    const checkboxes = screen.getAllByLabelText('Select row');
    await user.click(checkboxes[1]); // Bob

    const rows = screen.getAllByRole('row');
    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).not.toHaveAttribute('aria-selected');
  });
});
