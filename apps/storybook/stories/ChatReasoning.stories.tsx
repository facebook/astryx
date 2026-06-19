// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
} from '@xds/core/Chat';
import {XDSChatReasoning} from '@xds/lab';
import {Avatar} from '@xds/core/Avatar';
import {Markdown} from '@xds/core/Markdown';
import {useState, useEffect} from 'react';

const meta: Meta = {
  title: 'Lab/ChatReasoning',
  component: XDSChatReasoning,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 600, padding: 40}}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

/** Collapsed (default) — shows label, duration, and ellipsis preview */
export const Collapsed: StoryObj = {
  render: () => (
    <XDSChatReasoning duration="12s">
      Let me work through the constraints systematically. The farmer has 3
      fields and rotates wheat, corn, soy. No same crop in adjacent fields and
      no same crop in the same field two years in a row...
    </XDSChatReasoning>
  ),
};

/** Expanded — shows full reasoning content */
export const Expanded: StoryObj = {
  render: () => (
    <XDSChatReasoning duration="8s" defaultIsExpanded>
      <Markdown density="compact">{`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 \u00d7 2 \u00d7 2 = 12 arrangements...`}</Markdown>
    </XDSChatReasoning>
  ),
};

/** Streaming — shimmer effect on label while thinking */
export const Streaming: StoryObj = {
  render: () => {
    const [streaming, setStreaming] = useState(true);
    useEffect(() => {
      const t = setTimeout(() => setStreaming(false), 5000);
      return () => clearTimeout(t);
    }, []);
    return (
      <div>
        <XDSChatReasoning isStreaming={streaming} label="Thinking">
          Working through the combinatorial constraints...
        </XDSChatReasoning>
        {!streaming && (
          <p style={{marginTop: 8, fontSize: 13, color: '#888'}}>
            (Shimmer stopped after 5s)
          </p>
        )}
      </div>
    );
  },
};

/** Custom label */
export const CustomLabel: StoryObj = {
  render: () => (
    <XDSChatReasoning label="Analyzing" duration="3s">
      Checking the codebase for similar patterns...
    </XDSChatReasoning>
  ),
};

/** In a message — reasoning above the response */
export const InMessage: StoryObj = {
  render: () => (
    <ChatMessageList>
      <ChatMessage sender="user">
        <ChatMessageBubble>
          How many valid planting arrangements are possible over 3 years?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage
        sender="assistant"
        avatar={<Avatar name="AI" size="small" />}>
        <XDSChatReasoning duration="12s">
          Let me work through the constraints systematically...
        </XDSChatReasoning>
        <Markdown density="compact">{`There are **42** valid planting arrangements over 3 years.`}</Markdown>
      </ChatMessage>
    </ChatMessageList>
  ),
};
