'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTimestamp} from '@xds/core/Timestamp';

export default function ChatMultiBubbleGrouping() {
  return (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble group="first">
            Hey, can you review my PR?
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="middle">
            It's the one for the chat components
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="delivered"
              />
            }>
            Link: github.com/xds/pull/1180
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble group="first">
            Sure, looking at it now!
          </XDSChatMessageBubble>
          <XDSChatMessageBubble group="middle">
            The compound pattern looks solid. A few minor comments on the
            density styles.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:33:00" format="time" />
                }
              />
            }>
            I'll leave them as review comments.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:34:00" format="time" />
                }
                status="sending"
              />
            }>
            Thanks, will address those
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  );
}
