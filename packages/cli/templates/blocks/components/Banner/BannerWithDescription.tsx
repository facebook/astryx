'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function BannerWithDescription() {
  return (
    <XDSBanner
      status="info"
      title="New update available"
      description="A new version of the application is available. Update now to get the latest features and improvements."
    />
  );
}
