'use client';

import {useState} from 'react';
import {
  XDSTable,
  useXDSTableColumnSettings,
  useXDSTableColumnSettingsState,
  proportional,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSMultiSelector} from '@xds/core/MultiSelector';
import {XDSVStack} from '@xds/core/Layout';
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
  {key: 'name', header: 'Name', width: proportional(1)},
  {key: 'email', header: 'Email', width: proportional(2)},
  {key: 'role', header: 'Role', width: proportional(1)},
  {key: 'department', header: 'Department', width: proportional(1)},
  {key: 'status', header: 'Status', width: proportional(1)},
];

const columnOptions = [
  {key: 'name' as const, label: 'Name', isAlwaysVisible: true},
  {key: 'email' as const, label: 'Email'},
  {key: 'role' as const, label: 'Role'},
  {key: 'department' as const, label: 'Department'},
  {key: 'status' as const, label: 'Status'},
];

const allKeys: string[] = ['name', 'email', 'role', 'department', 'status'];

export default function TableColumnSettingsTable() {
  const [activeKeys, setActiveKeys] = useState<string[]>(allKeys);

  const state = useXDSTableColumnSettingsState({
    columns: columnOptions,
    activeColumnKeys: activeKeys,
    onChangeActiveColumnKeys: keys => setActiveKeys([...keys]),
  });

  const plugin = useXDSTableColumnSettings<User>(state.columnSettingsConfig);

  const selectorOptions = columnOptions.map(c => ({
    value: c.key,
    label: c.label,
    disabled: c.isAlwaysVisible === true,
  }));

  return (
    <XDSVStack gap={3} width="100%">
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
    </XDSVStack>
  );
}
