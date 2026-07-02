// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Stack, StackItem} from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  box: {
    backgroundColor: colorVars['--color-background-blue'],
    color: colorVars['--color-text-blue'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-blue'],
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-6'],
    borderRadius: radiusVars['--radius-element'],
    fontWeight: 500,
    height: '100%',
    boxSizing: 'border-box',
  },
  boxAlt: {
    backgroundColor: colorVars['--color-background-gray'],
    color: colorVars['--color-text-gray'],
    borderColor: colorVars['--color-border-gray'],
  },
  boxGreen: {
    backgroundColor: colorVars['--color-background-green'],
    color: colorVars['--color-text-green'],
    borderColor: colorVars['--color-border-green'],
  },
  boxPurple: {
    backgroundColor: colorVars['--color-background-purple'],
    color: colorVars['--color-text-purple'],
    borderColor: colorVars['--color-border-purple'],
  },
  boxOrange: {
    backgroundColor: colorVars['--color-background-orange'],
    color: colorVars['--color-text-orange'],
    borderColor: colorVars['--color-border-orange'],
  },
  container: {
    backgroundColor: colorVars['--color-background-body'],
  },
  containerWidth: {
    width: 300,
  },
  containerWidthMedium: {
    width: 500,
  },
  containerWidthLarge: {
    width: 600,
  },
  containerWidthSmall: {
    width: 150,
  },
  containerHeight: {
    height: 120,
  },
  containerHeightSmall: {
    height: 80,
  },
  containerHeightMedium: {
    height: 150,
  },
  containerHeightLarge: {
    height: 200,
  },
  containerPadding: {
    padding: spacingVars['--spacing-2'],
  },
  sidebarWidth: {
    width: 150,
  },
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  storyWrapperRow: {
    display: 'flex',
    gap: spacingVars['--spacing-6'],
  },
  heading: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-family-body'],
  },
});

// Demo box component for visibility
const Box = ({
  children,
  alt = false,
  green = false,
  purple = false,
  orange = false,
}: {
  children: React.ReactNode;
  alt?: boolean;
  green?: boolean;
  purple?: boolean;
  orange?: boolean;
}) => (
  <div
    {...stylex.props(
      styles.box,
      alt && styles.boxAlt,
      green && styles.boxGreen,
      purple && styles.boxPurple,
      orange && styles.boxOrange,
    )}>
    {children}
  </div>
);

const meta: Meta<typeof Stack> = {
  title: 'Core/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the stack layout',
    },
    gap: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description: 'Spacing step for gap between items',
    },
    padding: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description: 'Inner padding on all sides (spacing step)',
    },
    paddingInline: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description:
        'Inline (horizontal) padding; overrides padding on that axis',
    },
    paddingBlock: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
      description: 'Block (vertical) padding; overrides padding on that axis',
    },
    isScrollable: {
      control: 'boolean',
      description: 'Enables scrollable overflow (overflow: auto)',
    },
    hAlign: {
      control: 'select',
      options: [
        'start',
        'center',
        'end',
        'stretch',
        'between',
        'around',
        'evenly',
      ],
      description:
        'Horizontal alignment. Main-axis when horizontal, cross-axis when vertical.',
    },
    vAlign: {
      control: 'select',
      options: [
        'start',
        'center',
        'end',
        'stretch',
        'between',
        'around',
        'evenly',
      ],
      description:
        'Vertical alignment. Cross-axis when horizontal, main-axis when vertical.',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

// ============================================================================
// Basic examples
// ============================================================================

export const Default: Story = {
  args: {
    gap: 2,
    children: null,
  },
  render: args => (
    <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    gap: 2,
  },
  render: args => (
    <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    gap: 4,
  },
  render: args => (
    <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

// ============================================================================
// Alignment
// ============================================================================

/**
 * Main-axis alignment for horizontal stacks (hAlign → justify-content).
 * Uses a wide container so the spacing differences are clearly visible.
 */
export const HorizontalAlignments: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: start (default)</h4>
        <Stack
          direction="horizontal"
          gap={2}
          hAlign="start"
          xstyle={[
            styles.container,
            styles.containerWidthLarge,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: center</h4>
        <Stack
          direction="horizontal"
          gap={2}
          hAlign="center"
          xstyle={[
            styles.container,
            styles.containerWidthLarge,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: end</h4>
        <Stack
          direction="horizontal"
          gap={2}
          hAlign="end"
          xstyle={[
            styles.container,
            styles.containerWidthLarge,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: between</h4>
        <Stack
          direction="horizontal"
          gap={2}
          hAlign="between"
          xstyle={[
            styles.container,
            styles.containerWidthLarge,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: evenly</h4>
        <Stack
          direction="horizontal"
          gap={2}
          hAlign="evenly"
          xstyle={[
            styles.container,
            styles.containerWidthLarge,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      </div>
    </div>
  ),
};

/**
 * Cross-axis alignment for horizontal stacks (vAlign → align-items).
 * Uses items with different heights so alignment differences are visible.
 */
export const HorizontalCrossAxisAlignment: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: start</h4>
        <Stack
          direction="horizontal"
          gap={2}
          vAlign="start"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: center</h4>
        <Stack
          direction="horizontal"
          gap={2}
          vAlign="center"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: end</h4>
        <Stack
          direction="horizontal"
          gap={2}
          vAlign="end"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: stretch (default)</h4>
        <Stack
          direction="horizontal"
          gap={2}
          vAlign="stretch"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </Stack>
      </div>
    </div>
  ),
};

export const VerticalAlignments: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapperRow)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: start
        </h4>
        <Stack
          direction="vertical"
          gap={2}
          hAlign="start"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: center
        </h4>
        <Stack
          direction="vertical"
          gap={2}
          hAlign="center"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: end
        </h4>
        <Stack
          direction="vertical"
          gap={2}
          hAlign="end"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: stretch
        </h4>
        <Stack
          direction="vertical"
          gap={2}
          hAlign="stretch"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </Stack>
      </div>
    </div>
  ),
};

// ============================================================================
// Wrapping
// ============================================================================

export const Wrapping: Story = {
  args: {
    direction: 'horizontal',
    gap: 2,
    wrap: 'wrap',
  },
  render: args => (
    <Stack
      {...args}
      xstyle={[
        styles.container,
        styles.containerWidth,
        styles.containerPadding,
      ]}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
      <Box>Item 4</Box>
      <Box>Item 5</Box>
    </Stack>
  ),
};

// ============================================================================
// StackItem examples (merged from StackItem stories)
// ============================================================================

export const StackItemFillSize: Story = {
  render: () => (
    <Stack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerWidthMedium,
        styles.containerPadding,
      ]}>
      <StackItem size="static">
        <Box alt>Static</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Fill (grows to fill remaining space)</Box>
      </StackItem>
      <StackItem size="static">
        <Box alt>Static</Box>
      </StackItem>
    </Stack>
  ),
};

export const StackItemEqualFill: Story = {
  render: () => (
    <div>
      <h4 {...stylex.props(styles.heading)}>Equal Fill (1:1:1)</h4>
      <Stack
        direction="horizontal"
        gap={2}
        xstyle={[
          styles.container,
          styles.containerWidthMedium,
          styles.containerPadding,
        ]}>
        <StackItem size="fill">
          <Box>fill</Box>
        </StackItem>
        <StackItem size="fill">
          <Box green>fill</Box>
        </StackItem>
        <StackItem size="fill">
          <Box purple>fill</Box>
        </StackItem>
      </Stack>
    </div>
  ),
};

export const StackItemCrossAlignSelf: Story = {
  render: () => (
    <Stack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerHeightMedium,
        styles.containerPadding,
      ]}>
      <StackItem crossAlignSelf="start">
        <Box>start</Box>
      </StackItem>
      <StackItem crossAlignSelf="center">
        <Box green>center</Box>
      </StackItem>
      <StackItem crossAlignSelf="end">
        <Box purple>end</Box>
      </StackItem>
      <StackItem crossAlignSelf="stretch">
        <Box orange>stretch</Box>
      </StackItem>
    </Stack>
  ),
};

// ============================================================================
// Common layout patterns
// ============================================================================

export const HeaderLayout: Story = {
  render: () => (
    <Stack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerWidthLarge,
        styles.containerPadding,
      ]}>
      <StackItem size="static">
        <Box alt>Logo</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Navigation</Box>
      </StackItem>
      <StackItem size="static">
        <Box alt>Actions</Box>
      </StackItem>
    </Stack>
  ),
};

export const SidebarLayout: Story = {
  render: () => (
    <Stack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerWidthLarge,
        styles.containerHeightLarge,
        styles.containerPadding,
      ]}>
      <StackItem size="static" xstyle={styles.sidebarWidth}>
        <Box alt>Sidebar</Box>
      </StackItem>
      <StackItem size="fill">
        <Box>Main Content</Box>
      </StackItem>
    </Stack>
  ),
};

export const PageLayout: Story = {
  render: () => (
    <Stack direction="vertical" gap={2} xstyle={styles.containerWidthLarge}>
      <Stack
        direction="horizontal"
        gap={2}
        xstyle={[styles.container, styles.containerPadding]}>
        <StackItem size="static">
          <Box alt>Logo</Box>
        </StackItem>
        <StackItem size="fill">
          <Box>Navigation</Box>
        </StackItem>
        <StackItem size="static">
          <Box alt>Actions</Box>
        </StackItem>
      </Stack>
      <Stack
        direction="horizontal"
        gap={2}
        xstyle={[
          styles.container,
          styles.containerHeightLarge,
          styles.containerPadding,
        ]}>
        <StackItem size="static" xstyle={styles.sidebarWidth}>
          <Box alt>Sidebar</Box>
        </StackItem>
        <StackItem size="fill">
          <Box>Main Content</Box>
        </StackItem>
      </Stack>
    </Stack>
  ),
};

// ============================================================================
// Padding — inner padding via the spacing scale (no inline styles needed)
// ============================================================================

export const Padding: Story = {
  args: {
    gap: 2,
    padding: 4,
  },
  render: args => (
    <Stack {...args} xstyle={styles.container}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const PaddingPerAxis: Story = {
  args: {
    gap: 2,
    paddingInline: 6,
    paddingBlock: 2,
  },
  render: args => (
    <Stack {...args} xstyle={styles.container}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

// ============================================================================
// Scrollable — overflow: auto via the isScrollable prop
// ============================================================================

export const Scrollable: Story = {
  args: {
    gap: 2,
    padding: 2,
    isScrollable: true,
    height: 160,
  },
  render: args => (
    <Stack {...args} xstyle={styles.container}>
      {Array.from({length: 12}, (_, i) => (
        <Box key={i}>Item {i + 1}</Box>
      ))}
    </Stack>
  ),
};
