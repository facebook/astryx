// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatSendButton} from '@astryxdesign/core/Chat';
import {Icon} from '@astryxdesign/core/Icon';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {
  CheckIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import {XCircleIcon} from '@heroicons/react/24/outline';

export default function ChatSendButtonCustomIcon() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Custom icons for send and stop states
      </Text>
      <Stack direction="horizontal" gap={4} vAlign="center">
        <ChatSendButton
          isDisabled={false}
          onSend={() => {}}
          sendIcon={<Icon icon={PaperAirplaneIcon} size="sm" />}
        />
        <ChatSendButton
          isDisabled={false}
          onSend={() => {}}
          sendIcon={<Icon icon={CheckIcon} size="sm" />}
        />
        <ChatSendButton
          isDisabled={false}
          onSend={() => {}}
          sendIcon={<Icon icon={SparklesIcon} size="sm" />}
        />
        <ChatSendButton
          isStopShown
          onStop={() => {}}
          stopIcon={<Icon icon={XCircleIcon} size="sm" />}
        />
      </Stack>
    </Stack>
  );
}
