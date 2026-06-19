// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';

const meta: Meta<typeof XDSClickableCard> = {
  title: 'Core/ClickableCard',
  component: XDSClickableCard,
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
type Story = StoryObj<typeof XDSClickableCard>;

export const Navigation: Story = {
  name: 'Navigation (href)',
  render: () => (
    <XDSClickableCard label="Settings" href="/settings" width={300}>
      <XDSVStack gap={1}>
        <XDSText type="body" weight="bold">
          Settings
        </XDSText>
        <XDSText type="supporting" color="secondary">
          Manage your preferences
        </XDSText>
      </XDSVStack>
    </XDSClickableCard>
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
    <XDSClickableCard
      label="Open modal"
      onClick={() => alert('Card clicked!')}
      width={300}>
      <XDSVStack gap={1}>
        <XDSText type="body" weight="bold">
          Click me
        </XDSText>
        <XDSText type="supporting" color="secondary">
          Opens a modal
        </XDSText>
      </XDSVStack>
    </XDSClickableCard>
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
    <XDSClickableCard label="Product card" href="/product/123" width={300}>
      <XDSVStack gap={2}>
        <XDSText type="body" weight="bold">
          Product Name
        </XDSText>
        <XDSText type="supporting" color="secondary">
          $29.99
        </XDSText>
        <XDSButton
          label="Add to cart"
          onClick={() => alert('Added to cart! (card did NOT navigate)')}
          variant="primary"
        />
      </XDSVStack>
    </XDSClickableCard>
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
    <XDSClickableCard
      label="Disabled card"
      onClick={() => {}}
      isDisabled
      width={300}>
      <XDSVStack gap={1}>
        <XDSText type="body" weight="bold">
          Disabled
        </XDSText>
        <XDSText type="supporting" color="secondary">
          This card cannot be clicked
        </XDSText>
      </XDSVStack>
    </XDSClickableCard>
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
      <XDSHStack gap={3} wrap="wrap">
        {variants.map(v => (
          <XDSClickableCard
            key={v}
            label={v}
            onClick={() => alert(v)}
            variant={v}
            width={140}>
            <XDSText type="body" weight="bold">
              {v}
            </XDSText>
          </XDSClickableCard>
        ))}
      </XDSHStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'All color variants: same palette as XDSCard. Color cards have transparent borders.',
      },
    },
  },
};
