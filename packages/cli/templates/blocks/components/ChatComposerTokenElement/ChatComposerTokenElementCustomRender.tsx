'use client';

import {XDSChatComposerTokenElement} from '@xds/core/Chat';
import type {XDSChatComposerToken} from '@xds/core/Chat';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const CUSTOM_TOKENS: XDSChatComposerToken[] = [
  {
    value: '@cindy',
    render: () => (
      <XDSBadge variant="blue" label="Cindy Zhang" icon={<XDSAvatar name="Cindy Zhang" size="tiny" />} />
    ),
  },
  {
    value: '@alex',
    render: () => (
      <XDSBadge variant="green" label="Alex Johnson" icon={<XDSAvatar name="Alex Johnson" size="tiny" />} />
    ),
  },
  {
    value: '@sam',
    render: () => (
      <XDSBadge variant="purple" label="Sam Rivera" icon={<XDSAvatar name="Sam Rivera" size="tiny" />} />
    ),
  },
];

export default function ChatComposerTokenElementCustomRender() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Custom render tokens with avatar icons
      </XDSText>
      <XDSStack direction="horizontal" gap={2} vAlign="center">
        {CUSTOM_TOKENS.map((token) => (
          <XDSChatComposerTokenElement key={token.value} token={token} />
        ))}
      </XDSStack>
    </XDSStack>
  );
}
