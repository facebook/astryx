// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableContextMenu.test.tsx
 * @output Tests for the Table context-menu system (collection + rendering)
 * @position Validates plugin action aggregation and header context menus
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {useState} from 'react';
import {Table} from './Table';
import {
  collectHeaderContextActions,
  collectRowContextActions,
} from './tableContextMenu';
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
// Collection
// =============================================================================

describe('collectHeaderContextActions / collectRowContextActions', () => {
  it('aggregates actions from every plugin in order', () => {
    const a: TablePlugin<Row> = {
      getHeaderContextActions: () => [
        {id: 'a', label: 'A', onSelect: () => {}},
      ],
    };
    const b: TablePlugin<Row> = {
      getHeaderContextActions: () => [
        {id: 'b', label: 'B', onSelect: () => {}},
      ],
    };
    const actions = collectHeaderContextActions([a, b], columns[0], 0);
    expect(actions.map(x => x.id)).toEqual(['a', 'b']);
  });

  it('returns an empty array when no plugin contributes', () => {
    const plugin: TablePlugin<Row> = {transformHeaderCell: p => p};
    expect(collectHeaderContextActions([plugin], columns[0], 0)).toEqual([]);
    expect(collectRowContextActions([plugin], data[0], 0)).toEqual([]);
  });

  it('collects row actions per plugin', () => {
    const plugin: TablePlugin<Row> = {
      getRowContextActions: item => [
        {id: `del-${item.id}`, label: 'Delete', onSelect: () => {}},
      ],
    };
    const actions = collectRowContextActions([plugin], data[1], 1);
    expect(actions.map(x => x.id)).toEqual(['del-2']);
  });
});

// =============================================================================
// Rendering (header)
// =============================================================================

describe('Table header context menu', () => {
  it('opens a menu with the plugin actions on right-click', () => {
    const onSelect = vi.fn();
    const plugin: TablePlugin<Row> = {
      getHeaderContextActions: () => [
        {id: 'pin', label: 'Pin column', onSelect},
      ],
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

  it('does not render a menu when no plugin contributes actions', () => {
    render(<Table data={data} columns={columns} idKey="id" />);
    fireEvent.contextMenu(screen.getByText('Name'));
    expect(
      screen.queryByRole('menuitem', {hidden: true}),
    ).not.toBeInTheDocument();
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
});
