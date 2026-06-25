// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatMessageList, ChatSystemMessage} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ChatSystemMessageVariants() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Default
        </Text>
        <ChatMessageList>
          <ChatSystemMessage>
            Alex joined the conversation
          </ChatSystemMessage>
          <ChatSystemMessage>
            Conversation marked as resolved
          </ChatSystemMessage>
        </ChatMessageList>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Divider
        </Text>
        <ChatMessageList>
          <ChatSystemMessage variant="divider">
            March 15, 2026
          </ChatSystemMessage>
          <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
        </ChatMessageList>
      </Stack>
    </Stack>
  );
}
