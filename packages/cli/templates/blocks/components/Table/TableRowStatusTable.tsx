// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Table,
  useTableRowStatus,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn, TableRowStatus} from '@astryxdesign/core/Table';

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
      return {color: 'var(--color-icon-red)', label: 'Failed'};
    case 'running':
      return {color: 'var(--color-icon-orange)', label: 'Running'};
    case 'queued':
      return {color: 'var(--color-icon-secondary)', label: 'Queued'};
    default:
      return null; // succeeded → no bar
  }
}

export default function TableRowStatusTable() {
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
}
