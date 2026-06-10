// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCitation} from '@xds/core/Citation';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const sources = [
  {
    title: 'React Documentation',
    url: 'https://react.dev',
    icon: 'https://react.dev/favicon-32x32.png',
  },
  {
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    icon: 'https://www.typescriptlang.org/favicon-32x32.png',
  },
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    icon: 'https://developer.mozilla.org/favicon-48x48.cbbd161b.png',
  },
  {
    title: 'W3C WAI-ARIA Specification',
    url: 'https://www.w3.org/TR/wai-aria/',
  },
];

export default function CitationSourceList() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSText type="supporting" color="secondary">
        Sources
      </XDSText>
      <XDSStack direction="horizontal" gap={2} style={{flexWrap: 'wrap'}}>
        {sources.map((source, i) => (
          <XDSCitation
            key={source.title}
            source={source}
            number={i + 1}
            variant="label"
          />
        ))}
      </XDSStack>
    </XDSStack>
  );
}
