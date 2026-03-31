/**
 * @file useXDSTablePagination-perf.test.tsx
 * @input useXDSTablePagination, XDSTable, React testing utilities
 * @output Performance tests for pagination plugin render behavior
 * @position Test file; validates plugin identity stability and render efficiency
 *
 * The pagination plugin should produce a referentially stable plugin object
 * so that page/pageSize changes don't cause the entire table to re-render.
 */

import {describe, it, expect} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useState, useMemo, useRef, useEffect} from 'react';
import {XDSTable} from '../../XDSTable';
import {useXDSTablePagination} from './useXDSTablePagination';
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

/**
 * Tracks how many times the plugin reference changes across renders.
 */
function PluginStabilityTracker({
  data,
  pluginChanges,
}: {
  data: TestRow[];
  pluginChanges: {count: number};
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const pagination = useXDSTablePagination<TestRow>({
    page,
    onPageChange: setPage,
    totalItems: data.length,
    pageSize,
    onPageSizeChange: setPageSize,
    pageSizeOptions: [5, 10, 20],
  });

  const prevPluginRef = useRef(pagination.plugin);
  useEffect(() => {
    if (prevPluginRef.current !== pagination.plugin) {
      pluginChanges.count++;
      prevPluginRef.current = pagination.plugin;
    }
  });

  const columns = useMemo<XDSTableColumn<TestRow>[]>(
    () => [{key: 'name', header: 'Name'}],
    [],
  );

  return (
    <div>
      <button data-testid="next-page" onClick={() => setPage(p => p + 1)}>
        Next
      </button>
      <button data-testid="prev-page" onClick={() => setPage(p => p - 1)}>
        Prev
      </button>
      <button data-testid="change-size" onClick={() => setPageSize(10)}>
        Size 10
      </button>
      <span data-testid="page">{page}</span>
      <XDSTable
        data={pagination.paginatedData(data)}
        columns={columns}
        idKey="id"
        plugins={{pagination: pagination.plugin}}
      />
    </div>
  );
}

/**
 * Table with render counting per row to verify pagination changes
 * don't cause all rows to re-render.
 */
function PaginationRenderCountTable({
  data,
  renderCounts,
}: {
  data: TestRow[];
  renderCounts: Record<string, number>;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const pagination = useXDSTablePagination<TestRow>({
    page,
    onPageChange: setPage,
    totalItems: data.length,
    pageSize,
  });

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

  return (
    <div>
      <button data-testid="next-page" onClick={() => setPage(p => p + 1)}>
        Next
      </button>
      <XDSTable
        data={pagination.paginatedData(data)}
        columns={columns}
        idKey="id"
        plugins={{pagination: pagination.plugin}}
      />
    </div>
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('Pagination plugin render performance', () => {
  it('plugin identity should be stable across page changes', async () => {
    const data = createTestData(20);
    const pluginChanges = {count: 0};

    render(<PluginStabilityTracker data={data} pluginChanges={pluginChanges} />);

    // Go to page 2
    await act(async () => {
      screen.getByTestId('next-page').click();
    });

    // Go to page 3
    await act(async () => {
      screen.getByTestId('next-page').click();
    });

    expect(screen.getByTestId('page').textContent).toBe('3');
    // Plugin reference should NOT have changed
    expect(pluginChanges.count).toBe(0);
  });

  it('plugin identity should be stable across pageSize changes', async () => {
    const data = createTestData(20);
    const pluginChanges = {count: 0};

    render(<PluginStabilityTracker data={data} pluginChanges={pluginChanges} />);

    // Change page size
    await act(async () => {
      screen.getByTestId('change-size').click();
    });

    // Plugin reference should NOT have changed
    expect(pluginChanges.count).toBe(0);
  });

  it('page change should not re-render rows that remain visible', async () => {
    // 20 items, pageSize 5 — page 1 shows rows 0-4, page 2 shows rows 5-9
    const data = createTestData(20);
    const renderCounts: Record<string, number> = {};

    render(
      <PaginationRenderCountTable data={data} renderCounts={renderCounts} />,
    );

    // Initial render: rows 0-4 rendered once each
    const initialCounts = {...renderCounts};
    expect(Object.keys(initialCounts)).toHaveLength(5);

    // Navigate to page 2
    await act(async () => {
      screen.getByTestId('next-page').click();
    });

    // Page 1 rows (0-4) should NOT have re-rendered — they're not in the DOM
    for (let i = 0; i < 5; i++) {
      expect(renderCounts[`row-${i}`]).toBe(initialCounts[`row-${i}`]);
    }

    // Page 2 rows (5-9) should each have rendered exactly once
    for (let i = 5; i < 10; i++) {
      expect(renderCounts[`row-${i}`]).toBe(1);
    }
  });

  it('paginatedData should return stable reference when page/pageSize unchanged', () => {
    const data = createTestData(20);
    let capturedPaginatedData: ((d: TestRow[]) => TestRow[]) | null = null;
    let renderCount = 0;

    function TestComponent() {
      const [, setForceUpdate] = useState(0);
      renderCount++;

      const pagination = useXDSTablePagination<TestRow>({
        page: 1,
        onPageChange: () => {},
        totalItems: data.length,
        pageSize: 5,
      });

      capturedPaginatedData = pagination.paginatedData;

      return (
        <button
          data-testid="force-update"
          onClick={() => setForceUpdate(n => n + 1)}>
          Force
        </button>
      );
    }

    render(<TestComponent />);
    const firstRef = capturedPaginatedData;
    expect(renderCount).toBe(1);

    // Force re-render without changing page or pageSize
    act(() => {
      screen.getByTestId('force-update').click();
    });

    expect(renderCount).toBe(2);
    // paginatedData should be the same reference
    expect(capturedPaginatedData).toBe(firstRef);
  });
});
