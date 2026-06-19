// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Grid, GridSpan} from '@xds/core/Grid';
import {Card} from '@xds/core/Card';
import {Section} from '@xds/core/Section';
import {Text} from '@xds/core/Text';
import {VStack} from '@xds/core/Stack';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  container: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
  },
  item: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-body'],
    borderRadius: radiusVars['--radius-element'],
    textAlign: 'center',
  },
  featuredItem: {
    padding: spacingVars['--spacing-6'],
    backgroundColor: colorVars['--color-accent-muted'],
    borderRadius: radiusVars['--radius-element'],
    textAlign: 'center',
    height: '100%',
    boxSizing: 'border-box',
  },
  cardImage: {
    height: 120,
    backgroundColor: colorVars['--color-background-body'],
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

const meta: Meta<typeof Grid> = {
  title: 'Core/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'object',
      description:
        'Column configuration: number for fixed columns, or {minWidth, max?, repeat?} for responsive',
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
type Story = StoryObj<typeof Grid>;

const GridItem = ({children}: {children: React.ReactNode}) => (
  <div {...stylex.props(styles.item)}>
    <Text type="body">{children}</Text>
  </div>
);

const FeaturedItem = ({children}: {children: React.ReactNode}) => (
  <div {...stylex.props(styles.featuredItem)}>
    <Text type="body">{children}</Text>
  </div>
);

export const Default: Story = {
  args: {
    columns: 3,
    gap: 4,
  },
  render: args => (
    <div {...stylex.props(styles.container)}>
      <Grid {...args}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </Grid>
    </div>
  ),
};

export const FixedColumns: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          2 Columns
        </Text>
        <Grid columns={2} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          4 Columns
        </Text>
        <Grid columns={4} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
          <GridItem>Item 7</GridItem>
          <GridItem>Item 8</GridItem>
        </Grid>
      </div>
    </div>
  ),
};

/**
 * auto-fit (repeat: 'fit') stretches items to fill when there are fewer
 * items than available columns. Compare with auto-fill (default) which
 * preserves consistent widths.
 */
export const ResponsiveAutoFit: Story = {
  render: () => (
    <VStack gap={6}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          {
            'columns={{minWidth: 200}} with 2 items — cards stretch to fill (auto-fit)'
          }
        </Text>
        <Grid columns={{minWidth: 200}} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          
          Same grid with 6 items; looks fine because items fill the tracks
        </Text>
        <Grid columns={{minWidth: 200}} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </Grid>
      </div>
    </VStack>
  ),
};

/** New API: responsive columns with auto-fill (consistent widths) */
export const ResponsiveAutoFill: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Resize the viewport — columns auto-fill, empty tracks preserved (min
        200px per item)
      </Text>
      <Grid columns={{minWidth: 200}} gap={4}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
      </Grid>
    </div>
  ),
};

/** Side-by-side comparison: auto-fill vs auto-fit with few items */
export const FillVsFitComparison: Story = {
  render: () => (
    <VStack gap={6}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          auto-fill (default) — items stay consistent width, empty tracks
          preserved
        </Text>
        <Grid columns={{minWidth: 250}} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          auto-fit — items stretch to fill all available space
        </Text>
        <Grid columns={{minWidth: 250, repeat: 'fit'}} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
        </Grid>
      </div>
    </VStack>
  ),
};

export const CappedResponsive: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Responsive with max 3 columns (min 250px per item, capped via track-max)
      </Text>
      <Grid columns={{minWidth: 250, max: 3}} gap={4}>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </Grid>
    </div>
  ),
};

export const WithGridSpan: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Using GridSpan to span multiple columns/rows
      </Text>
      <Grid columns={4} gap={4}>
        <GridSpan columns={2}>
          <FeaturedItem>Spans 2 columns</FeaturedItem>
        </GridSpan>
        <GridItem>Normal</GridItem>
        <GridItem>Normal</GridItem>
        <GridItem>Normal</GridItem>
        <GridSpan columns={3}>
          <FeaturedItem>Spans 3 columns</FeaturedItem>
        </GridSpan>
        <GridSpan columns="full">
          <FeaturedItem>Full width (spans all columns)</FeaturedItem>
        </GridSpan>
      </Grid>
    </div>
  ),
};

export const GridSpanWithRows: Story = {
  render: () => (
    <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Grid items spanning both columns and rows
      </Text>
      <Grid columns={4} gap={4}>
        <GridSpan columns={2} rows={2}>
          <FeaturedItem>2x2 Featured</FeaturedItem>
        </GridSpan>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </Grid>
    </div>
  ),
};

export const GalleryExample: Story = {
  render: () => (
    <Section variant="muted">
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Gallery/Card Grid — Responsive with min 280px cards (auto-fill)
      </Text>
      <Grid columns={{minWidth: 280}} gap={5}>
        {Array.from({length: 8}, (_, i) => (
          <Card key={i}>
            <div {...stylex.props(styles.cardImage)} />
            <Text type="label" display="block">
              Card Title {i + 1}
            </Text>
            <Text type="supporting" display="block">
              A brief description of the card content goes here.
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  ),
};

export const DifferentGaps: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          Same gap for rows and columns (gap=4)
        </Text>
        <Grid columns={3} gap={4}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </Grid>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          Different gaps: rowGap=2, columnGap=6
        </Text>
        <Grid columns={3} rowGap={2} columnGap={6}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
          <GridItem>Item 4</GridItem>
          <GridItem>Item 5</GridItem>
          <GridItem>Item 6</GridItem>
        </Grid>
      </div>
    </div>
  ),
};

export const DashboardLayout: Story = {
  render: () => (
    <Section variant="muted">
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Dashboard-style layout with different sized widgets
      </Text>
      <Grid columns={4} gap={4}>
        <GridSpan columns={2} rows={2}>
          <Card>
            <Text type="label" display="block">
              Main Chart
            </Text>
            <Text type="supporting" display="block">
              Large visualization widget
            </Text>
          </Card>
        </GridSpan>
        <Card>
          <Text type="label" display="block">
            Metric 1
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <Card>
          <Text type="label" display="block">
            Metric 2
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <Card>
          <Text type="label" display="block">
            Metric 3
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <Card>
          <Text type="label" display="block">
            Metric 4
          </Text>
          <Text type="supporting" display="block">
            Quick stat
          </Text>
        </Card>
        <GridSpan columns="full">
          <Card>
            <Text type="label" display="block">
              Full-width Section
            </Text>
            <Text type="supporting" display="block">
              This section spans the entire width of the grid
            </Text>
          </Card>
        </GridSpan>
      </Grid>
    </Section>
  ),
};
