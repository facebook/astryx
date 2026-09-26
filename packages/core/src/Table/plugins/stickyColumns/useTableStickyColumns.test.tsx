// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableStickyColumns.test.tsx
 * @input useTableStickyColumns, Table, React testing utilities
 * @output Functional tests for the sticky-columns plugin
 * @position Test file; validates pinning, cumulative offsets, edges, no-op
 *
 * Note: `position: sticky` and the z-index/background are applied via StyleX
 * (compiled to classNames), which jsdom does not resolve to `element.style`.
 * The plugin sets the per-column *offset* (`insetInlineStart`/`insetInlineEnd`)
 * as an inline style, so these tests assert on those inline offsets — the
 * jsdom-visible, plugin-owned signal that a column is pinned and at what offset.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Table} from '../../Table';
import {useTableStickyColumns} from './useTableStickyColumns';
import {useTableColumnResize} from '../columnResize/useTableColumnResize';
import {pixel} from '../../columnUtils';
import type {TableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  team: string;
  status: string;
}

const data: Row[] = [
  {id: '1', name: 'Alice', email: 'a@x.com', team: 'DS', status: 'Active'},
  {id: '2', name: 'Bob', email: 'b@x.com', team: 'Plat', status: 'Away'},
];

const columns: TableColumn<Row>[] = [
  {key: 'name', header: 'Name', width: pixel(180)},
  {key: 'email', header: 'Email', width: pixel(220)},
  {key: 'team', header: 'Team', width: pixel(160)},
  {key: 'status', header: 'Status', width: pixel(140)},
];

function getHeader(name: string): HTMLElement {
  return screen.getByRole('columnheader', {name});
}

// =============================================================================
// Tests
// =============================================================================

describe('useTableStickyColumns', () => {
  it('pins a start column at inset-inline-start: 0', () => {
    function Harness() {
      const sticky = useTableStickyColumns<Row>({startKeys: ['name']});
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      );
    }
    render(<Harness />);
    expect(getHeader('Name').style.insetInlineStart).toBe('0px');
  });

  it('computes cumulative start offsets for contiguous pinned columns', () => {
    function Harness() {
      const sticky = useTableStickyColumns<Row>({
        startKeys: ['name', 'email'],
      });
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      );
    }
    render(<Harness />);
    // name is first → offset 0; email follows → offset = name width (180px)
    expect(getHeader('Name').style.insetInlineStart).toBe('0px');
    expect(getHeader('Email').style.insetInlineStart).toBe('180px');
  });

  it('pins an end column at inset-inline-end: 0', () => {
    function Harness() {
      const sticky = useTableStickyColumns<Row>({endKeys: ['status']});
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      );
    }
    render(<Harness />);
    expect(getHeader('Status').style.insetInlineEnd).toBe('0px');
  });

  it('pins body cells, not just headers', () => {
    function Harness() {
      const sticky = useTableStickyColumns<Row>({startKeys: ['name']});
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      );
    }
    render(<Harness />);
    const firstBodyCell = screen.getByText('Alice').closest('td');
    expect(firstBodyCell).not.toBeNull();
    expect(firstBodyCell!.style.insetInlineStart).toBe('0px');
  });

  it('is a no-op with an empty config — no cell gets an offset', () => {
    function Harness() {
      const sticky = useTableStickyColumns<Row>({});
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      );
    }
    render(<Harness />);
    for (const header of ['Name', 'Email', 'Team', 'Status']) {
      const th = getHeader(header);
      expect(th.style.insetInlineStart).toBe('');
      expect(th.style.insetInlineEnd).toBe('');
    }
  });

  it('only pins configured columns, leaving others unset', () => {
    function Harness() {
      const sticky = useTableStickyColumns<Row>({startKeys: ['name']});
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      );
    }
    render(<Harness />);
    expect(getHeader('Name').style.insetInlineStart).toBe('0px');
    expect(getHeader('Team').style.insetInlineStart).toBe('');
    expect(getHeader('Team').style.insetInlineEnd).toBe('');
  });

  /**
   * Composition with the resize plugin. Both plugins contribute `position` to
   * the same header cell — resize appends `relative` for its handle's
   * containing block — so the pin has to survive either insertion order. The
   * plugin writes `position` inline for exactly that reason, which also makes
   * it the jsdom-visible signal.
   */
  describe('composition with the column-resize plugin', () => {
    /**
     * With the resize plugin mounted, each header cell also contains the
     * handle's own labelled element, so the cell's accessible name is no
     * longer just its header text. Address the cell by its column key.
     */
    function getHeaderCell(key: string): HTMLElement {
      const cell = document.querySelector<HTMLElement>(
        `th[data-column-key="${key}"]`,
      );
      if (!cell) {
        throw new Error(`header cell not found: ${key}`);
      }
      return cell;
    }

    function StickyResizeHarness({
      resizeFirst,
    }: {
      resizeFirst: boolean;
    }): React.ReactElement {
      const sticky = useTableStickyColumns<Row>({startKeys: ['name']});
      const resize = useTableColumnResize<Row>({
        columns: columns as TableColumn<Record<string, unknown>>[],
      });
      return (
        <Table
          data={data}
          columns={columns}
          idKey="id"
          plugins={
            resizeFirst
              ? {resize, stickyColumns: sticky}
              : {stickyColumns: sticky, resize}
          }
        />
      );
    }

    it('keeps a pinned column sticky with resize declared first', () => {
      render(<StickyResizeHarness resizeFirst={true} />);
      expect(getHeaderCell('name').style.position).toBe('sticky');
      expect(getHeaderCell('name').style.insetInlineStart).toBe('0px');
    });

    it('keeps a pinned column sticky with sticky declared first', () => {
      render(<StickyResizeHarness resizeFirst={false} />);
      expect(getHeaderCell('name').style.position).toBe('sticky');
      expect(getHeaderCell('name').style.insetInlineStart).toBe('0px');
    });

    it('leaves unpinned columns to the resize plugin', () => {
      render(<StickyResizeHarness resizeFirst={true} />);
      // Only pinned cells get an inline position; the rest keep whatever the
      // resize plugin's own styles give them.
      expect(getHeaderCell('team').style.position).toBe('');
    });
  });
});
