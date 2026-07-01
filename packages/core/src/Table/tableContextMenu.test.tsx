// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableContextMenu.test.tsx
 * @output Tests for the Table context-menu system
 * @position Validates contextMenuActions aggregation + header context menus
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useState} from 'react';
import {Table} from './Table';
import {
  useTableSortable,
  type TableSortState,
} from './plugins/sortable/useTableSortable';
import type {TablePlugin, TableColumn} from './types';

// jsdom doesn't implement the Popover API; mirror the ContextMenu test's mock
// so the menu can "open" and its items become queryable (as hidden).
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
}

const data: Row[] = [
  {id: '1', name: 'Alice'},
  {id: '2', name: 'Bob'},
];

const columns: TableColumn<Row>[] = [
  {key: 'name', header: 'Name'},
  {key: 'id', header: 'ID'},
];

// =============================================================================
// contextMenuActions via transformHeaderCell
// =============================================================================

describe('Table header context menu', () => {
  it('renders a menu from a plugin that sets contextMenuActions', () => {
    const onSelect = vi.fn();
    const plugin: TablePlugin<Row> = {
      transformHeaderCell: props => ({
        ...props,
        contextMenuActions: [{id: 'pin', label: 'Pin column', onSelect}],
      }),
    };
    render(
      <Table data={data} columns={columns} idKey="id" plugins={{plugin}} />,
    );
    fireEvent.contextMenu(screen.getByText('Name'));
    const items = screen.getAllByRole('menuitem', {
      name: 'Pin column',
      hidden: true,
    });
    expect(items.length).toBeGreaterThan(0);
    fireEvent.click(items[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('concatenates actions from multiple plugins (never overridden)', () => {
    const a: TablePlugin<Row> = {
      transformHeaderCell: props => ({
        ...props,
        contextMenuActions: [
          ...(props.contextMenuActions ?? []),
          {id: 'a', label: 'Action A', onSelect: () => {}},
        ],
      }),
    };
    const b: TablePlugin<Row> = {
      transformHeaderCell: props => ({
        ...props,
        contextMenuActions: [
          ...(props.contextMenuActions ?? []),
          {id: 'b', label: 'Action B', onSelect: () => {}},
        ],
      }),
    };
    render(
      <Table data={data} columns={columns} idKey="id" plugins={{a, b}} />,
    );
    fireEvent.contextMenu(screen.getByText('Name'));
    expect(
      screen.getAllByRole('menuitem', {name: 'Action A', hidden: true}).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('menuitem', {name: 'Action B', hidden: true}).length,
    ).toBeGreaterThan(0);
  });

  it('does not render a menu when no plugin contributes actions', () => {
    render(<Table data={data} columns={columns} idKey="id" />);
    fireEvent.contextMenu(screen.getByText('Name'));
    expect(
      screen.queryByRole('menuitem', {hidden: true}),
    ).not.toBeInTheDocument();
  });
});

// =============================================================================
// Body / row context menu
// =============================================================================

describe('Table body context menu', () => {
  it('renders row actions from a plugin that sets contextMenuActions in transformBodyCell', () => {
    const onSelect = vi.fn();
    const plugin: TablePlugin<Row> = {
      transformBodyCell: (props, _column, item) => ({
        ...props,
        contextMenuActions: [
          {
            id: `delete-${item.id}`,
            label: 'Delete row',
            onSelect: () => {
              onSelect(item.id);
            },
          },
        ],
      }),
    };
    render(
      <Table data={data} columns={columns} idKey="id" plugins={{plugin}} />,
    );
    // Right-click the first body cell (Alice).
    fireEvent.contextMenu(screen.getByText('Alice'));
    const items = screen.getAllByRole('menuitem', {
      name: 'Delete row',
      hidden: true,
    });
    expect(items.length).toBeGreaterThan(0);
    fireEvent.click(items[0]);
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});

// =============================================================================
// Sortable integration
// =============================================================================

describe('sortable context actions', () => {
  it('offers Sort ascending/descending on a sortable header and Clear sort once sorted', () => {
    function Harness() {
      const [sort, setSort] = useState<TableSortState>([]);
      const sortPlugin = useTableSortable<Row>({sort, onSortChange: setSort});
      return (
        <Table
          data={data}
          columns={[{key: 'name', header: 'Name', sortable: true}]}
          idKey="id"
          plugins={{sort: sortPlugin}}
        />
      );
    }
    render(<Harness />);

    // Unsorted: asc + desc, no "Clear sort".
    fireEvent.contextMenu(screen.getByText('Name'));
    expect(
      screen.getAllByRole('menuitem', {name: 'Sort ascending', hidden: true})
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('menuitem', {name: 'Sort descending', hidden: true})
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole('menuitem', {name: 'Clear sort', hidden: true}),
    ).not.toBeInTheDocument();

    // Apply ascending → "Clear sort" now appears.
    fireEvent.click(
      screen.getAllByRole('menuitem', {
        name: 'Sort ascending',
        hidden: true,
      })[0],
    );
    fireEvent.contextMenu(screen.getByText('Name'));
    expect(
      screen.getAllByRole('menuitem', {name: 'Clear sort', hidden: true})
        .length,
    ).toBeGreaterThan(0);
  });

  it('resolves fresh actions on each open as sort state changes (lazy getter)', () => {
    const onSortChange = vi.fn();
    function Harness() {
      const [sort, setSort] = useState<TableSortState>([]);
      const sortPlugin = useTableSortable<Row>({
        sort,
        onSortChange: next => {
          setSort(next);
          onSortChange(next);
        },
      });
      return (
        <Table
          data={data}
          columns={[{key: 'name', header: 'Name', sortable: true}]}
          idKey="id"
          plugins={{sort: sortPlugin}}
        />
      );
    }
    render(<Harness />);

    // Open (unsorted) and pick descending.
    fireEvent.contextMenu(screen.getByText('Name'));
    fireEvent.click(
      screen.getAllByRole('menuitem', {name: 'Sort descending', hidden: true})[0],
    );
    expect(onSortChange).toHaveBeenLastCalledWith([
      {sortKey: 'name', direction: 'descending'},
    ]);

    // Re-open: the getter recomputes against the now-descending state, so
    // "Clear sort" is present and clicking it clears — proving the actions are
    // freshly derived on each open, not memoized from the first render.
    fireEvent.contextMenu(screen.getByText('Name'));
    const clear = screen.getAllByRole('menuitem', {
      name: 'Clear sort',
      hidden: true,
    });
    expect(clear.length).toBeGreaterThan(0);
    fireEvent.click(clear[0]);
    expect(onSortChange).toHaveBeenLastCalledWith([]);
  });
});
