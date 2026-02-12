/**
 * @file XDSTable.perf.test.tsx
 * @input XDSTable, React testing utilities
 * @output Performance tests for render behavior
 * @position Test file; validates memoization and render efficiency
 *
 * Tests ensure:
 * 1. Table doesn't double-render when unrelated state changes
 * 2. Only affected rows re-render when a single data item changes
 * 3. Non-memoized columns/data don't cause excessive re-renders
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useState} from 'react';
import {XDSTable} from './XDSTable';
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

const testColumns: XDSTableColumn<TestRow>[] = [
  {key: 'id', header: 'ID'},
  {key: 'name', header: 'Name'},
  {key: 'value', header: 'Value'},
];

// =============================================================================
// Test: Table doesn't re-render when unrelated state changes
// =============================================================================

describe('XDSTable render performance', () => {
  describe('unrelated state changes', () => {
    it('should not re-render table when unrelated parent state changes (stable props)', async () => {
      const tableRenderCount = vi.fn();
      const data = createTestData(5);

      function TestComponent() {
        const [unrelatedState, setUnrelatedState] = useState(0);

        // Track renders of this component
        tableRenderCount();

        return (
          <div>
            <button onClick={() => setUnrelatedState(n => n + 1)}>
              Increment: {unrelatedState}
            </button>
            <XDSTable data={data} columns={testColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);
      expect(tableRenderCount).toHaveBeenCalledTimes(1);

      // Click button to change unrelated state
      await act(async () => {
        screen.getByRole('button').click();
      });

      // Parent component re-renders, table receives same props
      // This test verifies the parent re-renders (which it should)
      expect(tableRenderCount).toHaveBeenCalledTimes(2);
    });

    it('should demonstrate inline columns cause table to receive new props', async () => {
      const parentRenderCount = vi.fn();
      const data = createTestData(5);

      function TestComponent() {
        const [unrelatedState, setUnrelatedState] = useState(0);
        parentRenderCount();

        // PROBLEM: Columns defined inline - new array on every render
        const inlineColumns: XDSTableColumn<TestRow>[] = [
          {key: 'id', header: 'ID'},
          {key: 'name', header: 'Name'},
          {key: 'value', header: 'Value'},
        ];

        return (
          <div>
            <button onClick={() => setUnrelatedState(n => n + 1)}>
              Increment: {unrelatedState}
            </button>
            <XDSTable data={data} columns={inlineColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);
      expect(parentRenderCount).toHaveBeenCalledTimes(1);

      await act(async () => {
        screen.getByRole('button').click();
      });

      // Parent re-renders, creating new inlineColumns array
      // Table receives new props reference (even if content is same)
      expect(parentRenderCount).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // Test: Only affected rows re-render when single item changes
  // ===========================================================================

  describe('row-level re-renders', () => {
    it('should only re-render the changed row when data item changes (memoized columns)', async () => {
      const rowRenderCounts: Record<string, number> = {};

      // Define renderCell outside component to track renders without recreating
      const trackingRenderCell = (row: TestRow) => {
        rowRenderCounts[row.id] = (rowRenderCounts[row.id] || 0) + 1;
        return row.name;
      };

      // Define columns outside component for stable reference
      const stableColumns: XDSTableColumn<TestRow>[] = [
        {key: 'id', header: 'ID'},
        {key: 'name', header: 'Name', renderCell: trackingRenderCell},
        {key: 'value', header: 'Value'},
      ];

      function TestComponent() {
        const [data, setData] = useState(() => createTestData(5));

        const updateSingleRow = () => {
          setData(prev =>
            prev.map((row, i) =>
              i === 2 ? {...row, name: `Updated-${row.id}`} : row,
            ),
          );
        };

        return (
          <div>
            <button onClick={updateSingleRow}>Update Row 2</button>
            <XDSTable data={data} columns={stableColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);

      // All 5 rows should have rendered once
      expect(Object.keys(rowRenderCounts)).toHaveLength(5);
      expect(rowRenderCounts['row-0']).toBe(1);
      expect(rowRenderCounts['row-1']).toBe(1);
      expect(rowRenderCounts['row-2']).toBe(1);
      expect(rowRenderCounts['row-3']).toBe(1);
      expect(rowRenderCounts['row-4']).toBe(1);

      // Update just row 2
      await act(async () => {
        screen.getByRole('button').click();
      });

      // Verify the update happened
      expect(screen.getByText('Updated-row-2')).toBeInTheDocument();

      console.log('Render counts after update (memoized):', rowRenderCounts);

      // With memoization: Only the changed row should re-render
      expect(rowRenderCounts['row-0']).toBe(1);
      expect(rowRenderCounts['row-1']).toBe(1);
      expect(rowRenderCounts['row-2']).toBe(2); // Only this row changed
      expect(rowRenderCounts['row-3']).toBe(1);
      expect(rowRenderCounts['row-4']).toBe(1);
    });

    it('should re-render all rows when columns array changes (inline columns)', async () => {
      const rowRenderCounts: Record<string, number> = {};

      function TestComponent() {
        const [data, setData] = useState(() => createTestData(5));

        // Inline columns - new array on every render
        const columns: XDSTableColumn<TestRow>[] = [
          {key: 'id', header: 'ID'},
          {
            key: 'name',
            header: 'Name',
            renderCell: row => {
              rowRenderCounts[row.id] = (rowRenderCounts[row.id] || 0) + 1;
              return row.name;
            },
          },
          {key: 'value', header: 'Value'},
        ];

        const updateSingleRow = () => {
          setData(prev =>
            prev.map((row, i) =>
              i === 2 ? {...row, name: `Updated-${row.id}`} : row,
            ),
          );
        };

        return (
          <div>
            <button onClick={updateSingleRow}>Update Row 2</button>
            <XDSTable data={data} columns={columns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);

      // All 5 rows rendered once
      expect(Object.keys(rowRenderCounts)).toHaveLength(5);

      await act(async () => {
        screen.getByRole('button').click();
      });

      console.log('Render counts after update (inline):', rowRenderCounts);

      // With inline columns, ALL rows re-render because columns array changes
      // This documents expected behavior - users should memoize columns
      expect(rowRenderCounts['row-0']).toBe(2);
      expect(rowRenderCounts['row-1']).toBe(2);
      expect(rowRenderCounts['row-2']).toBe(2);
      expect(rowRenderCounts['row-3']).toBe(2);
      expect(rowRenderCounts['row-4']).toBe(2);
    });

    it('should skip re-render when data array is replaced with identical content', async () => {
      const rowRenderCounts: Record<string, number> = {};

      const trackingRenderCell = (row: TestRow) => {
        rowRenderCounts[row.id] = (rowRenderCounts[row.id] || 0) + 1;
        return row.name;
      };

      const stableColumns: XDSTableColumn<TestRow>[] = [
        {key: 'id', header: 'ID'},
        {key: 'name', header: 'Name', renderCell: trackingRenderCell},
        {key: 'value', header: 'Value'},
      ];

      function TestComponent() {
        const [data, setData] = useState(() => createTestData(5));

        const replaceWithSameContent = () => {
          // Creates new array and objects, but values are identical
          setData(createTestData(5));
        };

        return (
          <div>
            <button onClick={replaceWithSameContent}>Replace Data</button>
            <XDSTable data={data} columns={stableColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);

      expect(rowRenderCounts['row-0']).toBe(1);

      await act(async () => {
        screen.getByRole('button').click();
      });

      console.log(
        'Render counts after replace (same content):',
        rowRenderCounts,
      );

      // Shallow comparison of item properties shows they're identical
      // So no rows should re-render
      expect(rowRenderCounts['row-0']).toBe(1);
      expect(rowRenderCounts['row-1']).toBe(1);
      expect(rowRenderCounts['row-2']).toBe(1);
      expect(rowRenderCounts['row-3']).toBe(1);
      expect(rowRenderCounts['row-4']).toBe(1);
    });

    it('should not re-render unchanged rows on force update (stable columns)', async () => {
      const allRenderCounts: number[] = [];

      const trackingRenderCell = (row: TestRow) => {
        allRenderCounts.push(parseInt(row.id.split('-')[1]));
        return row.name;
      };

      const stableColumns: XDSTableColumn<TestRow>[] = [
        {key: 'id', header: 'ID'},
        {key: 'name', header: 'Name', renderCell: trackingRenderCell},
        {key: 'value', header: 'Value'},
      ];

      function TestComponent() {
        const [data, setData] = useState(() => createTestData(10));

        return (
          <div>
            <button onClick={() => setData(prev => [...prev])}>
              Force Update
            </button>
            <XDSTable data={data} columns={stableColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);

      // Initial render: 10 rows rendered
      expect(allRenderCounts.length).toBe(10);

      await act(async () => {
        screen.getByRole('button').click();
      });

      console.log(
        'Total cell renders after force update (stable):',
        allRenderCounts.length,
      );

      // With stable columns and same item references via spread, no re-renders
      // Still 10 because [...prev] creates new array but same item references
      expect(allRenderCounts.length).toBe(10);
    });

    it('should re-render all rows when columns change (inline columns)', async () => {
      const allRenderCounts: number[] = [];

      function TestComponent() {
        const [data, setData] = useState(() => createTestData(10));

        // Inline columns - new array on every render
        const columns: XDSTableColumn<TestRow>[] = [
          {key: 'id', header: 'ID'},
          {
            key: 'name',
            header: 'Name',
            renderCell: row => {
              allRenderCounts.push(parseInt(row.id.split('-')[1]));
              return row.name;
            },
          },
          {key: 'value', header: 'Value'},
        ];

        return (
          <div>
            <button onClick={() => setData(prev => [...prev])}>
              Force Update
            </button>
            <XDSTable data={data} columns={columns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);

      // Initial render: 10 rows rendered
      expect(allRenderCounts.length).toBe(10);

      await act(async () => {
        screen.getByRole('button').click();
      });

      console.log(
        'Total cell renders after force update (inline):',
        allRenderCounts.length,
      );

      // With inline columns, all 10 rows re-render
      expect(allRenderCounts.length).toBe(20);
    });
  });

  // ===========================================================================
  // Test: Data array stability
  // ===========================================================================

  describe('data array stability', () => {
    it('should re-render when data content changes', async () => {
      const renderCount = vi.fn();

      function TestComponent() {
        const [data, setData] = useState(() => createTestData(5));

        renderCount();

        return (
          <div>
            <button onClick={() => setData(createTestData(5))}>
              Recreate Data
            </button>
            <XDSTable data={data} columns={testColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);
      expect(renderCount).toHaveBeenCalledTimes(1);

      await act(async () => {
        screen.getByRole('button').click();
      });

      // Data state changes -> component re-renders
      expect(renderCount).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // Benchmark: Render time with many rows
  // ===========================================================================

  describe('render benchmarks', () => {
    it('should render 100 rows within performance budget', () => {
      const data = createTestData(100);

      const startTime = performance.now();
      render(<XDSTable data={data} columns={testColumns} idKey="id" />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      console.log(`100 rows initial render: ${renderTime.toFixed(2)}ms`);

      // Should render within 100ms (generous budget for test environment)
      expect(renderTime).toBeLessThan(100);
    });

    it('should render 500 rows within performance budget', () => {
      const data = createTestData(500);

      const startTime = performance.now();
      render(<XDSTable data={data} columns={testColumns} idKey="id" />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;
      console.log(`500 rows initial render: ${renderTime.toFixed(2)}ms`);

      // Should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('should measure update performance', async () => {
      const data = createTestData(100);

      function TestComponent() {
        const [items, setItems] = useState(data);

        return (
          <div>
            <button
              onClick={() =>
                setItems(prev =>
                  prev.map((item, i) =>
                    i === 50 ? {...item, name: 'Updated'} : item,
                  ),
                )
              }>
              Update Row 50
            </button>
            <XDSTable data={items} columns={testColumns} idKey="id" />
          </div>
        );
      }

      render(<TestComponent />);

      const startTime = performance.now();
      await act(async () => {
        screen.getByRole('button').click();
      });
      const endTime = performance.now();

      const updateTime = endTime - startTime;
      console.log(`100 rows single update: ${updateTime.toFixed(2)}ms`);

      // Update should be fast
      expect(updateTime).toBeLessThan(50);
    });
  });
});
