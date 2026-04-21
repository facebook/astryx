'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSStack} from '@xds/core/Layout';

export default function BannerSectionVariant() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSBanner
        status="warning"
        title="Scheduled downtime"
        description="All services will be unavailable on Sunday from 2:00–4:00 AM."
        container="section"
        isDismissable
      />
      <XDSBanner
        status="info"
        title="Welcome to the new dashboard"
        description="We have redesigned the layout based on your feedback."
        container="section"
      />
    </XDSStack>
  );
}
