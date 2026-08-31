// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {Theme} from '../../../theme/Theme';
import {defineTheme} from '../../../theme/defineTheme';
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
    return {color: 'error', label: 'Error'};
  }
  if (item.state === 'warning') {
    return {color: 'warning', label: 'Warning'};
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
  it('names the status column header for assistive technology', () => {
    render(<Harness />);
    // The gutter looks blank but its th carries a visually hidden name.
    const header = screen.getByRole('columnheader', {name: 'Row status'});
    expect(header).toHaveAttribute('data-column-key', '__rowStatus');
    // Status column is first.
    expect(screen.getAllByRole('columnheader')[0]).toBe(header);
    // The name must come from the clipped VisuallyHidden span — bare th text
    // would be a visible header on what should stay a blank gutter.
    const hiddenText = within(header).getByText('Row status');
    expect(hiddenText.tagName).toBe('SPAN');
    expect(hiddenText.className).not.toBe('');
  });

  it('renders themed semantic icons by default', () => {
    const theme = defineTheme({
      name: 'table-row-status-semantic-icons',
      icons: {
        error: <svg data-testid="themed-error" />,
        warning: <svg data-testid="themed-warning" />,
      },
    });

    render(
      <Theme theme={theme}>
        <Harness />
      </Theme>,
    );

    expect(screen.getByRole('img', {name: 'Error'})).toContainElement(
      screen.getByTestId('themed-error'),
    );
    expect(screen.getByRole('img', {name: 'Error'})).toHaveAttribute(
      'data-color',
      'error',
    );
    expect(screen.getByRole('img', {name: 'Error'})).toHaveAttribute(
      'data-presentation',
      'icon',
    );
    expect(screen.getByRole('img', {name: 'Warning'})).toContainElement(
      screen.getByTestId('themed-warning'),
    );
  });

  it('keeps a dot for palette colors without outcome semantics', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error' ? {color: 'red', label: 'Red'} : null
        }
      />,
    );
    const indicator = screen.getByRole('img', {name: 'Red'});
    expect(indicator.querySelector('svg')).toBeNull();
    expect(indicator).toHaveClass('astryx-table-row-status');
    expect(indicator).toHaveAttribute('data-color', 'red');
    expect(indicator).toHaveAttribute('data-presentation', 'dot');
    expect(indicator.querySelector('span')?.getAttribute('style')).toContain(
      '--color-icon-red',
    );
  });

  it('renders no indicator for rows returning null', () => {
    render(<Harness />);
    const rows = screen.getAllByRole('row');
    // rows[2] is Bob (state ok): no status indicator in his status cell.
    const bob = rows[2];
    expect(within(bob).getByText('Bob')).toBeInTheDocument();
    expect(within(bob).queryByRole('img')).not.toBeInTheDocument();
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
    expect(indicator).toHaveClass('astryx-table-row-status');
    expect(indicator).toHaveAttribute('data-color', 'red');
    expect(indicator).toHaveAttribute('data-presentation', 'icon');
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
    const header = screen.getByRole('columnheader', {name: 'Row status'});
    expect(header).toHaveAttribute('data-column-key', '__rowStatus');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
