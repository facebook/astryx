'use client';

import {XDSChatLayoutScrollButton} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatLayoutScrollButtonLabels() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Labels expand the button to give context
      </XDSText>
      <XDSStack direction="vertical" gap={3}>
        <XDSChatLayoutScrollButton
          isVisible={true}
          onClick={() => {}}
        />
        <XDSChatLayoutScrollButton
          isVisible={true}
          label="New messages"
          onClick={() => {}}
        />
        <XDSChatLayoutScrollButton
          isVisible={true}
          label="3 unread replies"
          onClick={() => {}}
        />
      </XDSStack>
    </XDSStack>
  );
}
