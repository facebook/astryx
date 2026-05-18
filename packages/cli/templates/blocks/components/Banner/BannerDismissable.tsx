// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSStack} from '@xds/core/Layout';

export default function BannerDismissable() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSBanner
        status="success"
        title="Deployment complete"
        description="Version 3.2.0 is now live in production."
        isDismissable
      />
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
