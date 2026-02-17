import {useState, useMemo} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTable, useXDSTableSelection} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

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

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/XDSTable/Selection',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(users.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        users.length > 0 && users.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = users.filter(u => selectedKeys.has(u.id)).length;
        return count > 0 && count < users.length;
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Selected: {selectedKeys.size} of {users.length}
        </p>
        <XDSTable
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

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(users.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        users.length > 0 && users.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = users.filter(u => selectedKeys.has(u.id)).length;
        return count > 0 && count < users.length;
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Selected: {[...selectedKeys].join(', ') || 'none'}
        </p>
        <XDSTable
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

    const selectableUsers = useMemo(
      () => users.filter(u => u.role !== 'Admin'),
      [],
    );

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(selectableUsers.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        selectableUsers.length > 0 &&
        selectableUsers.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = selectableUsers.filter(u =>
          selectedKeys.has(u.id),
        ).length;
        return count > 0 && count < selectableUsers.length;
      },
      getIsItemSelectable: item => item.role !== 'Admin',
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Admin rows have no checkbox. Selected: {selectedKeys.size}
        </p>
        <XDSTable
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

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(users.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        users.length > 0 && users.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = users.filter(u => selectedKeys.has(u.id)).length;
        return count > 0 && count < users.length;
      },
      getIsItemEnabled: item => !item.isLocked,
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Locked rows (Diana) have a disabled checkbox. Selected:{' '}
          {selectedKeys.size}
        </p>
        <XDSTable
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

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(users.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        users.length > 0 && users.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = users.filter(u => selectedKeys.has(u.id)).length;
        return count > 0 && count < users.length;
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
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

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(users.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        users.length > 0 && users.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = users.filter(u => selectedKeys.has(u.id)).length;
        return count > 0 && count < users.length;
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
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

    const selectionPlugin = useXDSTableSelection<User>({
      getIsItemSelected: item => selectedKeys.has(item.id),
      onSelectItem: ({item, isSelected}) => {
        const next = new Set(selectedKeys);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        setSelectedKeys(next);
      },
      onSelectAll: ({isAllSelected}) => {
        setSelectedKeys(
          isAllSelected ? new Set(users.map(u => u.id)) : new Set(),
        );
      },
      getIsAllSelected: () =>
        users.length > 0 && users.every(u => selectedKeys.has(u.id)),
      getIsIndeterminate: () => {
        const count = users.filter(u => selectedKeys.has(u.id)).length;
        return count > 0 && count < users.length;
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <XDSTable
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
