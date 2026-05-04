'use client';

import {
  XDSChatLayout,
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatComposer,
  XDSChatTokenizedText,
} from '@xds/core/Chat';
import {XDSVStack} from '@xds/core/Stack';

const TOKENS = [{value: '/review', label: '/review', variant: 'blue' as const}];

export default function ChatLayoutShowcase() {
  return (
    <XDSVStack width={450}>
      <XDSChatLayout
        composer={
          <XDSChatComposer
            onSubmit={() => {}}
            placeholder="Ask something..."
          />
        }>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              <XDSChatTokenizedText tokens={TOKENS}>
                /review the changes in this file
              </XDSChatTokenizedText>
            </XDSChatMessageBubble>
          </XDSChatMessage>
          <XDSChatMessage sender="assistant">
            <XDSChatMessageBubble variant="ghost">
              Reading the file now...
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSChatLayout>
    </XDSVStack>
  );
}
