'use client';

import {useState} from 'react';
import {XDSTable, useXDSTableSortable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn, XDSTableSortState} from '@xds/core/Table';

interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  department: string;
  tenure: number;
  salary: number;
}

const employees: Employee[] = [
  {id: '1', name: 'Alice Johnson', department: 'Engineering', tenure: 5, salary: 125000},
  {id: '2', name: 'Bob Smith', department: 'Design', tenure: 3, salary: 110000},
  {id: '3', name: 'Charlie Brown', department: 'Marketing', tenure: 7, salary: 95000},
  {id: '4', name: 'Diana Prince', department: 'Engineering', tenure: 2, salary: 115000},
  {id: '5', name: 'Eve Davis', department: 'Design', tenure: 4, salary: 105000},
];

const columns: XDSTableColumn<Employee>[] = [
  {key: 'name', header: 'Name', width: proportional(2), sortable: true},
  {key: 'department', header: 'Department', sortable: true},
  {key: 'tenure', header: 'Years', width: pixel(80), sortable: true},
  {key: 'salary', header: 'Salary', width: pixel(100), sortable: true},
];

export default function TableHeaderCellShowcase() {
  const [sort, setSort] = useState<XDSTableSortState<string>>([
    {sortKey: 'name', direction: 'asc'},
  ]);

  const sortPlugin = useXDSTableSortable({sort, onSortChange: setSort});

  return (
    <XDSTable
      data={employees}
      columns={columns}
      idKey="id"
      plugins={{sort: sortPlugin}}
      hasHover
    />
  );
}
