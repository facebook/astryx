import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSTable,
  XDSTableRow,
  XDSTableCell,
  proportional,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSVStack,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  textSizeDefaults,
} from '@xds/core/theme';
import {
  colorVars,
  spacingVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

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

// =============================================================================
// Container Bleed — Table inside Card, Section, and Layout
// =============================================================================

const containerStoryStyles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
  },
  storyWrapper: {
    display: 'flex',
    gap: spacingVars['--spacing-6'],
    flexWrap: 'wrap',
    alignItems: 'start',
  },
  text: {
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-secondary'],
    fontSize: 14,
    margin: 0,
  },
  heading: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: 14,
    color: colorVars['--color-text-secondary'],
  },
});

const simpleColumns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'role', header: 'Role'},
  {key: 'email', header: 'Email'},
];

/**
 * Table inside a Card automatically bleeds to the card edges.
 * The first column's start padding and last column's end padding
 * align with the card's content padding, so text lines up with
 * other content in the card.
 */
export const InCard: Story = {
  decorators: [
    Story => (
      <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div {...stylex.props(containerStoryStyles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>
          Table in Card (auto bleed)
        </h4>
        <XDSCard width={480}>
          <XDSTable data={users.slice(0, 4)} columns={simpleColumns} />
        </XDSCard>
      </div>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>
          Before: Card padding={0} (old pattern)
        </h4>
        <XDSCard width={480} padding={0}>
          <XDSTable data={users.slice(0, 4)} columns={simpleColumns} />
        </XDSCard>
      </div>
    </div>
  ),
};

/**
 * Card with a heading above the table. The table bleeds edge-to-edge
 * while the heading respects the card's content padding — text in the
 * first column aligns with the heading.
 */
export const InCardWithHeading: Story = {
  decorators: [
    Story => (
      <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <XDSCard width={520}>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Team Members</XDSHeading>
        <XDSTable data={users.slice(0, 4)} columns={simpleColumns} hasHover />
      </XDSVStack>
    </XDSCard>
  ),
};

/**
 * Table inside a Card with XDSLayout — header, content with table, footer.
 * The table bleeds within the layout content area while header/footer
 * retain their own padding.
 */
export const InCardWithLayout: Story = {
  decorators: [
    Story => (
      <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <XDSCard width={560}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={3}>User Directory</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <XDSTable data={users} columns={simpleColumns} hasHover isStriped />
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Export" variant="secondary">
                Export
              </XDSButton>
              <XDSButton label="Add User" variant="primary">
                Add User
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  ),
};

/**
 * Table inside a Section with wash background. The section escapes
 * the card padding, and the table bleeds within the section.
 */
export const InCardWithSection: Story = {
  decorators: [
    Story => (
      <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <XDSCard width={520}>
      <XDSVStack gap={3}>
        <XDSHeading level={3}>Dashboard</XDSHeading>
        <p {...stylex.props(containerStoryStyles.text)}>
          The table below is in a wash section for visual separation.
        </p>
      </XDSVStack>
      <XDSSection variant="wash">
        <XDSTable
          data={users.slice(0, 3)}
          columns={simpleColumns}
          density="compact"
        />
      </XDSSection>
    </XDSCard>
  ),
};

/**
 * Compares all three density levels inside cards to show how
 * the edge padding adapts — it always matches the container padding,
 * with a minimum of 8px even for compact tables.
 */
export const InCardDensities: Story = {
  decorators: [
    Story => (
      <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div {...stylex.props(containerStoryStyles.storyWrapper)}>
      {(['compact', 'balanced', 'spacious'] as const).map(density => (
        <div key={density}>
          <h4 {...stylex.props(containerStoryStyles.heading)}>{density}</h4>
          <XDSCard width={400}>
            <XDSVStack gap={2}>
              <XDSHeading level={4}>Team</XDSHeading>
              <XDSTable
                data={users.slice(0, 3)}
                columns={simpleColumns}
                density={density}
              />
            </XDSVStack>
          </XDSCard>
        </div>
      ))}
    </div>
  ),
};

/**
 * Standalone table (no container) — behaves normally with
 * density-based cell padding. No bleed, no edge compensation.
 */
export const StandaloneVsContainer: Story = {
  decorators: [
    Story => (
      <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div {...stylex.props(containerStoryStyles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>
          Standalone (no container)
        </h4>
        <div style={{width: 400}}>
          <XDSTable data={users.slice(0, 3)} columns={simpleColumns} />
        </div>
      </div>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>Inside Card</h4>
        <XDSCard width={400}>
          <XDSTable data={users.slice(0, 3)} columns={simpleColumns} />
        </XDSCard>
      </div>
    </div>
  ),
};
