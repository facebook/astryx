'use client';

import {XDSChatSendButton} from '@xds/core/Chat';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {SparklesIcon} from '@heroicons/react/24/solid';

export default function ChatSendButtonShowcase() {
  return (
    <XDSStack direction="horizontal" gap={3} vAlign="center">
      <XDSChatSendButton isDisabled={false} onSend={() => {}} />
      <XDSChatSendButton
        isDisabled={false}
        onSend={() => {}}
        sendIcon={<XDSIcon icon={SparklesIcon} size="sm" />}
      />
      <XDSChatSendButton isStreaming onStop={() => {}} />
    </XDSStack>
  );
}
