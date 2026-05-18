// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function BannerCollapsibleContent() {
  return (
    <XDSBanner
      status="warning"
      title="Configuration changes detected"
      description="Review the changes before they take effect."
      endContent={<XDSButton label="Review" variant="secondary" size="sm" />}
      isDismissable
      defaultIsExpanded>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Changed settings:
        </XDSText>
        <XDSList density="compact">
          <XDSListItem label="Authentication method updated" />
          <XDSListItem label="Rate limits modified" />
        </XDSList>
      </XDSStack>
    </XDSBanner>
  );
}
