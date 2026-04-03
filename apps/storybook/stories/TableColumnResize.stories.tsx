import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  useXDSTableColumnResize,
  useXDSTableSelection,
  useXDSTableSelectionState,
  proportional,
  pixel,
} from '@xds/core/Table';
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
  title: 'Core/XDSTable/ColumnResize',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const resizePlugin = useXDSTableColumnResize<User>({
      columnWidths,
      columns,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({...prev, ...updates}));
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Drag the right edge of any column header to resize. The last
          proportional column has no handle — it flexes to fill remaining space.
        </p>
        <XDSTable
          data={users}
          columns={columns}
          idKey="id"
          plugins={{columnResize: resizePlugin}}
        />
      </div>
    );
  },
};

export const WithMinMaxConstraints: Story = {
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const resizePlugin = useXDSTableColumnResize<User>({
      columnWidths,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({...prev, ...updates}));
      },
      columns,
      minWidth: 80,
      maxWidth: 300,
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Columns are constrained between 80px and 300px.
        </p>
        <XDSTable
          data={users}
          columns={columns}
          idKey="id"
          plugins={{columnResize: resizePlugin}}
        />
      </div>
    );
  },
};

export const PersistingWidths: Story = {
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const resizePlugin = useXDSTableColumnResize<User>({
      columnWidths,
      columns,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({...prev, ...updates}));
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Current widths:{' '}
          {Object.keys(columnWidths).length > 0
            ? Object.entries(columnWidths)
                .map(([key, width]) => `${key}: ${width}px`)
                .join(', ')
            : 'none set (resize a column to see)'}
        </p>
        <button
          onClick={() => setColumnWidths({})}
          style={{marginBottom: 8, fontSize: 14}}>
          Reset all widths
        </button>
        <XDSTable
          data={users}
          columns={columns}
          idKey="id"
          plugins={{columnResize: resizePlugin}}
        />
      </div>
    );
  },
};

export const KeyboardResize: Story = {
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const resizePlugin = useXDSTableColumnResize<User>({
      columnWidths,
      columns,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({...prev, ...updates}));
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Tab to a resize handle, press Enter to activate, use Arrow keys to
          resize (Shift for larger steps), Enter to commit, Escape to cancel.
        </p>
        <XDSTable
          data={users}
          columns={columns}
          idKey="id"
          plugins={{columnResize: resizePlugin}}
        />
      </div>
    );
  },
};

export const WithSelectionAndResize: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const {selectionConfig} = useXDSTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
    });
    const selectionPlugin = useXDSTableSelection<User>(selectionConfig);

    const resizePlugin = useXDSTableColumnResize<User>({
      columnWidths,
      columns,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({...prev, ...updates}));
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          Selection and column resize plugins composed together. Selected:{' '}
          {selectedKeys.size} of {users.length}
        </p>
        <XDSTable
          data={users}
          columns={columns}
          idKey="id"
          plugins={{selection: selectionPlugin, columnResize: resizePlugin}}
        />
      </div>
    );
  },
};

const pixelColumns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name', width: pixel(200)},
  {key: 'email', header: 'Email', width: pixel(250)},
  {key: 'role', header: 'Role', width: pixel(150)},
];

export const AllPixelColumns: Story = {
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
      {},
    );

    const resizePlugin = useXDSTableColumnResize<User>({
      columnWidths,
      columns: pixelColumns,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({...prev, ...updates}));
      },
    });

    return (
      <div style={{maxWidth: 600}}>
        <p style={{marginBottom: 8, fontSize: 14, color: '#666'}}>
          All columns are pixel-width. Every column gets a resize handle,
          including the last one. Min width defaults to the column&apos;s
          declared pixel value.
        </p>
        <XDSTable
          data={users}
          columns={pixelColumns}
          idKey="id"
          plugins={{columnResize: resizePlugin}}
        />
      </div>
    );
  },
};
