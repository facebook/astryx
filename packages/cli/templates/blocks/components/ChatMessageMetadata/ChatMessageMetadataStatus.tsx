// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@xds/core/Chat';
import {Timestamp} from '@xds/core/Timestamp';

const STATUSES = [
  {status: 'sending' as const, text: 'Deploying the update now…'},
  {status: 'sent' as const, text: 'Config pushed to staging.'},
  {status: 'delivered' as const, text: 'Verified on the staging cluster.'},
  {status: 'read' as const, text: 'Looks good — promoting to prod.'},
  {status: 'error' as const, text: 'Rollback triggered, checking logs.'},
];

export default function ChatMessageMetadataStatus() {
  return (
    <ChatMessageList style={{maxWidth: 400}}>
      {STATUSES.map(({status, text}) => (
        <ChatMessage key={status} sender="user">
          <ChatMessageBubble
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-04-29T10:15:00" format="time" />
                }
                status={status}
              />
            }>
            {text}
          </ChatMessageBubble>
        </ChatMessage>
      ))}
    </ChatMessageList>
  );
}
