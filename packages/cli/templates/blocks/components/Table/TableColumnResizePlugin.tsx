'use client';

import {useState} from 'react';
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
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizePlugin = useXDSTableColumnResize({
    columnWidths,
    columns,
    onColumnResizeEnd: (updates) => setColumnWidths(prev => ({...prev, ...updates})),
  });

  return (
    <XDSTable
      data={users}
      columns={columns}
      idKey="id"
      plugins={{columnResize: resizePlugin}}
    />
  );
}
