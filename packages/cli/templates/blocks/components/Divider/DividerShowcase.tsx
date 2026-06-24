// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Divider} from '@astryxdesign/core/Divider';
import {Stack} from '@astryxdesign/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: 500,
  },
});

export default function DividerShowcase() {
  return (
    <Stack direction="vertical" gap={4} xstyle={styles.root}>
      <Divider variant="subtle" />
      <Divider variant="strong" />
      <Divider label="or" />
    </Stack>
  );
}
