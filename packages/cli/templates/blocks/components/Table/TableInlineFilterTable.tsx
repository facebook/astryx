'use client';

import {
  XDSTable,
  useXDSTableFiltering,
  useXDSTableFilterState,
  toSearchFilters,
  proportional,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {usePowerSearchConfig} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';

interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Engineer',
    department: 'Platform',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Designer',
    department: 'Product',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Manager',
    department: 'Platform',
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Engineer',
    department: 'Infra',
  },
  {
    id: '5',
    name: 'Eve Davis',
    email: 'eve@example.com',
    role: 'Admin',
    department: 'Operations',
  },
];

const fieldDefs = [
  {key: 'name', type: 'string', label: 'Name'},
  {key: 'email', type: 'string', label: 'Email'},
  {
    key: 'role',
    type: 'enum',
    label: 'Role',
    enumValues: [
      {value: 'Engineer', label: 'Engineer'},
      {value: 'Designer', label: 'Designer'},
      {value: 'Manager', label: 'Manager'},
      {value: 'Admin', label: 'Admin'},
    ],
  },
] as const;

const columns: XDSTableColumn<Employee>[] = [
  {key: 'name', header: 'Name', width: proportional(1), filter: 'name'},
  {key: 'email', header: 'Email', width: proportional(2), filter: 'email'},
  {key: 'role', header: 'Role', width: proportional(1), filter: 'role'},
  {key: 'department', header: 'Department', width: proportional(1)},
];

export default function TableInlineFilterTable() {
  const {config, applyFilters} = usePowerSearchConfig(fieldDefs);
  const {filters, onFilterChange} = useXDSTableFilterState();

  const filterPlugin = useXDSTableFiltering<Employee>({
    filters,
    onFilterChange,
    searchConfig: config,
    variant: 'inline',
  });

  const data = applyFilters(
    toSearchFilters(filters, columns, config) as PowerSearchFilter[],
    employees,
  );

  return (
    <XDSTable
      data={data}
      columns={columns}
      idKey="id"
      plugins={{filter: filterPlugin}}
    />
  );
}
