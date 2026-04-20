'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTimestamp} from '@xds/core/Timestamp';

const nameStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  lineHeight: '16px',
};

export default function ChatMessengerConversation() {
  return (
    <div style={{height: 500, display: 'flex', flexDirection: 'column'}}>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble
            name={<span style={nameStyle}>Navi</span>}
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
                }
              />
            }>
            Hey! I looked at the PR and left a few comments on the density
            styles.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="user"
          avatar={<XDSAvatar name="Cindy" size="small" />}>
          <XDSChatMessageBubble
            group="first"
            name={<span style={nameStyle}>Cindy</span>}>
            Thanks! I'll take a look.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="read"
              />
            }>
            Should be quick to fix.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble
            name={<span style={nameStyle}>Navi</span>}
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:32:00" format="time" />
                }
              />
            }>
            Sounds good. The main thing is the compact radius — it should use
            the container token, not the page token.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatSystemMessage>Cindy liked a message</XDSChatSystemMessage>
      </XDSChatMessageList>
    </div>
  );
}
