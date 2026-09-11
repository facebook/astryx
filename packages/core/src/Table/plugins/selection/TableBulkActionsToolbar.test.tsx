// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableSelection} from './useTableSelection';
import type {TableBulkAction} from './TableBulkActionsToolbar';

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
}

const data: Row[] = [
  {id: '1', name: 'Alice'},
  {id: '2', name: 'Bob'},
  {id: '3', name: 'Charlie'},
];

const columns: TableColumn<Row>[] = [{key: 'name', header: 'Name'}];

const EMPTY_SELECTION: Set<string> = new Set();

function BulkTable({
  actions,
  initialSelected = EMPTY_SELECTION,
  renderLabel,
  extraContent,
  selectAllMatching,
  withBulkActions = true,
}: {
  actions?: TableBulkAction[];
  initialSelected?: Set<string>;
  renderLabel?: (count: number) => React.ReactNode;
  extraContent?: (count: number) => React.ReactNode;
  selectAllMatching?: {
    totalMatchingCount: number;
    isSelectAllMatching: boolean;
    onSelectAllMatching: () => void;
  };
  withBulkActions?: boolean;
}) {
  const [selectedKeys, setSelectedKeys] =
    useState<Set<string>>(initialSelected);
  const selection = useTableSelection<Row>({
    getIsItemSelected: item => selectedKeys.has(item.id),
    onSelectItem: ({item, isSelected}) => {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        return next;
      });
    },
    onSelectAll: ({isAllSelected}) =>
      setSelectedKeys(isAllSelected ? new Set(data.map(d => d.id)) : new Set()),
    getIsAllSelected: () => data.every(d => selectedKeys.has(d.id)),
    getIsIndeterminate: () => {
      const n = data.filter(d => selectedKeys.has(d.id)).length;
      return n > 0 && n < data.length;
    },
    bulkActions: withBulkActions
      ? {
          selectedKeys,
          actions: actions ?? [{label: 'Delete', onClick: () => {}}],
          renderLabel,
          extraContent,
          selectAllMatching,
        }
      : undefined,
  });
  return (
    <Table data={data} columns={columns} idKey="id" plugins={{selection}} />
  );
}

describe('TableBulkActionsToolbar (via useTableSelection bulkActions)', () => {
  it('renders no toolbar when nothing is selected', () => {
    render(<BulkTable />);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('renders the toolbar with a default count label when rows are selected', () => {
    render(<BulkTable initialSelected={new Set(['1', '2'])} />);
    const toolbar = screen.getByRole('toolbar');
    expect(within(toolbar).getByText('2 selected')).toBeInTheDocument();
  });

  it('renders each action as a button', () => {
    const del = vi.fn();
    const exp = vi.fn();
    render(
      <BulkTable
        initialSelected={new Set(['1'])}
        actions={[
          {label: 'Delete', onClick: del, variant: 'destructive'},
          {label: 'Export', onClick: exp},
        ]}
      />,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(within(toolbar).getByText('Delete')).toBeInTheDocument();
    expect(within(toolbar).getByText('Export')).toBeInTheDocument();
  });

  it('invokes an action onClick with the current selected keys', () => {
    const del = vi.fn();
    render(
      <BulkTable
        initialSelected={new Set(['1', '3'])}
        actions={[{label: 'Delete', onClick: del}]}
      />,
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(del).toHaveBeenCalledTimes(1);
    const keys = del.mock.calls[0][0] as Set<string>;
    expect([...keys].sort()).toEqual(['1', '3']);
  });

  it('uses a custom renderLabel when provided', () => {
    render(
      <BulkTable
        initialSelected={new Set(['1', '2'])}
        renderLabel={count => `${count} rows chosen`}
      />,
    );
    expect(screen.getByText('2 rows chosen')).toBeInTheDocument();
  });

  it('renders extraContent between the label and the actions', () => {
    render(
      <BulkTable
        initialSelected={new Set(['1'])}
        extraContent={count => <span>{`note: ${count}`}</span>}
      />,
    );
    expect(screen.getByText('note: 1')).toBeInTheDocument();
  });

  it('shows a select-all-matching link when more matches exist than selected', () => {
    const onSelectAllMatching = vi.fn();
    render(
      <BulkTable
        initialSelected={new Set(['1'])}
        selectAllMatching={{
          totalMatchingCount: 42,
          isSelectAllMatching: false,
          onSelectAllMatching,
        }}
      />,
    );
    const link = screen.getByText('Select all 42 matching');
    fireEvent.click(link);
    expect(onSelectAllMatching).toHaveBeenCalledTimes(1);
  });

  it('hides the select-all-matching link once in select-all-matching mode', () => {
    render(
      <BulkTable
        initialSelected={new Set(['1'])}
        selectAllMatching={{
          totalMatchingCount: 42,
          isSelectAllMatching: true,
          onSelectAllMatching: () => {},
        }}
      />,
    );
    expect(
      screen.queryByText('Select all 42 matching'),
    ).not.toBeInTheDocument();
    // In select-all-matching mode the count reflects the total match count.
    expect(screen.getByText('42 selected')).toBeInTheDocument();
  });

  it('is a no-op (no toolbar) when bulkActions is omitted, even with a selection', () => {
    render(
      <BulkTable
        initialSelected={new Set(['1', '2'])}
        withBulkActions={false}
      />,
    );
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    // The table itself still renders.
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
