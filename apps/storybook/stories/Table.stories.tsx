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
  title: 'Core/Table',
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
    verticalAlign: {
      control: 'select',
      options: ['middle', 'top', 'bottom'],
      description: 'Vertical alignment for body row cells',
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
  scenario: string;
  content: string;
}

const overflowData: OverflowRow[] = [
  {
    scenario: 'Long unbroken string',
    content:
      'a_very_long_string_like_this_that_overflows_the_column_without_any_spaces_or_hyphens',
  },
  {
    scenario: 'Normal prose',
    content:
      'This is a longer sentence that might wrap or truncate depending on the textOverflow setting of the table.',
  },
  {
    scenario: 'Short text',
    content: 'Fits fine.',
  },
];

/**
 * Text wraps by default — rows grow taller and no content is hidden.
 * Set `textOverflow="truncate"` for dense data tables where fixed row
 * height matters. In truncate mode, default-rendered cells show a
 * tooltip on hover when text is actually overflowing.
 */
export const OverflowBehavior: Story = {
  render: () => {
    const cols: XDSTableColumn<OverflowRow>[] = [
      {key: 'scenario', header: 'Scenario', width: pixel(160)},
      {key: 'content', header: 'Content', width: proportional(1)},
    ];

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          width: '480px',
        }}>
        <div>
          <h4 style={{margin: '0 0 8px'}}>Wrap (default)</h4>
          <XDSTable
            data={overflowData}
            columns={cols}
            dividers="grid"
            density="balanced"
          />
        </div>
        <div>
          <h4 style={{margin: '0 0 8px'}}>Truncate (with tooltip on hover)</h4>
          <XDSTable
            data={overflowData}
            columns={cols}
            dividers="grid"
            density="balanced"
            textOverflow="truncate"
          />
        </div>
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

// =============================================================================
// Column Alignment
// =============================================================================

interface Transaction extends Record<string, unknown> {
  id: string;
  description: string;
  category: string;
  quantity: number;
  amount: string;
}

const transactions: Transaction[] = [
  {
    id: '1',
    description: 'Cloud hosting (monthly)',
    category: 'Infrastructure',
    quantity: 1,
    amount: '$2,400.00',
  },
  {
    id: '2',
    description: 'Design software licenses',
    category: 'Tools',
    quantity: 12,
    amount: '$1,188.00',
  },
  {
    id: '3',
    description: 'Team offsite catering',
    category: 'Events',
    quantity: 45,
    amount: '$3,150.00',
  },
  {
    id: '4',
    description: 'Ergonomic keyboards',
    category: 'Hardware',
    quantity: 8,
    amount: '$1,592.00',
  },
  {
    id: '5',
    description: 'Annual conference tickets',
    category: 'Travel',
    quantity: 3,
    amount: '$4,500.00',
  },
];

const alignedColumns: XDSTableColumn<Transaction>[] = [
  {key: 'description', header: 'Description', width: proportional(2)},
  {key: 'category', header: 'Category'},
  {key: 'quantity', header: 'Qty', align: 'center', width: pixel(80)},
  {key: 'amount', header: 'Amount', align: 'end', width: pixel(120)},
];

/**
 * Per-column horizontal alignment via the `align` prop.
 *
 * - `'start'` (default) — left in LTR, right in RTL
 * - `'center'` — centered text
 * - `'end'` — right in LTR, left in RTL
 *
 * Alignment applies to both the header `<th>` and body `<td>` cells.
 * Numeric columns typically use `align: 'end'`, while status or icon
 * columns work well with `align: 'center'`.
 */
export const ColumnAlignment: Story = {
  render: () => (
    <XDSTable
      data={transactions}
      columns={alignedColumns}
      idKey="id"
      hasHover
      dividers="rows"
    />
  ),
};

// =============================================================================
// Vertical Alignment
// =============================================================================

interface TeamMember extends Record<string, unknown> {
  id: string;
  name: string;
  bio: string;
  role: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    bio: 'Full-stack engineer with 8 years of experience. Specializes in distributed systems and performance optimization. Previously at Stripe and Google.',
    role: 'Staff Engineer',
  },
  {
    id: '2',
    name: 'Bob Smith',
    bio: 'Product designer focused on design systems and accessibility.',
    role: 'Senior Designer',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    bio: 'Engineering manager leading the platform team. Passionate about developer experience, tooling, and building inclusive teams that ship with confidence.',
    role: 'EM',
  },
];

const verticalAlignColumns: XDSTableColumn<TeamMember>[] = [
  {key: 'name', header: 'Name', width: pixel(140)},
  {
    key: 'bio',
    header: 'Bio',
    width: proportional(3),
    renderCell: item => (
      <span
        style={{
          whiteSpace: 'normal',
          overflow: 'visible',
          display: 'block',
        }}>
        {item.bio}
      </span>
    ),
  },
  {key: 'role', header: 'Role', align: 'end', width: pixel(140)},
];

/**
 * Compares all three `verticalAlign` options side by side.
 *
 * - `'middle'` (default) — vertically centers cell content
 * - `'top'` — aligns to the top, useful for multi-line cells
 * - `'bottom'` — aligns to the bottom
 *
 * Uses a multi-line "Bio" column with wrapping text to make
 * the vertical alignment difference visible.
 */
export const VerticalAlignment: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
      {(['middle', 'top', 'bottom'] as const).map(vAlign => (
        <div key={vAlign}>
          <p style={{margin: '0 0 8px', fontWeight: 600}}>
            verticalAlign=&quot;{vAlign}&quot;
          </p>
          <XDSTable
            data={teamMembers}
            columns={verticalAlignColumns}
            idKey="id"
            verticalAlign={vAlign}
            dividers="rows"
          />
        </div>
      ))}
    </div>
  ),
};
