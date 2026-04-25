'use client';

import {XDSChatComposer, XDSChatSendButton} from '@xds/core/Chat';
import {XDSIcon} from '@xds/core/Icon';
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

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Custom send icon
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          value="Custom icon"
          onChange={() => {}}
          sendButton={
            <XDSChatSendButton
              sendIcon={<XDSIcon icon="check" size="sm" />}
              onSend={() => {}}
              isDisabled={false}
            />
          }
        />
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Small size
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          value="Small send button"
          onChange={() => {}}
          density="compact"
          sendButton={
            <XDSChatSendButton
              size="sm"
              onSend={() => {}}
              isDisabled={false}
            />
          }
        />
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Standalone (outside composer context)
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          <XDSChatSendButton
            isDisabled={true}
            onSend={() => {}}
          />
          <XDSChatSendButton
            isDisabled={false}
            onSend={() => {}}
          />
          <XDSChatSendButton
            isStreaming={true}
            onStop={() => {}}
          />
          <XDSChatSendButton
            size="sm"
            isDisabled={false}
            onSend={() => {}}
          />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
