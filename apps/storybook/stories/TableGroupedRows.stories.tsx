// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableGroupedRows,
  useTableStickyHeader,
  useTableStickyColumns,
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

// =============================================================================
// Sticky group headings
//
// Needs more rows than the sample set above: a heading only has somewhere to
// pin once its own section is taller than the scrollport.
// =============================================================================

const TEAMS = ['Design Systems', 'Infra', 'Growth', 'Payments'];
const ROLES = ['Engineer', 'Senior Eng', 'Staff Eng', 'Manager', 'PM'];

const staff: Person[] = Array.from({length: 48}, (_, index) => ({
  id: String(index + 1),
  name: `Person ${String(index + 1).padStart(2, '0')}`,
  team: TEAMS[Math.floor(index / 12)],
  role: ROLES[index % ROLES.length],
}));

// Wider than the container the composition story puts it in, so there is
// something to scroll sideways past the pinned column.
const wideColumns: TableColumn<Person>[] = [
  {key: 'name', header: 'Name', width: pixel(200)},
  {key: 'team', header: 'Team', width: pixel(180)},
  {key: 'role', header: 'Role', width: pixel(180)},
];

/**
 * `hasStickyGroupHeaders` pins each heading to the top of the scrollport while
 * its section is on screen, so scrolling deep into a long group never loses
 * which group it is. The heading needs somewhere to pin, which is what
 * `useTableStickyHeader`'s `maxHeight` gives it — and with that plugin
 * installed the heading comes to rest below the header row rather than over
 * it, because the header publishes its measured height for it to clear.
 */
export const StickyGroupHeadings: Story = {
  render: () => {
    const {collapsedGroups, onToggleGroup} = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: staff,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id,
      hasStickyGroupHeaders: true,
    });
    const stickyHeader = useTableStickyHeader<Person>({maxHeight: 320});
    return (
      <Table
        data={grouped.data}
        columns={columns}
        idKey={grouped.idKey}
        hasHover
        plugins={{grouped: grouped.plugin, stickyHeader}}
      />
    );
  },
};

/**
 * All three at once. Scrolling down pins the header row and the heading under
 * it; scrolling sideways holds the `Name` column and keeps the heading's label
 * at the start edge. The heading stays above the pinned column as rows pass
 * beneath, and below the pinned header rather than covering it.
 */
export const StickyGroupHeadingsWithStickyColumn: Story = {
  render: () => {
    const {collapsedGroups, onToggleGroup} = useCollapsed();
    const grouped = useTableGroupedRows<Person>({
      data: staff,
      groupBy: p => p.team,
      collapsedGroups,
      onToggleGroup,
      getRowKey: p => p.id,
      hasStickyGroupHeaders: true,
    });
    const stickyHeader = useTableStickyHeader<Person>({maxHeight: 320});
    const stickyColumns = useTableStickyColumns<Person>({startKeys: ['name']});
    return (
      <div style={{maxWidth: 420}}>
        <Table
          data={grouped.data}
          columns={wideColumns}
          idKey={grouped.idKey}
          hasHover
          plugins={{grouped: grouped.plugin, stickyHeader, stickyColumns}}
        />
      </div>
    );
  },
};
