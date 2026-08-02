// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  Table,
  useTableColumnResize,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
}

const users: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Engineer',
  },
  {id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Designer'},
  {id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'PM'},
  {id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'Engineer'},
  {id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Analyst'},
];

const columns = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email', width: proportional(2)},
  {key: 'role', header: 'Role', width: pixel(120)},
];

export default function ColumnResizeHookUsage() {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const columnResize = useTableColumnResize({
    columnWidths,
    columns,
    onColumnResizeEnd: updates => {
      setColumnWidths(prev => ({...prev, ...updates}));
    },
  });

  return (
    <Table
      data={users}
      columns={columns}
      idKey="id"
      hasHover
      plugins={{columnResize}}
    />
  );
}
