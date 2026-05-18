// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';

export default function BannerWithActionButton() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSBanner
        status="info"
        title="Your trial expires in 3 days"
        description="Upgrade now to keep access to all features."
        endContent={<XDSButton label="Upgrade" variant="secondary" size="sm" />}
      />
      <XDSBanner
        status="warning"
        title="API key expires soon"
        description="Generate a new key before December 1 to avoid service interruption."
        endContent={
          <XDSButton label="Renew key" variant="secondary" size="sm" />
        }
      />
      <XDSBanner
        status="error"
        title="Payment failed"
        description="We could not process your last payment."
        endContent={<XDSButton label="Retry" variant="secondary" size="sm" />}
      />
    </XDSStack>
  );
}
