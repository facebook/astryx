'use client';

import {XDSList, XDSListItem} from '@xds/core/List';

export default function ListBasic() {
  return (
    <XDSList>
      <XDSListItem label="Notifications" description="Manage your alerts" />
      <XDSListItem label="Privacy" description="Control your data" />
    </XDSList>
  );
}

export const showcase = {
  aspectRatio: 3 / 4,
  render: ListBasic,
};
