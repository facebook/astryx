// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  ChatMessageList,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
} from '@astryxdesign/core/Chat';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {
  ClipboardDocumentIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';

export default function ChatMessageMetadataShowcase() {
  return (
    <VStack style={{maxWidth: 600}}>
      <ChatMessageList>
        <ChatMessage sender="assistant">
          <ChatMessageBubble
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-03-15T14:30:00" format="time" />
                }
                status="error"
                footer={
                  <HStack gap={1}>
                    <Button
                      label="Retry"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={ArrowPathIcon} size="sm" />}
                      isIconOnly
                      onClick={() => {}}
                    />
                  </HStack>
                }
              />
            }>
            Sorry, something went wrong on my end.
          </ChatMessageBubble>
        </ChatMessage>

        <ChatMessage sender="user">
          <ChatMessageBubble
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-03-15T14:31:00" format="time" />
                }
                status="read"
              />
            }>
            No worries — try again with just the last 24 hours of logs.
          </ChatMessageBubble>
        </ChatMessage>

        <ChatMessage sender="assistant">
          <ChatMessageBubble
            metadata={
              <ChatMessageMetadata
                timestamp={
                  <Timestamp value="2026-03-15T14:32:00" format="time" />
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
                      Claude Opus 4.6
                    </Text>
                  </HStack>
                }
              />
            }>
            The canary at 11:42 AM caused a memory spike. Rolled back
            at 11:58 AM.
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </VStack>
  );
}
