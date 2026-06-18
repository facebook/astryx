// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Banner} from '@xds/core/Banner';
import {Stack} from '@xds/core/Layout';

export default function BannerDismissable() {
  return (
    <Stack direction="vertical" gap={3}>
      <Banner
        status="success"
        title="Deployment complete"
        description="Version 3.2.0 is now live in production."
        isDismissable
      />
      <Banner
        status="warning"
        title="Scheduled maintenance tonight"
        description="The system will be briefly unavailable from 2:00–3:00 AM."
        isDismissable
      />
      <Banner
        status="info"
        title="New feature available"
        description="Try the new dashboard layout in Settings."
        isDismissable
      />
    </Stack>
  );
}
