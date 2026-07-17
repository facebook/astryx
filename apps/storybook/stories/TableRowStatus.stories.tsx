// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableRowStatus,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn, TableRowStatus} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data
// =============================================================================

interface Job extends Record<string, unknown> {
  id: string;
  name: string;
  owner: string;
  state: 'failed' | 'running' | 'queued' | 'succeeded';
}

const jobs: Job[] = [
  {id: 'j1', name: 'build-core', owner: 'Ava', state: 'failed'},
  {id: 'j2', name: 'lint', owner: 'Liam', state: 'running'},
  {id: 'j3', name: 'unit-tests', owner: 'Zoe', state: 'succeeded'},
  {id: 'j4', name: 'docsite-deploy', owner: 'Max', state: 'queued'},
  {id: 'j5', name: 'smoke-test', owner: 'Mia', state: 'succeeded'},
];

const columns: TableColumn<Job>[] = [
  {key: 'name', header: 'Job', width: proportional(2)},
  {key: 'owner', header: 'Owner', width: pixel(120)},
  {key: 'state', header: 'State', width: pixel(120)},
];

function jobStatus(job: Job): TableRowStatus | null {
  switch (job.state) {
    case 'failed':
      return {color: 'error', icon: 'error', label: 'Failed'};
    case 'running':
      return {color: 'warning', icon: 'warning', label: 'Running'};
    case 'queued':
      return {color: 'gray', label: 'Queued'};
    default:
      return null; // succeeded: no indicator
  }
}

const meta: Meta = {
  title: 'Core/TableRowStatus',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * A small colored dot in a leading gutter column signals per-row status.
 * Rows whose `getStatus` returns `null` (here: succeeded jobs) show no dot.
 * Hover a dot to see its accessible label.
 */
export const Default: Story = {
  render: () => {
    const rowStatus = useTableRowStatus<Job>({getStatus: jobStatus});
    return (
      <Table
        data={jobs}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{rowStatus}}
      />
    );
  },
};

/**
 * Any CSS color works: here raw hex values instead of theme tokens.
 */
export const RawColors: Story = {
  render: () => {
    const rowStatus = useTableRowStatus<Job>({
      getStatus: job =>
        job.state === 'failed'
          ? {color: '#dc2626', label: 'Failed'}
          : job.state === 'running'
            ? {color: '#f59e0b', label: 'Running'}
            : null,
    });
    return (
      <Table
        data={jobs}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{rowStatus}}
      />
    );
  },
};
