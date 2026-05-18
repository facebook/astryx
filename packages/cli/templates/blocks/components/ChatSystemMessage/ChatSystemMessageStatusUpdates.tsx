// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatMessageList, XDSChatSystemMessage} from '@xds/core/Chat';
import {XDSIcon} from '@xds/core/Icon';
import {
  CheckCircleIcon,
  UserMinusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function ChatSystemMessageStatusUpdates() {
  return (
    <XDSChatMessageList>
      <XDSChatSystemMessage variant="divider">
        March 14, 2026
      </XDSChatSystemMessage>

      <XDSChatSystemMessage icon={<XDSIcon icon={UserPlusIcon} />}>
        Sarah Chen joined the conversation
      </XDSChatSystemMessage>

      <XDSChatSystemMessage>
        Topic changed to "Q2 Launch Planning"
      </XDSChatSystemMessage>

      <XDSChatSystemMessage variant="divider">
        March 15, 2026
      </XDSChatSystemMessage>

      <XDSChatSystemMessage icon={<XDSIcon icon={UserMinusIcon} />}>
        Alex Rivera left the conversation
      </XDSChatSystemMessage>

      <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>

      <XDSChatSystemMessage icon={<XDSIcon icon={CheckCircleIcon} />}>
        Conversation marked as resolved
      </XDSChatSystemMessage>
    </XDSChatMessageList>
  );
}
