'use client';

import {useState} from 'react';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';

export default function PopoverShowcase() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <XDSPopover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="below"
      label="Settings"
      width={280}
      content={
        <XDSVStack gap={3}>
          <XDSHeading level={4} tabIndex={0}>Settings</XDSHeading>
          <XDSDivider />
          <XDSText type="body">Notifications, dark mode, and sound preferences.</XDSText>
        </XDSVStack>
      }>
      <XDSButton label="Settings">Settings</XDSButton>
    </XDSPopover>
  );
}
