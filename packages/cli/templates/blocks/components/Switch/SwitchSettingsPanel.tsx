'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';

export default function SwitchSettingsPanel() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 350,
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 16,
      }}>
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
    </div>
  );
}
