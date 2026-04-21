'use client';

import {useState} from 'react';
import {
  XDSTable,
  useXDSTableSelection,
  useXDSTableSelectionState,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
}

const users: User[] = [
  {id: '1', name: 'Alice', email: 'alice@example.com', role: 'Engineer'},
  {id: '2', name: 'Bob', email: 'bob@example.com', role: 'Designer'},
  {id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'Manager'},
  {id: '4', name: 'Diana', email: 'diana@example.com', role: 'Engineer'},
  {id: '5', name: 'Eve', email: 'eve@example.com', role: 'Admin'},
];

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
];

export default function TableSelectableTable() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const {selectionConfig} = useXDSTableSelectionState<User>({
    data: users,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useXDSTableSelection<User>(selectionConfig);

  return (
    <XDSTable
      data={users}
      columns={columns}
      idKey="id"
      plugins={{selection: selectionPlugin}}
    />
  );
}
