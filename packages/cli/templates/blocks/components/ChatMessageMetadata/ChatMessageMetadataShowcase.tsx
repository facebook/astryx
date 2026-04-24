'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';

export default function ChatMessageMetadataShowcase() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
              }
              status="read"
            />
          }>
          Did you see the latest deployment?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble>
          Yes, everything looks good! The build passed all checks.
        </XDSChatMessageBubble>
        <XDSChatMessageMetadata
          timestamp={
            <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
          }
          footer={<span>Claude Opus 4.6</span>}
        />
      </XDSChatMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:32:00" format="time" />
              }
              status="delivered"
            />
          }>
          Great, shipping it now.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
