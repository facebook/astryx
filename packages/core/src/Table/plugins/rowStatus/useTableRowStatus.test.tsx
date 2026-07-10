// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableRowStatus, type TableRowStatus} from './useTableRowStatus';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  state: 'error' | 'warning' | 'ok';
}

const data: Row[] = [
  {id: 'a', name: 'Alice', state: 'error'},
  {id: 'b', name: 'Bob', state: 'ok'},
  {id: 'c', name: 'Carol', state: 'warning'},
];

const columns: TableColumn<Row>[] = [{key: 'name', header: 'Name'}];

function getStatus(item: Row): TableRowStatus | null {
  if (item.state === 'error') {
    return {color: 'rgb(220, 38, 38)', label: 'Error'};
  }
  if (item.state === 'warning') {
    return {color: 'rgb(245, 158, 11)', label: 'Warning'};
  }
  return null;
}

function Harness() {
  const rowStatus = useTableRowStatus<Row>({getStatus});
  return (
    <Table data={data} columns={columns} idKey="id" plugins={{rowStatus}} />
  );
}

describe('useTableRowStatus', () => {
  it('prepends a narrow status column with an empty header', () => {
    render(<Harness />);
    const headers = screen.getAllByRole('columnheader');
    // Status column is first; its header is empty.
    expect(headers[0]).toHaveAttribute('data-column-key', '__rowStatus');
    expect(headers[0].textContent).toBe('');
  });

  it('renders a labeled bar for rows with a status', () => {
    render(<Harness />);
    expect(screen.getByRole('img', {name: 'Error'})).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Warning'})).toBeInTheDocument();
  });

  it('renders no bar for rows returning null', () => {
    render(<Harness />);
    const rows = screen.getAllByRole('row');
    // rows[2] is Bob (state ok) — no status bar in his status cell.
    const bob = rows[2];
    expect(within(bob).getByText('Bob')).toBeInTheDocument();
    expect(within(bob).queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies the status color to the bar', () => {
    render(<Harness />);
    const errorBar = screen.getByRole('img', {name: 'Error'});
    // StyleX compiles the dynamic color into a CSS variable on the inline
    // style; a static class applies `background-color: var(--x-backgroundColor)`.
    expect(errorBar.getAttribute('style')).toContain('rgb(220, 38, 38)');
  });
});
