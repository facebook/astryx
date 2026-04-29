'use client';

import {
  XDSChatTokenizedText,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
} from '@xds/core/Chat';

const tokens = [
  {value: '@cindy', label: '@Cindy', variant: 'blue' as const},
  {value: '@alex', label: '@Alex', variant: 'blue' as const},
];

export default function ChatTokenizedTextBasic() {
  return (
    <XDSChatMessageList>
      <XDSChatMessage sender="system">
        <XDSChatMessageBubble>
          <XDSChatTokenizedText tokens={tokens}>
            Assign @cindy and @alex as reviewers.
          </XDSChatTokenizedText>
        </XDSChatMessageBubble>
      </XDSChatMessage>
    </XDSChatMessageList>
  );
}
