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

function Harness({
  rows = people,
  initialCollapsed = EMPTY,
  renderGroupHeader,
}: {
  rows?: Person[];
  initialCollapsed?: Set<string>;
  renderGroupHeader?: (
    groupKey: string,
    count: number,
    collapsed: boolean,
  ) => React.ReactNode;
}) {
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
    data: rows,
    groupBy: p => p.team,
    collapsedGroups,
    onToggleGroup,
    getRowKey: p => p.id,
    renderGroupHeader,
  });
  return (
    <Table
      data={grouped.data}
      columns={columns}
      idKey={grouped.idKey}
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

  it('toggles a group via its chevron and back again', () => {
    render(<Harness />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    // The standalone chevron button toggles the group; its accessible name is
    // qualified with the group key.
    fireEvent.click(screen.getByRole('button', {name: 'Collapse group Core'}));
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    // Toggle back: the Core chevron now says "Expand group Core".
    fireEvent.click(screen.getByRole('button', {name: 'Expand group Core'}));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('exposes each group toggle as a named, keyboard-operable button', () => {
    render(<Harness />);
    // Native <button>: focusable and operable without a custom key handler.
    const coreToggle = screen.getByRole('button', {
      name: 'Collapse group Core',
    });
    expect(coreToggle.tagName).toBe('BUTTON');
    expect(coreToggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded on the header row reflecting collapse state', () => {
    render(<Harness initialCollapsed={new Set(['Core'])} />);
    const rows = screen.getAllByRole('row');
    // rows[1] = Core header (collapsed), rows[2] = Infra header (expanded).
    expect(rows[1]).toHaveAttribute('aria-expanded', 'false');
    expect(rows[2]).toHaveAttribute('aria-expanded', 'true');
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
      expect(grouped.data.length).toBeGreaterThan(0);
      return (
        <Table
          data={grouped.data}
          columns={columns}
          idKey={grouped.idKey}
          plugins={{grouped: grouped.plugin}}
        />
      );
    }
    render(<OrderedHarness />);
    const rows = screen.getAllByRole('row');
    // rows[0] = column header; rows[1] = first group header (Infra).
    expect(within(rows[1]).getByText('Infra')).toBeInTheDocument();
  });

  it('renders custom group header content via renderGroupHeader', () => {
    render(
      <Harness
        renderGroupHeader={(key, count, collapsed) => (
          <span>{`${key}::${count}::${collapsed ? 'closed' : 'open'}`}</span>
        )}
      />,
    );
    expect(screen.getByText('Core::2::open')).toBeInTheDocument();
    expect(screen.getByText('Infra::1::open')).toBeInTheDocument();
  });

  it('renders nothing (no group headers) for empty data', () => {
    render(<Harness rows={[]} />);
    // Column header row still renders; no group header rows.
    expect(screen.queryByText('Core')).not.toBeInTheDocument();
    expect(screen.queryByText('Infra')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /group/i}),
    ).not.toBeInTheDocument();
  });

  it('keeps a group collapsed across a data change (state keyed by group)', () => {
    function ChangingHarness() {
      const [collapsed, setCollapsed] = useState<Set<string>>(
        new Set(['Core']),
      );
      const [rows, setRows] = useState(people);
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
        data: rows,
        groupBy: p => p.team,
        collapsedGroups: collapsed,
        onToggleGroup,
        getRowKey: p => p.id,
      });
      return (
        <>
          <button
            type="button"
            onClick={() =>
              setRows([...people, {id: 'd', name: 'Dave', team: 'Core'}])
            }>
            add
          </button>
          <Table
            data={grouped.data}
            columns={columns}
            idKey={grouped.idKey}
            plugins={{grouped: grouped.plugin}}
          />
        </>
      );
    }
    render(<ChangingHarness />);
    // Core collapsed initially: Alice hidden.
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    // Add a new Core member; Core must stay collapsed (keyed by group value).
    fireEvent.click(screen.getByText('add'));
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Dave')).not.toBeInTheDocument();
    // Count reflects the new member (3), header still present.
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });
});
