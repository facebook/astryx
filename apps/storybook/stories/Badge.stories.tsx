import type {Meta, StoryObj} from '@storybook/react';
import {XDSBadge} from '@xds/core/Badge';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

const pageStyles = stylex.create({
  pageWrapper: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
  },
});

const meta: Meta<typeof XDSBadge> = {
  title: 'Core/XDSBadge',
  component: XDSBadge,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div {...stylex.props(pageStyles.pageWrapper)}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'neutral',
        'info',
        'success',
        'warning',
        'error',
        'blue',
        'cyan',
        'gray',
        'green',
        'orange',
        'pink',
        'purple',
        'red',
        'teal',
        'yellow',
      ],
      description: 'Visual style variant',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSBadge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const SemanticVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="neutral">Neutral</XDSBadge>
      <XDSBadge variant="info">Info</XDSBadge>
      <XDSBadge variant="success">Success</XDSBadge>
      <XDSBadge variant="warning">Warning</XDSBadge>
      <XDSBadge variant="error">Error</XDSBadge>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
      <XDSBadge variant="blue">Blue</XDSBadge>
      <XDSBadge variant="cyan">Cyan</XDSBadge>
      <XDSBadge variant="gray">Gray</XDSBadge>
      <XDSBadge variant="green">Green</XDSBadge>
      <XDSBadge variant="orange">Orange</XDSBadge>
      <XDSBadge variant="pink">Pink</XDSBadge>
      <XDSBadge variant="purple">Purple</XDSBadge>
      <XDSBadge variant="red">Red</XDSBadge>
      <XDSBadge variant="teal">Teal</XDSBadge>
      <XDSBadge variant="yellow">Yellow</XDSBadge>
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="info">3</XDSBadge>
      <XDSBadge variant="error">99+</XDSBadge>
      <XDSBadge variant="success">12</XDSBadge>
    </div>
  ),
};

export const DotIndicators: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="neutral" />
      <XDSBadge variant="info" />
      <XDSBadge variant="success" />
      <XDSBadge variant="warning" />
      <XDSBadge variant="error" />
      <XDSBadge variant="blue" />
      <XDSBadge variant="purple" />
      <XDSBadge variant="pink" />
    </div>
  ),
};

export const CategoryTags: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
      <XDSBadge variant="blue">Frontend</XDSBadge>
      <XDSBadge variant="purple">Design</XDSBadge>
      <XDSBadge variant="teal">Infrastructure</XDSBadge>
      <XDSBadge variant="orange">Urgent</XDSBadge>
      <XDSBadge variant="pink">Research</XDSBadge>
      <XDSBadge variant="green">Approved</XDSBadge>
    </div>
  ),
};

export const StatusLabels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSBadge variant="success">Active</XDSBadge>
      <XDSBadge variant="warning">Pending</XDSBadge>
      <XDSBadge variant="error">Failed</XDSBadge>
      <XDSBadge variant="neutral">Draft</XDSBadge>
    </div>
  ),
};
