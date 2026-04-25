'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack} from '@xds/core/Layout';

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
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
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
                  <XDSButton
                    label="Retry"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon="wrench" size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSButton
                    label="Good"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon="check" size="sm" />}
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
          Yes, everything looks good! The build passed all checks and
          performance metrics are within target.
        </XDSChatMessageBubble>
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

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-03-15T14:33:00" format="time" />
              }
              status="error"
              footer={
                <XDSHStack gap={1}>
                  <XDSButton
                    label="Retry"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon="wrench" size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                </XDSHStack>
              }
            />
          }>
          Metadata can also show error status with a retry action.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
