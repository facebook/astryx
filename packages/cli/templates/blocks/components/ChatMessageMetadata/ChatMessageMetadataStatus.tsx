'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';

const STATUSES = [
  {status: 'sending' as const, text: 'Deploying the update now…'},
  {status: 'sent' as const, text: 'Config pushed to staging.'},
  {status: 'delivered' as const, text: 'Verified on the staging cluster.'},
  {status: 'read' as const, text: 'Looks good — promoting to prod.'},
  {status: 'error' as const, text: 'Rollback triggered, checking logs.'},
];

export default function ChatMessageMetadataStatus() {
  return (
    <XDSChatMessageList style={{maxWidth: 400}}>
      {STATUSES.map(({status, text}) => (
        <XDSChatMessage key={status} sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-04-29T10:15:00" format="time" />
                }
                status={status}
              />
            }>
            {text}
          </XDSChatMessageBubble>
        </XDSChatMessage>
      ))}
    </XDSChatMessageList>
  );
}
