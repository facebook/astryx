'use client';

import {XDSChatLayoutScrollButton} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatLayoutScrollButtonStates() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Hidden (user is at bottom)
        </XDSText>
        <XDSChatLayoutScrollButton
          isVisible={false}
          onClick={() => {}}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Visible (user scrolled up)
        </XDSText>
        <XDSChatLayoutScrollButton
          isVisible={true}
          onClick={() => {}}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Expanded with label (new messages arrived)
        </XDSText>
        <XDSChatLayoutScrollButton
          isVisible={true}
          label="New messages"
          onClick={() => {}}
        />
      </XDSStack>
    </XDSStack>
  );
}
