import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  box: {
    backgroundColor: colorVars['--color-blue-background'],
    color: colorVars['--color-blue-text'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-blue-border'],
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-6'],
    borderRadius: radiusVars['--radius-element'],
    fontWeight: 500,
    height: '100%',
    boxSizing: 'border-box',
  },
  boxAlt: {
    backgroundColor: colorVars['--color-gray-background'],
    color: colorVars['--color-gray-text'],
    borderColor: colorVars['--color-gray-border'],
  },
  boxGreen: {
    backgroundColor: colorVars['--color-green-background'],
    color: colorVars['--color-green-text'],
    borderColor: colorVars['--color-green-border'],
  },
  boxPurple: {
    backgroundColor: colorVars['--color-purple-background'],
    color: colorVars['--color-purple-text'],
    borderColor: colorVars['--color-purple-border'],
  },
  boxOrange: {
    backgroundColor: colorVars['--color-orange-background'],
    color: colorVars['--color-orange-text'],
    borderColor: colorVars['--color-orange-border'],
  },
  container: {
    backgroundColor: colorVars['--color-wash'],
  },
  containerWidth: {
    width: 500,
  },
  containerWidthLarge: {
    width: 600,
  },
  containerHeight: {
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
  heading: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-body'],
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

const meta: Meta<typeof XDSStackItem> = {
  title: 'Layout/XDSStackItem',
  component: XDSStackItem,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['static', 'fill'],
      description: 'Size behavior within the stack',
    },
    crossAlignSelf: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Override cross-axis alignment for this item',
    },
    element: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside', 'span'],
      description: 'HTML element to render',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSStackItem>;

export const Default: Story = {
  args: {
    size: 'static',
    children: null,
  },
  render: args => (
    <XDSHStack
      gap="space2"
      xstyle={[
        styles.container,
        styles.containerWidth,
        styles.containerPadding,
      ]}>
      <XDSStackItem {...args}>
        <Box>Stack Item</Box>
      </XDSStackItem>
      <Box alt>Other Item</Box>
    </XDSHStack>
  ),
};

export const FillSize: Story = {
  render: () => (
    <XDSHStack
      gap="space2"
      xstyle={[
        styles.container,
        styles.containerWidth,
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
    </XDSHStack>
  ),
};

export const EqualFill: Story = {
  render: () => (
    <div>
      <h4 {...stylex.props(styles.heading)}>Equal Fill (1:1:1)</h4>
      <XDSHStack
        gap="space2"
        xstyle={[
          styles.container,
          styles.containerWidth,
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
      </XDSHStack>
    </div>
  ),
};

export const CrossAlignSelf: Story = {
  render: () => (
    <XDSHStack
      gap="space2"
      xstyle={[
        styles.container,
        styles.containerHeight,
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
    </XDSHStack>
  ),
};

export const PolymorphicElement: Story = {
  render: () => (
    <XDSHStack
      gap="space2"
      xstyle={[
        styles.container,
        styles.containerWidth,
        styles.containerPadding,
      ]}>
      <XDSStackItem element="section" size="fill">
        <Box>section element</Box>
      </XDSStackItem>
      <XDSStackItem element="article" size="fill">
        <Box green>article element</Box>
      </XDSStackItem>
      <XDSStackItem element="aside" size="static">
        <Box purple>aside element</Box>
      </XDSStackItem>
    </XDSHStack>
  ),
};

export const CommonLayoutPattern: Story = {
  render: () => (
    <XDSVStack gap="space4">
      <div>
        <h4 {...stylex.props(styles.heading)}>Header Layout</h4>
        <XDSHStack
          gap="space2"
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
        </XDSHStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Sidebar Layout</h4>
        <XDSHStack
          gap="space2"
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
        </XDSHStack>
      </div>
    </XDSVStack>
  ),
};
