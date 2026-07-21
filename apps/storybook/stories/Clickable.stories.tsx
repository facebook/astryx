// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Clickable} from '@astryxdesign/core/Clickable';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof Clickable> = {
  title: 'Core/Clickable',
  component: Clickable,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name for screen readers.',
    },
    href: {control: 'text', description: 'Navigation URL. Renders as a link.'},
    isDisabled: {control: 'boolean', description: 'Disables interaction.'},
    isReadOnly: {
      control: 'boolean',
      description: 'Keeps appearance but removes interaction.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A button/link wrapper that makes a single child element interactive. ' +
          'Renders a hover/active overlay and focus-visible outline. ' +
          'Uses `useClickable` internally.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Clickable>;

export const AsButton: Story = {
  name: 'Button (onClick)',
  render: () => (
    <HStack gap={3} vAlign="center">
      <Clickable label="Add item" onClick={() => alert('Added!')}>
        <HStack gap={2} vAlign="center">
          <Icon icon="search" size="sm" />
          <Text type="body">Add item</Text>
        </HStack>
      </Clickable>
    </HStack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When `onClick` is provided, renders as a `<button>` element.',
      },
    },
  },
};

export const AsLink: Story = {
  name: 'Link (href)',
  render: () => (
    <Clickable label="Go to settings" href="/settings">
      <HStack gap={2} vAlign="center">
        <Icon icon="wrench" size="sm" />
        <Text type="body">Settings</Text>
      </HStack>
    </Clickable>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When `href` is provided, renders as a link via `useLinkComponent`. Framework routers (Next.js, React Router) swap the link element via `LinkProvider`.',
      },
    },
  },
};

export const WithBadge: Story = {
  name: 'With Badge',
  render: () => (
    <Clickable label="Notifications (3)" href="/notifications">
      <HStack gap={2} vAlign="center">
        <Text type="body">Notifications</Text>
        <Badge label="3" variant="info" />
      </HStack>
    </Clickable>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Clickable wraps content of any shape — badges, icons, text.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <Clickable label="Save" isDisabled onClick={() => {}}>
      <Text type="body">Save</Text>
    </Clickable>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`isDisabled` uses `aria-disabled` (not native `disabled`) so the element stays focusable and announced by screen readers. Visual dimming is applied via opacity.',
      },
    },
  },
};

export const DisabledWithMessage: Story = {
  name: 'Disabled with Message',
  render: () => (
    <Clickable
      label="Save"
      isDisabled
      disabledMessage="You need the Editor role"
      onClick={() => {}}>
      <Text type="body">Save</Text>
    </Clickable>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When `disabledMessage` is set with `isDisabled`, a tooltip explains the reason on hover and keyboard focus. ' +
          'The element stays focusable via `aria-disabled` so the reason is discoverable.',
      },
    },
  },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <Clickable label="Read only action" isReadOnly onClick={() => {}}>
      <Text type="body">Read only</Text>
    </Clickable>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`isReadOnly` keeps the element focusable and visually unchanged, but removes click interaction.',
      },
    },
  },
};
