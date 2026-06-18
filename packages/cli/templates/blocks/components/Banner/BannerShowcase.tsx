// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Banner} from '@xds/core/Banner';
import {Stack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 800,
  },
});

export default function BannerShowcase() {
  return (
    <Stack direction="vertical" gap={3} xstyle={styles.root}>
      <Banner status="info" title="A new software update is available." />
      <Banner status="success" title="Your changes have been saved." />
      <Banner
        status="warning"
        title="Your trial expires in 3 days."
        description="Upgrade to keep access to all features."
      />
      <Banner
        status="error"
        title="Payment failed."
        description="Update your billing information to continue."
      />
    </Stack>
  );
}
