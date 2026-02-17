/**
 * @file XDSTable.selection-perf.test.tsx
 * @input XDSTable, useXDSTableSelection, React testing utilities
 * @output Performance tests for selection plugin render behavior
 * @position Test file; validates that selection changes don't cause excessive re-renders
 *
 * Tests ensure:
 * 1. Selection with memoized plugins record avoids re-rendering row content
 * 2. Inline plugins record with stable plugin values also avoids re-renders
 *    (useXDSBaseTablePlugins compares by plugin identity)
 * 3. Select-all with memoized plugins doesn't re-render row content
 */

import {describe, it, expect} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useState, useMemo} from 'react';
import userEvent from '@testing-library/user-event';
import {XDSTable} from './XDSTable';
import {useXDSTableSelection} from './useXDSTableSelection';
import type {XDSTableColumn} from './types';

// =============================================================================
// Test Data
// =============================================================================

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
  value: number;
}

const createTestData = (count: number): TestRow[] =>
  Array.from({length: count}, (_, i) => ({
    id: `row-${i}`,
    name: `Item ${i}`,
    value: i * 10,
  }));

// =============================================================================
// Selection Perf Tests
// =============================================================================

describe('Selection plugin render performance', () => {
  it('selecting a row should not re-render other rows when plugins record is memoized', async () => {
    const user = userEvent.setup();
    const cellRenderCounts: Record<string, number> = {};
    const data = createTestData(5);

    const trackingRenderCell = (row: TestRow) => {
      cellRenderCounts[row.id] = (cellRenderCounts[row.id] || 0) + 1;
      return row.name;
    };

    const columns: XDSTableColumn<TestRow>[] = [
      {key: 'id', header: 'ID'},
      {key: 'name', header: 'Name', renderCell: trackingRenderCell},
      {key: 'value', header: 'Value'},
    ];

    function TestComponent() {
      const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
          setSelectedKeys(
            isAllSelected ? new Set(data.map(d => d.id)) : new Set(),
          );
        },
        getIsAllSelected: () =>
          data.length > 0 && data.every(d => selectedKeys.has(d.id)),
        getIsIndeterminate: () => {
          const count = data.filter(d => selectedKeys.has(d.id)).length;
          return count > 0 && count < data.length;
        },
      });

      // KEY: memoize the plugins record so it's a stable reference.
      // selectionPlugin is already stable (useRef internally), so this
      // memo only recomputes if the plugin identity changes (it won't).
      const plugins = useMemo(
        () => ({selection: selectionPlugin}),
        [selectionPlugin],
      );

      return (
        <XDSTable data={data} columns={columns} idKey="id" plugins={plugins} />
      );
    }

    render(<TestComponent />);

    // Initial render: all 5 rows rendered once
    expect(cellRenderCounts['row-0']).toBe(1);
    expect(cellRenderCounts['row-1']).toBe(1);
    expect(cellRenderCounts['row-2']).toBe(1);
    expect(cellRenderCounts['row-3']).toBe(1);
    expect(cellRenderCounts['row-4']).toBe(1);

    // Select row 2
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    await act(async () => {
      await user.click(rowCheckboxes[2]);
    });

    console.log(
      'Cell render counts after selecting row 2 (memoized plugins):',
      cellRenderCounts,
    );

    // With memoized plugins record, other rows should NOT re-render.
    // Only checkboxes update via SelectionContext.
    expect(cellRenderCounts['row-0']).toBe(1);
    expect(cellRenderCounts['row-1']).toBe(1);
    expect(cellRenderCounts['row-3']).toBe(1);
    expect(cellRenderCounts['row-4']).toBe(1);
  });

  it('inline plugins record does not cause re-renders when plugin values are stable', async () => {
    const user = userEvent.setup();
    const cellRenderCounts: Record<string, number> = {};
    const data = createTestData(5);

    const trackingRenderCell = (row: TestRow) => {
      cellRenderCounts[row.id] = (cellRenderCounts[row.id] || 0) + 1;
      return row.name;
    };

    const columns: XDSTableColumn<TestRow>[] = [
      {key: 'id', header: 'ID'},
      {key: 'name', header: 'Name', renderCell: trackingRenderCell},
    ];

    function TestComponent() {
      const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
          setSelectedKeys(
            isAllSelected ? new Set(data.map(d => d.id)) : new Set(),
          );
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
          // Inline object — new reference every render, but
          // useXDSBaseTablePlugins compares plugin values by identity
          // so this is safe as long as selectionPlugin is stable (it is).
          plugins={{selection: selectionPlugin}}
        />
      );
    }

    render(<TestComponent />);

    expect(cellRenderCounts['row-0']).toBe(1);

    const rowCheckboxes = screen.getAllByLabelText('Select row');
    await act(async () => {
      await user.click(rowCheckboxes[0]);
    });

    console.log(
      'Cell render counts after selection (inline plugins):',
      cellRenderCounts,
    );

    // With useXDSBaseTablePlugins, inline plugin records are compared by
    // plugin value identity. Since selectionPlugin is stable (useRef internally),
    // the merged array stays the same — no unnecessary row re-renders.
    expect(cellRenderCounts['row-0']).toBe(1);
    expect(cellRenderCounts['row-1']).toBe(1);
    expect(cellRenderCounts['row-2']).toBe(1);
    expect(cellRenderCounts['row-3']).toBe(1);
    expect(cellRenderCounts['row-4']).toBe(1);
  });

  it('select-all should not re-render row content when plugins are memoized', async () => {
    const user = userEvent.setup();
    const cellRenderCounts: Record<string, number> = {};
    const data = createTestData(10);

    const trackingRenderCell = (row: TestRow) => {
      cellRenderCounts[row.id] = (cellRenderCounts[row.id] || 0) + 1;
      return row.name;
    };

    const columns: XDSTableColumn<TestRow>[] = [
      {key: 'id', header: 'ID'},
      {key: 'name', header: 'Name', renderCell: trackingRenderCell},
    ];

    function TestComponent() {
      const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
          setSelectedKeys(
            isAllSelected ? new Set(data.map(d => d.id)) : new Set(),
          );
        },
        getIsAllSelected: () =>
          data.length > 0 && data.every(d => selectedKeys.has(d.id)),
        getIsIndeterminate: () => {
          const count = data.filter(d => selectedKeys.has(d.id)).length;
          return count > 0 && count < data.length;
        },
      });

      const plugins = useMemo(
        () => ({selection: selectionPlugin}),
        [selectionPlugin],
      );

      return (
        <XDSTable data={data} columns={columns} idKey="id" plugins={plugins} />
      );
    }

    render(<TestComponent />);

    for (let i = 0; i < 10; i++) {
      expect(cellRenderCounts[`row-${i}`]).toBe(1);
    }

    // Click select-all
    const selectAll = screen.getByLabelText('Select all rows');
    await act(async () => {
      await user.click(selectAll);
    });

    console.log(
      'Cell render counts after select-all (memoized):',
      cellRenderCounts,
    );

    // Row content cells should not re-render — only checkboxes update
    for (let i = 0; i < 10; i++) {
      expect(cellRenderCounts[`row-${i}`]).toBe(1);
    }
  });

  it('multiple sequential selections should not accumulate row re-renders', async () => {
    const user = userEvent.setup();
    const cellRenderCounts: Record<string, number> = {};
    const data = createTestData(5);

    const trackingRenderCell = (row: TestRow) => {
      cellRenderCounts[row.id] = (cellRenderCounts[row.id] || 0) + 1;
      return row.name;
    };

    const columns: XDSTableColumn<TestRow>[] = [
      {key: 'name', header: 'Name', renderCell: trackingRenderCell},
    ];

    function TestComponent() {
      const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
          setSelectedKeys(
            isAllSelected ? new Set(data.map(d => d.id)) : new Set(),
          );
        },
        getIsAllSelected: () =>
          data.length > 0 && data.every(d => selectedKeys.has(d.id)),
        getIsIndeterminate: () => {
          const count = data.filter(d => selectedKeys.has(d.id)).length;
          return count > 0 && count < data.length;
        },
      });

      const plugins = useMemo(
        () => ({selection: selectionPlugin}),
        [selectionPlugin],
      );

      return (
        <XDSTable data={data} columns={columns} idKey="id" plugins={plugins} />
      );
    }

    render(<TestComponent />);

    const rowCheckboxes = screen.getAllByLabelText('Select row');

    // Select row 0, then row 1, then row 2
    await act(async () => {
      await user.click(rowCheckboxes[0]);
    });
    await act(async () => {
      await user.click(rowCheckboxes[1]);
    });
    await act(async () => {
      await user.click(rowCheckboxes[2]);
    });

    console.log(
      'Cell render counts after 3 selections (memoized):',
      cellRenderCounts,
    );

    // After 3 selection changes, unaffected rows should still only
    // have rendered once (initial render)
    expect(cellRenderCounts['row-3']).toBe(1);
    expect(cellRenderCounts['row-4']).toBe(1);
  });
});
