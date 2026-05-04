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
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack} from '@xds/core/Layout';

export default function ChatMessageBubbleMetadata() {
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
                <XDSTimestamp value="2026-04-10T09:15:00" format="time" />
              }
              footer={
                <XDSHStack gap={1}>
                  <XDSButton
                    label="Copy"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon="copy" size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    Claude Opus 4.6
                  </XDSText>
                </XDSHStack>
              }
            />
          }>
          Your deployment finished successfully. All 14 checks passed.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-10T09:16:00" format="time" />
              }
              status="read"
            />
          }>
          Great, can you send me the production URL?
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
