'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSStack} from '@xds/core/Layout';

export default function BannerDismissable() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSBanner
        status="warning"
        title="Scheduled maintenance tonight"
        description="The system will be briefly unavailable from 2:00–3:00 AM."
        isDismissable
      />
      <XDSBanner
        status="info"
        title="New feature available"
        description="Try the new dashboard layout in Settings."
        isDismissable
      />
    </XDSStack>
  );
}
