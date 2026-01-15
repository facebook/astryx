import type { Meta, StoryObj } from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import { XDSHStack } from '@xds/core/Layout';
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  typographyTokens,
} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  box: {
    backgroundColor: colorTokens.blueBackground,
    color: colorTokens.blueText,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorTokens.blueBorder,
    paddingBlock: spacingTokens.space4,
    paddingInline: spacingTokens.space6,
    borderRadius: radiusTokens.element,
    fontWeight: 500,
  },
  boxAlt: {
    backgroundColor: colorTokens.grayBackground,
    color: colorTokens.grayText,
    borderColor: colorTokens.grayBorder,
  },
  container: {
    backgroundColor: colorTokens.wash,
  },
  containerHeight: {
    height: 120,
  },
  containerHeightSmall: {
    height: 80,
  },
  containerWidth: {
    width: 300,
  },
  containerPadding: {
    padding: spacingTokens.space2,
  },
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingTokens.space6,
  },
  heading: {
    margin: `0 0 ${spacingTokens.space2} 0`,
    fontFamily: typographyTokens.fontFamilyBody,
  },
});

// Demo box component for visibility
const Box = ({ children, alt = false }: { children: React.ReactNode; alt?: boolean }) => (
  <div {...stylex.props(styles.box, alt && styles.boxAlt)}>{children}</div>
);

const meta: Meta<typeof XDSHStack> = {
  title: 'Layout/XDSHStack',
  component: XDSHStack,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ['space0', 'space0.5', 'space1', 'space2', 'space3', 'space4', 'space5', 'space6', 'space7'],
      description: 'Spacing token for gap between items',
    },
    vAlign: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of items',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSHStack>;

export const Default: Story = {
  args: {
    gap: 'space2',
    children: null,
  },
  render: (args) => (
    <XDSHStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSHStack>
  ),
};

export const WithGap: Story = {
  args: {
    gap: 'space4',
  },
  render: (args) => (
    <XDSHStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSHStack>
  ),
};

export const VerticalAlignCenter: Story = {
  args: {
    gap: 'space4',
    vAlign: 'center',
  },
  render: (args) => (
    <XDSHStack {...args} xstyle={[styles.container, styles.containerHeight]}>
      <Box>Short</Box>
      <Box>
        Tall
        <br />
        Item
      </Box>
      <Box>Short</Box>
    </XDSHStack>
  ),
};

export const VerticalAlignStart: Story = {
  args: {
    gap: 'space4',
    vAlign: 'start',
  },
  render: (args) => (
    <XDSHStack {...args} xstyle={[styles.container, styles.containerHeight]}>
      <Box>Short</Box>
      <Box>
        Tall
        <br />
        Item
      </Box>
      <Box>Short</Box>
    </XDSHStack>
  ),
};

export const VerticalAlignEnd: Story = {
  args: {
    gap: 'space4',
    vAlign: 'end',
  },
  render: (args) => (
    <XDSHStack {...args} xstyle={[styles.container, styles.containerHeight]}>
      <Box>Short</Box>
      <Box>
        Tall
        <br />
        Item
      </Box>
      <Box>Short</Box>
    </XDSHStack>
  ),
};

export const Wrapping: Story = {
  args: {
    gap: 'space2',
    wrap: 'wrap',
  },
  render: (args) => (
    <XDSHStack {...args} xstyle={[styles.container, styles.containerWidth, styles.containerPadding]}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
      <Box>Item 4</Box>
      <Box>Item 5</Box>
    </XDSHStack>
  ),
};

export const AllAlignments: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: start</h4>
        <XDSHStack gap="space2" vAlign="start" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: center</h4>
        <XDSHStack gap="space2" vAlign="center" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: end</h4>
        <XDSHStack gap="space2" vAlign="end" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>vAlign: stretch (default)</h4>
        <XDSHStack gap="space2" vAlign="stretch" xstyle={[styles.container, styles.containerHeightSmall]}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
    </div>
  ),
};
