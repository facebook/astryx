'use client';

import {XDSChatSendButton} from '@xds/core/Chat';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  CheckIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import {XCircleIcon} from '@heroicons/react/24/outline';

export default function ChatSendButtonCustomIcon() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Custom icons for send and stop states
      </XDSText>
      <XDSStack direction="horizontal" gap={4} vAlign="center">
        <XDSChatSendButton
          isDisabled={false}
          onSend={() => {}}
          sendIcon={<XDSIcon icon={PaperAirplaneIcon} size="sm" />}
        />
        <XDSChatSendButton
          isDisabled={false}
          onSend={() => {}}
          sendIcon={<XDSIcon icon={CheckIcon} size="sm" />}
        />
        <XDSChatSendButton
          isDisabled={false}
          onSend={() => {}}
          sendIcon={<XDSIcon icon={SparklesIcon} size="sm" />}
        />
        <XDSChatSendButton
          isStreaming
          onStop={() => {}}
          stopIcon={<XDSIcon icon={XCircleIcon} size="sm" />}
        />
      </XDSStack>
    </XDSStack>
  );
}
