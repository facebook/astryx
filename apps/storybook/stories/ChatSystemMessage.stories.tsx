// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChatSystemMessage} from '@astryxdesign/core/Chat';

const meta = {
  title: 'Core/ChatSystemMessage',
  component: ChatSystemMessage,
  tags: ['no-visual'],
  args: {
    children: 'Conversation started',
  },
} satisfies Meta<typeof ChatSystemMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RtlApplicability: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 16, width: 320}}>
      <ChatSystemMessage icon={<span aria-hidden="true">●</span>}>
        Conversation started
      </ChatSystemMessage>
      <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
    </div>
  ),
};
