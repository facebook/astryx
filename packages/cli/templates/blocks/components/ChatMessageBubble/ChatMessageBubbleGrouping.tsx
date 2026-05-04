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

export default function ChatMessageBubbleGrouping() {
  return (
    <XDSChatMessageList style={{maxWidth: 500}}>
      <XDSChatMessage
        sender="assistant"
        avatar={<XDSAvatar name="Agent" size="small" />}>
        <XDSChatMessageBubble
          group="first"
          name={
            <XDSText type="supporting" weight="semibold" color="secondary">
              Agent
            </XDSText>
          }>
          I reviewed the three files you shared.
        </XDSChatMessageBubble>
        <XDSChatMessageBubble group="middle">
          The data model looks solid, but the API handler has a race condition
          on concurrent writes.
        </XDSChatMessageBubble>
        <XDSChatMessageBubble
          group="last"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-10T10:45:00" format="time" />
              }
            />
          }>
          I can draft a fix if you want.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble group="first">Yes please!</XDSChatMessageBubble>
        <XDSChatMessageBubble
          group="last"
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-10T10:46:00" format="time" />
              }
              status="delivered"
            />
          }>
          Also add a test for the concurrent case.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
