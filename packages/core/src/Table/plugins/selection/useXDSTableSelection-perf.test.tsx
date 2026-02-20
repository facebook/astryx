/**
 * @file XDSTable.selection-perf.test.tsx
 * @input XDSTable, useXDSTableSelection, React testing utilities
 * @output Performance tests for selection plugin render behavior
 * @position Test file; validates selection interaction correctness and render efficiency
 *
 * The selection plugin uses an external store so that only the row whose
 * selection state changed re-renders — not all rows in the table body.
 */

import {describe, it, expect} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useState, useMemo} from 'react';
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
// Helpers
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

/**
 * Table with render counting per row.
 * Each row's renderCell increments a counter so we can verify
 * which rows re-rendered. Columns are memoized to isolate
 * selection-related re-renders from column-change re-renders.
 */
function SelectionRenderCountTable({
  data,
  renderCounts,
}: {
  data: TestRow[];
  renderCounts: Record<string, number>;
}) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Memoize columns so that re-renders from selection state changes
  // don't cause all rows to re-render due to new column references.
  // renderCounts is a mutable object, so it's safe to close over.
  const columns = useMemo<XDSTableColumn<TestRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        renderCell: (item: TestRow) => {
          renderCounts[item.id] = (renderCounts[item.id] ?? 0) + 1;
          return item.name;
        },
      },
    ],
    [renderCounts],
  );

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

  it('selecting a row should not re-render other rows', async () => {
    const user = userEvent.setup();
    const data = createTestData(5);
    const renderCounts: Record<string, number> = {};

    render(
      <SelectionRenderCountTable data={data} renderCounts={renderCounts} />,
    );

    // Record initial render counts
    const initialCounts = {...renderCounts};
    expect(Object.keys(initialCounts)).toHaveLength(5);

    // Select row-2
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    await act(async () => {
      await user.click(rowCheckboxes[2]);
    });

    // Only row-2 should have re-rendered (count increased)
    // Other rows should keep their initial count
    for (const id of Object.keys(renderCounts)) {
      if (id === 'row-2') {
        // Selected row may re-render
        continue;
      }
      expect(renderCounts[id]).toBe(initialCounts[id]);
    }
  });

  it('deselecting a row should not re-render other rows', async () => {
    const user = userEvent.setup();
    const data = createTestData(5);
    const renderCounts: Record<string, number> = {};

    render(
      <SelectionRenderCountTable data={data} renderCounts={renderCounts} />,
    );

    // Select row-1 first
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    await act(async () => {
      await user.click(rowCheckboxes[1]);
    });

    // Reset counts
    for (const key of Object.keys(renderCounts)) {
      renderCounts[key] = 0;
    }

    // Deselect row-1
    await act(async () => {
      await user.click(rowCheckboxes[1]);
    });

    // Only row-1 should have re-rendered
    for (const id of Object.keys(renderCounts)) {
      if (id === 'row-1') continue;
      expect(renderCounts[id]).toBe(0);
    }
  });
});
