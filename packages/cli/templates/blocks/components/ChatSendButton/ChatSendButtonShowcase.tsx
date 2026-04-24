'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatSendButtonShowcase() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default (empty input — disabled)
        </XDSText>
        <XDSChatComposer onSubmit={() => {}} />
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          With content (enabled)
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          value="Ready to send"
          onChange={() => {}}
        />
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Streaming (shows stop button)
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          onStop={() => {}}
          isStreaming
        />
      </XDSStack>
    </XDSStack>
  );
}
