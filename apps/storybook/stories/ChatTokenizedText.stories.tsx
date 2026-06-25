// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ChatTokenizedText} from '@astryxdesign/core/Chat';
import {ChatMessage, ChatMessageBubble} from '@astryxdesign/core/Chat';

const meta: Meta<typeof ChatTokenizedText> = {
  title: 'Core/ChatTokenizedText',
  component: ChatTokenizedText,
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
  decorators: [
    Story => (
      <div style={{width: 500, padding: 40}}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ChatTokenizedText>;

const mentionTokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '@navi', label: '@Navi', variant: 'blue' as const},
  {value: '@alex', label: '@Alex Rivera', variant: 'blue' as const},
];

/** Single mention token */
export const SingleToken: Story = {
  render: () => (
    <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
  ),
};

/** Multiple mentions in one message */
export const MultipleTokens: Story = {
  render: () => (
    <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
  ),
};

/** No tokens — renders as plain text */
export const PlainText: Story = {
  render: () => (
    <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText>
          Just a regular message with no mentions.
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
  ),
};

/** Tokens with different variants */
export const MixedVariants: Story = {
  render: () => (
    <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText
          tokens={[
            {value: '@cindy', label: '@Cindy', variant: 'blue'},
            {value: '#bug', label: '#bug', variant: 'red'},
            {value: '#feat', label: '#feature', variant: 'green'},
          ]}>
          @cindy filed #bug and #feat for the sprint
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
  ),
};

/** Token at start and end of message */
export const TokensAtEdges: Story = {
  render: () => (
    <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
  ),
};
