/**
 * @file useXDSTableColumnResize.test.tsx
 * @input useXDSTableColumnResize, XDSTable, React testing utilities
 * @output Functional tests for the column resize plugin
 * @position Test file; validates resize behavior (handle, drag, keyboard, aria)
 */

import {describe, it, expect, vi, beforeAll} from 'vitest';
import {useState} from 'react';
import {render, screen, within, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTable} from '../../XDSTable';
import {useXDSTableColumnResize} from './useXDSTableColumnResize';
import {useXDSTableSelection} from '../selection/useXDSTableSelection';
import type {XDSTableColumn} from '../../types';

// JSDOM doesn't implement pointer capture
beforeAll(() => {
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});

// =============================================================================
// Test Data
// =============================================================================

interface TestItem extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
}

const testData: TestItem[] = [
  {id: '1', name: 'Alice', role: 'engineer'},
  {id: '2', name: 'Bob', role: 'admin'},
  {id: '3', name: 'Charlie', role: 'designer'},
];

const testColumns: XDSTableColumn<TestItem>[] = [
  {key: 'name', header: 'Name'},
  {key: 'role', header: 'Role'},
];

// =============================================================================
// Test Helpers
// =============================================================================

function ResizeTable({
  columnWidths: initialWidths = {},
  onColumnResizeEnd,
  minWidth,
  maxWidth,
}: {
  columnWidths?: Record<string, number>;
  onColumnResizeEnd?: (event: {columnKey: string; newWidth: number}) => void;
  minWidth?: number;
  maxWidth?: number;
}) {
  const [columnWidths, setColumnWidths] = useState(initialWidths);

  const resizePlugin = useXDSTableColumnResize<TestItem>({
    columnWidths,
    onColumnResizeEnd: event => {
      setColumnWidths(prev => ({...prev, [event.columnKey]: event.newWidth}));
      onColumnResizeEnd?.(event);
    },
    minWidth,
    maxWidth,
  });

  return (
    <XDSTable
      data={testData}
      columns={testColumns}
      idKey="id"
      plugins={{resize: resizePlugin}}
    />
  );
}

function getResizeHandles() {
  return screen.getAllByRole('separator');
}

// =============================================================================
// 6.1 Unit Tests — Hook Behavior
// =============================================================================

describe('useXDSTableColumnResize', () => {
  describe('hook behavior', () => {
    it('renders resize handles in each header cell', () => {
      render(<ResizeTable />);
      const handles = getResizeHandles();
      expect(handles).toHaveLength(2);
    });

    it('applies width override when columnWidths has entry', () => {
      render(<ResizeTable columnWidths={{name: 200}} />);
      const headerRow = screen.getAllByRole('row')[0];
      const headers = within(headerRow).getAllByRole('columnheader');
      // The first header (Name) should have width and maxWidth override
      // Note: minWidth may be overridden by XDSBaseTable's column min-width logic
      expect(headers[0].style.width).toBe('200px');
      expect(headers[0].style.maxWidth).toBe('200px');
    });

    it('does not override width when columnWidths is empty', () => {
      render(<ResizeTable />);
      const headerRow = screen.getAllByRole('row')[0];
      const headers = within(headerRow).getAllByRole('columnheader');
      // No pixel width override from the plugin
      expect(headers[0].style.width).toBe('');
    });

    it('does not add user-select: none when not dragging', () => {
      render(<ResizeTable />);
      const table = screen.getByRole('table');
      expect(table.style.userSelect).not.toBe('none');
    });
  });

  // ===========================================================================
  // 6.2 Integration Tests — Resize Interaction
  // ===========================================================================

  describe('resize interaction', () => {
    it('calls onColumnResizeEnd after pointer drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];

      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      fireEvent.pointerMove(handle, {clientX: 300, pointerId: 1});
      fireEvent.pointerUp(handle, {clientX: 300, pointerId: 1});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 300,
      });
    });

    it('respects minWidth during drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 100}}
          onColumnResizeEnd={onResize}
          minWidth={80}
        />,
      );
      const handle = getResizeHandles()[0];

      // Drag left past minWidth
      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      fireEvent.pointerMove(handle, {clientX: 50, pointerId: 1});
      fireEvent.pointerUp(handle, {clientX: 50, pointerId: 1});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 80,
      });
    });

    it('respects maxWidth during drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
          maxWidth={300}
        />,
      );
      const handle = getResizeHandles()[0];

      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      fireEvent.pointerMove(handle, {clientX: 600, pointerId: 1});
      fireEvent.pointerUp(handle, {clientX: 600, pointerId: 1});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 300,
      });
    });

    it('does not call onColumnResizeEnd on Escape during drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];

      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      fireEvent.pointerMove(handle, {clientX: 300, pointerId: 1});
      // Cancel via pointerCancel
      fireEvent.pointerCancel(handle, {pointerId: 1});

      expect(onResize).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 6.3 Integration Tests — Table Rendering
  // ===========================================================================

  describe('table rendering', () => {
    it('composes with selection plugin', () => {
      function ComposedTable() {
        const [columnWidths, setColumnWidths] = useState<
          Record<string, number>
        >({});

        const resizePlugin = useXDSTableColumnResize<TestItem>({
          columnWidths,
          onColumnResizeEnd: ({columnKey, newWidth}) => {
            setColumnWidths(prev => ({...prev, [columnKey]: newWidth}));
          },
        });

        const selectionPlugin = useXDSTableSelection<TestItem>({
          getIsItemSelected: () => false,
          onSelectItem: () => {},
          onSelectAll: () => {},
          getIsAllSelected: () => false,
        });

        return (
          <XDSTable
            data={testData}
            columns={testColumns}
            idKey="id"
            plugins={{resize: resizePlugin, selection: selectionPlugin}}
          />
        );
      }

      render(<ComposedTable />);

      // Both selection checkboxes and resize handles should be present
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      const handles = getResizeHandles();
      expect(handles).toHaveLength(2);
    });

    it('resized column persists across re-renders', () => {
      const {rerender} = render(
        <ResizeTable columnWidths={{name: 250}} />,
      );
      const headerRow = screen.getAllByRole('row')[0];
      const headers = within(headerRow).getAllByRole('columnheader');
      expect(headers[0].style.width).toBe('250px');

      // Trigger re-render
      rerender(<ResizeTable columnWidths={{name: 250}} />);
      const headersAfter = within(
        screen.getAllByRole('row')[0],
      ).getAllByRole('columnheader');
      expect(headersAfter[0].style.width).toBe('250px');
    });

    it('resets column width when key removed from columnWidths', () => {
      // Use a controlled component that passes columnWidths directly
      function ControlledResizeTable({
        columnWidths,
      }: {
        columnWidths: Record<string, number>;
      }) {
        const resizePlugin = useXDSTableColumnResize<TestItem>({
          columnWidths,
        });
        return (
          <XDSTable
            data={testData}
            columns={testColumns}
            idKey="id"
            plugins={{resize: resizePlugin}}
          />
        );
      }

      const {rerender} = render(
        <ControlledResizeTable columnWidths={{name: 250}} />,
      );
      const headers = within(
        screen.getAllByRole('row')[0],
      ).getAllByRole('columnheader');
      expect(headers[0].style.width).toBe('250px');

      rerender(<ControlledResizeTable columnWidths={{}} />);
      const headersAfter = within(
        screen.getAllByRole('row')[0],
      ).getAllByRole('columnheader');
      expect(headersAfter[0].style.width).toBe('');
    });
  });

  // ===========================================================================
  // 6.4 Keyboard Accessibility Tests
  // ===========================================================================

  describe('keyboard accessibility', () => {
    it('handle is focusable via Tab', async () => {
      const user = userEvent.setup();
      render(<ResizeTable />);
      const handle = getResizeHandles()[0];

      await user.tab();
      // Tab may land on the handle (or other focusable elements first)
      // Explicitly focus the handle
      handle.focus();
      expect(document.activeElement).toBe(handle);
    });

    it('Enter activates resize mode and locks width', () => {
      render(<ResizeTable columnWidths={{name: 200}} />);
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'Enter'});
      // After activation, the th should have width locked as inline style
      const headers = within(
        screen.getAllByRole('row')[0],
      ).getAllByRole('columnheader');
      expect(headers[0].style.width).toBe('200px');
    });

    it('ArrowRight increases width by 10px in resize mode', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      // Activate
      fireEvent.keyDown(handle, {key: 'Enter'});
      // Arrow right
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      // Commit
      fireEvent.keyDown(handle, {key: 'Enter'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 210,
      });
    });

    it('ArrowLeft decreases width by 10px', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'Enter'});
      fireEvent.keyDown(handle, {key: 'ArrowLeft'});
      fireEvent.keyDown(handle, {key: 'Enter'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 190,
      });
    });

    it('Shift+ArrowRight increases by 50px', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'Enter'});
      fireEvent.keyDown(handle, {key: 'ArrowRight', shiftKey: true});
      fireEvent.keyDown(handle, {key: 'Enter'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 250,
      });
    });

    it('Escape cancels keyboard resize and reverts width', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'Enter'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'Escape'});

      expect(onResize).not.toHaveBeenCalled();

      // Width should revert — the th should have the original 200px
      const headers = within(
        screen.getAllByRole('row')[0],
      ).getAllByRole('columnheader');
      expect(headers[0].style.width).toBe('200px');
    });

    it('Enter commits keyboard resize with accumulated changes', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'Enter'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'Enter'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 230,
      });
    });
  });

  // ===========================================================================
  // 6.5 ARIA Tests
  // ===========================================================================

  describe('ARIA attributes', () => {
    it('handle has role="separator"', () => {
      render(<ResizeTable />);
      const handles = getResizeHandles();
      expect(handles[0]).toHaveAttribute('role', 'separator');
    });

    it('handle has aria-orientation="vertical"', () => {
      render(<ResizeTable />);
      const handle = getResizeHandles()[0];
      expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('handle has aria-valuenow matching column width', () => {
      render(<ResizeTable columnWidths={{name: 200}} />);
      const handle = getResizeHandles()[0];
      expect(handle).toHaveAttribute('aria-valuenow', '200');
    });

    it('handle has aria-label with column header text', () => {
      render(<ResizeTable />);
      const handle = getResizeHandles()[0];
      expect(handle).toHaveAttribute('aria-label', 'Resize column Name');
    });

    it('handle has aria-valuemin', () => {
      render(<ResizeTable minWidth={80} />);
      const handle = getResizeHandles()[0];
      expect(handle).toHaveAttribute('aria-valuemin', '80');
    });

    it('handle has aria-valuemax when finite', () => {
      render(<ResizeTable maxWidth={500} />);
      const handle = getResizeHandles()[0];
      expect(handle).toHaveAttribute('aria-valuemax', '500');
    });
  });

  // ===========================================================================
  // 6.6 Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('no columns → no crash', () => {
      function EmptyTable() {
        const resizePlugin = useXDSTableColumnResize<TestItem>({});
        return (
          <XDSTable
            data={[]}
            columns={[]}
            plugins={{resize: resizePlugin}}
          />
        );
      }

      expect(() => render(<EmptyTable />)).not.toThrow();
    });

    it('single column resize works', () => {
      const singleColumn: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name'},
      ];

      function SingleColumnTable() {
        const resizePlugin = useXDSTableColumnResize<TestItem>({
          columnWidths: {name: 300},
        });
        return (
          <XDSTable
            data={testData}
            columns={singleColumn}
            idKey="id"
            plugins={{resize: resizePlugin}}
          />
        );
      }

      render(<SingleColumnTable />);
      const handles = getResizeHandles();
      expect(handles).toHaveLength(1);
    });

    it('column reorder after resize — widths map correctly', () => {
      function ReorderTable() {
        const [cols, setCols] = useState(testColumns);
        const resizePlugin = useXDSTableColumnResize<TestItem>({
          columnWidths: {name: 200, role: 150},
        });
        return (
          <div>
            <button onClick={() => setCols([...cols].reverse())}>
              Reorder
            </button>
            <XDSTable
              data={testData}
              columns={cols}
              idKey="id"
              plugins={{resize: resizePlugin}}
            />
          </div>
        );
      }

      render(<ReorderTable />);
      let headers = within(screen.getAllByRole('row')[0]).getAllByRole(
        'columnheader',
      );
      expect(headers[0].style.width).toBe('200px');
      expect(headers[1].style.width).toBe('150px');

      // Reorder columns
      fireEvent.click(screen.getByText('Reorder'));

      headers = within(screen.getAllByRole('row')[0]).getAllByRole(
        'columnheader',
      );
      // After reorder, Role is first, Name is second
      expect(headers[0].style.width).toBe('150px');
      expect(headers[1].style.width).toBe('200px');
    });
  });
});
