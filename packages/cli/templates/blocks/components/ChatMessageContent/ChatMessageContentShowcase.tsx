// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageContent,
  ChatMessageMetadata,
} from '@astryxdesign/core/Chat';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';

export default function ChatMessageContentShowcase() {
  return (
    <ChatMessageList style={{maxWidth: 520}}>
      <ChatMessage sender="user">
        <ChatMessageBubble>Can you pull up the Q3 report?</ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble name="Navi">
          Sure, here is the artifact from last quarter.
        </ChatMessageBubble>
        <ChatMessageContent>
          <ClickableCard label="Open Q3 performance report" onClick={() => {}}>
            <Text type="body" weight="semibold" display="block">
              Q3 Performance Report
            </Text>
            <Text type="supporting" color="secondary" display="block">
              12 pages · updated 2 days ago
            </Text>
          </ClickableCard>
        </ChatMessageContent>
        <ChatMessageContent>
          <ChatMessageMetadata
            timestamp={<Timestamp value="2026-04-28T09:45:00" format="time" />}
            footer={
              <Text type="supporting" color="secondary">
                Claude Opus 4.6
              </Text>
            }
          />
        </ChatMessageContent>
      </ChatMessage>
    </ChatMessageList>
  );
}
