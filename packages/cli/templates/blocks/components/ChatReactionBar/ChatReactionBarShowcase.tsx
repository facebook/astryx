// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatReactionBar,
} from '@astryxdesign/core/Chat';
import type {ChatReaction} from '@astryxdesign/core/Chat';

const INITIAL_REACTIONS: ChatReaction[] = [
  {
    emoji: '🎉',
    count: 4,
    isSelected: true,
    label: 'You, Dana, Lee, and Mia reacted with 🎉',
  },
  {emoji: '👀', count: 2, label: 'Dana and Lee reacted with 👀'},
];

export default function ChatReactionBarShowcase() {
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
          The design review went great — tokens are approved and we can start
          rolling out the new chat components next sprint.
        </ChatMessageBubble>
        <ChatReactionBar
          reactions={reactions}
          onToggle={handleToggle}
          onAdd={handleAdd}
        />
      </ChatMessage>
    </ChatMessageList>
  );
}
