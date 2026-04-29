'use client';

import {
  XDSChatComposerTokenElement,
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatComposerTokenElementInMessage() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Tokens rendered inline within message bubbles
      </XDSText>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            <XDSText type="body">
              Hey{' '}
              <XDSChatComposerTokenElement
                token={{value: '@cindy', label: 'Cindy Zhang', variant: 'blue'}}
              />{' '}
              can you review the{' '}
              <XDSChatComposerTokenElement
                token={{value: '#auth-migration', label: '#auth-migration', variant: 'purple'}}
              />{' '}
              PR?
            </XDSText>
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>
            <XDSText type="body">
              Running{' '}
              <XDSChatComposerTokenElement
                token={{value: '/review', label: '/review', variant: 'yellow'}}
              />{' '}
              on the pull request now.
            </XDSText>
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSStack>
  );
}
