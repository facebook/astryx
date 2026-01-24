import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
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
  },
  boxAlt: {
    backgroundColor: colorVars['--color-gray-background'],
    color: colorVars['--color-gray-text'],
    borderColor: colorVars['--color-gray-border'],
  },
  container: {
    backgroundColor: colorVars['--color-wash'],
  },
  containerWidth: {
    width: 300,
  },
  containerWidthSmall: {
    width: 150,
  },
  containerHeight: {
    height: 150,
  },
  containerPadding: {
    padding: spacingVars['--spacing-2'],
  },
  storyWrapper: {
    display: 'flex',
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
}: {
  children: React.ReactNode;
  alt?: boolean;
}) => <div {...stylex.props(styles.box, alt && styles.boxAlt)}>{children}</div>;

const meta: Meta<typeof XDSVStack> = {
  title: 'Layout/XDSVStack',
  component: XDSVStack,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: [
        'space0',
        'space0.5',
        'space1',
        'space2',
        'space3',
        'space4',
        'space5',
        'space6',
        'space7',
      ],
      description: 'Spacing token for gap between items',
    },
    hAlign: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Horizontal alignment of items',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSVStack>;

export const Default: Story = {
  args: {
    gap: 'space2',
    children: null,
  },
  render: args => (
    <XDSVStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSVStack>
  ),
};

export const WithGap: Story = {
  args: {
    gap: 'space4',
  },
  render: args => (
    <XDSVStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSVStack>
  ),
};

export const HorizontalAlignCenter: Story = {
  args: {
    gap: 'space4',
    hAlign: 'center',
  },
  render: args => (
    <XDSVStack {...args} xstyle={[styles.container, styles.containerWidth]}>
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>Short</Box>
    </XDSVStack>
  ),
};

export const HorizontalAlignStart: Story = {
  args: {
    gap: 'space4',
    hAlign: 'start',
  },
  render: args => (
    <XDSVStack {...args} xstyle={[styles.container, styles.containerWidth]}>
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>Short</Box>
    </XDSVStack>
  ),
};

export const HorizontalAlignEnd: Story = {
  args: {
    gap: 'space4',
    hAlign: 'end',
  },
  render: args => (
    <XDSVStack {...args} xstyle={[styles.container, styles.containerWidth]}>
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>Short</Box>
    </XDSVStack>
  ),
};

export const Wrapping: Story = {
  args: {
    gap: 'space2',
    wrap: 'wrap',
  },
  render: args => (
    <XDSVStack
      {...args}
      xstyle={[
        styles.container,
        styles.containerHeight,
        styles.containerPadding,
      ]}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
      <Box>Item 4</Box>
      <Box>Item 5</Box>
    </XDSVStack>
  ),
};

export const AllAlignments: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: start</h4>
        <XDSVStack
          gap="space2"
          hAlign="start"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: center</h4>
        <XDSVStack
          gap="space2"
          hAlign="center"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: end</h4>
        <XDSVStack
          gap="space2"
          hAlign="end"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>hAlign: stretch</h4>
        <XDSVStack
          gap="space2"
          hAlign="stretch"
          xstyle={[
            styles.container,
            styles.containerWidthSmall,
            styles.containerPadding,
          ]}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
    </div>
  ),
};
