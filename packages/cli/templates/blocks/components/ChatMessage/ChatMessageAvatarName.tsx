'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function ChatMessageAvatarName() {
  return (
    <XDSChatMessageList style={{maxWidth: 500}}>
      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Agent" size="small" />}>
        <XDSChatMessageBubble
          name={
            <XDSText type="supporting" weight="semibold" color="secondary">
              Agent
            </XDSText>
          }
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T10:15:00" format="time" />
              }
            />
          }>
          I reviewed the pull request. The changes look solid — clean code and
          good test coverage.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T10:16:00" format="time" />
              }
              status="read"
            />
          }>
          Thanks! Merging it now.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Agent" size="small" />}>
        <XDSChatMessageBubble
          name={
            <XDSText type="supporting" weight="semibold" color="secondary">
              Agent
            </XDSText>
          }
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T10:17:00" format="time" />
              }
            />
          }>
          I can run the deployment pipeline once it lands. Just let me know.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
