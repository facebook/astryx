'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';
import {XDSList, XDSListItem} from '@xds/core/List';

export default function BannerErrorList() {
  return (
    <XDSBanner
      status="error"
      title="4 errors found"
      description="Fix the following before submitting:"
      endContent={<XDSButton label="Fix all" variant="secondary" size="sm" />}
      defaultIsExpanded>
      <XDSList density="compact">
        <XDSListItem label="Email address is invalid" />
        <XDSListItem label="Password must be at least 8 characters" />
        <XDSListItem label="Username is already taken" />
        <XDSListItem label="Terms of service must be accepted" />
      </XDSList>
    </XDSBanner>
  );
}
