// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Table, useTableStickyColumns, pixel} from '@astryxdesign/core/Table';

interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
  location: string;
  startDate: string;
  status: string;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    team: 'Design Systems',
    role: 'Staff Engineer',
    location: 'San Francisco',
    startDate: '2019-03-12',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    team: 'Design Systems',
    role: 'Senior Designer',
    location: 'New York',
    startDate: '2020-07-01',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    team: 'Platform',
    role: 'Engineering Manager',
    location: 'London',
    startDate: '2017-11-20',
    status: 'On leave',
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    team: 'Platform',
    role: 'Staff Engineer',
    location: 'Remote',
    startDate: '2021-01-15',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Eve Davis',
    email: 'eve@example.com',
    team: 'Growth',
    role: 'Product Engineer',
    location: 'Berlin',
    startDate: '2022-05-30',
    status: 'Active',
  },
];

// Wide fixed-width columns so the table overflows and scrolls horizontally,
// keeping the pinned Name (start) and Status (end) columns in view.
const columns = [
  {key: 'name', header: 'Name', width: pixel(180)},
  {key: 'email', header: 'Email', width: pixel(220)},
  {key: 'team', header: 'Team', width: pixel(180)},
  {key: 'role', header: 'Role', width: pixel(200)},
  {key: 'location', header: 'Location', width: pixel(160)},
  {key: 'startDate', header: 'Start date', width: pixel(140)},
  {key: 'status', header: 'Status', width: pixel(140)},
];

export default function StickyColumnsHookUsage() {
  const stickyColumns = useTableStickyColumns<Employee>({
    startKeys: ['name'],
    endKeys: ['status'],
  });

  return (
    // Constrain the width so the Table's own horizontal scroll container is
    // narrower than its columns — that scroll container is what sticky columns
    // pin against. Without a width cap the table renders full-width and never
    // scrolls internally, so nothing sticks.
    <div style={{width: 560, maxWidth: '100%'}}>
      <Table
        data={employees}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{stickyColumns}}
      />
    </div>
  );
}
