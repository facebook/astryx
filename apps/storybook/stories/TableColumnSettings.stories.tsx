// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableColumnSettings,
  useTableColumnSettingsState,
  useTableSelection,
  useTableSelectionState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {MultiSelector} from '@astryxdesign/core/MultiSelector';
import {Button} from '@astryxdesign/core/Button';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Text} from '@astryxdesign/core/Text';

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

const allColumns: TableColumn<User>[] = [
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
  title: 'Core/TableColumnSettings',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const BasicColumnToggle: Story = {
  render: () => {
    const [activeKeys, setActiveKeys] =
      useState<UserColumnKey[]>(defaultActiveKeys);

    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) =>
        setActiveKeys([...keys]),
    });
    const plugin = useTableColumnSettings<User, UserColumnKey>(
      state.columnSettingsConfig,
    );
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true,
    }));

    return (
      <div style={{maxWidth: 700}}>
        <Toolbar
          label="Table actions"
          startContent={<Text type="label">Users</Text>}
          endContent={
            <MultiSelector
              label="Columns"
              isLabelHidden
              options={selectorOptions}
              value={[...state.activeColumnKeys]}
              onChange={state.setActiveColumnKeys}
            />
          }
        />
        <Table
          data={users}
          columns={allColumns}
          idKey="id"
          plugins={{columnSettings: plugin}}
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

    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) =>
        setActiveKeys([...keys]),
    });
    const plugin = useTableColumnSettings<User, UserColumnKey>(
      state.columnSettingsConfig,
    );
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true,
    }));

    return (
      <div style={{maxWidth: 700}}>
        <Text type="supporting">
          &quot;Name&quot; is always visible and cannot be unchecked.
        </Text>
        <Toolbar
          label="Table actions"
          startContent={<Text type="label">Users</Text>}
          endContent={
            <MultiSelector
              label="Columns"
              isLabelHidden
              options={selectorOptions}
              value={[...state.activeColumnKeys]}
              onChange={state.setActiveColumnKeys}
            />
          }
        />
        <Table
          data={users}
          columns={allColumns}
          idKey="id"
          plugins={{columnSettings: plugin}}
        />
      </div>
    );
  },
};

export const ResetToDefault: Story = {
  render: () => {
    const defaultKeys: UserColumnKey[] = ['name', 'email', 'role'];

    const [activeKeys, setActiveKeys] = useState<UserColumnKey[]>(defaultKeys);

    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) =>
        setActiveKeys([...keys]),
      defaultColumnKeys: defaultKeys,
    });
    const plugin = useTableColumnSettings<User, UserColumnKey>(
      state.columnSettingsConfig,
    );
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true,
    }));

    return (
      <div style={{maxWidth: 700}}>
        <Text type="supporting">
          Toggle columns, then reset to restore the default set (Name, Email,
          Role).
        </Text>
        <Toolbar
          label="Table actions"
          startContent={<Text type="label">Users</Text>}
          endContent={
            <>
              <Button
                label="Reset to default"
                variant="secondary"
                onClick={state.resetToDefault}
              />
              <MultiSelector
                label="Columns"
                isLabelHidden
                options={selectorOptions}
                value={[...state.activeColumnKeys]}
                onChange={state.setActiveColumnKeys}
              />
            </>
          }
        />
        <Table
          data={users}
          columns={allColumns}
          idKey="id"
          plugins={{columnSettings: plugin}}
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

    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) =>
        setActiveKeys([...keys]),
    });
    const columnPlugin = useTableColumnSettings<User, UserColumnKey>(
      state.columnSettingsConfig,
    );
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true,
    }));

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 700}}>
        <Toolbar
          label="Table actions"
          startContent={
            <Text type="supporting">
              {selectedKeys.size} of {users.length} selected
            </Text>
          }
          endContent={
            <MultiSelector
              label="Columns"
              isLabelHidden
              options={selectorOptions}
              value={[...state.activeColumnKeys]}
              onChange={state.setActiveColumnKeys}
            />
          }
        />
        <Table
          data={users}
          columns={allColumns}
          idKey="id"
          plugins={{
            columnSettings: columnPlugin,
            selection: selectionPlugin,
          }}
        />
      </div>
    );
  },
};
