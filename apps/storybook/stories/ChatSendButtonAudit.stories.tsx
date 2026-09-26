// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatSendButtonAudit.stories.tsx
 * @input Uses ChatSendButton with explicit small send and stop configurations
 * @output Checked-in single-subject fixtures for the component audit browser lane
 * @position Browser evidence fixtures for appearance-only size coverage that does
 *   not belong in the shared Button semantic-state inventory
 */

import type {Meta, StoryObj} from '@storybook/react';
import {ChatSendButton} from '@astryxdesign/core/Chat';

const meta = {
  title: 'a11y/ChatSendButton audit',
  component: ChatSendButton,
  tags: ['no-visual'],
  parameters: {
    docs: {
      description: {
        component:
          'Single-subject small-size fixtures driven by the ChatSendButton exact-head component audit.',
      },
    },
  },
} satisfies Meta<typeof ChatSendButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendSmall: Story = {
  args: {
    isDisabled: false,
    onSend: () => {},
    size: 'sm',
  },
};

export const StopSmall: Story = {
  args: {
    isStopShown: true,
    onStop: () => {},
    size: 'sm',
  },
};
