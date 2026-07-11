// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ClickableContainer} from '@astryxdesign/core/ClickableContainer';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {VStack, HStack} from '@astryxdesign/core/Layout';

const meta: Meta<typeof ClickableContainer> = {
  title: 'Core/ClickableContainer',
  component: ClickableContainer,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name for screen readers.',
    },
    href: {control: 'text', description: 'Navigation URL.'},
    isDisabled: {control: 'boolean', description: 'Disables the container.'},
    isReadOnly: {
      control: 'boolean',
      description: 'Keeps appearance but removes interaction.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A clickable surface that safely handles nested interactive elements. ' +
          'Nested buttons, links, and inputs work independently — clicking them ' +
          "does NOT trigger the container's onClick or navigation. " +
          'Uses `useClickableContainer` internally.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClickableContainer>;

export const Navigation: Story = {
  name: 'Navigation (href)',
  render: () => (
    <ClickableContainer label="Settings" href="/settings">
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Settings
        </Text>
        <Text type="supporting" color="secondary">
          Manage your preferences
        </Text>
      </VStack>
    </ClickableContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Container with `href`: clicking navigates. Ctrl/Cmd+click opens new tab. Middle-click opens new tab.',
      },
    },
  },
};

export const WithOnClick: Story = {
  name: 'Action (onClick)',
  render: () => (
    <ClickableContainer
      label="Open modal"
      onClick={() => alert('Container clicked!')}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Click me
        </Text>
        <Text type="supporting" color="secondary">
          Opens a modal
        </Text>
      </VStack>
    </ClickableContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Container with `onClick`: fires the handler when the container surface is clicked.',
      },
    },
  },
};

export const NestedButton: Story = {
  name: 'Nested Interactive Elements',
  render: () => (
    <ClickableContainer label="Product card" href="/product/123">
      <VStack gap={2}>
        <Text type="body" weight="bold">
          Product Name
        </Text>
        <Text type="supporting" color="secondary">
          $29.99
        </Text>
        <Button
          label="Add to cart"
          onClick={() => alert('Added to cart! (container did NOT navigate)')}
          variant="primary"
        />
      </VStack>
    </ClickableContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The key feature: nested buttons/links work independently. ' +
          'Clicking "Add to cart" fires its own handler without triggering container navigation.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <ClickableContainer
      label="Disabled container"
      onClick={() => {}}
      isDisabled>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Disabled
        </Text>
        <Text type="supporting" color="secondary">
          This container cannot be clicked
        </Text>
      </VStack>
    </ClickableContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`isDisabled` uses `aria-disabled` (not native `disabled`) so the hidden interactive element stays focusable and announced.',
      },
    },
  },
};

export const DisabledWithMessage: Story = {
  name: 'Disabled with Message',
  render: () => (
    <ClickableContainer
      label="Save container"
      isDisabled
      disabledMessage="You need the Editor role">
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Save
        </Text>
        <Text type="supporting" color="secondary">
          Hover for reason
        </Text>
      </VStack>
    </ClickableContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When `disabledMessage` is set, a tooltip explains the reason on hover and keyboard focus.',
      },
    },
  },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <ClickableContainer
      label="Read only container"
      isReadOnly
      onClick={() => alert('should not fire')}>
      <VStack gap={1}>
        <Text type="body" weight="bold">
          Read only
        </Text>
        <Text type="supporting" color="secondary">
          Appearance preserved, interaction removed
        </Text>
      </VStack>
    </ClickableContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`isReadOnly` keeps the container focusable and visually unchanged, but removes click interaction.',
      },
    },
  },
};
