import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTableColumnSettings,
  useXDSTableSelection,
  useXDSTableSelectionState,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

// =============================================================================
// Sample Data
// =============================================================================

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
    name: 'Alice',
    email: 'alice@example.com',
    role: 'Engineer',
    department: 'Platform',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'Designer',
    department: 'Product',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Charlie',
    email: 'charlie@example.com',
    role: 'Manager',
    department: 'Platform',
    status: 'Away',
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@example.com',
    role: 'Engineer',
    department: 'Infrastructure',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Eve',
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

type UserColumnKey = 'name' | 'email' | 'role' | 'department' | 'status';

const columnOptions = [
  {key: 'name' as UserColumnKey, label: 'Name', isAlwaysVisible: true},
  {key: 'email' as UserColumnKey, label: 'Email'},
  {key: 'role' as UserColumnKey, label: 'Role'},
  {key: 'department' as UserColumnKey, label: 'Department'},
  {key: 'status' as UserColumnKey, label: 'Status'},
];

const defaultActiveKeys: UserColumnKey[] = [
  'name',
  'email',
  'role',
  'department',
  'status',
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/XDSTable/ColumnSettings',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const BasicColumnToggle: Story = {
  render: () => {
    const [activeKeys, setActiveKeys] =
      useState<UserColumnKey[]>(defaultActiveKeys);

    const columnSettings = useXDSTableColumnSettings<User, UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: setActiveKeys,
    });

    return (
      <div style={{maxWidth: 700}}>
        <div style={{marginBottom: 12}}>
          <XDSMultiSelector
            label="Columns"
            options={columnSettings.dropdownItems}
            value={[...columnSettings.activeColumnKeys]}
            onChange={columnSettings.onDropdownChange}
          />
        </div>
        <XDSTable
          data={users}
          columns={columnSettings.activeColumns(allColumns)}
          idKey="id"
          plugins={{columnSettings: columnSettings.plugin}}
        />
      </div>
    );
  },
};

export const DisabledColumns: Story = {
  render: () => {
    const [activeKeys, setActiveKeys] = useState<UserColumnKey[]>([
      'name',
      'email',
      'role',
    ]);

    const columnSettings = useXDSTableColumnSettings<User, UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: setActiveKeys,
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          &quot;Name&quot; is always visible and cannot be unchecked.
        </p>
        <div style={{marginBottom: 12}}>
          <XDSMultiSelector
            label="Columns"
            options={columnSettings.dropdownItems}
            value={[...columnSettings.activeColumnKeys]}
            onChange={columnSettings.onDropdownChange}
          />
        </div>
        <XDSTable
          data={users}
          columns={columnSettings.activeColumns(allColumns)}
          idKey="id"
          plugins={{columnSettings: columnSettings.plugin}}
        />
      </div>
    );
  },
};

export const ResetToDefault: Story = {
  render: () => {
    const defaultKeys: UserColumnKey[] = ['name', 'email', 'role'];

    const [activeKeys, setActiveKeys] =
      useState<UserColumnKey[]>(defaultKeys);

    const columnSettings = useXDSTableColumnSettings<User, UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: setActiveKeys,
      viewConfig: {
        views: [],
        defaultColumnKeys: defaultKeys,
        onCreateView: () => {},
        onDeleteView: () => {},
      },
    });

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Toggle columns, then click &quot;Reset&quot; to restore the default
          set (Name, Email, Role).
        </p>
        <div
          style={{
            marginBottom: 12,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <XDSMultiSelector
            label="Columns"
            options={columnSettings.dropdownItems}
            value={[...columnSettings.activeColumnKeys]}
            onChange={columnSettings.onDropdownChange}
          />
          <button
            onClick={columnSettings.resetToDefault}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
        <XDSTable
          data={users}
          columns={columnSettings.activeColumns(allColumns)}
          idKey="id"
          plugins={{columnSettings: columnSettings.plugin}}
        />
      </div>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [activeKeys, setActiveKeys] =
      useState<UserColumnKey[]>(defaultActiveKeys);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const columnSettings = useXDSTableColumnSettings<User, UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: setActiveKeys,
    });

    const {selectionConfig} = useXDSTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 700}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Column settings + row selection composed together. Selected:{' '}
          {selectedKeys.size} of {users.length}
        </p>
        <div style={{marginBottom: 12}}>
          <XDSMultiSelector
            label="Columns"
            options={columnSettings.dropdownItems}
            value={[...columnSettings.activeColumnKeys]}
            onChange={columnSettings.onDropdownChange}
          />
        </div>
        <XDSTable
          data={users}
          columns={columnSettings.activeColumns(allColumns)}
          idKey="id"
          plugins={{
            columnSettings: columnSettings.plugin,
            selection: selectionPlugin,
          }}
        />
      </div>
    );
  },
};
