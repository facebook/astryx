// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
} from '@astryxdesign/core/Chat';
import {Button} from '@astryxdesign/core/Button';
import {
  ChatEmojiPicker,
  ChatReactionBar,
  ChatTypingIndicator,
  ChatUnreadDivider,
} from '@astryxdesign/lab';
import type {ChatReaction} from '@astryxdesign/lab';

const meta: Meta = {
  title: 'Lab/ChatAdditions',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 640, maxWidth: '100%'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const INITIAL_REACTIONS: ChatReaction[] = [
  {
    emoji: '🎉',
    count: 4,
    isSelected: true,
    label: 'You, Dana, Lee, and Mia reacted with 🎉',
  },
  {emoji: '👀', count: 2, label: 'Dana and Lee reacted with 👀'},
];

export const Reactions: Story = {
  render: () => {
    const [reactions, setReactions] = useState(INITIAL_REACTIONS);

    const handleToggle = (emoji: string) => {
      setReactions(prev =>
        prev
          .map(reaction =>
            reaction.emoji === emoji
              ? {
                  ...reaction,
                  isSelected: !reaction.isSelected,
                  count: reaction.count + (reaction.isSelected ? -1 : 1),
                }
              : reaction,
          )
          .filter(reaction => reaction.count > 0),
      );
    };

    const handleAdd = (emoji: string) => {
      setReactions(prev => {
        const existing = prev.find(reaction => reaction.emoji === emoji);
        if (existing != null) {
          return existing.isSelected
            ? prev
            : prev.map(reaction =>
                reaction.emoji === emoji
                  ? {...reaction, isSelected: true, count: reaction.count + 1}
                  : reaction,
              );
        }
        return [...prev, {emoji, count: 1, isSelected: true}];
      });
    };

    return (
      <ChatMessageList style={{maxWidth: 600}}>
        <ChatMessage sender="assistant">
          <ChatMessageBubble>
            The design review went great. Tokens are approved and we can start
            testing the new chat affordances next sprint.
          </ChatMessageBubble>
          <ChatReactionBar
            reactions={reactions}
            onToggle={handleToggle}
            onAdd={handleAdd}
          />
        </ChatMessage>
      </ChatMessageList>
    );
  },
};

export const TypingAndUnread: Story = {
  render: () => (
    <ChatMessageList style={{maxWidth: 600}}>
      <ChatMessage sender="user">
        <ChatMessageBubble>
          Sounds good. I&apos;ll take the migration notes.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatUnreadDivider />
      <ChatMessage sender="assistant">
        <ChatMessageBubble>
          Perfect. I&apos;ve drafted the rollout checklist and shared it with
          the team.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
    </ChatMessageList>
  ),
};

export const EmojiPicker: Story = {
  render: () => {
    const [selected, setSelected] = useState('🎉');

    return (
      <ChatEmojiPicker onSelect={setSelected}>
        <Button label={`Pick emoji ${selected}`} variant="secondary" />
      </ChatEmojiPicker>
    );
  },
};
