'use client';

import {XDSChatComposer} from '@xds/core/Chat';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatComposer() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          placeholder="Type a message…"
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          With footer actions
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          placeholder="Ask me anything…"
          footerActions={
            <>
              <XDSButton label="Auto" variant="ghost" size="md" />
              <XDSButton label="Settings" variant="ghost" size="md" />
            </>
          }
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Error status
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          status={{
            type: 'error',
            message: 'Failed to send message. Please try again.',
          }}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSChatComposer
          onSubmit={() => {}}
          isDisabled
          placeholder="Composer is disabled"
        />
      </XDSStack>
    </XDSStack>
  );
}
