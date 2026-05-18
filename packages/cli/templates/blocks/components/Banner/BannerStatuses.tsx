// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSStack} from '@xds/core/Layout';

export default function BannerStatuses() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSBanner
        status="info"
        title="A new software update is available"
        description="Version 2.4.1 includes performance improvements and bug fixes."
      />
      <XDSBanner
        status="success"
        title="Changes saved"
        description="Your profile information has been updated successfully."
      />
      <XDSBanner
        status="warning"
        title="Storage almost full"
        description="You have used 90% of your available storage."
      />
      <XDSBanner
        status="error"
        title="Build failed"
        description="3 tests did not pass. Check the logs for details."
      />
    </XDSStack>
  );
}
