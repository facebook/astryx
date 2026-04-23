import type {Meta, StoryObj} from '@storybook/react';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';

const meta: Meta<typeof XDSClickableCard> = {
  title: 'ClickableCard/XDSClickableCard',
  component: XDSClickableCard,
};

export default meta;
type Story = StoryObj<typeof XDSClickableCard>;

export const Navigation: Story = {
  render: () => (
    <XDSClickableCard label="Settings" href="/settings" width={300}>
      <XDSVStack gap={1}>
        <XDSText type="body" weight="bold">Settings</XDSText>
        <XDSText type="supporting" color="secondary">Manage your preferences</XDSText>
      </XDSVStack>
    </XDSClickableCard>
  ),
};

export const WithOnClick: Story = {
  render: () => (
    <XDSClickableCard label="Open modal" onClick={() => alert('Card clicked!')} width={300}>
      <XDSVStack gap={1}>
        <XDSText type="body" weight="bold">Click me</XDSText>
        <XDSText type="supporting" color="secondary">Opens a modal</XDSText>
      </XDSVStack>
    </XDSClickableCard>
  ),
};

export const NestedButton: Story = {
  name: 'With Nested Button',
  render: () => (
    <XDSClickableCard label="Product card" href="/product/123" width={300}>
      <XDSVStack gap={2}>
        <XDSText type="body" weight="bold">Product Name</XDSText>
        <XDSText type="supporting" color="secondary">$29.99</XDSText>
        <XDSButton
          label="Add to cart"
          onClick={() => alert('Added to cart! (card did NOT navigate)')}
          variant="primary"
        />
      </XDSVStack>
    </XDSClickableCard>
  ),
};

export const Disabled: Story = {
  render: () => (
    <XDSClickableCard label="Disabled card" onClick={() => {}} isDisabled width={300}>
      <XDSVStack gap={1}>
        <XDSText type="body" weight="bold">Disabled</XDSText>
        <XDSText type="supporting" color="secondary">This card cannot be clicked</XDSText>
      </XDSVStack>
    </XDSClickableCard>
  ),
};

export const Variants: Story = {
  name: 'Background Variants',
  render: () => (
    <XDSHStack gap={3}>
      <XDSClickableCard label="Default" onClick={() => {}} width={200}>
        <XDSText type="body" weight="bold">Default</XDSText>
      </XDSClickableCard>
      <XDSClickableCard label="Muted" onClick={() => {}} variant="muted" width={200}>
        <XDSText type="body" weight="bold">Muted</XDSText>
      </XDSClickableCard>
      <XDSClickableCard label="Transparent" onClick={() => {}} variant="transparent" width={200}>
        <XDSText type="body" weight="bold">Transparent</XDSText>
      </XDSClickableCard>
    </XDSHStack>
  ),
};
