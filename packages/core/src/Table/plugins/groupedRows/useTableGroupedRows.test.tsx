// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {useState, useCallback} from 'react';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableGroupedRows} from './useTableGroupedRows';

interface Person extends Record<string, unknown> {
  id: string;
  name: string;
  team: string;
}

const people: Person[] = [
  {id: 'a', name: 'Alice', team: 'Core'},
  {id: 'b', name: 'Bob', team: 'Core'},
  {id: 'c', name: 'Carol', team: 'Infra'},
];

const columns: TableColumn<Person>[] = [{key: 'name', header: 'Name'}];

const EMPTY = new Set<string>();

function Harness({initialCollapsed = EMPTY}: {initialCollapsed?: Set<string>}) {
  const [collapsedGroups, setCollapsed] = useState(initialCollapsed);
  const onToggleGroup = useCallback((key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);
  const grouped = useTableGroupedRows<Person>({
    data: people,
    groupBy: p => p.team,
    collapsedGroups,
    onToggleGroup,
    getRowKey: p => p.id,
  });
  return (
    <Table
      data={grouped.data}
      columns={columns}
      idKey={grouped.getRowKey}
      plugins={{grouped: grouped.plugin}}
    />
  );
}

describe('useTableGroupedRows', () => {
  it('renders a header row per group with label and count', () => {
    render(<Harness />);
    // Two groups: Core (2), Infra (1).
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('Infra')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });

  it('shows group members when expanded', () => {
    render(<Harness />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('hides members of a collapsed group but keeps the header', () => {
    render(<Harness initialCollapsed={new Set(['Core'])} />);
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    // Other group unaffected.
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('toggles a group via its chevron', () => {
    render(<Harness />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    // Both groups start expanded, so target the Core group's chevron (the
    // first "Collapse group" button belongs to the first group).
    const collapseButtons = screen.getAllByRole('button', {
      name: 'Collapse group',
    });
    fireEvent.click(collapseButtons[0]);
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    // Core header stays; Infra group is unaffected.
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('respects groupOrder in the flattened data', () => {
    function OrderedHarness() {
      const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
      const grouped = useTableGroupedRows<Person>({
        data: people,
        groupBy: p => p.team,
        collapsedGroups: collapsed,
        onToggleGroup: k => setCollapsed(new Set([k])),
        getRowKey: p => p.id,
        groupOrder: ['Infra', 'Core'],
      });
      // First flattened row should be the Infra header.
      expect(grouped.data.length).toBeGreaterThan(0);
      return (
        <Table
          data={grouped.data}
          columns={columns}
          idKey={grouped.getRowKey}
          plugins={{grouped: grouped.plugin}}
        />
      );
    }
    render(<OrderedHarness />);
    const rows = screen.getAllByRole('row');
    // rows[0] = column header; rows[1] = first group header (Infra).
    expect(within(rows[1]).getByText('Infra')).toBeInTheDocument();
  });
});
