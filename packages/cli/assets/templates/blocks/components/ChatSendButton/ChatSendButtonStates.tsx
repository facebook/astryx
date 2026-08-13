// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatSendButton} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ChatSendButtonStates() {
  return (
    <Stack direction="vertical" gap={2}>
      <Text type="supporting" color="secondary">
        Disabled → Ready → Streaming
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="center">
        <ChatSendButton isDisabled onSend={() => {}} />
        <ChatSendButton isDisabled={false} onSend={() => {}} />
        <ChatSendButton isStopShown onStop={() => {}} />
      </Stack>
    </Stack>
  );
}
