// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  XDSTable,
  useXDSTableColumnResize,
  proportional,
  pixel,
} from '@xds/core/Table';

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

export default function TableResizableTable() {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const resizePlugin = useXDSTableColumnResize({
    columnWidths,
    columns,
    onColumnResizeEnd: updates => {
      setColumnWidths(prev => ({...prev, ...updates}));
    },
  });

  return (
    <XDSTable
      data={users}
      columns={columns}
      idKey="id"
      hasHover
      plugins={{columnResize: resizePlugin}}
    />
  );
}
