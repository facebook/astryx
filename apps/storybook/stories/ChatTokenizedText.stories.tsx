import type {Meta, StoryObj} from '@storybook/react';
import {XDSChatMessageTokenizedText} from '@xds/core/Chat';
import {XDSChatMessage, XDSChatMessageBubble} from '@xds/core/Chat';

const meta: Meta<typeof XDSChatMessageTokenizedText> = {
  title: 'Chat/XDSChatMessageTokenizedText',
  component: XDSChatMessageTokenizedText,
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

type Story = StoryObj<typeof XDSChatMessageTokenizedText>;

const mentionTokens = [
  {pattern: '@cindy', label: '@Cindy Zhang', variant: 'blue' as const},
  {pattern: '@navi', label: '@Navi', variant: 'blue' as const},
  {pattern: '@alex', label: '@Alex Rivera', variant: 'blue' as const},
];

/** Single mention token */
export const SingleToken: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatMessageTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </XDSChatMessageTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** Multiple mentions in one message */
export const MultipleTokens: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatMessageTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </XDSChatMessageTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** No tokens — renders as plain text */
export const PlainText: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatMessageTokenizedText>
          Just a regular message with no mentions.
        </XDSChatMessageTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** Tokens with different variants */
export const MixedVariants: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatMessageTokenizedText
          tokens={[
            {pattern: '@cindy', label: '@Cindy', variant: 'blue'},
            {pattern: '#bug', label: '#bug', variant: 'red'},
            {pattern: '#feat', label: '#feature', variant: 'green'},
          ]}>
          @cindy filed #bug and #feat for the sprint
        </XDSChatMessageTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};

/** Token at start and end of message */
export const TokensAtEdges: Story = {
  render: () => (
    <XDSChatMessage sender="user">
      <XDSChatMessageBubble>
        <XDSChatMessageTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </XDSChatMessageTokenizedText>
      </XDSChatMessageBubble>
    </XDSChatMessage>
  ),
};
