// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';

export default function BannerSectionVariant() {
  return (
    <XDSStack direction="vertical" gap={3}>
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
        endContent={
          <XDSButton label="Take a tour" variant="secondary" size="sm" />
        }
      />
    </XDSStack>
  );
}
