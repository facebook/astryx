'use client';

import {useState} from 'react';
import {XDSTable, useXDSTableSelection, useXDSTableSelectionState} from '@xds/core/Table';

type User = {id: string; name: string; email: string};
const users: User[] = [
  {id: '1', name: 'Alice', email: 'alice@example.com'},
  {id: '2', name: 'Bob', email: 'bob@example.com'},
];
const columns = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
];

export default function TableSelectionPlugin() {
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
      plugins={{selection: selectionPlugin}}
    />
  );
}
