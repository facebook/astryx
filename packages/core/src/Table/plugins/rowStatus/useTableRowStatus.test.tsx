// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableRowStatus, type TableRowStatus} from './useTableRowStatus';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  state: 'error' | 'warning' | 'ok' | 'done';
}

const data: Row[] = [
  {id: 'a', name: 'Alice', state: 'error'},
  {id: 'b', name: 'Bob', state: 'ok'},
  {id: 'c', name: 'Carol', state: 'warning'},
];

const columns: TableColumn<Row>[] = [{key: 'name', header: 'Name'}];

function getStatus(item: Row): TableRowStatus | null {
  if (item.state === 'error') {
    return {color: 'red', label: 'Error'};
  }
  if (item.state === 'warning') {
    return {color: 'orange', label: 'Warning'};
  }
  return null;
}

function Harness({
  rows = data,
  statusFn = getStatus,
}: {
  rows?: Row[];
  statusFn?: (item: Row) => TableRowStatus | null;
}) {
  const rowStatus = useTableRowStatus<Row>({getStatus: statusFn});
  return (
    <Table data={rows} columns={columns} idKey="id" plugins={{rowStatus}} />
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

  it('renders a labeled dot for rows with a status', () => {
    render(<Harness />);
    expect(screen.getByRole('img', {name: 'Error'})).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Warning'})).toBeInTheDocument();
  });

  it('renders a dot (not an icon) by default', () => {
    render(<Harness />);
    // Default (no icon) renders a plain colored dot: no svg in the indicator.
    const dot = screen.getByRole('img', {name: 'Error'});
    expect(dot.querySelector('svg')).toBeNull();
  });

  it('renders no indicator for rows returning null', () => {
    render(<Harness />);
    const rows = screen.getAllByRole('row');
    // rows[2] is Bob (state ok): no status indicator in his status cell.
    const bob = rows[2];
    expect(within(bob).getByText('Bob')).toBeInTheDocument();
    expect(within(bob).queryByRole('img')).not.toBeInTheDocument();
  });

  it('maps a semantic color name to its icon color token', () => {
    render(<Harness />);
    const errorDot = screen.getByRole('img', {name: 'Error'});
    // 'red' resolves to var(--color-icon-red); StyleX emits it on the inline
    // style of the inner dot element.
    const dot = errorDot.querySelector('span');
    expect(dot?.getAttribute('style')).toContain('--color-icon-red');
  });

  it('passes through a raw CSS color as an escape hatch', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error' ? {color: 'rgb(1, 2, 3)', label: 'Raw'} : null
        }
      />,
    );
    const indicator = screen.getByRole('img', {name: 'Raw'});
    const dot = indicator.querySelector('span');
    expect(dot?.getAttribute('style')).toContain('rgb(1, 2, 3)');
  });

  it('renders an icon as the status signifier when icon is provided', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error'
            ? {color: 'red', icon: 'error', label: 'Error'}
            : null
        }
      />,
    );
    // Icon-mode still exposes the accessible label via role=img.
    const indicator = screen.getByRole('img', {name: 'Error'});
    expect(indicator).toBeInTheDocument();
    // An SVG icon is rendered inside the indicator (dot mode has no svg).
    expect(indicator.querySelector('svg')).not.toBeNull();
  });

  it('exposes the required label as the accessible name in dot mode', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error' ? {color: 'red', label: 'Error'} : null
        }
      />,
    );
    // Label is required, so every dot is announced via role=img with its name.
    const indicator = screen.getByRole('img', {name: 'Error'});
    expect(indicator).toBeInTheDocument();
    // Dot mode renders no svg (that is icon mode).
    expect(indicator.querySelector('svg')).toBeNull();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders the status header with empty data and no indicators', () => {
    render(<Harness rows={[]} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveAttribute('data-column-key', '__rowStatus');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
