// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSChatTokenizedText} from '@xds/core/Chat';
import {XDSChatMessage, XDSChatMessageBubble} from '@xds/core/Chat';

const meta: Meta<typeof XDSChatTokenizedText> = {
  title: 'Core/Chat/TokenizedText',
  component: XDSChatTokenizedText,
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

type Story = StoryObj<typeof XDSChatTokenizedText>;

const mentionTokens = [
  {value: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {value: '@navi', label: '@Navi', variant: 'blue' as const},
  {value: '@alex', label: '@Alex Rivera', variant: 'blue' as const},
];

/** Single mention token */
export const SingleToken: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** Multiple mentions in one message */
export const MultipleTokens: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** No tokens — renders as plain text */
export const PlainText: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText>
          Just a regular message with no mentions.
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** Tokens with different variants */
export const MixedVariants: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText
          tokens={[
            {value: '@cindy', label: '@Cindy', variant: 'blue'},
            {value: '#bug', label: '#bug', variant: 'red'},
            {value: '#feat', label: '#feature', variant: 'green'},
          ]}>
          @cindy filed #bug and #feat for the sprint
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** Token at start and end of message */
export const TokensAtEdges: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </XDSChatTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};
