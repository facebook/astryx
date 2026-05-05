'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';

export default function SwitchSettingsPanel() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <XDSCard width="100%" style={{maxWidth: 300}}>
      <XDSVStack gap={4}>
        <XDSSwitch
          label="Enable notifications"
          value={notifications}
          onChange={setNotifications}
          labelPosition="start"
          labelSpacing="spread"
        />
        <XDSSwitch
          label="Dark mode"
          value={darkMode}
          onChange={setDarkMode}
          labelPosition="start"
          labelSpacing="spread"
        />
        <XDSSwitch
          label="Auto-save"
          value={autoSave}
          onChange={setAutoSave}
          labelPosition="start"
          labelSpacing="spread"
        />
      </XDSVStack>
    </XDSCard>
  );
}
