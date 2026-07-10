// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableRowIndex} from './useTableRowIndex';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
}

const data: Row[] = [
  {id: 'a', name: 'Alice'},
  {id: 'b', name: 'Bob'},
  {id: 'c', name: 'Carol'},
];

const columns: TableColumn<Row>[] = [{key: 'name', header: 'Name'}];

function Harness({
  label,
  startFrom,
  useKey = false,
}: {
  label?: string;
  startFrom?: number;
  useKey?: boolean;
}) {
  const rowIndex = useTableRowIndex<Row>({
    data,
    label,
    startFrom,
    getRowKey: useKey ? item => item.id : undefined,
  });
  return (
    <Table data={data} columns={columns} idKey="id" plugins={{rowIndex}} />
  );
}

describe('useTableRowIndex', () => {
  it('prepends a header cell with the default label', () => {
    render(<Harness />);
    const headers = screen.getAllByRole('columnheader');
    // First column is the index column.
    expect(within(headers[0]).getByText('#')).toBeInTheDocument();
  });

  it('numbers rows 1..n by default', () => {
    render(<Harness />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('respects startFrom', () => {
    render(<Harness startFrom={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('supports a custom label', () => {
    render(<Harness label="Row" />);
    const headers = screen.getAllByRole('columnheader');
    expect(within(headers[0]).getByText('Row')).toBeInTheDocument();
  });

  it('keyed lookup numbers rows in data order', () => {
    render(<Harness useKey />);
    const rows = screen.getAllByRole('row');
    // rows[0] is the header row; rows[1] is Alice.
    expect(within(rows[1]).getByText('1')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Alice')).toBeInTheDocument();
    expect(within(rows[3]).getByText('3')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Carol')).toBeInTheDocument();
  });
});
