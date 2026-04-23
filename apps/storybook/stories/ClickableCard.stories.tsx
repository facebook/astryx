import type {Meta, StoryObj} from '@storybook/react';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Stack';

const meta: Meta<typeof XDSClickableCard> = {
  title: 'ClickableCard/XDSClickableCard',
  component: XDSClickableCard,
  parameters: {
    docs: {
      description: {
        component:
          'An interactive card for navigation or action targets. ' +
          'Nested interactive elements work independently.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSClickableCard>;

export const Navigation: Story = {
  args: {
    label: 'Settings',
    href: '/settings',
    width: 300,
    children: null,
  },
  render: (args) => (
    <XDSClickableCard {...args}>
      <XDSStack gap={1}>
        <XDSText weight="bold">Settings</XDSText>
        <XDSText color="secondary">Manage your preferences</XDSText>
      </XDSStack>
    </XDSClickableCard>
  ),
};

export const WithOnClick: Story = {
  args: {
    label: 'Open modal',
    width: 300,
    children: null,
  },
  render: (args) => (
    <XDSClickableCard {...args} onClick={() => alert('Card clicked!')}>
      <XDSStack gap={1}>
        <XDSText weight="bold">Click me</XDSText>
        <XDSText color="secondary">Opens a modal</XDSText>
      </XDSStack>
    </XDSClickableCard>
  ),
};

export const NestedButton: Story = {
  name: 'With Nested Button',
  args: {
    label: 'Product card',
    href: '/product/123',
    width: 300,
    children: null,
  },
  render: (args) => (
    <XDSClickableCard {...args}>
      <XDSStack gap={2}>
        <XDSText weight="bold">Product Name</XDSText>
        <XDSText color="secondary">$29.99</XDSText>
        <XDSButton
          label="Add to cart"
          onClick={() => alert('Added to cart! (card did NOT navigate)')}
          variant="primary"
        />
      </XDSStack>
    </XDSClickableCard>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled card',
    onClick: () => {},
    isDisabled: true,
    width: 300,
    children: null,
  },
  render: (args) => (
    <XDSClickableCard {...args}>
      <XDSStack gap={1}>
        <XDSText weight="bold">Disabled</XDSText>
        <XDSText color="secondary">This card cannot be clicked</XDSText>
      </XDSStack>
    </XDSClickableCard>
  ),
};

export const Variants: Story = {
  name: 'Background Variants',
  render: () => (
    <XDSStack gap={3} direction="row">
      <XDSClickableCard label="Default" onClick={() => {}} width={200}>
        <XDSText weight="bold">Default</XDSText>
      </XDSClickableCard>
      <XDSClickableCard
        label="Muted"
        onClick={() => {}}
        variant="muted"
        width={200}
      >
        <XDSText weight="bold">Muted</XDSText>
      </XDSClickableCard>
      <XDSClickableCard
        label="Transparent"
        onClick={() => {}}
        variant="transparent"
        width={200}
      >
        <XDSText weight="bold">Transparent</XDSText>
      </XDSClickableCard>
    </XDSStack>
  ),
};
