// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableSelection.test.tsx
 * @input useTableSelection, Table, React testing utilities
 * @output Functional tests for the selection plugin
 * @position Test file; validates selection behavior (checkboxes, aria, select-all)
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {act, render, renderHook, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Table} from '../../Table';
import {useTableSelection} from './useTableSelection';
import type {BodyRowRenderProps, TableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface SelectableUser extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  isLocked: boolean;
}

const selectableUsers: SelectableUser[] = [
  {id: '1', name: 'Alice', role: 'engineer', isLocked: false},
  {id: '2', name: 'Bob', role: 'admin', isLocked: false},
  {id: '3', name: 'Charlie', role: 'designer', isLocked: true},
];

const selectableColumns: TableColumn<SelectableUser>[] = [
  {key: 'name', header: 'Name'},
  {key: 'role', header: 'Role'},
];

function SelectionTable({
  getIsItemSelectable,
  getIsItemEnabled,
}: {
  getIsItemSelectable?: (item: SelectableUser) => boolean;
  getIsItemEnabled?: (item: SelectableUser) => boolean;
}) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const nonAdminUsers = getIsItemSelectable
    ? selectableUsers.filter(getIsItemSelectable)
    : selectableUsers;

  const selectionPlugin = useTableSelection<SelectableUser>({
    getIsItemSelected: item => selectedKeys.has(item.id),
    onSelectItem: ({item, isSelected}) => {
      const next = new Set(selectedKeys);
      if (isSelected) {
        next.add(item.id);
      } else {
        next.delete(item.id);
      }
      setSelectedKeys(next);
    },
    onSelectAll: ({isAllSelected}) => {
      setSelectedKeys(
        isAllSelected ? new Set(nonAdminUsers.map(u => u.id)) : new Set(),
      );
    },
    getIsAllSelected: () =>
      nonAdminUsers.length > 0 &&
      nonAdminUsers.every(u => selectedKeys.has(u.id)),
    getIsIndeterminate: () => {
      const count = nonAdminUsers.filter(u => selectedKeys.has(u.id)).length;
      return count > 0 && count < nonAdminUsers.length;
    },
    getIsItemSelectable,
    getIsItemEnabled,
  });

  return (
    <Table
      data={selectableUsers}
      columns={selectableColumns}
      idKey="id"
      plugins={{selection: selectionPlugin}}
    />
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('useTableSelection', () => {
  it('renders selection checkboxes in header and body rows', () => {
    render(<SelectionTable />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
  });

  it('renders header checkbox with "Select all rows" label', () => {
    render(<SelectionTable />);
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
  });

  it('renders row checkboxes with "Select row" label', () => {
    render(<SelectionTable />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    expect(rowCheckboxes).toHaveLength(3);
  });

  it('toggles individual row selection on click', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');

    await user.click(rowCheckboxes[0]);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    expect(rows[3]).not.toHaveAttribute('aria-selected');
  });

  it('deselects a selected row on click', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');

    await user.click(rowCheckboxes[0]);
    expect(screen.getAllByRole('row')[1]).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(rowCheckboxes[0]);
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('aria-selected');
  });

  it('selects all rows when select-all is clicked', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const selectAll = screen.getByLabelText('Select all rows');

    await user.click(selectAll);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
  });

  it('deselects all rows when select-all is clicked again', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const selectAll = screen.getByLabelText('Select all rows');

    await user.click(selectAll);
    await user.click(selectAll);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    expect(rows[3]).not.toHaveAttribute('aria-selected');
  });

  it('hides checkbox for non-selectable rows', () => {
    render(
      <SelectionTable getIsItemSelectable={item => item.role !== 'admin'} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('disables checkbox for disabled rows', () => {
    render(<SelectionTable getIsItemEnabled={item => !item.isLocked} />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    expect(rowCheckboxes[0]).not.toBeDisabled();
    expect(rowCheckboxes[1]).not.toBeDisabled();
    expect(rowCheckboxes[2]).toBeDisabled();
  });

  it('prepends selection <td> to each body row', () => {
    render(<SelectionTable />);
    const rows = screen.getAllByRole('row');
    const firstBodyRow = rows[1];
    const cells = within(firstBodyRow).getAllByRole('cell');
    expect(cells).toHaveLength(3);
  });

  it('prepends selection <th> to header row', () => {
    render(<SelectionTable />);
    const headerRow = screen.getAllByRole('row')[0];
    const headers = within(headerRow).getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
  });

  it('unsubscribes detached row refs instead of accumulating listeners', () => {
    const getIsItemSelected = vi.fn(() => false);
    const {result, rerender} = renderHook(() =>
      useTableSelection<SelectableUser>({
        getIsItemSelected,
        onSelectItem: vi.fn(),
        onSelectAll: vi.fn(),
        getIsAllSelected: () => false,
      }),
    );

    const initialProps: BodyRowRenderProps = {
      htmlProps: {},
      styles: [],
      children: null,
    };
    const row = document.createElement('tr');
    document.body.append(row);

    let detach: (() => void) | undefined;

    // Simulate React replacing the callback ref as this row re-renders.
    // Each detach must unsubscribe the previous ref before the next attaches.
    for (let i = 0; i < 3; i++) {
      act(() => {
        detach?.();
      });

      const transformed = result.current.transformBodyRow?.(
        initialProps,
        selectableUsers[0],
        0,
      );
      expect(transformed?.ref).toBeTypeOf('function');

      act(() => {
        const cleanup = (
          transformed?.ref as React.RefCallback<HTMLTableRowElement>
        )(row);
        expect(cleanup).toBeTypeOf('function');
        detach = cleanup as () => void;
      });
    }

    getIsItemSelected.mockClear();
    rerender();
    expect(getIsItemSelected).toHaveBeenCalledTimes(1);

    act(() => {
      detach?.();
    });
    getIsItemSelected.mockClear();
    rerender();
    expect(getIsItemSelected).not.toHaveBeenCalled();

    row.remove();
  });
});
