'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';

export default function ChatMessageMetadataTimestamp() {
  return (
    <XDSChatMessageList style={{maxWidth: 500}}>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-29T14:30:00" format="time" />
              }
            />
          }>
          Thanks — any blockers I should know about?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T16:45:00" format="relative" />
              }
            />
          }>
          Relative timestamps work too — helpful for older messages where the
          exact time matters less than recency.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
