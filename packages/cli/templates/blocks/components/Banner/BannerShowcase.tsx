'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 800,
  },
});

export default function BannerShowcase() {
  return (
    <XDSStack direction="vertical" gap={3} xstyle={styles.root}>
      <XDSBanner status="info" title="A new software update is available." />
      <XDSBanner status="success" title="Your changes have been saved." />
      <XDSBanner
        status="warning"
        title="Your trial expires in 3 days."
        description="Upgrade to keep access to all features."
      />
      <XDSBanner
        status="error"
        title="Payment failed."
        description="Update your billing information to continue."
      />
    </XDSStack>
  );
}
