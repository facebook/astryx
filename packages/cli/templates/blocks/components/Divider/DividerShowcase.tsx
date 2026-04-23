'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
  },
});

export default function DividerShowcase() {
  return (
    <XDSStack direction="vertical" gap={4} xstyle={styles.root}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Subtle
        </XDSText>
        <XDSDivider variant="subtle" />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Strong
        </XDSText>
        <XDSDivider variant="strong" />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          With label
        </XDSText>
        <XDSDivider label="or" />
      </XDSStack>
    </XDSStack>
  );
}
