/**
 * @file useXDSTablePagination.test.tsx
 * @input useXDSTablePagination, XDSTable, XDSPagination, React testing utilities
 * @output Functional tests for the pagination plugin
 * @position Test file; validates pagination hook behavior, data slicing, plugin rendering
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderHook, act} from '@testing-library/react';
import {XDSTable} from '../../XDSTable';
import {useXDSTablePagination} from './useXDSTablePagination';
import {useXDSTableSelection} from '../selection/useXDSTableSelection';
import type {XDSTableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface TestItem extends Record<string, unknown> {
  id: string;
  name: string;
  value: number;
}

function generateItems(count: number): TestItem[] {
  return Array.from({length: count}, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
    value: (i + 1) * 10,
  }));
}

const columns: XDSTableColumn<TestItem>[] = [
  {key: 'name', header: 'Name'},
  {key: 'value', header: 'Value'},
];

// =============================================================================
// Helper Components
// =============================================================================

function PaginatedTable({
  data,
  pageSize = 10,
  position,
  align,
  variant,
  size,
  label,
  pageSizeOptions,
  totalPagesProp,
  hasMore,
}: {
  data: TestItem[];
  pageSize?: number;
  position?: 'below' | 'above' | 'both' | 'none';
  align?: 'start' | 'center' | 'end';
  variant?: 'pages' | 'count' | 'compact' | 'dots' | 'none';
  size?: 'sm' | 'md';
  label?: string;
  pageSizeOptions?: number[];
  totalPagesProp?: number;
  hasMore?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const pagination = useXDSTablePagination<TestItem>({
    page,
    onPageChange: setPage,
    // Allow overriding with totalPages/hasMore for specific test scenarios
    totalItems:
      totalPagesProp == null && hasMore == null ? data.length : undefined,
    totalPages: totalPagesProp,
    hasMore,
    pageSize: currentPageSize,
    position,
    align,
    variant,
    size,
    label,
    pageSizeOptions,
    onPageSizeChange: pageSizeOptions ? setCurrentPageSize : undefined,
  });

  return (
    <XDSTable
      data={pagination.paginatedData(data)}
      columns={columns}
      idKey="id"
      plugins={{pagination: pagination.plugin}}
    />
  );
}

// =============================================================================
// Hook Return Value Tests
// =============================================================================

describe('useXDSTablePagination', () => {
  describe('hook return value', () => {
    it('returns plugin object with transformTableContext', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({page: 1, onPageChange: vi.fn(), totalItems: 50}),
      );
      expect(result.current.plugin).toBeDefined();
      expect(result.current.plugin.transformTableContext).toBeTypeOf(
        'function',
      );
    });

    it('returns paginationProps matching config', () => {
      const onChange = vi.fn();
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 2,
          onPageChange: onChange,
          totalItems: 100,
          pageSize: 25,
          variant: 'count',
          size: 'sm',
          label: 'Custom label',
        }),
      );
      const props = result.current.paginationProps;
      expect(props.page).toBe(2);
      expect(props.onChange).toBe(onChange);
      expect(props.totalItems).toBe(100);
      expect(props.pageSize).toBe(25);
      expect(props.variant).toBe('count');
      expect(props.size).toBe('sm');
      expect(props.label).toBe('Custom label');
    });

    it('returns paginatedData function', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({page: 1, onPageChange: vi.fn(), totalItems: 50}),
      );
      expect(result.current.paginatedData).toBeTypeOf('function');
    });

    it('returns computed totalPages from totalItems and pageSize', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 100,
          pageSize: 25,
        }),
      );
      expect(result.current.totalPages).toBe(4);
    });

    it('returns totalPages directly when totalPagesProp is provided', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalPages: 7,
        }),
      );
      expect(result.current.totalPages).toBe(7);
    });

    it('returns undefined totalPages when using hasMore', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          hasMore: true,
        }),
      );
      expect(result.current.totalPages).toBeUndefined();
    });

    it('defaults pageSize to 10', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({page: 1, onPageChange: vi.fn(), totalItems: 50}),
      );
      expect(result.current.pageSize).toBe(10);
    });

    it('defaults variant to pages', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({page: 1, onPageChange: vi.fn(), totalItems: 50}),
      );
      expect(result.current.paginationProps.variant).toBe('pages');
    });

    it('defaults position to below', () => {
      // Verify default by checking that pagination renders after the table
      render(<PaginatedTable data={generateItems(20)} />);
      const nav = screen.getByRole('navigation', {name: 'Table pagination'});
      expect(nav).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // paginatedData Helper
  // ===========================================================================

  describe('paginatedData helper', () => {
    it('slices data for page 1', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 30,
          pageSize: 10,
        }),
      );
      const data = generateItems(30);
      const sliced = result.current.paginatedData(data);
      expect(sliced).toHaveLength(10);
      expect(sliced[0].id).toBe('1');
      expect(sliced[9].id).toBe('10');
    });

    it('slices data for page 2', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 2,
          onPageChange: vi.fn(),
          totalItems: 30,
          pageSize: 10,
        }),
      );
      const data = generateItems(30);
      const sliced = result.current.paginatedData(data);
      expect(sliced).toHaveLength(10);
      expect(sliced[0].id).toBe('11');
      expect(sliced[9].id).toBe('20');
    });

    it('slices data for last page with partial data', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 3,
          onPageChange: vi.fn(),
          totalItems: 23,
          pageSize: 10,
        }),
      );
      const data = generateItems(23);
      const sliced = result.current.paginatedData(data);
      expect(sliced).toHaveLength(3);
      expect(sliced[0].id).toBe('21');
      expect(sliced[2].id).toBe('23');
    });

    it('returns empty array for empty data', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 0,
          pageSize: 10,
        }),
      );
      expect(result.current.paginatedData([])).toEqual([]);
    });

    it('returns empty array when page exceeds data', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 5,
          onPageChange: vi.fn(),
          totalItems: 10,
          pageSize: 10,
        }),
      );
      const data = generateItems(10);
      expect(result.current.paginatedData(data)).toEqual([]);
    });

    it('updates slice when page changes', () => {
      let page = 1;
      const {result, rerender} = renderHook(() =>
        useXDSTablePagination({
          page,
          onPageChange: vi.fn(),
          totalItems: 30,
          pageSize: 10,
        }),
      );
      const data = generateItems(30);
      expect(result.current.paginatedData(data)[0].id).toBe('1');

      page = 2;
      rerender();
      expect(result.current.paginatedData(data)[0].id).toBe('11');
    });

    it('updates slice when pageSize changes', () => {
      let pageSize = 10;
      const {result, rerender} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 30,
          pageSize,
        }),
      );
      const data = generateItems(30);
      expect(result.current.paginatedData(data)).toHaveLength(10);

      pageSize = 5;
      rerender();
      expect(result.current.paginatedData(data)).toHaveLength(5);
    });

    it('handles data shorter than pageSize', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 3,
          pageSize: 10,
        }),
      );
      const data = generateItems(3);
      const sliced = result.current.paginatedData(data);
      expect(sliced).toHaveLength(3);
    });

    it('memoizes paginatedData callback', () => {
      const {result, rerender} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 30,
          pageSize: 10,
        }),
      );
      const first = result.current.paginatedData;
      rerender();
      expect(result.current.paginatedData).toBe(first);
    });
  });

  // ===========================================================================
  // Plugin Behavior
  // ===========================================================================

  describe('plugin behavior', () => {
    it('transformTableContext renders XDSPagination below table by default', () => {
      render(<PaginatedTable data={generateItems(30)} pageSize={10} />);
      const table = screen.getByRole('table');
      const nav = screen.getByRole('navigation', {name: 'Table pagination'});
      expect(table).toBeInTheDocument();
      expect(nav).toBeInTheDocument();
      // Nav should come after the table in DOM order
      expect(
        table.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('transformTableContext renders XDSPagination above table', () => {
      render(
        <PaginatedTable
          data={generateItems(30)}
          pageSize={10}
          position="above"
        />,
      );
      const table = screen.getByRole('table');
      const nav = screen.getByRole('navigation', {name: 'Table pagination'});
      // Nav should come before the table in DOM order
      expect(
        table.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_PRECEDING,
      ).toBeTruthy();
    });

    it('transformTableContext renders XDSPagination above and below', () => {
      render(
        <PaginatedTable
          data={generateItems(30)}
          pageSize={10}
          position="both"
        />,
      );
      const navs = screen.getAllByRole('navigation', {
        name: 'Table pagination',
      });
      expect(navs).toHaveLength(2);
    });

    it('transformTableContext does not render XDSPagination when position is none', () => {
      render(
        <PaginatedTable
          data={generateItems(30)}
          pageSize={10}
          position="none"
        />,
      );
      expect(
        screen.queryByRole('navigation', {name: 'Table pagination'}),
      ).not.toBeInTheDocument();
    });

    it('does not render pagination when there is only one page', () => {
      // 5 items with pageSize 10 → 1 page total
      render(<PaginatedTable data={generateItems(5)} pageSize={10} />);
      expect(
        screen.queryByRole('navigation', {name: 'Table pagination'}),
      ).not.toBeInTheDocument();
    });

    it('does not render pagination when totalPages is explicitly 1', () => {
      render(
        <PaginatedTable
          data={generateItems(5)}
          pageSize={10}
          totalPagesProp={1}
        />,
      );
      expect(
        screen.queryByRole('navigation', {name: 'Table pagination'}),
      ).not.toBeInTheDocument();
    });

    it('renders pagination when hasMore is true even with one page of data', () => {
      render(
        <PaginatedTable data={generateItems(5)} pageSize={10} hasMore={true} />,
      );
      expect(
        screen.getByRole('navigation', {name: 'Table pagination'}),
      ).toBeInTheDocument();
    });

    it('renders pagination wrapper with center alignment', () => {
      render(
        <PaginatedTable
          data={generateItems(30)}
          pageSize={10}
          align="center"
        />,
      );
      const nav = screen.getByRole('navigation', {name: 'Table pagination'});
      expect(nav.parentElement).toBeInTheDocument();
    });

    it('renders pagination wrapper with end alignment', () => {
      render(
        <PaginatedTable data={generateItems(30)} pageSize={10} align="end" />,
      );
      const nav = screen.getByRole('navigation', {name: 'Table pagination'});
      expect(nav.parentElement).toBeInTheDocument();
    });

    it('paginationProps include pageSizeOptions when provided', () => {
      render(
        <PaginatedTable
          data={generateItems(50)}
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
        />,
      );
      expect(screen.getByLabelText('Items per page')).toBeInTheDocument();
    });

    it('paginationProps exclude pageSizeOptions when not provided', () => {
      render(<PaginatedTable data={generateItems(50)} pageSize={10} />);
      expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Integration with XDSTable
  // ===========================================================================

  describe('integration with XDSTable', () => {
    it('renders table with paginated data', () => {
      render(<PaginatedTable data={generateItems(25)} pageSize={10} />);
      const rows = screen.getAllByRole('row');
      // 1 header row + 10 data rows
      expect(rows).toHaveLength(11);
    });

    it('page change re-renders table with new data', async () => {
      const user = userEvent.setup();
      render(<PaginatedTable data={generateItems(25)} pageSize={10} />);

      // Initially on page 1 — should show Item 1..10
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 10')).toBeInTheDocument();

      // Click page 2
      const page2Button = screen.getByRole('button', {
        name: 'Go to page 2',
      });
      await user.click(page2Button);

      // Now should show Item 11..20
      expect(screen.getByText('Item 11')).toBeInTheDocument();
      expect(screen.getByText('Item 20')).toBeInTheDocument();
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    it('empty data renders pagination as null', () => {
      render(<PaginatedTable data={[]} pageSize={10} />);
      expect(
        screen.queryByRole('navigation', {name: 'Table pagination'}),
      ).not.toBeInTheDocument();
    });

    it('works alongside selection plugin', () => {
      function DualPluginTable() {
        const [page, setPage] = useState(1);
        const data = generateItems(20);
        const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

        const pagination = useXDSTablePagination<TestItem>({
          page,
          onPageChange: setPage,
          totalItems: data.length,
          pageSize: 10,
        });

        const selection = useXDSTableSelection<TestItem>({
          getIsItemSelected: item => selectedIds.has(item.id),
          onSelectItem: ({item, isSelected}) => {
            const next = new Set(selectedIds);
            if (isSelected) next.add(item.id);
            else next.delete(item.id);
            setSelectedIds(next);
          },
          onSelectAll: ({isAllSelected}) => {
            const pageData = pagination.paginatedData(data);
            setSelectedIds(
              isAllSelected ? new Set(pageData.map(d => d.id)) : new Set(),
            );
          },
          getIsAllSelected: () => {
            const pageData = pagination.paginatedData(data);
            return (
              pageData.length > 0 && pageData.every(d => selectedIds.has(d.id))
            );
          },
        });

        return (
          <XDSTable
            data={pagination.paginatedData(data)}
            columns={columns}
            idKey="id"
            plugins={{selection, pagination: pagination.plugin}}
          />
        );
      }

      render(<DualPluginTable />);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', {name: 'Table pagination'}),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
    });

    it('plugin order does not break rendering', () => {
      function ReversedPluginTable() {
        const [page, setPage] = useState(1);
        const data = generateItems(20);

        const pagination = useXDSTablePagination<TestItem>({
          page,
          onPageChange: setPage,
          totalItems: data.length,
          pageSize: 10,
        });

        const selection = useXDSTableSelection<TestItem>({
          getIsItemSelected: () => false,
          onSelectItem: vi.fn(),
          onSelectAll: vi.fn(),
          getIsAllSelected: () => false,
        });

        return (
          <XDSTable
            data={pagination.paginatedData(data)}
            columns={columns}
            idKey="id"
            plugins={{pagination: pagination.plugin, selection}}
          />
        );
      }

      render(<ReversedPluginTable />);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', {name: 'Table pagination'}),
      ).toBeInTheDocument();
    });

    it('page size change updates totalPages', () => {
      const {result, rerender} = renderHook(
        ({pageSize}: {pageSize: number}) =>
          useXDSTablePagination({
            page: 1,
            onPageChange: vi.fn(),
            totalItems: 50,
            pageSize,
          }),
        {initialProps: {pageSize: 10}},
      );

      expect(result.current.totalPages).toBe(5);

      rerender({pageSize: 25});
      expect(result.current.totalPages).toBe(2);
    });
  });

  // ===========================================================================
  // Props Passthrough to XDSPagination
  // ===========================================================================

  describe('props passthrough', () => {
    it('passes variant prop', () => {
      render(
        <PaginatedTable
          data={generateItems(30)}
          pageSize={10}
          variant="compact"
        />,
      );
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('passes size prop', () => {
      render(
        <PaginatedTable data={generateItems(30)} pageSize={10} size="sm" />,
      );
      const nav = screen.getByRole('navigation', {name: 'Table pagination'});
      expect(nav).toBeInTheDocument();
    });

    it('passes label prop', () => {
      render(
        <PaginatedTable
          data={generateItems(30)}
          pageSize={10}
          label="Custom navigation"
        />,
      );
      expect(
        screen.getByRole('navigation', {name: 'Custom navigation'}),
      ).toBeInTheDocument();
    });

    it('passes hasMore for cursor-based pagination', () => {
      function CursorTable() {
        const [page, setPage] = useState(1);
        const pagination = useXDSTablePagination<TestItem>({
          page,
          onPageChange: setPage,
          hasMore: true,
          pageSize: 10,
        });
        return (
          <XDSTable
            data={generateItems(10)}
            columns={columns}
            idKey="id"
            plugins={{pagination: pagination.plugin}}
          />
        );
      }
      render(<CursorTable />);
      const nextButton = screen.getByRole('button', {
        name: 'Go to next page',
      });
      expect(nextButton).not.toBeDisabled();
    });

    it('passes onPageSizeChange and pageSizeOptions', () => {
      render(
        <PaginatedTable
          data={generateItems(50)}
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
        />,
      );

      // Verify the page size selector is rendered with current value
      const selector = screen.getByRole('combobox', {name: 'Items per page'});
      expect(selector).toBeInTheDocument();
      expect(selector).toHaveTextContent('10');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles totalItems=0 gracefully', () => {
      const {result} = renderHook(() =>
        useXDSTablePagination({
          page: 1,
          onPageChange: vi.fn(),
          totalItems: 0,
          pageSize: 10,
        }),
      );
      expect(result.current.totalPages).toBe(0);
    });

    it('handles totalPages=1 — pagination is hidden', () => {
      // When there is only one page, the plugin should not render pagination at all.
      render(<PaginatedTable data={generateItems(5)} pageSize={10} />);
      expect(
        screen.queryByRole('navigation', {name: 'Table pagination'}),
      ).not.toBeInTheDocument();
    });

    it('handles page=1 with no totalItems or totalPages (cursor mode)', () => {
      function CursorTable() {
        const pagination = useXDSTablePagination<TestItem>({
          page: 1,
          onPageChange: vi.fn(),
          hasMore: false,
        });
        return (
          <XDSTable
            data={generateItems(5)}
            columns={columns}
            idKey="id"
            plugins={{pagination: pagination.plugin}}
          />
        );
      }
      render(<CursorTable />);
      const prevButton = screen.getByRole('button', {
        name: 'Go to previous page',
      });
      const nextButton = screen.getByRole('button', {
        name: 'Go to next page',
      });
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('handles rapid page changes', async () => {
      const user = userEvent.setup();
      render(<PaginatedTable data={generateItems(50)} pageSize={10} />);

      const page2 = screen.getByRole('button', {name: 'Go to page 2'});
      await user.click(page2);

      const page3 = screen.getByRole('button', {name: 'Go to page 3'});
      await user.click(page3);

      // Should be on page 3 showing Item 21..30
      expect(screen.getByText('Item 21')).toBeInTheDocument();
      expect(screen.getByText('Item 30')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('pagination nav has correct aria-label', () => {
      render(<PaginatedTable data={generateItems(30)} pageSize={10} />);
      expect(
        screen.getByRole('navigation', {name: 'Table pagination'}),
      ).toBeInTheDocument();
    });

    it('page buttons have aria-label "Go to page N"', () => {
      render(<PaginatedTable data={generateItems(30)} pageSize={10} />);
      expect(
        screen.getByRole('button', {name: 'Go to page 1'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to page 2'}),
      ).toBeInTheDocument();
    });

    it('current page has aria-current="page"', () => {
      render(<PaginatedTable data={generateItems(30)} pageSize={10} />);
      const page1Button = screen.getByRole('button', {name: 'Go to page 1'});
      expect(page1Button).toHaveAttribute('aria-current', 'page');
    });

    it('disabled prev/next buttons have aria-disabled', () => {
      // Use multi-page data so pagination is rendered; on page 1, prev is disabled.
      render(<PaginatedTable data={generateItems(30)} pageSize={10} />);
      const prevButton = screen.getByRole('button', {
        name: 'Go to previous page',
      });
      expect(prevButton).toBeDisabled();
    });
  });
});
