'use client';

import {
  XDSTable,
  useXDSTableSortable,
  useXDSTableSortableState,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
}

const employees: Employee[] = [
  {id: '1', name: 'Alice', email: 'alice@example.com', role: 'Engineer', age: 32},
  {id: '2', name: 'Bob', email: 'bob@example.com', role: 'Designer', age: 28},
  {id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'Manager', age: 45},
  {id: '4', name: 'Diana', email: 'diana@example.com', role: 'Engineer', age: 37},
  {id: '5', name: 'Eve', email: 'eve@example.com', role: 'Admin', age: 29},
];

const columns: XDSTableColumn<Employee>[] = [
  {key: 'name', header: 'Name', sortable: true},
  {key: 'email', header: 'Email', sortable: true},
  {key: 'role', header: 'Role', sortable: true},
  {key: 'age', header: 'Age', sortable: true},
];

export default function TableSortableTable() {
  const {sortedData, sortConfig} = useXDSTableSortableState<Employee>({
    data: employees,
    defaultSort: [{sortKey: 'name', direction: 'ascending'}],
  });

  const sortablePlugin = useXDSTableSortable<Employee>(sortConfig);

  return (
    <XDSTable
      data={sortedData}
      columns={columns}
      idKey="id"
      plugins={{sortable: sortablePlugin}}
    />
  );
}
