// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Switch} from '@astryxdesign/core/Switch';

export default function SwitchShowcase() {
  const [enabled, setEnabled] = useState(true);
  return (
    <Switch
      label="Enable notifications"
      value={enabled}
      onChange={setEnabled}
    />
  );
}
