/**
 * @file XDSTable.selection-perf.test.tsx
 * @input XDSTable, useXDSTableSelection, React testing utilities
 * @output Performance tests for selection plugin render behavior
 * @position Test file; validates selection interaction correctness
 *
 * The selection plugin passes aria-selected and styles via transformBodyRow.
 * Row re-renders on selection change are expected — checkbox content
 * re-renders independently via SelectionContext.
 */

import {describe, it, expect} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useState} from 'react';
import userEvent from '@testing-library/user-event';
import {XDSTable} from '../../XDSTable';
import {useXDSTableSelection} from './useXDSTableSelection';
import type {XDSTableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
}

const createTestData = (count: number): TestRow[] =>
  Array.from({length: count}, (_, i) => ({
    id: `row-${i}`,
    name: `Item ${i}`,
  }));

// =============================================================================
// Helper
// =============================================================================

function SelectionTestTable({data}: {data: TestRow[]}) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const columns: XDSTableColumn<TestRow>[] = [{key: 'name', header: 'Name'}];

  const selectionPlugin = useXDSTableSelection<TestRow>({
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
      setSelectedKeys(isAllSelected ? new Set(data.map(d => d.id)) : new Set());
    },
    getIsAllSelected: () =>
      data.length > 0 && data.every(d => selectedKeys.has(d.id)),
    getIsIndeterminate: () => {
      const count = data.filter(d => selectedKeys.has(d.id)).length;
      return count > 0 && count < data.length;
    },
  });

  return (
    <XDSTable
      data={data}
      columns={columns}
      idKey="id"
      plugins={{selection: selectionPlugin}}
    />
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('Selection plugin render performance', () => {
  it('selecting a row updates aria-selected correctly', async () => {
    const user = userEvent.setup();
    render(<SelectionTestTable data={createTestData(5)} />);

    const rowCheckboxes = screen.getAllByLabelText('Select row');
    await act(async () => {
      await user.click(rowCheckboxes[2]);
    });

    const rows = screen.getAllByRole('row');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
  });

  it('select-all sets aria-selected on all rows', async () => {
    const user = userEvent.setup();
    render(<SelectionTestTable data={createTestData(5)} />);

    await act(async () => {
      await user.click(screen.getByLabelText('Select all rows'));
    });

    const rows = screen.getAllByRole('row');
    for (let i = 1; i <= 5; i++) {
      expect(rows[i]).toHaveAttribute('aria-selected', 'true');
    }
  });

  it('multiple sequential selections work correctly', async () => {
    const user = userEvent.setup();
    render(<SelectionTestTable data={createTestData(5)} />);

    const rowCheckboxes = screen.getAllByLabelText('Select row');
    await act(async () => {
      await user.click(rowCheckboxes[0]);
    });
    await act(async () => {
      await user.click(rowCheckboxes[1]);
    });
    await act(async () => {
      await user.click(rowCheckboxes[2]);
    });

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
    expect(rows[4]).not.toHaveAttribute('aria-selected');
    expect(rows[5]).not.toHaveAttribute('aria-selected');
  });
});
