'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';

export default function ChatMessageBubbleShowcase() {
  return (
    <XDSChatMessageList style={{maxWidth: 600}}>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble group="first">
          I just pushed the latest changes to the feature branch.
        </XDSChatMessageBubble>
        <XDSChatMessageBubble
          group="last"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-10T09:15:00" format="time" />
              }
              status="read"
            />
          }>
          Can you review when you get a chance?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          variant="ghost"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-10T09:16:00" format="time" />
              }
            />
          }>
          The changes look great. Ship it!
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
