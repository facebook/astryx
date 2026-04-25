'use client';

import {
  XDSChatMessageList,
  XDSChatSystemMessage,
} from '@xds/core/Chat';

export default function ChatSystemMessageShowcase() {
  return (
    <XDSChatMessageList>
      <XDSChatSystemMessage variant="divider">
        March 15, 2026
      </XDSChatSystemMessage>

      <XDSChatSystemMessage>
        Alex joined the conversation
      </XDSChatSystemMessage>

      <XDSChatSystemMessage>
        Navi is thinking…
      </XDSChatSystemMessage>

      <XDSChatSystemMessage variant="divider">
        Today
      </XDSChatSystemMessage>

      <XDSChatSystemMessage>
        Conversation marked as resolved
      </XDSChatSystemMessage>
    </XDSChatMessageList>
  );
}
