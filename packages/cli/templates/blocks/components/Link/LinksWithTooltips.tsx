// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSLink} from '@xds/core/Link';
import {XDSHStack} from '@xds/core/Layout';

export default function LinksWithTooltips() {
  return (
    <XDSHStack gap={4} vAlign="center">
      <XDSLink
        href="#"
        tooltip="Configure your account settings"
        isStandalone>
        Settings
      </XDSLink>
      <XDSLink
        href="#"
        tooltip="View and edit your profile"
        isStandalone>
        Profile
      </XDSLink>
      <XDSLink
        href="#"
        tooltip="Get help and support"
        color="secondary"
        isStandalone>
        Help
      </XDSLink>
    </XDSHStack>
  );
}
