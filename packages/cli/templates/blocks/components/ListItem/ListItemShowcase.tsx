// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';

export default function ListItemShowcase() {
  return (
    <XDSList header="Settings" hasDividers>
      <XDSListItem
        label="Notifications"
        description="Push, email, and SMS alerts"
        startContent={<XDSIcon icon="info" />}
        endContent={<XDSBadge label="3 new" variant="blue" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Privacy"
        description="Manage data sharing preferences"
        startContent={<XDSIcon icon="eyeSlash" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Appearance"
        description="Theme, font size, and display"
        startContent={<XDSIcon icon="wrench" />}
        onClick={() => {}}
      />
      <XDSListItem
        label="Billing"
        description="Plans and payment methods"
        startContent={<XDSIcon icon="copy" />}
        endContent={<XDSBadge label="Pro" variant="purple" />}
        onClick={() => {}}
      />
    </XDSList>
  );
}
