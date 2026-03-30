import type {Meta, StoryObj} from '@storybook/react';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSSpinner> = {
  title: 'Core/XDSSpinner',
  component: XDSSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Spinner size',
    },
    shade: {
      control: 'select',
      options: ['default', 'onMedia'],
      description: 'Color shade',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSpinner>;

export const Default: Story = {
  args: {
    size: 'md',
    shade: 'default',
  },
};

export const Sizes: Story = {
  render: () => (
    <XDSHStack gap={4} vAlign="center">
      <XDSSpinner size="sm" />
      <XDSSpinner size="md" />
      <XDSSpinner size="lg" />
      <XDSSpinner size="xl" />
    </XDSHStack>
  ),
};

export const Shades: Story = {
  render: () => (
    <XDSHStack gap={4} vAlign="center">
      <XDSSpinner shade="default" />
      <div
        style={{
          backgroundColor: '#1a1a2e',
          padding: 16,
          borderRadius: 8,
        }}>
        <XDSSpinner shade="onMedia" />
      </div>
    </XDSHStack>
  ),
};

export const InContext: Story = {
  render: () => (
    <XDSVStack gap={2} hAlign="center">
      <XDSSpinner size="lg" />
      <XDSText type="body" color="secondary">
        Loading...
      </XDSText>
    </XDSVStack>
  ),
};
