'use client';

import {XDSChatSendButton} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatSendButtonStates() {
  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="supporting" color="secondary">
        Disabled → Ready → Streaming
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSChatSendButton isDisabled onSend={() => {}} />
        <XDSChatSendButton isDisabled={false} onSend={() => {}} />
        <XDSChatSendButton isStreaming onStop={() => {}} />
      </XDSStack>
    </XDSStack>
  );
}
