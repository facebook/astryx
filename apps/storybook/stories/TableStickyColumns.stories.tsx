// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableStickyColumns,
  useTableColumnResize,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data — wide enough to require horizontal scroll
// =============================================================================

interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
  location: string;
  startDate: string;
  manager: string;
  status: string;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Alice Nguyen',
    email: 'alice@example.com',
    team: 'Design Systems',
    role: 'Staff Engineer',
    location: 'San Francisco',
    startDate: '2019-03-12',
    manager: 'Priya Patel',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Bob Martinez',
    email: 'bob@example.com',
    team: 'Design Systems',
    role: 'Senior Designer',
    location: 'New York',
    startDate: '2020-07-01',
    manager: 'Priya Patel',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Charlie Okafor',
    email: 'charlie@example.com',
    team: 'Platform',
    role: 'Engineering Manager',
    location: 'London',
    startDate: '2017-11-20',
    manager: 'Sam Lee',
    status: 'On leave',
  },
  {
    id: '4',
    name: 'Diana Rossi',
    email: 'diana@example.com',
    team: 'Platform',
    role: 'Staff Engineer',
    location: 'Remote',
    startDate: '2021-01-15',
    manager: 'Sam Lee',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Ehsan Karimi',
    email: 'ehsan@example.com',
    team: 'Growth',
    role: 'Product Engineer',
    location: 'Berlin',
    startDate: '2022-05-30',
    manager: 'Mei Chen',
    status: 'Active',
  },
];

// Wide columns so the table overflows its container and scrolls horizontally.
const columns: TableColumn<Employee>[] = [
  {key: 'name', header: 'Name', width: pixel(180)},
  {key: 'email', header: 'Email', width: pixel(220)},
  {key: 'team', header: 'Team', width: pixel(180)},
  {key: 'role', header: 'Role', width: pixel(200)},
  {key: 'location', header: 'Location', width: pixel(160)},
  {key: 'startDate', header: 'Start date', width: pixel(140)},
  {key: 'manager', header: 'Manager', width: pixel(180)},
  {key: 'status', header: 'Status', width: pixel(140)},
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/TableStickyColumns',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const note = {marginBottom: 8, fontSize: 14, color: '#666'} as const;

/**
 * Pin the leading `Name` column to the start edge. Scroll horizontally — the
 * name stays put and a drop shadow appears over the scrolling content.
 */
export const PinStart: Story = {
  render: () => {
    const sticky = useTableStickyColumns<Employee>({startKeys: ['name']});
    return (
      <div style={{maxWidth: 720}}>
        <p style={note}>
          <code>startKeys: ['name']</code> — scroll right to see the Name column
          stay pinned with a drop shadow.
        </p>
        <Table
          data={employees}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      </div>
    );
  },
};

/**
 * Pin the trailing `Status` column to the end edge.
 */
export const PinEnd: Story = {
  render: () => {
    const sticky = useTableStickyColumns<Employee>({endKeys: ['status']});
    return (
      <div style={{maxWidth: 720}}>
        <p style={note}>
          <code>endKeys: ['status']</code> — the Status column stays pinned to
          the right edge while the rest scrolls.
        </p>
        <Table
          data={employees}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      </div>
    );
  },
};

/**
 * Pin both edges at once. `startKeys`/`endKeys` each define a contiguous run
 * from their edge inward; columns get cumulative offsets so multiple pinned
 * columns stack correctly.
 */
export const PinBothEdges: Story = {
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name', 'email'],
      endKeys: ['status'],
    });
    return (
      <div style={{maxWidth: 720}}>
        <p style={note}>
          <code>startKeys: ['name', 'email']</code> +{' '}
          <code>endKeys: ['status']</code> — two columns pinned left with
          cumulative offsets, one pinned right.
        </p>
        <Table
          data={employees}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      </div>
    );
  },
};

/**
 * Sticky columns composed with column resize. Resizing a pinned column keeps it
 * pinned; the plugin order (sticky after resize) ensures the sticky inline
 * offset wins over the resize handle's inline width.
 */
export const WithColumnResize: Story = {
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );
    const resize = useTableColumnResize<Employee>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates =>
        setColumnWidths(prev => ({...prev, ...updates})),
    });
    const sticky = useTableStickyColumns<Employee>({startKeys: ['name']});
    return (
      <div style={{maxWidth: 720}}>
        <p style={note}>
          Resize columns by dragging header edges; the pinned Name column stays
          sticky. Plugins compose:{' '}
          <code>{'{ columnResize, stickyColumns }'}</code>.
        </p>
        <Table
          data={employees}
          columns={columns}
          idKey="id"
          plugins={{columnResize: resize, stickyColumns: sticky}}
        />
      </div>
    );
  },
};

/**
 * Empty config is a valid no-op — nothing is pinned, every cell passes through
 * untouched. Lets callers compute keys conditionally without branching on
 * whether to install the plugin.
 */
export const NoOpEmptyConfig: Story = {
  render: () => {
    const sticky = useTableStickyColumns<Employee>({});
    return (
      <div style={{maxWidth: 720}}>
        <p style={note}>
          <code>useTableStickyColumns({'{}'})</code> — no pinned columns; the
          table behaves as if the plugin weren't installed.
        </p>
        <Table
          data={employees}
          columns={columns}
          idKey="id"
          plugins={{stickyColumns: sticky}}
        />
      </div>
    );
  },
};
