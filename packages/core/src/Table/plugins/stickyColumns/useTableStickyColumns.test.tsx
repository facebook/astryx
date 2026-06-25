// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableStickyColumns.test.tsx
 * @input useTableStickyColumns, Table, React testing utilities
 * @output Functional tests for the sticky-columns plugin
 * @position Test file; validates pinning, cumulative offsets, edges, no-op
 */

import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {Table} from '../../Table';
import {useTableStickyColumns} from './useTableStickyColumns';
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
  it('pins a start column with position: sticky and inset-inline-start: 0', () => {
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
    const nameHeader = getHeader('Name');
    expect(nameHeader.style.position).toBe('sticky');
    expect(nameHeader.style.insetInlineStart).toBe('0px');
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

  it('pins an end column with inset-inline-end: 0', () => {
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
    const statusHeader = getHeader('Status');
    expect(statusHeader.style.position).toBe('sticky');
    expect(statusHeader.style.insetInlineEnd).toBe('0px');
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
    expect(firstBodyCell!.style.position).toBe('sticky');
    expect(firstBodyCell!.style.insetInlineStart).toBe('0px');
  });

  it('is a no-op with an empty config — no cell is pinned', () => {
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
      expect(getHeader(header).style.position).not.toBe('sticky');
    }
  });

  it('only pins configured columns, leaving others non-sticky', () => {
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
    expect(getHeader('Name').style.position).toBe('sticky');
    expect(getHeader('Team').style.position).not.toBe('sticky');
  });
});
