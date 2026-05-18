// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatMessageList, XDSChatSystemMessage} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatSystemMessageVariants() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSChatMessageList>
          <XDSChatSystemMessage>
            Alex joined the conversation
          </XDSChatSystemMessage>
          <XDSChatSystemMessage>
            Conversation marked as resolved
          </XDSChatSystemMessage>
        </XDSChatMessageList>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Divider
        </XDSText>
        <XDSChatMessageList>
          <XDSChatSystemMessage variant="divider">
            March 15, 2026
          </XDSChatSystemMessage>
          <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>
        </XDSChatMessageList>
      </XDSStack>
    </XDSStack>
  );
}
