'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

export default function TextHierarchy() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="label" display="block">
          Account settings
        </XDSText>
        <XDSText type="body" display="block">
          Manage your profile information, notification preferences, and
          security options from this page.
        </XDSText>
        <XDSText type="supporting" display="block">
          Last updated 3 hours ago
        </XDSText>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="label" display="block">
          Billing details
        </XDSText>
        <XDSText type="body" display="block">
          Your next invoice of $49.00 is scheduled for January 15, 2025. All
          charges are billed in USD.
        </XDSText>
        <XDSText type="supporting" color="active" display="block">
          Payment method verified
        </XDSText>
      </XDSStack>
    </XDSStack>
  );
}
