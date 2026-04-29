'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    height: 420,
  },
});

const STATUSES = [
  {status: 'sending' as const, text: 'Sending this message...'},
  {status: 'sent' as const, text: 'This message was sent'},
  {status: 'delivered' as const, text: 'This message was delivered'},
  {status: 'read' as const, text: 'This message was read'},
  {status: 'error' as const, text: 'This message failed to send'},
];

export default function ChatMessageListMessageStatus() {
  return (
    <XDSVStack gap={2} xstyle={styles.container}>
      <XDSText type="supporting" color="secondary">
        Delivery status indicators
      </XDSText>
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
    </XDSVStack>
  );
}
