'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function BannerWithContent() {
  return (
    <XDSBanner
      status="error"
      title="Multiple errors found"
      description="The following issues need to be resolved:">
      <ul>
        <li>Email address is invalid</li>
        <li>Password must be at least 8 characters</li>
      </ul>
    </XDSBanner>
  );
}
