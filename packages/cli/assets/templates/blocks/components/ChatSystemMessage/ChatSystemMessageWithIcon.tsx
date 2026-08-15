// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatMessageList, ChatSystemMessage} from '@astryxdesign/core/Chat';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function ChatSystemMessageWithIcon() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Icons reinforce the message type
      </Text>
      <ChatMessageList>
        <ChatSystemMessage icon={<Icon icon={UserPlusIcon} />}>
          Jordan was added to the conversation
        </ChatSystemMessage>
        <ChatSystemMessage icon={<Icon icon={LockClosedIcon} />}>
          Messages are end-to-end encrypted
        </ChatSystemMessage>
        <ChatSystemMessage icon={<Icon icon={SparklesIcon} />}>
          Agent is generating a response…
        </ChatSystemMessage>
        <ChatSystemMessage icon={<Icon icon={ShieldCheckIcon} />}>
          Conversation verified by admin
        </ChatSystemMessage>
      </ChatMessageList>
    </Stack>
  );
}
