'use client';

import {XDSChatComposerTokenElement} from '@xds/core/Chat';
import type {XDSChatComposerToken} from '@xds/core/Chat';
import {XDSBadge} from '@xds/core/Badge';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const BADGE_TOKENS: XDSChatComposerToken[] = [
  {value: '@cindy', label: 'Cindy Zhang', variant: 'blue' as const},
  {value: '/summarize', label: '/summarize', variant: 'yellow' as const},
];

const CUSTOM_TOKEN: XDSChatComposerToken = {
  value: '@sam',
  render: () => <XDSBadge variant="green" label="Sam Rivera ✔" />,
};

export default function ChatComposerTokenElementMixed() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Badge and custom render tokens mixed inline
      </XDSText>
      <XDSStack direction="horizontal" gap={1} vAlign="center">
        <XDSText type="body">Assign</XDSText>
        {BADGE_TOKENS.map((token) => (
          <XDSChatComposerTokenElement key={token.value} token={token} />
        ))}
        <XDSChatComposerTokenElement token={CUSTOM_TOKEN} />
        <XDSText type="body">to review</XDSText>
      </XDSStack>
    </XDSStack>
  );
}
