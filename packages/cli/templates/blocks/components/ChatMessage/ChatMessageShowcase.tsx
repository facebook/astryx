'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function ChatMessageShowcase() {
  return (
    <XDSChatMessageList style={{maxWidth: 600}}>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble group="first">
          I just pushed the refactored auth module.
        </XDSChatMessageBubble>
        <XDSChatMessageBubble
          group="last"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T14:30:00" format="time" />
              }
              status="read"
            />
          }>
          Can you review the token validation changes?
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          variant="ghost"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T14:31:00" format="time" />
              }
              footer={
                <XDSText type="supporting" color="secondary">
                  Claude Opus 4.6
                </XDSText>
              }
            />
          }>
          Looks good — the refresh token rotation is solid and the error
          handling covers all the edge cases. Ship it.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
