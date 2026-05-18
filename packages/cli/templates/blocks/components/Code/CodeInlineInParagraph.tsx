// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCode} from '@xds/core/CodeBlock';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 400,
  },
});

export default function CodeInlineInParagraph() {
  return (
    <XDSText type="body" xstyle={styles.root}>
      Use <XDSCode>useState</XDSCode> for local state and{' '}
      <XDSCode>useEffect</XDSCode> for side effects. If you need shared state
      across components, consider <XDSCode>useContext</XDSCode> or a state
      management library.
    </XDSText>
  );
}
