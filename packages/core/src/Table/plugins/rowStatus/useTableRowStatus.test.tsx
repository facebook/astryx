// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {Theme} from '../../../theme/Theme';
import {defineTheme} from '../../../theme/defineTheme';
import {__resetDevWarnings} from '../../../utils/devWarning';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {
  useTableRowStatus,
  type TableRowStatus,
  type TableRowStatusValue,
  type UseTableRowStatusConfig,
} from './useTableRowStatus';

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

function getStatus(item: Row): TableRowStatusValue | null {
  if (item.state === 'error') {
    return {status: 'error', label: 'Error'};
  }
  if (item.state === 'warning') {
    return {status: 'warning', label: 'Warning'};
  }
  return null;
}

function Harness({
  rows = data,
  statusFn = getStatus,
}: {
  rows?: Row[];
  statusFn?: (item: Row) => TableRowStatusValue | null;
}) {
  const rowStatus = useTableRowStatus<Row>({getStatus: statusFn});
  return (
    <Table data={rows} columns={columns} idKey="id" plugins={{rowStatus}} />
  );
}

beforeEach(() => {
  __resetDevWarnings();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('TableRowStatusValue type', () => {
  it('accepts each exclusive public branch', () => {
    expectTypeOf<{
      status: 'success';
      label: string;
    }>().toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{
      color: 'red';
      label: string;
    }>().toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{
      color: 'rgb(1, 2, 3)';
      icon: 'check';
      label: string;
    }>().toMatchTypeOf<TableRowStatusValue>();
  });

  it('rejects mixed, incomplete, and unknown statuses', () => {
    expectTypeOf<{
      status: 'success';
      color: 'green';
      label: string;
    }>().not.toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{
      status: 'error';
      icon: 'error';
      label: string;
    }>().not.toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{
      status: 'info';
      label: string;
    }>().not.toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{label: string}>().not.toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{
      status: 'success';
    }>().not.toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf<{color: 'red'}>().not.toMatchTypeOf<TableRowStatusValue>();
  });

  it('preserves interface extension and legacy getStatus compatibility', () => {
    interface ExtendedCustomStatus extends TableRowStatus {
      source: 'consumer';
    }

    const legacyGetStatus = (_item: Row): TableRowStatus | null => ({
      color: 'red',
      label: 'Legacy',
    });

    expectTypeOf<ExtendedCustomStatus>().toMatchTypeOf<TableRowStatusValue>();
    expectTypeOf(legacyGetStatus).toMatchTypeOf<
      UseTableRowStatusConfig<Row>['getStatus']
    >();
  });

  it('keeps resolved anatomy internal', () => {
    expectTypeOf<TableRowStatusValue>().not.toHaveProperty('variant');
    expectTypeOf<TableRowStatusValue>().not.toHaveProperty('presentation');
  });
});

describe('useTableRowStatus', () => {
  it('preserves the fixed leading status-column semantics', () => {
    render(<Harness />);
    const header = screen.getByRole('columnheader', {name: 'Row status'});

    expect(header).toHaveAttribute('data-column-key', '__rowStatus');
    expect(screen.getAllByRole('columnheader')[0]).toBe(header);
    expect(header).toHaveStyle({width: '28px'});

    const hiddenText = within(header).getByText('Row status');
    expect(hiddenText.tagName).toBe('SPAN');
    expect(hiddenText.className).not.toBe('');
  });

  it('resolves every semantic status through the active theme glyph and tone', () => {
    const theme = defineTheme({
      name: 'table-row-status-semantic-icons',
      icons: {
        success: <svg data-testid="themed-success" />,
        warning: <svg data-testid="themed-warning" />,
        error: <svg data-testid="themed-error" />,
      },
    });

    render(
      <Theme theme={theme}>
        <Harness
          statusFn={item =>
            item.id === 'a'
              ? {status: 'error', label: 'Error'}
              : item.id === 'b'
                ? {status: 'success', label: 'Success'}
                : {status: 'warning', label: 'Warning'}
          }
        />
      </Theme>,
    );

    for (const status of ['success', 'warning', 'error'] as const) {
      const glyph = screen.getByTestId(`themed-${status}`);
      expect(
        screen.getByRole('img', {
          name: status[0].toUpperCase() + status.slice(1),
        }),
      ).toContainElement(glyph);
      expect(glyph.parentElement).toHaveAttribute('data-color', status);
    }
  });

  it('keeps semantic-looking custom colors on the stable 8px dot path', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error'
            ? {color: 'success', label: 'Success-colored custom marker'}
            : null
        }
      />,
    );

    const indicator = screen.getByRole('img', {
      name: 'Success-colored custom marker',
    });
    const dot = indicator.firstElementChild;

    expect(indicator.querySelector('svg')).toBeNull();
    expect(dot).toBeInstanceOf(HTMLElement);
    expect(getComputedStyle(dot as HTMLElement).width).toBe('8px');
    expect(getComputedStyle(dot as HTMLElement).height).toBe('8px');
    expect(dot?.getAttribute('style')).toContain('--color-icon-green');
  });

  it('uses an explicit custom icon only on the custom-marker branch', () => {
    const theme = defineTheme({
      name: 'table-row-status-custom-icon',
      icons: {
        check: <svg data-testid="caller-check" />,
        error: <svg data-testid="semantic-error" />,
      },
    });

    render(
      <Theme theme={theme}>
        <Harness
          statusFn={item =>
            item.state === 'error'
              ? {color: 'error', icon: 'check', label: 'Custom check'}
              : null
          }
        />
      </Theme>,
    );

    const indicator = screen.getByRole('img', {name: 'Custom check'});
    const glyph = screen.getByTestId('caller-check');

    expect(indicator).toContainElement(glyph);
    expect(screen.queryByTestId('semantic-error')).not.toBeInTheDocument();
    expect(indicator.getAttribute('style')).toContain('--color-icon-red');
    expect(glyph.parentElement).toHaveAttribute('data-color', 'inherit');
  });

  it('passes through a raw CSS color to a custom dot', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error' ? {color: 'rgb(1, 2, 3)', label: 'Raw'} : null
        }
      />,
    );

    const indicator = screen.getByRole('img', {name: 'Raw'});
    expect(indicator.firstElementChild?.getAttribute('style')).toContain(
      'rgb(1, 2, 3)',
    );
  });

  it('renders no indicator for rows returning null', () => {
    render(<Harness />);
    const rows = screen.getAllByRole('row');
    const bob = rows[2];

    expect(within(bob).getByText('Bob')).toBeInTheDocument();
    expect(within(bob).queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes the required label as one accessible image name', () => {
    render(
      <Harness
        statusFn={item =>
          item.state === 'error' ? {status: 'error', label: 'Failed'} : null
        }
      />,
    );

    const indicator = screen.getByRole('img', {name: 'Failed'});
    expect(indicator).toBeInTheDocument();
    expect(within(indicator).queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders the status header with empty data and no indicators', () => {
    render(<Harness rows={[]} />);
    const header = screen.getByRole('columnheader', {name: 'Row status'});

    expect(header).toHaveAttribute('data-column-key', '__rowStatus');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('lets status win an untyped custom-marker conflict and warns once in development', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'table-row-status-conflict',
      icons: {
        error: <svg data-testid="conflict-semantic-error" />,
        check: <svg data-testid="ignored-custom-check" />,
      },
    });
    const mixedStatus = {
      status: 'error',
      color: 'blue',
      icon: 'check',
      label: 'Conflict',
    } as unknown as TableRowStatusValue;

    render(
      <Theme theme={theme}>
        <Harness statusFn={() => mixedStatus} />
      </Theme>,
    );

    expect(screen.getAllByTestId('conflict-semantic-error')).toHaveLength(3);
    expect(
      screen.queryByTestId('ignored-custom-check'),
    ).not.toBeInTheDocument();
    const conflictWarnings = warning.mock.calls.filter(
      ([message]) =>
        message ===
        'useTableRowStatus: status cannot be combined with color or icon. The semantic status takes precedence and the custom marker fields are ignored.',
    );
    expect(conflictWarnings).toHaveLength(1);
  });

  it('uses the same status-wins fallback without warning in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'table-row-status-production-conflict',
      icons: {
        warning: <svg data-testid="production-semantic-warning" />,
        check: <svg data-testid="production-ignored-check" />,
      },
    });
    const mixedStatus = {
      status: 'warning',
      color: 'red',
      icon: 'check',
      label: 'Conflict',
    } as unknown as TableRowStatusValue;

    render(
      <Theme theme={theme}>
        <Harness statusFn={() => mixedStatus} />
      </Theme>,
    );

    expect(screen.getAllByTestId('production-semantic-warning')).toHaveLength(
      3,
    );
    expect(
      screen.queryByTestId('production-ignored-check'),
    ).not.toBeInTheDocument();
    const conflictWarnings = warning.mock.calls.filter(
      ([message]) =>
        message ===
        'useTableRowStatus: status cannot be combined with color or icon. The semantic status takes precedence and the custom marker fields are ignored.',
    );
    expect(conflictWarnings).toHaveLength(0);
  });

  it('ignores custom fields when an untyped status value is unsupported', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'table-row-status-unsupported',
      icons: {check: <svg data-testid="unsupported-ignored-check" />},
    });
    const unsupportedStatus = {
      status: 'info',
      color: 'red',
      icon: 'check',
      label: 'Unsupported',
    } as unknown as TableRowStatusValue;

    render(
      <Theme theme={theme}>
        <Harness statusFn={() => unsupportedStatus} />
      </Theme>,
    );

    expect(
      screen.queryByRole('img', {name: 'Unsupported'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('unsupported-ignored-check'),
    ).not.toBeInTheDocument();
    const unsupportedWarnings = warning.mock.calls.filter(
      ([message]) =>
        message ===
        'useTableRowStatus: Received an unsupported status. No row status indicator was rendered.',
    );
    expect(unsupportedWarnings).toHaveLength(1);
  });
});
