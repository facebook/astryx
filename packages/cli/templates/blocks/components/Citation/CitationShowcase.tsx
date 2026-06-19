// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCitation} from '@xds/core/Citation';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function CitationShowcase() {
  return (
    <XDSStack direction="vertical" gap={6}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Label variant
        </XDSText>
        <XDSStack direction="horizontal" gap={2} style={{flexWrap: 'wrap'}}>
          <XDSCitation
            source={{title: 'React Documentation', url: 'https://react.dev'}}
            number={1}
            variant="label"
          />
          <XDSCitation
            source={{
              title: 'GitHub',
              url: 'https://github.com',
              icon: 'https://github.githubassets.com/favicons/favicon.svg',
            }}
            number={2}
            variant="label"
          />
          <XDSCitation
            source={{title: 'Internal reference'}}
            number={3}
            variant="label"
          />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Number variant
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSCitation
            source={{title: 'TypeScript Handbook', url: 'https://typescriptlang.org'}}
            number={1}
            variant="number"
          />
          <XDSCitation
            source={{title: 'MDN Web Docs', url: 'https://developer.mozilla.org'}}
            number={2}
            variant="number"
          />
          <XDSCitation
            source={{title: 'W3C Specification'}}
            number={3}
            variant="number"
          />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
