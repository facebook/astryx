'use client';

import {useState} from 'react';
import {XDSTable, useXDSTableColumnResize} from '@xds/core/Table';
import {XDSTableColumnResize} from '@xds/core/TableColumnResize';

export default function TableColumnResizePlugin() {
  const [columnWidths, setColumnWidths] = useState({});
  const resizePlugin = useXDSTableColumnResize({
    columnWidths,
    columns,
    onColumnResizeEnd: updates => setColumnWidths(prev => ({...prev, ...updates})),
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
