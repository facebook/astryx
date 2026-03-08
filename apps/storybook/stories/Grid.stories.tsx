import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText} from '@xds/core/Text';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  container: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-surface'],
  },
  item: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-wash'],
    borderRadius: radiusVars['--radius-element'],
    textAlign: 'center',
  },
  featuredItem: {
    padding: spacingVars['--spacing-6'],
    backgroundColor: colorVars['--color-accent-deemphasized'],
    borderRadius: radiusVars['--radius-element'],
    textAlign: 'center',
    height: '100%',
    boxSizing: 'border-box',
  },
  cardImage: {
    height: 120,
    backgroundColor: colorVars['--color-wash'],
    borderRadius: radiusVars['--radius-element'],
    marginBlockEnd: spacingVars['--spacing-3'],
  },
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  sectionLabel: {
    marginBlockEnd: spacingVars['--spacing-2'],
  },
});

const meta: Meta<typeof XDSGrid> = {
  title: 'Layout/XDSGrid',
  component: XDSGrid,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'number',
      description: 'Maximum number of columns',
    },
    minChildWidth: {
      control: 'number',
      description:
        'Minimum width of each grid item in pixels (enables auto-fit)',
    },
    gap: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description: 'Spacing between all grid items',
    },
    rowGap: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description: 'Spacing between rows (overrides gap)',
    },
    columnGap: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description: 'Spacing between columns (overrides gap)',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of grid items',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Horizontal alignment of grid items',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSGrid>;

const GridItem = ({children}: {children: React.ReactNode}) => (
  <div {...stylex.props(styles.item)}>
    <XDSText type="body">{children}</XDSText>
  </div>
);

const FeaturedItem = ({children}: {children: React.ReactNode}) => (
  <div {...stylex.props(styles.featuredItem)}>
    <XDSText type="body">{children}</XDSText>
  </div>
);

export const Default: Story = {
  args: {
    columns: 3,
    gap: 4,
  },
  render: args => (
    <div {...stylex.props(styles.container)}>
      <XDSGrid {...args}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </XDSGrid>
    </div>
  ),
};

export const FixedColumns: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          2 Columns
        </XDSText>
        <XDSGrid columns={2} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
        </XDSGrid>
      </div>
      <div {...stylex.props(styles.container)}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          4 Columns
        </XDSText>
        <XDSGrid columns={4} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
          <GridItem>Item 7</GridItem>
          <GridItem>Item 8</GridItem>
        </XDSGrid>
      </div>
    </div>
  ),
};

export const ResponsiveAutoFit: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Resize the viewport - columns adjust automatically (min 200px per item)
      </XDSText>
      <XDSGrid minChildWidth={200} gap={4}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </XDSGrid>
    </div>
  ),
};

export const CappedResponsive: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Auto-fit with max 3 columns (min 250px per item, capped via max-width)
      </XDSText>
      <XDSGrid columns={3} minChildWidth={250} gap={4}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </XDSGrid>
    </div>
  ),
};

export const WithGridSpan: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Using XDSGridSpan to span multiple columns/rows
      </XDSText>
      <XDSGrid columns={4} gap={4}>
        <XDSGridSpan columns={2}>
          <FeaturedItem>Spans 2 columns</FeaturedItem>
        </XDSGridSpan>
        <GridItem>Normal</GridItem>
        <GridItem>Normal</GridItem>
        <GridItem>Normal</GridItem>
        <XDSGridSpan columns={3}>
          <FeaturedItem>Spans 3 columns</FeaturedItem>
        </XDSGridSpan>
        <XDSGridSpan columns="full">
          <FeaturedItem>Full width (spans all columns)</FeaturedItem>
        </XDSGridSpan>
      </XDSGrid>
    </div>
  ),
};

export const GridSpanWithRows: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Grid items spanning both columns and rows
      </XDSText>
      <XDSGrid columns={4} gap={4}>
        <XDSGridSpan columns={2} rows={2}>
          <FeaturedItem>2x2 Featured</FeaturedItem>
        </XDSGridSpan>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </XDSGrid>
    </div>
  ),
};

export const GalleryExample: Story = {
  render: () => (
    <XDSSection variant="wash">
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Gallery/Card Grid - Responsive with min 280px cards
      </XDSText>
      <XDSGrid minChildWidth={280} gap={5}>
        {Array.from({length: 8}, (_, i) => (
          <XDSCard key={i}>
            <div {...stylex.props(styles.cardImage)} />
            <XDSText type="label" display="block">
              Card Title {i + 1}
            </XDSText>
            <XDSText type="supporting" display="block">
              A brief description of the card content goes here.
            </XDSText>
          </XDSCard>
        ))}
      </XDSGrid>
    </XDSSection>
  ),
};

export const DifferentGaps: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          Same gap for rows and columns (space4)
        </XDSText>
        <XDSGrid columns={3} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </XDSGrid>
      </div>
      <div {...stylex.props(styles.container)}>
        <XDSText type="supporting" xstyle={styles.sectionLabel}>
          Different gaps: rowGap=space2, columnGap=space6
        </XDSText>
        <XDSGrid columns={3} rowGap={2} columnGap={6}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </XDSGrid>
      </div>
    </div>
  ),
};

export const DashboardLayout: Story = {
  render: () => (
    <XDSSection variant="wash">
      <XDSText type="supporting" xstyle={styles.sectionLabel}>
        Dashboard-style layout with different sized widgets
      </XDSText>
      <XDSGrid columns={4} gap={4}>
        <XDSGridSpan columns={2} rows={2}>
          <XDSCard>
            <XDSText type="label" display="block">
              Main Chart
            </XDSText>
            <XDSText type="supporting" display="block">
              Large visualization widget
            </XDSText>
          </XDSCard>
        </XDSGridSpan>
        <XDSCard>
          <XDSText type="label" display="block">
            Metric 1
          </XDSText>
          <XDSText type="supporting" display="block">
            Quick stat
          </XDSText>
        </XDSCard>
        <XDSCard>
          <XDSText type="label" display="block">
            Metric 2
          </XDSText>
          <XDSText type="supporting" display="block">
            Quick stat
          </XDSText>
        </XDSCard>
        <XDSCard>
          <XDSText type="label" display="block">
            Metric 3
          </XDSText>
          <XDSText type="supporting" display="block">
            Quick stat
          </XDSText>
        </XDSCard>
        <XDSCard>
          <XDSText type="label" display="block">
            Metric 4
          </XDSText>
          <XDSText type="supporting" display="block">
            Quick stat
          </XDSText>
        </XDSCard>
        <XDSGridSpan columns="full">
          <XDSCard>
            <XDSText type="label" display="block">
              Full-width Section
            </XDSText>
            <XDSText type="supporting" display="block">
              This section spans the entire width of the grid
            </XDSText>
          </XDSCard>
        </XDSGridSpan>
      </XDSGrid>
    </XDSSection>
  ),
};
