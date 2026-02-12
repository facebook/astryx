import type {Meta, StoryObj} from '@storybook/react';
import {XDSCloseButton} from '@xds/core/CloseButton';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSCloseButton> = {
  title: 'Core/XDSCloseButton',
  component: XDSCloseButton,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the close button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCloseButton>;

/**
 * Default close button
 */
export const Default: Story = {
  args: {
    onClick: () => alert('Close clicked'),
  },
};

/**
 * All sizes
 */
export const Sizes: Story = {
  render: () => (
    <XDSHStack gap="space4" vAlign="center">
      <XDSHStack gap="space2" vAlign="center">
        <XDSCloseButton size="sm" />
        <XDSText type="supporting">sm</XDSText>
      </XDSHStack>
      <XDSHStack gap="space2" vAlign="center">
        <XDSCloseButton size="md" />
        <XDSText type="supporting">md</XDSText>
      </XDSHStack>
      <XDSHStack gap="space2" vAlign="center">
        <XDSCloseButton size="lg" />
        <XDSText type="supporting">lg</XDSText>
      </XDSHStack>
    </XDSHStack>
  ),
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * With custom aria-label
 */
export const CustomAriaLabel: Story = {
  args: {
    'aria-label': 'Dismiss notification',
    onClick: () => alert('Dismissed'),
  },
};
