'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';

export default function BannerWithActionButton() {
  return (
    <XDSBanner
      status="info"
      title="New update available"
      description="Version 2.0 is ready to install."
      endContent={<XDSButton label="Update now" variant="primary" size="sm" />}
    />
  );
}
