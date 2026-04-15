'use client';

import {useState} from 'react';
// @ts-expect-error migrated example
// @ts-expect-error migrated example
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
  
  // @ts-expect-error migrated example
  // @ts-expect-error migrated example
  const {selectionConfig} = useXDSTableSelectionState<User>({
    data: users,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  // @ts-expect-error migrated example
  // @ts-expect-error migrated example
  const selectionPlugin = useXDSTableSelection<User>(selectionConfig);
  

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTable
      data={users}
      columns={columns}
      plugins={{selection: selectionPlugin}}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TableSelectionPlugin,
};
