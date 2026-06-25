// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Code} from '@astryxdesign/core/CodeBlock';
import {Text} from '@astryxdesign/core/Text';

export default function CodeInlineInParagraph() {
  return (
    <Text type="body" style={{maxWidth: 400}}>Use <Code>useState</Code>for local state and{' '}
      <Code>useEffect</Code>for side effects. If you need shared state
            across components, consider <Code>useContext</Code>or a state
            management library.
          </Text>
  );
}
