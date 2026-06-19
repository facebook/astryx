// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCitation} from '@xds/core/Citation';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';

export default function CitationInlineText() {
  return (
    <XDSStack direction="vertical" gap={4} style={{maxWidth: 560}}>
      <XDSText type="body">
        React uses a virtual DOM to minimize expensive DOM operations
        <XDSCitation
          source={{title: 'React Documentation', url: 'https://react.dev'}}
          number={1}
          variant="number"
        />
        . This approach was inspired by earlier functional UI frameworks
        <XDSCitation
          source={{title: 'Elm Architecture', url: 'https://guide.elm-lang.org/architecture/'}}
          number={2}
          variant="number"
        />
        .
      </XDSText>
      <XDSText type="body">
        StyleX compiles atomic CSS at build time for optimal performance
        <XDSCitation
          source={{
            title: 'StyleX Documentation',
            url: 'https://stylexjs.com',
            icon: 'https://stylexjs.com/img/favicon.ico',
          }}
          number={3}
          variant="label"
        />
        .
      </XDSText>
    </XDSStack>
  );
}
