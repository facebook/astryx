'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: 500,
  },
});

export default function DividerShowcase() {
  return (
    <XDSStack direction="vertical" gap={4} xstyle={styles.root}>
      <XDSDivider variant="subtle" />
      <XDSDivider variant="strong" />
      <XDSDivider label="or" />
    </XDSStack>
  );
}
