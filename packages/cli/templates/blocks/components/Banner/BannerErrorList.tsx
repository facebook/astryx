'use client';

import {XDSBanner} from '@xds/core/Banner';

export default function BannerErrorList() {
  return (
    <XDSBanner
      status="error"
      title="Multiple errors found"
      description="The following issues need to be resolved:"
      defaultIsExpanded>
      <ul style={{margin: 0, paddingInlineStart: 20, fontSize: 13}}>
        <li>Email address is invalid</li>
        <li>Password must be at least 8 characters</li>
        <li>Username is already taken</li>
      </ul>
    </XDSBanner>
  );
}
