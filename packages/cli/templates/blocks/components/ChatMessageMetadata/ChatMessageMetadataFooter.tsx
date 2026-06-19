// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@xds/core/Chat';
import {Timestamp} from '@xds/core/Timestamp';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Text} from '@xds/core/Text';
import {HStack} from '@xds/core/Layout';
import {
  ClipboardDocumentIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';

export default function ChatMessageMetadataFooter() {
  return (
    <ChatMessageList style={{maxWidth: 500}}>
      <ChatMessage sender="user">
        <ChatMessageBubble
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-29T09:41:00" format="time" />
              }
              status="read"
            />
          }>
          Summarize the Q1 revenue report.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp value="2026-04-29T09:42:00" format="time" />
              }
              footer={
                <HStack gap={1}>
                  <Button
                    label="Copy"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={ClipboardDocumentIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <Button
                    label="Retry"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={ArrowPathIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <Button
                    label="Good response"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={HandThumbUpIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <Button
                    label="Bad response"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={HandThumbDownIcon} size="sm" />}
                    isIconOnly
                    onClick={() => {}}
                  />
                  <Text type="supporting" color="secondary">
                    GPT-4o
                  </Text>
                </HStack>
              }
            />
          }>
          Q1 revenue reached $2.4B, up 18% year-over-year. Enterprise
          subscriptions drove 62% of the growth, while ad revenue held steady at
          $890M.
        </ChatMessageBubble>
      </ChatMessage>
    </ChatMessageList>
  );
}
