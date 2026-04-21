'use client';

import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';

export default function PopoverShowcase() {
  return (
    <XDSPopover
      placement="below"
      label="Settings"
      width={280}
      content={
        <XDSVStack gap={3}>
          <XDSHeading level={4}>Settings</XDSHeading>
          <XDSDivider />
          <XDSText type="body">Notifications, dark mode, and sound preferences.</XDSText>
        </XDSVStack>
      }>
      <XDSButton label="Settings">Settings</XDSButton>
    </XDSPopover>
  );
}
