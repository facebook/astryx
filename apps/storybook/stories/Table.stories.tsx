import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  XDSTableRow,
  XDSTableCell,
  proportional,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {colorRaw, spacingRaw, radiusRaw, textSizeRaw} from '@xds/core/theme';

// =============================================================================
// Sample Data
// =============================================================================

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
}

const users: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Engineer',
    age: 30,
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Designer',
    age: 25,
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'PM',
    age: 35,
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Engineer',
    age: 28,
  },
  {
    id: '5',
    name: 'Eve Davis',
    email: 'eve@example.com',
    role: 'Designer',
    age: 32,
  },
];

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email', width: proportional(2)},
  {key: 'role', header: 'Role'},
  {key: 'age', header: 'Age', width: pixel(80)},
];

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof XDSTable> = {
  title: 'Core/XDSTable',
  component: XDSTable,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'balanced', 'spacious'],
      description: 'Row density controlling padding and font size',
    },
    dividers: {
      control: 'select',
      options: ['rows', 'columns', 'grid', 'none'],
      description: 'Divider style between cells',
    },
    striped: {
      control: 'boolean',
      description: 'Alternate row background color',
    },
    hover: {
      control: 'boolean',
      description: 'Highlight rows on hover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
  },
};

export const Compact: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'compact',
  },
};

export const Spacious: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'spacious',
  },
};

export const StripedWithHover: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    striped: true,
    hover: true,
  },
};

export const GridDividers: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'grid',
  },
};

export const ColumnDividers: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'columns',
  },
};

export const NoDividers: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'none',
  },
};

export const AutoColumns: Story = {
  render: () => (
    <XDSTable
      data={[
        {name: 'Alice', role: 'Engineer', status: 'Active'},
        {name: 'Bob', role: 'Designer', status: 'Away'},
      ]}
      hover
    />
  ),
};

export const CustomCellRenderer: Story = {
  render: () => {
    const cols: XDSTableColumn<User>[] = [
      {key: 'name', header: 'Name'},
      {
        key: 'email',
        header: 'Email',
        width: proportional(2),
        renderCell: item => (
          <a href={`mailto:${item.email}`} style={{color: 'inherit'}}>
            {item.email}
          </a>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        renderCell: item => (
          <span
            style={{
              padding: `${spacingRaw['--spacing-0-5']} ${spacingRaw['--spacing-2']}`,
              borderRadius: radiusRaw['--radius-content'],
              fontSize: textSizeRaw['--text-xsm'],
              backgroundColor:
                item.role === 'Engineer'
                  ? colorRaw['--color-blue-background']
                  : colorRaw['--color-purple-background'],
              color:
                item.role === 'Engineer'
                  ? colorRaw['--color-blue-text']
                  : colorRaw['--color-purple-text'],
            }}>
            {item.role}
          </span>
        ),
      },
      {key: 'age', header: 'Age', width: pixel(80)},
    ];

    return <XDSTable data={users} columns={cols} idKey="id" hover />;
  },
};

export const ChildrenMode: Story = {
  render: () => (
    <XDSTable density="balanced" dividers="rows" striped hover>
      <XDSTableRow>
        <XDSTableCell>Alice</XDSTableCell>
        <XDSTableCell>alice@example.com</XDSTableCell>
        <XDSTableCell>Engineer</XDSTableCell>
      </XDSTableRow>
      <XDSTableRow>
        <XDSTableCell>Bob</XDSTableCell>
        <XDSTableCell>bob@example.com</XDSTableCell>
        <XDSTableCell>Designer</XDSTableCell>
      </XDSTableRow>
      <XDSTableRow>
        <XDSTableCell>Charlie</XDSTableCell>
        <XDSTableCell>charlie@example.com</XDSTableCell>
        <XDSTableCell>PM</XDSTableCell>
      </XDSTableRow>
      <XDSTableRow>
        <XDSTableCell>Diana</XDSTableCell>
        <XDSTableCell>diana@example.com</XDSTableCell>
        <XDSTableCell>Engineer</XDSTableCell>
      </XDSTableRow>
    </XDSTable>
  ),
};

export const AllDensities: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
      <div>
        <p style={{margin: '0 0 8px', fontWeight: 600}}>Compact</p>
        <XDSTable
          data={users.slice(0, 3)}
          columns={columns}
          idKey="id"
          density="compact"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontWeight: 600}}>Balanced (default)</p>
        <XDSTable
          data={users.slice(0, 3)}
          columns={columns}
          idKey="id"
          density="balanced"
        />
      </div>
      <div>
        <p style={{margin: '0 0 8px', fontWeight: 600}}>Spacious</p>
        <XDSTable
          data={users.slice(0, 3)}
          columns={columns}
          idKey="id"
          density="spacious"
        />
      </div>
    </div>
  ),
};

export const KitchenSink: Story = {
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'compact',
    dividers: 'grid',
    striped: true,
    hover: true,
  },
};
