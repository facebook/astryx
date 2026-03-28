import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSTable,
  XDSTableRow,
  XDSTableCell,
  proportional,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  textSizeDefaults,
} from '@xds/core/theme';

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
    isStriped: {
      control: 'boolean',
      description: 'Alternate row background color',
    },
    hasHover: {
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
    isStriped: true,
    hasHover: true,
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
      hasHover
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
              padding: `${spacingDefaults['--spacing-0-5']} ${spacingDefaults['--spacing-2']}`,
              borderRadius: radiusDefaults['--radius-inner'],
              fontSize: textSizeDefaults['--font-size-xs'],
              backgroundColor:
                item.role === 'Engineer'
                  ? colorDefaults['--color-background-blue']
                  : colorDefaults['--color-background-purple'],
              color:
                item.role === 'Engineer'
                  ? colorDefaults['--color-text-blue']
                  : colorDefaults['--color-text-purple'],
            }}>
            {item.role}
          </span>
        ),
      },
      {key: 'age', header: 'Age', width: pixel(80)},
    ];

    return <XDSTable data={users} columns={cols} idKey="id" hasHover />;
  },
};

export const ChildrenMode: Story = {
  render: () => (
    <XDSTable density="balanced" dividers="rows" isStriped hasHover>
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
    isStriped: true,
    hasHover: true,
  },
};

// =============================================================================
// Overflow & Text Wrapping
// =============================================================================

interface OverflowRow extends Record<string, unknown> {
  column: string;
  truncated: string;
  wrapped: string;
}

const overflowData: OverflowRow[] = [
  {
    column: 'Default (truncate)',
    truncated:
      'a_very_long_string_like_this_that_overflows_the_column_without_spaces',
    wrapped:
      'a_very_long_string_like_this_that_overflows_the_column_without_spaces',
  },
  {
    column: 'Normal prose',
    truncated:
      'This is a longer sentence that will also get clipped by the ellipsis when it runs out of room.',
    wrapped:
      'This is a longer sentence that wraps naturally onto the next line when it runs out of room.',
  },
];

/**
 * Cells truncate overflow with an ellipsis by default.
 * The default renderer adds a native title tooltip so truncated text
 * is still accessible on hover.
 *
 * For the full XDS tooltip experience (only shows when actually truncated),
 * use renderCell with <XDSText maxLines={1}>.
 *
 * The "Wrapped" column shows how consumers can opt into wrapping
 * via renderCell with white-space: normal and overflow: visible.
 */
export const OverflowBehavior: Story = {
  render: () => {
    const cols: XDSTableColumn<OverflowRow>[] = [
      {key: 'column', header: 'Row', width: pixel(140)},
      {
        key: 'truncated',
        header: 'Truncated (default)',
        width: proportional(1),
      },
      {
        key: 'wrapped',
        header: 'Wrapped (xstyle override)',
        width: proportional(1),
        renderCell: item => (
          <span
            style={{
              whiteSpace: 'normal',
              overflow: 'visible',
              wordBreak: 'break-word',
              display: 'block',
            }}>
            {item.wrapped}
          </span>
        ),
      },
    ];

    return (
      <div style={{width: '640px'}}>
        <XDSTable
          data={overflowData}
          columns={cols}
          dividers="grid"
          density="balanced"
        />
      </div>
    );
  },
};
