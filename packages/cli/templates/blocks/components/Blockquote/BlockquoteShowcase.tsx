// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBlockquote} from '@xds/core/Blockquote';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: 500,
  },
});

export default function BlockquoteShowcase() {
  return (
    <XDSStack direction="vertical" gap={4} xstyle={styles.root}>
      <XDSBlockquote>
        Design is not just what it looks like and feels like. Design is how it
        works.
      </XDSBlockquote>
      <XDSBlockquote cite="Steve Jobs">
        The people who are crazy enough to think they can change the world are
        the ones who do.
      </XDSBlockquote>
    </XDSStack>
  );
}
