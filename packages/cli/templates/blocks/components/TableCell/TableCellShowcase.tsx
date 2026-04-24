'use client';

import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSHStack} from '@xds/core/Layout';

interface Task extends Record<string, unknown> {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  priority: string;
  assignee: string;
}

const tasks: Task[] = [
  {id: '1', title: 'Design system audit', status: 'active', priority: 'High', assignee: 'Alice'},
  {id: '2', title: 'API documentation', status: 'paused', priority: 'Medium', assignee: 'Bob'},
  {id: '3', title: 'Unit test coverage', status: 'completed', priority: 'Low', assignee: 'Charlie'},
  {id: '4', title: 'Performance review', status: 'active', priority: 'High', assignee: 'Diana'},
];

const statusVariant: Record<string, 'positive' | 'warning' | 'neutral'> = {
  active: 'positive',
  paused: 'warning',
  completed: 'neutral',
};

const priorityVariant: Record<string, 'red' | 'yellow' | 'blue'> = {
  High: 'red',
  Medium: 'yellow',
  Low: 'blue',
};

const columns: XDSTableColumn<Task>[] = [
  {key: 'title', header: 'Task', width: proportional(2)},
  {
    key: 'status',
    header: 'Status',
    renderCell: item => (
      <XDSHStack gap={2} align="center">
        <XDSStatusDot variant={statusVariant[item.status]} label={item.status} />
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </XDSHStack>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    renderCell: item => (
      <XDSBadge label={item.priority} variant={priorityVariant[item.priority] ?? 'neutral'} />
    ),
  },
  {key: 'assignee', header: 'Assignee', width: pixel(120)},
];

export default function TableCellShowcase() {
  return <XDSTable data={tasks} columns={columns} idKey="id" hasHover />;
}
