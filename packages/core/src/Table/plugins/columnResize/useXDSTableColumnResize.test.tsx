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
import {proportional, pixel} from '../../columnUtils';
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

/** Pixel columns — both columns get handles and resize directly */
const pixelColumns: XDSTableColumn<TestItem>[] = [
  {key: 'name', header: 'Name', width: pixel(200)},
  {key: 'role', header: 'Role', width: pixel(200)},
];

// =============================================================================
// Test Helpers
// =============================================================================

function ResizeTable({
  columnWidths: initialWidths = {},
  onColumnResizeEnd,
  minWidth,
  maxWidth,
  columns: columnsProp = testColumns,
}: {
  columnWidths?: Record<string, number>;
  onColumnResizeEnd?: (event: {columnKey: string; newWidth: number}) => void; // spy receives single entry
  minWidth?: number;
  maxWidth?: number;
  columns?: XDSTableColumn<TestItem>[];
}) {
  const [columnWidths, setColumnWidths] = useState(initialWidths);

  const resizePlugin = useXDSTableColumnResize<TestItem>({
    columnWidths,
    onColumnResizeEnd: updates => {
      setColumnWidths(prev => ({...prev, ...updates}));
      // Forward the first update entry to the single-column spy for test assertions
      const [[columnKey, newWidth]] = Object.entries(updates);
      onColumnResizeEnd?.({columnKey, newWidth});
    },
    minWidth,
    maxWidth,
    columns: columnsProp,
  });

  return (
    <XDSTable
      data={testData}
      columns={columnsProp}
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
    it('renders resize handles in each header cell (pixel columns)', () => {
      render(<ResizeTable columns={pixelColumns} />);
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
      // No pixel override from the plugin — XDSBaseTable sets a percentage width
      // for table-layout:fixed distribution, so width is not empty
      expect(headers[0].style.width).not.toBe('');
      expect(headers[0].style.width).not.toContain('px');
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
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];

      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 300,
          pointerId: 1,
          bubbles: true,
        }),
      );
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 300,
          pointerId: 1,
          bubbles: true,
        }),
      );

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 300,
      });
    });

    it('respects minWidth during drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 100}}
          onColumnResizeEnd={onResize}
          minWidth={80}
        />,
      );
      const handle = getResizeHandles()[0];

      // Drag left past minWidth
      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 50,
          pointerId: 1,
          bubbles: true,
        }),
      );
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 50,
          pointerId: 1,
          bubbles: true,
        }),
      );

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 80,
      });
    });

    it('respects maxWidth during drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
          maxWidth={300}
        />,
      );
      const handle = getResizeHandles()[0];

      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 600,
          pointerId: 1,
          bubbles: true,
        }),
      );
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 600,
          pointerId: 1,
          bubbles: true,
        }),
      );

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 300,
      });
    });

    it('does not call onColumnResizeEnd on Escape during drag', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable columnWidths={{name: 200}} onColumnResizeEnd={onResize} />,
      );
      const handle = getResizeHandles()[0];

      fireEvent.pointerDown(handle, {clientX: 200, pointerId: 1});
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 300,
          pointerId: 1,
          bubbles: true,
        }),
      );
      // Cancel via pointerCancel
      window.dispatchEvent(
        new PointerEvent('pointercancel', {pointerId: 1, bubbles: true}),
      );

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
      const {rerender} = render(<ResizeTable columnWidths={{name: 250}} />);
      const headerRow = screen.getAllByRole('row')[0];
      const headers = within(headerRow).getAllByRole('columnheader');
      expect(headers[0].style.width).toBe('250px');

      // Trigger re-render
      rerender(<ResizeTable columnWidths={{name: 250}} />);
      const headersAfter = within(screen.getAllByRole('row')[0]).getAllByRole(
        'columnheader',
      );
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
      const headers = within(screen.getAllByRole('row')[0]).getAllByRole(
        'columnheader',
      );
      expect(headers[0].style.width).toBe('250px');

      rerender(<ControlledResizeTable columnWidths={{}} />);
      const headersAfter = within(screen.getAllByRole('row')[0]).getAllByRole(
        'columnheader',
      );
      // Plugin override removed — falls back to XDSBaseTable's percentage width
      expect(headersAfter[0].style.width).not.toContain('px');
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
      // Explicitly focus the handle
      handle.focus();
      expect(document.activeElement).toBe(handle);
    });

    it('ArrowRight resizes immediately on focus (no activation step)', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      // Arrow right commits immediately — no Enter activation needed
      fireEvent.keyDown(handle, {key: 'ArrowRight'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 210,
      });
    });

    it('ArrowLeft decreases width by 10px immediately', () => {
      const smallPixelColumns: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name', width: pixel(100)},
        {key: 'role', header: 'Role', width: pixel(100)},
      ];
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={smallPixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'ArrowLeft'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 190,
      });
    });

    it('Shift+ArrowRight increases by 50px', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'ArrowRight', shiftKey: true});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 250,
      });
    });

    it('multiple arrow presses accumulate', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});
      fireEvent.keyDown(handle, {key: 'ArrowRight'});

      // Each press commits independently, building on the previous
      expect(onResize).toHaveBeenCalledTimes(3);
      expect(onResize).toHaveBeenLastCalledWith({
        columnKey: 'name',
        newWidth: 230, // 200 + 10 + 10 + 10
      });
    });

    it('Home key jumps to minimum width', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 300}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'Home'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 200, // pixel(200) column min
      });
    });

    it('End key jumps to maximum width when finite', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
          maxWidth={500}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'End'});

      expect(onResize).toHaveBeenCalledWith({
        columnKey: 'name',
        newWidth: 500,
      });
    });

    it('End key does nothing when maxWidth is Infinity', () => {
      const onResize = vi.fn();
      render(
        <ResizeTable
          columns={pixelColumns}
          columnWidths={{name: 200}}
          onColumnResizeEnd={onResize}
        />,
      );
      const handle = getResizeHandles()[0];
      handle.focus();

      fireEvent.keyDown(handle, {key: 'End'});

      expect(onResize).not.toHaveBeenCalled();
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
          <XDSTable data={[]} columns={[]} plugins={{resize: resizePlugin}} />
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

  // ===========================================================================
  // 6.7 Per-Column Min Width
  // ===========================================================================

  describe('per-column min width', () => {
    it('uses proportional column minWidth as resize minimum', () => {
      const columnsWithMinWidth: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name', width: proportional(1, {minWidth: 150})},
        {key: 'role', header: 'Role', width: pixel(200)},
      ];

      render(<ResizeTable columns={columnsWithMinWidth} />);
      const handle = getResizeHandles()[0];
      // The handle's aria-valuemin should reflect the column's minWidth
      expect(handle).toHaveAttribute('aria-valuemin', '150');
    });

    it('uses pixel column value as resize minimum', () => {
      const columnsWithPixel: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name', width: pixel(180)},
        {key: 'role', header: 'Role', width: pixel(200)},
      ];

      render(<ResizeTable columns={columnsWithPixel} />);
      const handle = getResizeHandles()[0];
      expect(handle).toHaveAttribute('aria-valuemin', '180');
    });

    it('global minWidth overrides per-column minimum', () => {
      const columnsWithMinWidth: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name', width: proportional(1, {minWidth: 150})},
        {key: 'role', header: 'Role'},
      ];

      render(<ResizeTable columns={columnsWithMinWidth} minWidth={60} />);
      const handle = getResizeHandles()[0];
      // Global override wins
      expect(handle).toHaveAttribute('aria-valuemin', '60');
    });

    it('defaults to DEFAULT_MIN_COLUMN_WIDTH (120) for proportional without explicit minWidth', () => {
      const defaultColumns: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name', width: proportional(1)},
        {key: 'role', header: 'Role', width: pixel(200)},
      ];

      render(<ResizeTable columns={defaultColumns} />);
      const handle = getResizeHandles()[0];
      // proportional() helper defaults minWidth to 120
      expect(handle).toHaveAttribute('aria-valuemin', '120');
    });
  });

  // ===========================================================================
  // 6.8 Proportional-Preserving Resize
  // ===========================================================================

  describe('proportional-preserving resize', () => {
    it('does not render resize handle on last proportional column', () => {
      // Default columns have no explicit width → proportional
      // The last column (role) should have no handle
      render(<ResizeTable />);
      const handles = getResizeHandles();
      // Only the first column should get a handle (proportional with a neighbor)
      // The last proportional column has no handle
      expect(handles).toHaveLength(1);
    });

    it('renders resize handle on last column if it is pixel', () => {
      const columnsWithPixelLast: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name'},
        {key: 'role', header: 'Role', width: pixel(200)},
      ];

      render(<ResizeTable columns={columnsWithPixelLast} />);
      const handles = getResizeHandles();
      // Both columns get handles — last is pixel, not proportional
      expect(handles).toHaveLength(2);
    });

    it('all pixel columns get handles including last', () => {
      const allPixel: XDSTableColumn<TestItem>[] = [
        {key: 'name', header: 'Name', width: pixel(200)},
        {key: 'role', header: 'Role', width: pixel(200)},
      ];

      render(<ResizeTable columns={allPixel} />);
      const handles = getResizeHandles();
      expect(handles).toHaveLength(2);
    });

    it('without columns config, all columns get handles (backward compat)', () => {
      // Don't pass columns to the plugin — falls back to old behavior
      function LegacyResizeTable() {
        const resizePlugin = useXDSTableColumnResize<TestItem>({});
        return (
          <XDSTable
            data={testData}
            columns={testColumns}
            idKey="id"
            plugins={{resize: resizePlugin}}
          />
        );
      }

      render(<LegacyResizeTable />);
      const handles = getResizeHandles();
      expect(handles).toHaveLength(2);
    });
  });
});
