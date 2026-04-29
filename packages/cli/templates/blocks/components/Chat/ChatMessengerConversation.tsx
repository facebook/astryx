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
import {XDSText} from '@xds/core/Text';

const SenderName = ({children}: {children: string}) => (
  <XDSText type="supporting" weight="semibold" color="secondary">
    {children}
  </XDSText>
);

export default function ChatMessengerConversation() {
  return (
    <XDSChatMessageList>
      <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Navi" size="small" />}>
        <XDSChatMessageBubble
          name={<SenderName>Navi</SenderName>}
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
              }
            />
          }>
          Hey! I looked at the PR and left a few comments on the density styles.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage
        sender="user"
        avatar={<XDSAvatar name="Cindy" size="small" />}>
        <XDSChatMessageBubble
          group="first"
          name={<SenderName>Cindy</SenderName>}>
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
          name={<SenderName>Navi</SenderName>}
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:32:00" format="time" />
              }
            />
          }>
          Sounds good. The main thing is the compact radius — it should use the
          container token, not the page token.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage
        sender="user"
        avatar={<XDSAvatar name="Cindy" size="small" />}>
        <XDSChatMessageBubble
          name={<SenderName>Cindy</SenderName>}
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:33:00" format="time" />
              }
              status="delivered"
            />
          }>
          Good catch, fixed and pushed.
        </XDSChatMessageBubble>
      </XDSChatMessage>
      <XDSChatSystemMessage>Cindy liked a message</XDSChatSystemMessage>
    </XDSChatMessageList>
  );
}
