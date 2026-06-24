// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Code} from '@astryxdesign/core/CodeBlock';
import {Text} from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 400,
  },
});

export default function CodeInlineInParagraph() {
  return (
    <Text type="body" xstyle={styles.root}>Use <Code>useState</Code>for local state and{' '}
      <Code>useEffect</Code>for side effects. If you need shared state
            across components, consider <Code>useContext</Code>or a state
            management library.
          </Text>
  );
}
