// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ClickableCard} from '@xds/core/ClickableCard';
import {Text} from '@xds/core/Text';
import {Button} from '@xds/core/Button';
import {VStack, HStack} from '@xds/core/Layout';

const meta: Meta<typeof ClickableCard> = {
  title: 'Core/ClickableCard',
  component: ClickableCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'transparent',
        'muted',
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
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An interactive card for navigation or action targets. ' +
          'Nested interactive elements (buttons, links) work independently; ' +
          "clicking them does NOT trigger the card's onClick or navigation. " +
          'Uses `useClickableContainer` internally.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClickableCard>;

export const Navigation: Story = {
  name: 'Navigation (href)',
  render: () => (
    <ClickableCard label="Settings" href="/settings" width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Settings
        </Text>
        <Text type="supporting" color="secondary">
          Manage your preferences
        </Text>
      </VStack>
    </ClickableCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Card with `href`: clicking navigates. Ctrl/Cmd+click opens new tab. Middle-click opens new tab.',
      },
    },
  },
};

export const WithOnClick: Story = {
  name: 'Action (onClick)',
  render: () => (
    <ClickableCard
      label="Open modal"
      onClick={() => alert('Card clicked!')}
      width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Click me
        </Text>
        <Text type="supporting" color="secondary">
          Opens a modal
        </Text>
      </VStack>
    </ClickableCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Card with `onClick`: fires the handler when the card surface is clicked.',
      },
    },
  },
};

export const NestedButton: Story = {
  name: 'Nested Interactive Elements',
  render: () => (
    <ClickableCard label="Product card" href="/product/123" width={300}>
      <VStack gap={2}>
        <Text type="body" weight="bold">
          Product Name
        </Text>
        <Text type="supporting" color="secondary">
          $29.99
        </Text>
        <Button
          label="Add to cart"
          onClick={() => alert('Added to cart! (card did NOT navigate)')}
          variant="primary"
        />
      </VStack>
    </ClickableCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The key feature: nested buttons/links work independently. ' +
          'Clicking "Add to cart" fires its own handler without triggering card navigation. ' +
          'This is handled by `useClickableContainer` which checks `hasInteractiveAncestor` on each click.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <ClickableCard
      label="Disabled card"
      onClick={() => {}}
      isDisabled
      width={300}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Disabled
        </Text>
        <Text type="supporting" color="secondary">
          This card cannot be clicked
        </Text>
      </VStack>
    </ClickableCard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`isDisabled` suppresses click, hover, focus, and sets `aria-disabled`. `tabIndex` becomes -1.',
      },
    },
  },
};

export const ColorVariants: Story = {
  name: 'Color Variants',
  render: () => {
    const variants = [
      'default',
      'muted',
      'transparent',
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
    ] as const;

    return (
      <HStack gap={3} wrap="wrap">
        {variants.map(v => (
          <ClickableCard
            key={v}
            label={v}
            onClick={() => alert(v)}
            variant={v}
            width={140}>
            <Text type="body" weight="bold">
              {v}
            </Text>
          </ClickableCard>
        ))}
      </HStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'All color variants: same palette as Card. Color cards have transparent borders.',
      },
    },
  },
};
