// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatMessageList, XDSChatSystemMessage} from '@xds/core/Chat';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function ChatSystemMessageWithIcon() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Icons reinforce the message type
      </XDSText>
      <XDSChatMessageList>
        <XDSChatSystemMessage icon={<XDSIcon icon={UserPlusIcon} />}>
          Jordan was added to the conversation
        </XDSChatSystemMessage>
        <XDSChatSystemMessage icon={<XDSIcon icon={LockClosedIcon} />}>
          Messages are end-to-end encrypted
        </XDSChatSystemMessage>
        <XDSChatSystemMessage icon={<XDSIcon icon={SparklesIcon} />}>
          Agent is generating a response…
        </XDSChatSystemMessage>
        <XDSChatSystemMessage icon={<XDSIcon icon={ShieldCheckIcon} />}>
          Conversation verified by admin
        </XDSChatSystemMessage>
      </XDSChatMessageList>
    </XDSStack>
  );
}
