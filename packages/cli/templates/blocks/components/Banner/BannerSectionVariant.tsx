'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function BannerSectionVariant() {
  return (
    <XDSBanner
      status="info"
      title="System maintenance scheduled"
      description="The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC."
      container="section"
    />
  );
}
