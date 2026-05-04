'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {XDSHStack} from '@xds/core/Layout';
import {
  ClipboardDocumentIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';

export default function ChatMessageMetadataFooter() {
  return (
    <XDSChatMessageList style={{maxWidth: 500}}>
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-29T09:41:00" format="time" />
              }
              status="read"
            />
          }>
          Summarize the Q1 revenue report.
        </XDSChatMessageBubble>
      </XDSChatMessage>

      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-29T09:42:00" format="time" />
              }
              footer={
                <XDSHStack gap={1}>
                  <XDSButton
                    label="Copy"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={ClipboardDocumentIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSButton
                    label="Retry"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={ArrowPathIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSButton
                    label="Good response"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={HandThumbUpIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSButton
                    label="Bad response"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={HandThumbDownIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    GPT-4o
                  </XDSText>
                </XDSHStack>
              }
            />
          }>
          Q1 revenue reached $2.4B, up 18% year-over-year. Enterprise
          subscriptions drove 62% of the growth, while ad revenue held steady at
          $890M.
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
