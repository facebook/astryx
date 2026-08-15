// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableGroupedRows,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data
// =============================================================================

interface Person extends Record<string, unknown> {
  id: string;
  name: string;
  team: string;
  role: string;
}

const people: Person[] = [
  {id: '1', name: 'Ava Chen', team: 'Design Systems', role: 'Staff Eng'},
  {id: '2', name: 'Liam Park', team: 'Design Systems', role: 'Engineer'},
  {id: '3', name: 'Zoe Vega', team: 'Design Systems', role: 'Manager'},
  {id: '4', name: 'Max Ross', team: 'Infra', role: 'Senior Eng'},
  {id: '5', name: 'Mia Cole', team: 'Infra', role: 'Engineer'},
  {id: '6', name: 'Leo Nash', team: 'Growth', role: 'PM'},
];

const columns: TableColumn<Person>[] = [
  {key: 'name', header: 'Name', width: proportional(2)},
  {key: 'role', header: 'Role', width: pixel(140)},
];

const meta: Meta = {
  title: 'Core/TableGroupedRows',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function useCollapsed(initial: string[] = []) {
  const [collapsedGroups, setCollapsed] = useState<Set<string>>(
    new Set(initial),
  );
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
  return {collapsedGroups, onToggleGroup};
}

/**
 * Rows are grouped into collapsible sections by `groupBy`. Each section gets a
 * full-width header with a chevron, the group label, and a member count.
 * Click a header (or its chevron) to collapse/expand that group.
 */
export const Default: Story = {
  render: () => {
    const {collapsedGroups, onToggleGroup} = useCollapsed();
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
        idKey={grouped.idKey}
        hasHover
        plugins={{grouped: grouped.plugin}}
      />
    );
  },
};

/**
 * Groups can start collapsed — pass their keys in the initial `collapsedGroups`
 * set. Here "Infra" begins collapsed.
 */
export const InitiallyCollapsed: Story = {
  render: () => {
    const {collapsedGroups, onToggleGroup} = useCollapsed(['Infra']);
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
        idKey={grouped.idKey}
        hasHover
        plugins={{grouped: grouped.plugin}}
      />
    );
  },
};

/**
 * `groupOrder` pins specific groups to the front; `renderGroupHeader`
 * customizes the header content shown to the right of the chevron.
 */
export const CustomOrderAndHeader: Story = {
  render: () => {
    const {collapsedGroups, onToggleGroup} = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: people,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id,
      groupOrder: ['Growth', 'Infra'],
      renderGroupHeader: (key, count, collapsed) => (
        <span>
          <strong>{key}</strong> — {count} {count === 1 ? 'person' : 'people'}
          {collapsed ? ' (hidden)' : ''}
        </span>
      ),
    });
    return (
      <Table
        data={grouped.data}
        columns={columns}
        idKey={grouped.idKey}
        hasHover
        plugins={{grouped: grouped.plugin}}
      />
    );
  },
};
