'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';

export default function BannerCollapsibleContent() {
  return (
    <XDSBanner
      status="warning"
      title="Configuration changes detected"
      description="Review the changes before they take effect."
      endContent={<XDSButton label="Review" variant="secondary" size="sm" />}
      isDismissable
      defaultIsExpanded>
      <div style={{fontSize: 13}}>
        <p style={{margin: '0 0 8px'}}>Changed settings:</p>
        <ul style={{margin: 0, paddingInlineStart: 20}}>
          <li>Authentication method updated</li>
          <li>Rate limits modified</li>
        </ul>
      </div>
    </XDSBanner>
  );
}
