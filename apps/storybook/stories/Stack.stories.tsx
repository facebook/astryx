import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSStack, XDSStackItem} from '@xds/core/Layout';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

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

const meta: Meta<typeof XDSStack> = {
  title: 'Core/Stack',
  component: XDSStack,
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
type Story = StoryObj<typeof XDSStack>;

// ============================================================================
// Basic examples
// ============================================================================

export const Default: Story = {
  args: {
    gap: 2,
    children: null,
  },
  render: args => (
    <XDSStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSStack>
  ),
};

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    gap: 2,
  },
  render: args => (
    <XDSStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSStack>
  ),
};

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    gap: 4,
  },
  render: args => (
    <XDSStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSStack>
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
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: center</h4>
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: end</h4>
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: between</h4>
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: evenly</h4>
        <XDSStack
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
        </XDSStack>
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
        <XDSStack
          direction="horizontal"
          gap={2}
          vAlign="start"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: center</h4>
        <XDSStack
          direction="horizontal"
          gap={2}
          vAlign="center"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: end</h4>
        <XDSStack
          direction="horizontal"
          gap={2}
          vAlign="end"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: stretch (default)</h4>
        <XDSStack
          direction="horizontal"
          gap={2}
          vAlign="stretch"
          xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSStack>
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
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: center
        </h4>
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: end
        </h4>
        <XDSStack
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
        </XDSStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>
          direction=&quot;vertical&quot;, hAlign: stretch
        </h4>
        <XDSStack
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
        </XDSStack>
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
    <XDSStack
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
    </XDSStack>
  ),
};

// ============================================================================
// XDSStackItem examples (merged from StackItem stories)
// ============================================================================

export const StackItemFillSize: Story = {
  render: () => (
    <XDSStack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerWidthMedium,
        styles.containerPadding,
      ]}>
      <XDSStackItem size="static">
        <Box alt>Static</Box>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <Box>Fill (grows to fill remaining space)</Box>
      </XDSStackItem>
      <XDSStackItem size="static">
        <Box alt>Static</Box>
      </XDSStackItem>
    </XDSStack>
  ),
};

export const StackItemEqualFill: Story = {
  render: () => (
    <div>
      <h4 {...stylex.props(styles.heading)}>Equal Fill (1:1:1)</h4>
      <XDSStack
        direction="horizontal"
        gap={2}
        xstyle={[
          styles.container,
          styles.containerWidthMedium,
          styles.containerPadding,
        ]}>
        <XDSStackItem size="fill">
          <Box>fill</Box>
        </XDSStackItem>
        <XDSStackItem size="fill">
          <Box green>fill</Box>
        </XDSStackItem>
        <XDSStackItem size="fill">
          <Box purple>fill</Box>
        </XDSStackItem>
      </XDSStack>
    </div>
  ),
};

export const StackItemCrossAlignSelf: Story = {
  render: () => (
    <XDSStack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerHeightMedium,
        styles.containerPadding,
      ]}>
      <XDSStackItem crossAlignSelf="start">
        <Box>start</Box>
      </XDSStackItem>
      <XDSStackItem crossAlignSelf="center">
        <Box green>center</Box>
      </XDSStackItem>
      <XDSStackItem crossAlignSelf="end">
        <Box purple>end</Box>
      </XDSStackItem>
      <XDSStackItem crossAlignSelf="stretch">
        <Box orange>stretch</Box>
      </XDSStackItem>
    </XDSStack>
  ),
};

// ============================================================================
// Common layout patterns
// ============================================================================

export const HeaderLayout: Story = {
  render: () => (
    <XDSStack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerWidthLarge,
        styles.containerPadding,
      ]}>
      <XDSStackItem size="static">
        <Box alt>Logo</Box>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <Box>Navigation</Box>
      </XDSStackItem>
      <XDSStackItem size="static">
        <Box alt>Actions</Box>
      </XDSStackItem>
    </XDSStack>
  ),
};

export const SidebarLayout: Story = {
  render: () => (
    <XDSStack
      direction="horizontal"
      gap={2}
      xstyle={[
        styles.container,
        styles.containerWidthLarge,
        styles.containerHeightLarge,
        styles.containerPadding,
      ]}>
      <XDSStackItem size="static" xstyle={styles.sidebarWidth}>
        <Box alt>Sidebar</Box>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <Box>Main Content</Box>
      </XDSStackItem>
    </XDSStack>
  ),
};

export const PageLayout: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={2} xstyle={styles.containerWidthLarge}>
      <XDSStack
        direction="horizontal"
        gap={2}
        xstyle={[styles.container, styles.containerPadding]}>
        <XDSStackItem size="static">
          <Box alt>Logo</Box>
        </XDSStackItem>
        <XDSStackItem size="fill">
          <Box>Navigation</Box>
        </XDSStackItem>
        <XDSStackItem size="static">
          <Box alt>Actions</Box>
        </XDSStackItem>
      </XDSStack>
      <XDSStack
        direction="horizontal"
        gap={2}
        xstyle={[
          styles.container,
          styles.containerHeightLarge,
          styles.containerPadding,
        ]}>
        <XDSStackItem size="static" xstyle={styles.sidebarWidth}>
          <Box alt>Sidebar</Box>
        </XDSStackItem>
        <XDSStackItem size="fill">
          <Box>Main Content</Box>
        </XDSStackItem>
      </XDSStack>
    </XDSStack>
  ),
};
