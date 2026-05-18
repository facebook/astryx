// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

interface Metric extends Record<string, unknown> {
  id: string;
  metric: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

const metrics: Metric[] = [
  {
    id: '1',
    metric: 'Revenue',
    q1: '$1.2M',
    q2: '$1.4M',
    q3: '$1.3M',
    q4: '$1.8M',
  },
  {
    id: '2',
    metric: 'Users',
    q1: '12,400',
    q2: '14,200',
    q3: '15,800',
    q4: '18,100',
  },
  {id: '3', metric: 'Retention', q1: '82%', q2: '85%', q3: '84%', q4: '88%'},
  {id: '4', metric: 'NPS', q1: '42', q2: '45', q3: '48', q4: '51'},
  {id: '5', metric: 'CSAT', q1: '4.2', q2: '4.3', q3: '4.5', q4: '4.6'},
];

const columns: XDSTableColumn<Metric>[] = [
  {key: 'metric', header: 'Metric', width: proportional(2)},
  {key: 'q1', header: 'Q1', width: pixel(90), align: 'end'},
  {key: 'q2', header: 'Q2', width: pixel(90), align: 'end'},
  {key: 'q3', header: 'Q3', width: pixel(90), align: 'end'},
  {key: 'q4', header: 'Q4', width: pixel(90), align: 'end'},
];

export default function TableGridDividersTable() {
  return (
    <XDSTable
      data={metrics}
      columns={columns}
      idKey="id"
      dividers="grid"
      density="compact"
    />
  );
}
