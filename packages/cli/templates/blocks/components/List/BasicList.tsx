'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function BasicList() {
  return (
    <XDSList>
      <XDSListItem label="Notifications" description="Manage your alerts" />
      <XDSListItem label="Privacy" description="Control your data" />
      <XDSListItem label="Security" description="Password and 2FA" />
    </XDSList>
  );
}
