// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Switch} from '@astryxdesign/core/Switch';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';

export default function SwitchSettingsPanel() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <Card width="100%" style={{maxWidth: 300}}>
      <VStack gap={4}>
        <Switch
          label="Enable notifications"
          value={notifications}
          onChange={setNotifications}
          labelPosition="start"
          labelSpacing="spread"
        />
        <Switch
          label="Dark mode"
          value={darkMode}
          onChange={setDarkMode}
          labelPosition="start"
          labelSpacing="spread"
        />
        <Switch
          label="Auto-save"
          value={autoSave}
          onChange={setAutoSave}
          labelPosition="start"
          labelSpacing="spread"
        />
      </VStack>
    </Card>
  );
}
