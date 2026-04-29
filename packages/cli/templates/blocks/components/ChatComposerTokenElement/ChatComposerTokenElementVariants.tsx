'use client';

import {XDSChatComposerTokenElement} from '@xds/core/Chat';
import type {XDSChatComposerToken} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const MENTION_TOKENS: XDSChatComposerToken[] = [
  {value: '@cindy', label: 'Cindy Zhang', variant: 'blue'},
  {value: '@alex', label: 'Alex Johnson', variant: 'green'},
  {value: '@jordan', label: 'Jordan Lee', variant: 'purple'},
];

const COMMAND_TOKENS: XDSChatComposerToken[] = [
  {value: '/summarize', label: '/summarize', variant: 'yellow'},
  {value: '/translate', label: '/translate', variant: 'cyan'},
  {value: '/search', label: '/search', variant: 'orange'},
];

const TAG_TOKENS: XDSChatComposerToken[] = [
  {value: '#bug', label: '#bug', variant: 'red'},
  {value: '#feature', label: '#feature', variant: 'teal'},
  {value: '#urgent', label: '#urgent', variant: 'pink'},
];

export default function ChatComposerTokenElementVariants() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Mentions
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          {MENTION_TOKENS.map((token) => (
            <XDSChatComposerTokenElement key={token.value} token={token} />
          ))}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Commands
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          {COMMAND_TOKENS.map((token) => (
            <XDSChatComposerTokenElement key={token.value} token={token} />
          ))}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Tags
        </XDSText>
        <XDSStack direction="horizontal" gap={2} vAlign="center">
          {TAG_TOKENS.map((token) => (
            <XDSChatComposerTokenElement key={token.value} token={token} />
          ))}
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
