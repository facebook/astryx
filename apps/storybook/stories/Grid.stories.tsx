// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@astryxdesign/core/theme/tokens.stylex';

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
        'Column configuration: number for at most N columns, {count, isFixed: true} for exactly N, or {minWidth, max?, repeat?} for responsive',
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
        <Grid columns={{count: 2, isFixed: true}} gap={4}>
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
        <Grid columns={{count: 4, isFixed: true}} gap={4}>
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
        Responsive with max 3 columns (min 250px per item; column count is
        capped but present columns always fill)
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

export const CappedCollapsesToFullWidth: Story = {
  name: 'Capped — fills when collapsed (#3391)',
  render: () => (
    <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        columns={'{{minWidth: 360, max: 2}}'} — resize the viewport narrow
        enough that only one column fits. The lone column stretches to full
        width (no dead space on the right); on wider viewports it caps at 2.
      </Text>
      <div style={{maxWidth: 520, resize: 'horizontal', overflow: 'auto'}}>
        <Grid columns={{minWidth: 360, max: 2}} gap={4}>
          <GridItem>Left block</GridItem>
          <GridItem>Right block</GridItem>
        </Grid>
      </div>
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

const atMostStyles = stylex.create({
  frames: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-6'],
  },
  frame: {
    boxSizing: 'border-box',
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-element'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
  },
  frame390: {width: 390},
  frame768: {width: 768},
  frame1200: {width: 1200},
});

const STATS = [
  {label: 'Active users', value: '12,480'},
  {label: 'Conversion', value: '4.2%'},
  {label: 'Revenue', value: '$84,210'},
  {label: 'Churn', value: '1.8%'},
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AtMostFrame = ({width}: {width: 390 | 768 | 1200}) => (
  <div
    {...stylex.props(
      atMostStyles.frame,
      width === 390
        ? atMostStyles.frame390
        : width === 768
          ? atMostStyles.frame768
          : atMostStyles.frame1200,
    )}>
    <Text type="supporting">{width}px frame</Text>
    <Grid columns={4} gap={4}>
      {STATS.map(stat => (
        <Card key={stat.label} padding={4}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              {stat.label}
            </Text>
            <Text type="body" weight="semibold">
              {stat.value}
            </Text>
          </VStack>
        </Card>
      ))}
    </Grid>
    <Grid columns={3} gap={4}>
      <GridSpan columns={2}>
        <FeaturedItem>Chart (span 2)</FeaturedItem>
      </GridSpan>
      <GridItem>Side</GridItem>
    </Grid>
    <Grid columns={{count: 7, isFixed: true}} gap={1}>
      {DAYS.map(day => (
        <GridItem key={day}>{day}</GridItem>
      ))}
    </Grid>
  </div>
);

/**
 * `columns={N}` means at most N columns (each at least 12rem wide): the stat
 * tiles show 4 across at 1200px, fewer at 768px, and one per row at 390px. A
 * GridSpan in a numeric grid takes the full row once the grid has fewer
 * columns than it spans. The week row uses `{count: 7, isFixed: true}` and
 * stays 7 across in every frame.
 */
export const AtMostNColumns: Story = {
  name: 'At most N columns — 390 / 768 / 1200',
  render: () => (
    <div {...stylex.props(atMostStyles.frames)}>
      <AtMostFrame width={390} />
      <AtMostFrame width={768} />
      <AtMostFrame width={1200} />
    </div>
  ),
};
