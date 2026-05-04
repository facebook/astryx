import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {CheckCircleIcon} from '@heroicons/react/24/outline';
import {
  colorVars,
  spacingVars,
  radiusVars,
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
  },
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  iconWrapper: {
    backgroundColor: colorVars['--color-background-blue'],
    color: colorVars['--color-text-blue'],
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
  },
});

// Demo box component for visibility
const Box = ({children}: {children: React.ReactNode}) => (
  <div {...stylex.props(styles.box)}>{children}</div>
);

const meta: Meta<typeof XDSCenter> = {
  title: 'Core/Center',
  component: XDSCenter,
  tags: ['autodocs'],
  argTypes: {
    axis: {
      control: 'select',
      options: ['both', 'horizontal', 'vertical'],
      description: 'Which direction(s) to center',
    },
    width: {
      control: 'text',
      description:
        'Width of the container (number for px, string for any unit)',
    },
    height: {
      control: 'text',
      description:
        'Height of the container (number for px, string for any unit)',
    },
    isInline: {
      control: 'boolean',
      description: 'Whether to render as inline-flex',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCenter>;

export const Default: Story = {
  args: {
    axis: 'both',
    width: '100%',
    height: 200,
    children: null,
  },
  render: args => (
    <XDSSection variant="muted" width="100%">
      <XDSCenter {...args}>
        <Box>Centered Content</Box>
      </XDSCenter>
    </XDSSection>
  ),
};

export const HorizontalOnly: Story = {
  args: {
    axis: 'horizontal',
    width: '100%',
    children: null,
  },
  render: args => (
    <XDSSection variant="muted" width="100%">
      <XDSCenter {...args}>
        <Box>Horizontal Center</Box>
      </XDSCenter>
    </XDSSection>
  ),
};

export const VerticalOnly: Story = {
  args: {
    axis: 'vertical',
    height: 150,
    width: '100%',
    children: null,
  },
  render: args => (
    <XDSSection variant="muted" width="100%">
      <XDSCenter {...args}>
        <Box>Vertical Center</Box>
      </XDSCenter>
    </XDSSection>
  ),
};

export const FullSize: Story = {
  args: {
    axis: 'both',
    width: '100%',
    height: 300,
    children: null,
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCenter {...args}>
        <Box>Full Width, Fixed Height</Box>
      </XDSCenter>
    </XDSSection>
  ),
};

export const Inline: Story = {
  args: {
    isInline: true,
    children: null,
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSText type="body">
          Text with inline centered icon:{' '}
          <XDSCenter {...args} xstyle={styles.iconWrapper}>
            <XDSIcon icon={CheckCircleIcon} size="sm" />
          </XDSCenter>{' '}
          and more text after.
        </XDSText>
      </XDSCard>
    </XDSSection>
  ),
};

export const WithIcon: Story = {
  args: {
    axis: 'both',
    width: 300,
    height: 200,
    children: null,
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCenter {...args}>
        <div {...stylex.props(styles.iconWrapper)}>
          <XDSIcon icon={CheckCircleIcon} size="lg" />
        </div>
      </XDSCenter>
    </XDSSection>
  ),
};

export const InsideACard: Story = {
  args: {
    height: 150,
    children: null,
  },
  render: args => (
    <XDSSection variant="muted">
      <XDSCard>
        <XDSCenter {...args}>
          <Box>Centered in Card</Box>
        </XDSCenter>
      </XDSCard>
    </XDSSection>
  ),
};

export const AllAxisModes: Story = {
  args: {
    children: null,
  },
  render: () => (
    <XDSSection variant="muted">
      <div {...stylex.props(styles.storyWrapper)}>
        <XDSCard>
          <XDSText type="supporting" display="block">
            axis: both (default)
          </XDSText>
          <XDSCenter axis="both" width={300} height={150}>
            <Box>Both Axes</Box>
          </XDSCenter>
        </XDSCard>
        <XDSCard>
          <XDSText type="supporting" display="block">
            axis: horizontal
          </XDSText>
          <XDSCenter axis="horizontal" width={300}>
            <Box>Horizontal Only</Box>
          </XDSCenter>
        </XDSCard>
        <XDSCard>
          <XDSText type="supporting" display="block">
            axis: vertical
          </XDSText>
          <XDSCenter axis="vertical" height={150}>
            <Box>Vertical Only</Box>
          </XDSCenter>
        </XDSCard>
      </div>
    </XDSSection>
  ),
};
