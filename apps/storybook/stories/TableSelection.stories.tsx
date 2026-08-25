// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableSelection,
  useTableSelectionState,
} from '@astryxdesign/core/Table';
import type {
  TableBulkActionsLayout,
  TableColumn,
} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data
// =============================================================================

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  isLocked: boolean;
}

const users: User[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'Engineer',
    isLocked: false,
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'Designer',
    isLocked: false,
  },
  {
    id: '3',
    name: 'Charlie',
    email: 'charlie@example.com',
    role: 'Manager',
    isLocked: false,
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@example.com',
    role: 'Engineer',
    isLocked: true,
  },
  {
    id: '5',
    name: 'Eve',
    email: 'eve@example.com',
    role: 'Admin',
    isLocked: false,
  },
];

const columns: TableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/TableSelection',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <p
          style={{
            marginBottom: 8,
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
          Selected: {selectedKeys.size} of {users.length}
        </p>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const WithPreselection: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
      new Set(['1', '3']),
    );

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <p
          style={{
            marginBottom: 8,
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
          Selected: {[...selectedKeys].join(', ') || 'none'}
        </p>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const NonSelectableRows: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
      getIsItemSelectable: item => item.role !== 'Admin',
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <p
          style={{
            marginBottom: 8,
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
          Admin rows have no checkbox. Selected: {selectedKeys.size}
        </p>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const DisabledRows: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
      getIsItemEnabled: item => !item.isLocked,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <p
          style={{
            marginBottom: 8,
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
          Locked rows (Diana) have a disabled checkbox. Select-all skips them.
          Selected: {selectedKeys.size}
        </p>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const Compact: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          density="compact"
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const Spacious: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          density="spacious"
          hasHover
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

export const WithStripedRows: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const {selectionConfig} = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);

    return (
      <div style={{maxWidth: 600}}>
        <Table
          data={users}
          columns={columns}
          idKey="id"
          isStriped
          plugins={{selection: selectionPlugin}}
        />
      </div>
    );
  },
};

/**
 * Shared harness for the fixed and floating bulk-actions examples.
 */
function BulkActionsExample({layout}: {layout?: TableBulkActionsLayout}) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const {selectionConfig} = useTableSelectionState<User>({
    data: users,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection<User>({
    ...selectionConfig,
    bulkActions: {
      layout,
      selectedKeys,
      actions:
        layout === 'floating'
          ? [
              {
                label: 'Approve',
                onClick: keys => window.alert(`Approve ${keys.size} rows`),
              },
            ]
          : [
              {
                label: 'Export',
                onClick: keys => window.alert(`Export ${keys.size} rows`),
              },
              {
                label: 'Delete',
                onClick: keys => {
                  setSelectedKeys(new Set());
                  window.alert(`Deleted ${keys.size} rows`);
                },
              },
            ],
      clearSelection: {
        label: 'Unselect All',
        onClick: () => setSelectedKeys(new Set()),
      },
    },
  });

  return (
    <div
      style={{
        maxWidth: 600,
        paddingTop: layout === 'floating' ? 64 : undefined,
      }}>
      <Table
        data={users}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{selection: selectionPlugin}}
      />
    </div>
  );
}

/**
 * The default fixed layout renders in flow as a full-bleed band. Actions lead;
 * selection status and the clear-selection control trail.
 */
export const BulkActions: Story = {
  render: () => <BulkActionsExample />,
};

/**
 * The floating layout appears 16px above the table without shifting it. It
 * keeps the same action and selection-control alignment as the fixed layout.
 */
export const BulkActionsFloating: Story = {
  render: () => <BulkActionsExample layout="floating" />,
};
