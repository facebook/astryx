'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';

const STATUSES = [
  {status: 'sending' as const, text: 'Sending this message now…'},
  {status: 'sent' as const, text: 'This message was sent to the server.'},
  {status: 'delivered' as const, text: 'Message arrived on their device.'},
  {status: 'read' as const, text: 'They read this one already.'},
  {status: 'error' as const, text: 'This message failed to send.'},
];

export default function ChatMessageListStatus() {
  return (
    <XDSChatMessageList>
      {STATUSES.map(({status, text}) => (
        <XDSChatMessage key={status} sender="user">
          <XDSChatMessageBubble
            metadata={<XDSChatMessageMetadata status={status} />}>
            {text}
          </XDSChatMessageBubble>
        </XDSChatMessage>
      ))}
    </XDSChatMessageList>
  );
}
