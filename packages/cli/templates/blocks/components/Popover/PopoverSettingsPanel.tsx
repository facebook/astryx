'use client';

import {useState} from 'react';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSDivider} from '@xds/core/Divider';
export default function PopoverSettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);

  return (
    <XDSPopover
      placement="below"
      label="Settings"
      width={280}
      content={
        <XDSVStack gap={3}>
          <XDSHeading level={4}>Settings</XDSHeading>
          <XDSDivider />
          <XDSSwitch
            label="Notifications"
            description="Receive push notifications"
            value={notifications}
            onChange={setNotifications}
          />
          <XDSSwitch
            label="Dark mode"
            description="Use dark color theme"
            value={darkMode}
            onChange={setDarkMode}
          />
          <XDSSwitch
            label="Sounds"
            description="Play sounds for actions"
            value={sounds}
            onChange={setSounds}
          />
        </XDSVStack>
      }>
      <XDSButton label="Settings">Settings</XDSButton>
    </XDSPopover>
  );
}
