'use client';

import {useState} from 'react';
import {
  XDSTable,
  useXDSTableColumnSettings,
  useXDSTableColumnSettingsState,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSMultiSelector} from '@xds/core/MultiSelector';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSText} from '@xds/core/Text';

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

const users: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Engineer',
    department: 'Platform',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Designer',
    department: 'Product',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Manager',
    department: 'Platform',
    status: 'Away',
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Engineer',
    department: 'Infra',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Eve Davis',
    email: 'eve@example.com',
    role: 'Admin',
    department: 'Operations',
    status: 'Inactive',
  },
];

const allColumns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
  {key: 'department', header: 'Department'},
  {key: 'status', header: 'Status'},
];

type ColumnKey = 'name' | 'email' | 'role' | 'department' | 'status';

const columnOptions = [
  {key: 'name' as ColumnKey, label: 'Name', isAlwaysVisible: true},
  {key: 'email' as ColumnKey, label: 'Email'},
  {key: 'role' as ColumnKey, label: 'Role'},
  {key: 'department' as ColumnKey, label: 'Department'},
  {key: 'status' as ColumnKey, label: 'Status'},
];

export default function TableColumnSettingsTable() {
  const [activeKeys, setActiveKeys] = useState<ColumnKey[]>([
    'name',
    'email',
    'role',
    'department',
    'status',
  ]);

  const state = useXDSTableColumnSettingsState<ColumnKey>({
    columns: columnOptions,
    activeColumnKeys: activeKeys,
    onChangeActiveColumnKeys: (keys) => setActiveKeys([...keys]),
  });

  const plugin = useXDSTableColumnSettings<User>(state.columnSettingsConfig);

  const selectorOptions = columnOptions.map(c => ({
    value: c.key,
    label: c.label,
    disabled: c.isAlwaysVisible === true,
  }));

  return (
    <>
      <XDSToolbar
        label="Table actions"
        startContent={<XDSText type="label">Team</XDSText>}
        endContent={
          <XDSMultiSelector
            label="Columns"
            isLabelHidden
            options={selectorOptions}
            value={[...state.activeColumnKeys]}
            onChange={state.setActiveColumnKeys}
          />
        }
      />
      <XDSTable
        data={users}
        columns={allColumns}
        idKey="id"
        hasHover
        plugins={{columnSettings: plugin}}
      />
    </>
  );
}
