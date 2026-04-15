'use client';

import {useState} from 'react';
// @ts-expect-error migrated example
// @ts-expect-error migrated example
import {XDSTable, useXDSTableColumnResize} from '@xds/core/Table';

const users = [
  {id: '1', name: 'Alice', email: 'alice@example.com'},
  {id: '2', name: 'Bob', email: 'bob@example.com'},
];
const columns = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
];

export default function TableColumnResizePlugin() {
  const [columnWidths, setColumnWidths] = useState({});
  // @ts-expect-error migrated example
  // @ts-expect-error migrated example
  const resizePlugin = useXDSTableColumnResize({
    columnWidths,
    columns,
    onColumnResizeEnd: (updates: any) => setColumnWidths(prev => ({...prev, ...updates})),
  });

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTable
      data={users}
      columns={columns}
      idKey="id"
      plugins={{columnResize: resizePlugin}}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: TableColumnResizePlugin,
};
