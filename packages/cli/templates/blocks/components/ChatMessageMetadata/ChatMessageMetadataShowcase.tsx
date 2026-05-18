// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
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
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {
  ClipboardDocumentIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';

const styles = stylex.create({
  container: {
    maxWidth: 600,
  },
});

export default function ChatMessageMetadataShowcase() {
  return (
    <XDSVStack xstyle={styles.container}>
      <XDSChatMessageList>
        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:30:00" format="time" />
                }
                status="error"
                footer={
                  <XDSHStack gap={1}>
                    <XDSButton
                      label="Retry"
                      variant="ghost"
                      size="sm"
                      icon={<XDSIcon icon={ArrowPathIcon} size="sm" />}
                      isIconOnly
                      onClick={() => {}}
                    />
                  </XDSHStack>
                }
              />
            }>
            Sorry, something went wrong on my end.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="read"
              />
            }>
            No worries — try again with just the last 24 hours of logs.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-03-15T14:32:00" format="time" />
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
                      Claude Opus 4.6
                    </XDSText>
                  </XDSHStack>
                }
              />
            }>
            The canary at 11:42 AM caused a memory spike. Rolled back
            at 11:58 AM.
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSVStack>
  );
}
